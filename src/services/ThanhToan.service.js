import axios from 'axios';
import db from '../models/index.js';
import { buildMomoPaymentBody, verifyMomoSignature, MOMO_ENDPOINT } from '../utils/momo.util.js';
import { TrangThaiThanhToan, PhuongThucThanhToan, TrangThaiDonHang } from '../constants/index.js';
import { tinhVaCapNhatHang } from './NguoiDung.service.js';
import { io } from "../server.js"

const callMomoAPI = async (body) => {
    try {
        const { data } = await axios.post(MOMO_ENDPOINT, body, {
            headers: { 'Content-Type': 'application/json' },
        });
        return data;
    } catch (error) {
        throw error;
    }
};

export const createMomoPayment = async ({ donhang_id, sotien, orderInfo }) => {

    const donHang = await db.DonHang.findByPk(donhang_id);
    if (!donHang) throw { status: 404, message: 'Đơn hàng không tồn tại' };

    const thanhtoan = await db.ThanhToan.create({
        donhang_id,
        phuongthucthanhtoan: PhuongThucThanhToan.MOMO,
        sotien,
        trangthai: TrangThaiThanhToan.CHO_THANH_TOAN,
    });

    // 2. Gọi MoMo API
    const body = buildMomoPaymentBody({
        orderId: thanhtoan.thanhtoan_id,
        amount: sotien,
        orderInfo: orderInfo ?? `Thanh toan don hang ${donhang_id}`,
    });

    const momoResult = await callMomoAPI(body);

    if (momoResult.resultCode !== 0) {
        // Cập nhật trạng thái thất bại nếu MoMo từ chối ngay
        await thanhtoan.update({
            trangthai: TrangThaiThanhToan.THAT_BAI,
            momo_result_code: momoResult.resultCode,
        });
        throw new Error(momoResult.message || 'MoMo từ chối tạo giao dịch');
    }

    // 3. Lưu lại requestId để đối soát sau
    await thanhtoan.update({
        momo_order_id: momoResult.orderId,
        momo_request_id: momoResult.requestId,
    });

    return { thanhtoan, momoResult };
};

/**
 * Xử lý IPN từ MoMo (server-to-server notify)
 * MoMo POST vào endpoint này sau khi user hoàn tất thanh toán
 */
export const processMomoIPN = async (ipnPayload) => {
    if (!verifyMomoSignature(ipnPayload)) {
        throw new Error('Chữ ký IPN không hợp lệ');
    }

    const { orderId, transId, amount, resultCode, message, payType, responseTime } = ipnPayload;
    const isSuccess = resultCode === 0;

    const thanhtoan = await db.ThanhToan.findByPk(orderId);
    if (!thanhtoan) throw new Error(`Không tìm thấy thanh toán: ${orderId}`);

    await thanhtoan.update({
        trangthai: isSuccess ? TrangThaiThanhToan.THANH_CONG : TrangThaiThanhToan.THAT_BAI,
        momo_trans_id: String(transId),
        momo_result_code: resultCode,
        momo_pay_type: payType,
        momo_time_pay: isSuccess ? new Date(Number(responseTime)) : null,
    });

    if (isSuccess) {
        const donHang = await db.DonHang.findByPk(thanhtoan.donhang_id);
        if (donHang) {
            await donHang.update({ trangthai: TrangThaiDonHang.DA_THANH_TOAN });
            await db.GioHang.destroy({ where: { nguoidung_id: donHang.nguoidung_id } });

            if (donHang.nguoidung_id) {
                await tinhVaCapNhatHang(donHang.nguoidung_id);
            }

            io.to(`user-${donHang.nguoidung_id}`).emit('order-status-updated', {
                donhang_id: donHang.donhang_id,
                trangthai: TrangThaiDonHang.DA_THANH_TOAN,
            })

            io.to('admin-room').emit('new-order', {
                donhang_id: donHang.donhang_id,
                tongtien: donHang.tongtien,
                nguoidung_id: donHang.nguoidung_id,
            })
        }
    }


    return { isSuccess, orderId, transId, amount, message };
};

/**
 * Xác minh redirect callback khi MoMo trả user về site
 */
export const verifyMomoReturn = (queryParams) => {
    if (!verifyMomoSignature(queryParams)) {
        throw new Error('Chữ ký redirect không hợp lệ');
    }

    return {
        orderId: queryParams.orderId,
        isSuccess: Number(queryParams.resultCode) === 0,
        resultCode: Number(queryParams.resultCode),
        message: queryParams.message,
        transId: queryParams.transId,
        amount: Number(queryParams.amount),
    };
};

/**
 * Lấy chi tiết một thanh toán theo ID
 */
export const getThanhToanById = async (thanhtoan_id) => {
    const thanhtoan = await db.ThanhToan.findByPk(thanhtoan_id);
    if (!thanhtoan) throw new Error('Không tìm thấy thanh toán');
    return thanhtoan;
};