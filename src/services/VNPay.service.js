import qs from 'qs';
import db from '../models/index.js';
import { PhuongThucThanhToan, TrangThaiDonHang, TrangThaiThanhToan } from '../constants/index.js';
import vnpayConfig from '../config/vnpay.config.js';
import { sortObject, buildSecureHash, formatVnpDate, parseVnpDate, generateTxnRef } from '../utils/vnpay.util.js';
import { tinhVaCapNhatHang } from './NguoiDung.service.js';


const REQUIRED_CONFIG = ['tmnCode', 'hashSecret', 'url', 'returnUrl'];
for (const key of REQUIRED_CONFIG) {
    if (!vnpayConfig[key]) {
        throw new Error(`[VNPay] Thiếu cấu hình: ${key} — kiểm tra lại file .env`);
    }
}

// ─── Tạo thanh toán ─────────────────────────────────────────────────────
export const createVnpayPayment = async ({ donhang_id, sotien, orderInfo, ipAddr }) => {
    const txnRef = generateTxnRef();

    const thanhtoan = await db.ThanhToan.create({
        donhang_id,
        sotien,
        phuongthucthanhtoan: PhuongThucThanhToan.VNPAY,
        trangthai: TrangThaiThanhToan.CHO_THANH_TOAN,
        vnp_txn_ref: txnRef,
    });

    const createDate = new Date();
    const expireDate = new Date(createDate.getTime() + 15 * 60 * 1000);

    let vnpParams = {
        vnp_Version: vnpayConfig.version,
        vnp_Command: 'pay',
        vnp_TmnCode: vnpayConfig.tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: orderInfo || `Thanh toan don hang ${donhang_id}`,
        vnp_OrderType: 'other',
        vnp_Amount: Math.round(sotien) * 100,
        vnp_ReturnUrl: vnpayConfig.returnUrl,
        vnp_IpAddr: ipAddr || '127.0.0.1',
        vnp_CreateDate: formatVnpDate(createDate),
        vnp_ExpireDate: formatVnpDate(expireDate),
    };

    vnpParams = sortObject(vnpParams);
    const secureHash = buildSecureHash(vnpParams, vnpayConfig.hashSecret);
    const paymentUrl = `${vnpayConfig.url}?${qs.stringify(vnpParams, { encode: false })}&vnp_SecureHash=${secureHash}`;

    console.log('[VNPay] Payment URL:', paymentUrl);

    return { thanhtoan, paymentUrl, txnRef };
};


// ─── Verify chữ ký (dùng chung cho cả Return và IPN) ───────────────────────
const verifySignature = (query) => {
    const { vnp_SecureHash, vnp_SecureHashType, ...rest } = query;
    const sorted = sortObject(rest);
    const checkHash = buildSecureHash(sorted, vnpayConfig.hashSecret);
    return checkHash === vnp_SecureHash;
};

// ─── IPN (server-to-server, VNPay gọi bằng GET query params) ──────────────
export const processVnpayIPN = async (query) => {
    if (!verifySignature(query)) {
        return { RspCode: '97', Message: 'Invalid signature' };
    }

    const thanhtoan = await db.ThanhToan.findOne({ where: { vnp_txn_ref: query.vnp_TxnRef } });

    if (!thanhtoan) {
        return { RspCode: '01', Message: 'Order not found' };
    }

    const soTienNhan = Number(query.vnp_Amount) / 100;
    if (Number(thanhtoan.sotien) !== soTienNhan) {
        return { RspCode: '04', Message: 'Invalid amount' };
    }

    if (Number(thanhtoan.trangthai) !== TrangThaiThanhToan.CHO_THANH_TOAN) {
        return { RspCode: '02', Message: 'Order already confirmed' };
    }

    const isSuccess = query.vnp_ResponseCode === '00';
    let donHang = null;
    const t = await db.sequelize.transaction();
    try {
        await thanhtoan.update({
            trangthai: isSuccess ? TrangThaiThanhToan.THANH_CONG : TrangThaiThanhToan.THAT_BAI,
            vnp_transaction_no: query.vnp_TransactionNo,
            vnp_response_code: query.vnp_ResponseCode,
            vnp_bank_code: query.vnp_BankCode,
            vnp_pay_date: parseVnpDate(query.vnp_PayDate),
        }, { transaction: t });

        donHang = await db.DonHang.findByPk(thanhtoan.donhang_id, { transaction: t });

        if (donHang) {
            if (isSuccess) {
                await donHang.update({ trangthai: TrangThaiDonHang.DA_THANH_TOAN }, { transaction: t });
                await db.GioHang.destroy({
                    where: { nguoidung_id: donHang.nguoidung_id },
                    transaction: t,
                });
            } else if (donHang.trangthai === TrangThaiDonHang.CHO_XAC_NHAN) {
                await donHang.update({
                    trangthai: TrangThaiDonHang.DA_HUY,
                    ly_do_huy: LyDoHuyDonHang.THANH_TOAN_THAT_BAI,
                    ghi_chu_huy: `VNPay ResponseCode: ${query.vnp_ResponseCode}`,
                    huy_boi: HuyBoi.HE_THONG,
                }, { transaction: t });
            }
        }

        await t.commit(); // ✅ bắt buộc phải có
    } catch (err) {
        await t.rollback();
        console.error('[VNPay IPN] Lỗi cập nhật đơn hàng:', err);
        return { RspCode: '99', Message: 'Unknown error' };
    }

    // ✅ side-effect chạy SAU khi commit, không ảnh hưởng tính atomic của transaction chính
    if (donHang && isSuccess) {
        if (donHang.nguoidung_id) {
            await tinhVaCapNhatHang(donHang.nguoidung_id);
        }
        io.to(`user-${donHang.nguoidung_id}`).emit('order-status-updated', {
            donhang_id: donHang.donhang_id,
            trangthai: TrangThaiDonHang.DA_THANH_TOAN,
        });
        io.to('admin-room').emit('new-order', {
            donhang_id: donHang.donhang_id,
            tongtien: donHang.tongtien,
            nguoidung_id: donHang.nguoidung_id,
        });
        // ✅ FIX: dùng wasHuy thay vì donHang.trangthai === DA_HUY (stale object sau update trong transaction)
    } else if (donHang && !isSuccess && wasHuy) {
        if (donHang.nguoidung_id) {
            io.to(`user-${donHang.nguoidung_id}`).emit('order-status-updated', {
                donhang_id: donHang.donhang_id,
                trangthai: TrangThaiDonHang.DA_HUY,
            });
        }
    }

    return { RspCode: '00', Message: 'Confirm Success' };
};

// ─── Return (redirect người dùng, chỉ để hiển thị) ────────────────────────
export const verifyVnpayReturn = (query) => {
    const isValidSignature = verifySignature(query);
    const isSuccess = isValidSignature && query.vnp_ResponseCode === '00';

    return {
        orderId: query.vnp_TxnRef,
        isSuccess,
        resultCode: query.vnp_ResponseCode,
        message: isValidSignature ? (isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại') : 'Sai chữ ký',
        amount: Number(query.vnp_Amount) / 100,
    };
};