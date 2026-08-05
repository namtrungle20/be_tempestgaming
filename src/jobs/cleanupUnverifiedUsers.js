// jobs/cleanupUnverifiedUsers.js
import cron from 'node-cron';
import { Op } from 'sequelize';
import db from '../models/index.js';

const { Otp, NguoiDung } = db;

const CLEANUP_AFTER_MINUTES = 10; // xóa nếu chưa xác thực sau 10 phút

export const cleanupUnverifiedUsers = async () => {
    const now = new Date();
    const nguongTaoTaiKhoan = new Date(now.getTime() - CLEANUP_AFTER_MINUTES * 60 * 1000);

    const candidates = await NguoiDung.findAll({
        where: {
            email_verified: false,
            ngayvao: { [Op.lt]: nguongTaoTaiKhoan }
        }
    });

    for (const user of candidates) {
        try {
            const otpConHan = await Otp.findOne({
                where: {
                    nguoidung_id: user.nguoidung_id,
                    da_su_dung: false,
                    het_han: { [Op.gt]: now }
                }
            });

            if (!otpConHan) {
                await user.destroy();
                console.log(`[Cleanup] Đã xóa tài khoản chưa xác thực: ${user.email}`);
            }
        } catch (err) {
            // Không để 1 user lỗi làm dừng cả job — log lại rồi bỏ qua, xử lý user tiếp theo
            console.error(`[Cleanup] Lỗi khi xóa user ${user.nguoidung_id}: ${err.message}`);
        }
    }
};

export const startCleanupJob = () => {
    cron.schedule('*/5 * * * *', cleanupUnverifiedUsers);
    console.log('[Cleanup] Job dọn tài khoản chưa xác thực đã khởi động');
};