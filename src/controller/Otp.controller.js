import db from '../models/index.js';
import * as OtpService from '../services/Otp.service.js';

const { NguoiDung } = db;

export const postXacThucEmail = async (req, res) => {
    const { nguoidung_id, otp } = req.body;

    if (!nguoidung_id || !otp) throw { status: 400, message: 'Thiếu nguoidung_id hoặc otp' };

    await OtpService.xacThucOtp(nguoidung_id, otp);

    return res.status(200).json({ message: 'Xác thực email thành công' });
};

export const postGuiLaiOtp = async (req, res) => {
    const { nguoidung_id } = req.body;

    if (!nguoidung_id) throw { status: 400, message: 'Thiếu nguoidung_id' };

    const user = await NguoiDung.findByPk(nguoidung_id);
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };
    if (user.email_verified) throw { status: 400, message: 'Email đã được xác thực' };

    await OtpService.taoVaGuiOtp(user.nguoidung_id, user.email);

    return res.status(200).json({ message: 'Đã gửi lại mã OTP' });
};