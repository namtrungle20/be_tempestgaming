import cron from 'node-cron';
import axios from 'axios';
import db from '../models/index.js';
import { Op } from 'sequelize';
import { TrangThaiDonHang, TrangThaiThanhToan } from '../constants/index.js';
import { buildMomoQueryBody, MOMO_QUERY_ENDPOINT } from '../utils/momo.util.js';

cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Bắt đầu đối soát giao dịch MoMo treo...');

    const donHangCho = await db.DonHang.findAll({
        where: {
            trangthai: TrangThaiDonHang.CHO_XAC_NHAN,
            createdAt: { [Op.lt]: new Date(Date.now() - 5 * 60 * 1000) },
        },
    });

    for (const dh of donHangCho) {
        try {
            const thanhtoan = await db.ThanhToan.findOne({ where: { donhang_id: dh.donhang_id } });
            if (!thanhtoan || !thanhtoan.momo_order_id) continue;

            const body = buildMomoQueryBody({
                orderId: thanhtoan.momo_order_id,
                requestId: thanhtoan.momo_request_id,
            });

            const { data } = await axios.post(MOMO_QUERY_ENDPOINT, body, { timeout: 15000 });

            if (data.resultCode === 0) {
                await dh.update({ trangthai: TrangThaiDonHang.DA_THANH_TOAN });
                await thanhtoan.update({ trangthai: TrangThaiThanhToan.THANH_CONG });
                console.log(`[Cron] Đơn ${dh.donhang_id} đã cập nhật thành công qua đối soát.`);
            }
        } catch (err) {
            console.error(`[Cron] Lỗi đối soát đơn ${dh.donhang_id}:`, err.message);
        }
    }
});