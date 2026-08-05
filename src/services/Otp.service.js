import crypto from 'crypto';
import argon2 from 'argon2';
import { Op } from 'sequelize';
import db from '../models/index.js';
import { LoaiOTP, TrangThaiTaiKhoan } from '../constants/index.js';
import { transporter } from '../utils/mailer.js';
import {
    OTP_EXPIRE_MINUTES,
    MAX_ATTEMPTS,
    RESEND_COOLDOWN_SECONDS,
} from '../config/otp.config.js';

const { Otp, NguoiDung } = db;

const generateOtpCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const taoVaGuiOtp = async (nguoidung_id, email) => {
    const otpGanNhat = await Otp.findOne({
        where: { nguoidung_id, loai: LoaiOTP.XAC_THUC_EMAIL },
        order: [['created_at', 'DESC']],
    });

    if (otpGanNhat) {
        const giayDaTroi = (Date.now() - new Date(otpGanNhat.created_at).getTime()) / 1000;
        if (giayDaTroi < RESEND_COOLDOWN_SECONDS) {
            const conLai = Math.ceil(RESEND_COOLDOWN_SECONDS - giayDaTroi);
            throw { status: 429, message: `Vui lòng đợi ${conLai} giây trước khi gửi lại OTP` };
        }
    }

    await Otp.update(
        { da_su_dung: true },
        { where: { nguoidung_id, loai: LoaiOTP.XAC_THUC_EMAIL, da_su_dung: false } }
    );

    const otpCode = generateOtpCode();
    const hashedOtp = await argon2.hash(otpCode); // dùng argon2 cho đồng bộ với dangKy
    const hetHan = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

    await Otp.create({
        nguoidung_id,
        email,
        otp_code: hashedOtp,
        loai: LoaiOTP.XAC_THUC_EMAIL,
        het_han: hetHan,
    });

    await transporter.sendMail({
        from: `"Hỗ trợ" <${process.env.EMAIL_ADMIN}>`,
        to: email,
        subject: 'Mã xác thực email của bạn',
        html: `<p>Mã OTP của bạn là: <b>${otpCode}</b></p><p>Mã có hiệu lực trong ${OTP_EXPIRE_MINUTES} phút.</p>`,
    });

    return true;
};

export const xacThucOtp = async (nguoidung_id, otpNhap) => {
    const user = await NguoiDung.findByPk(nguoidung_id);
    if (!user) {
        throw { status: 404, message: 'Tài khoản không tồn tại hoặc đã hết hạn, vui lòng đăng ký lại' };
    }
    const otpRecord = await Otp.findOne({
        where: {
            nguoidung_id,
            loai: LoaiOTP.XAC_THUC_EMAIL,
            da_su_dung: false,
            het_han: { [Op.gt]: new Date() },
        },
        order: [['created_at', 'DESC']],
    });

    if (!otpRecord) {
        throw { status: 400, message: 'OTP không tồn tại hoặc đã hết hạn' };
    }

    if (otpRecord.so_lan_thu >= MAX_ATTEMPTS) {
        throw { status: 400, message: 'Bạn đã nhập sai quá số lần cho phép, vui lòng yêu cầu OTP mới' };
    }

    const hopLe = await argon2.verify(otpRecord.otp_code, otpNhap);

    if (!hopLe) {
        await otpRecord.increment('so_lan_thu');
        throw { status: 400, message: 'Mã OTP không đúng' };
    }

    otpRecord.da_su_dung = true;
    await otpRecord.save();

    await NguoiDung.update(
        { email_verified: true },
        { where: { nguoidung_id } }
    );

    return true;
};

export const yeuCauDoiEmail = async (nguoidung_id, emailMoi) => {
    const user = await NguoiDung.findByPk(nguoidung_id);
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };

    if (user.email === emailMoi) {
        throw { status: 400, message: 'Email mới trùng với email hiện tại' };
    }

    const daTonTai = await NguoiDung.findOne({
        where: { email: emailMoi, trangthai: { [Op.ne]: TrangThaiTaiKhoan.DA_XOA } }
    });
    if (daTonTai) throw { status: 409, message: 'Email này đã được sử dụng bởi tài khoản khác' };

    // Cooldown chống spam, check theo loai DOI_EMAIL
    const otpGanNhat = await Otp.findOne({
        where: { nguoidung_id, loai: LoaiOTP.DOI_EMAIL },
        order: [['created_at', 'DESC']],
    });

    if (otpGanNhat) {
        const giayDaTroi = (Date.now() - new Date(otpGanNhat.created_at).getTime()) / 1000;
        if (giayDaTroi < RESEND_COOLDOWN_SECONDS) {
            const conLai = Math.ceil(RESEND_COOLDOWN_SECONDS - giayDaTroi);
            throw { status: 429, message: `Vui lòng đợi ${conLai} giây trước khi gửi lại OTP` };
        }
    }

    await Otp.update(
        { da_su_dung: true },
        { where: { nguoidung_id, loai: LoaiOTP.DOI_EMAIL, da_su_dung: false } }
    );

    const otpCode = generateOtpCode();
    const hashedOtp = await argon2.hash(otpCode);
    const hetHan = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

    await Otp.create({
        nguoidung_id,
        email: emailMoi, // lưu email MỚI, không phải email hiện tại
        otp_code: hashedOtp,
        loai: LoaiOTP.DOI_EMAIL,
        het_han: hetHan,
    });

    await transporter.sendMail({
        from: `"Hỗ trợ" <${process.env.EMAIL_ADMIN}>`,
        to: emailMoi, // gửi tới email MỚI để xác nhận quyền sở hữu
        subject: 'Xác nhận đổi email',
        html: `<p>Mã OTP xác nhận đổi email của bạn là: <b>${otpCode}</b></p><p>Mã có hiệu lực trong ${OTP_EXPIRE_MINUTES} phút.</p>`,
    });

    return true;
};

export const xacThucDoiEmail = async (nguoidung_id, otpNhap) => {
    const otpRecord = await Otp.findOne({
        where: {
            nguoidung_id,
            loai: LoaiOTP.DOI_EMAIL,
            da_su_dung: false,
            het_han: { [Op.gt]: new Date() },
        },
        order: [['created_at', 'DESC']],
    });

    if (!otpRecord) throw { status: 400, message: 'OTP không tồn tại hoặc đã hết hạn' };

    if (otpRecord.so_lan_thu >= MAX_ATTEMPTS) {
        throw { status: 400, message: 'Bạn đã nhập sai quá số lần cho phép, vui lòng yêu cầu OTP mới' };
    }

    const hopLe = await argon2.verify(otpRecord.otp_code, otpNhap);
    if (!hopLe) {
        await otpRecord.increment('so_lan_thu');
        throw { status: 400, message: 'Mã OTP không đúng' };
    }

    // Kiểm tra lại lần cuối, phòng trường hợp có người khác đăng ký/đổi trùng email này trong lúc chờ xác thực
    const daTonTai = await NguoiDung.findOne({
        where: {
            email: otpRecord.email,
            nguoidung_id: { [Op.ne]: nguoidung_id },
            trangthai: { [Op.ne]: TrangThaiTaiKhoan.DA_XOA }
        }
    });
    if (daTonTai) throw { status: 409, message: 'Email này vừa được người khác sử dụng, vui lòng thử email khác' };

    otpRecord.da_su_dung = true;
    await otpRecord.save();

    await NguoiDung.update(
        { email: otpRecord.email, email_verified: true },
        { where: { nguoidung_id } }
    );

    return { email: otpRecord.email };
};