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

export const postYeuCauDoiEmail = async (req, res) => {
    // console.log('req.user:', req.user);
    // console.log('req.user.id:', req.user?.id);
    // console.log('req.user.nguoidung_id:', req.user?.nguoidung_id);
    const nguoidung_id = req.user.nguoidung_id; // lấy từ middleware auth, không tin req.body
    const { email_moi } = req.body;

    if (!email_moi) throw { status: 400, message: 'Thiếu email mới' };

    await OtpService.yeuCauDoiEmail(nguoidung_id, email_moi);

    return res.status(200).json({ success: true, message: 'Đã gửi mã OTP tới email mới' });
};

export const postXacThucDoiEmail = async (req, res) => {
    const nguoidung_id = req.user.nguoidung_id;
    const { otp } = req.body;

    if (!otp) throw { status: 400, message: 'Thiếu otp' };

    const result = await OtpService.xacThucDoiEmail(nguoidung_id, otp);

    return res.status(200).json({ success: true, message: 'Đổi email thành công', data: result });
};

export const quenMatKhauYeuCau = async (req, res) => {
    const result = await OtpService.yeuCauQuenMatKhau(req.body.email)
    res.json(result)
}

export const quenMatKhauXacThuc = async (req, res) => {
    const result = await OtpService.xacThucQuenMatKhau(
        req.body.email,
        req.body.otp,
        req.body.mat_khau_moi
    )
    res.json(result)
}