// jobs/cleanupUnverifiedUsers.js
import cron from 'node-cron';
import { Op } from 'sequelize';
import db from '../models/index.js';

const { Otp, NguoiDung } = db;

const CLEANUP_AFTER_MINUTES = 3; // xóa nếu chưa xác thực sau 15 phút

export const cleanupUnverifiedUsers = async () => {
    const hetHan = new Date(Date.now() - CLEANUP_AFTER_MINUTES * 60 * 1000);

    // Lấy user chưa xác thực và đã tạo quá lâu
    const candidates = await NguoiDung.findAll({
        where: {
            email_verified: false,
            ngayvao: { [Op.lt]: hetHan }
        }
    });

    for (const user of candidates) {
        // Kiểm tra xem có OTP nào được tạo GẦN ĐÂY không (trong vòng CLEANUP_AFTER_MINUTES)
        const otpGanDay = await Otp.findOne({
            where: {
                nguoidung_id: user.nguoidung_id,
                created_at: { [Op.gt]: hetHan } // có OTP tạo sau mốc hết hạn -> vẫn đang hoạt động
            }
        });

        if (!otpGanDay) {
            await user.destroy();
            console.log(`[Cleanup] Đã xóa tài khoản chưa xác thực: ${user.email}`);
        }
    }
};

export const startCleanupJob = () => {
    cron.schedule('*/1 * * * *', cleanupUnverifiedUsers);
    console.log('[Cleanup] Job dọn tài khoản chưa xác thực đã khởi động');
};