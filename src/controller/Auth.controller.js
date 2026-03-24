import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';
import db from '../models/index.js';
import ResponseNguoiDung from '../dtos/responses/nguoidung/ResponseNguoiDung.js';
import { VaiTroNguoiDung, TrangThaiTaiKhoan } from '../constants/index.js';
import { verifyRefreshToken } from '../helpers/refreshToken.helper.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const buildLoginCondition = (email, sdt) => {
    const condition = {};
    if (email) condition.email = email;
    if (sdt) condition.sdt = sdt;
    return condition;
};

const generateAccessToken = (nguoidung_id, vaitro) =>
    jwt.sign(
        { nguoidung_id, vaitro },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

const setRefreshTokenCookie = (res, token) =>
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10),
    });

// ─── Controllers ────────────────────────────────────────────────────────────

export const signUp = async (req, res) => {
    const { email, sdt, password } = req.body;

    if (!email && !sdt) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email hoặc số điện thoại' });
    }

    const condition = buildLoginCondition(email, sdt);
    const existed = await db.NguoiDung.findOne({ where: { [db.Sequelize.Op.or]: condition } });
    if (existed) {
        return res.status(409).json({ success: false, message: 'Email hoặc số điện thoại đã được sử dụng' });
    }

    const hashedPassword = password ? await argon2.hash(password) : null;
    const nguoidung = await db.NguoiDung.create({
        nguoidung_id: uuidv7(),
        email,
        sdt,
        vaitro: VaiTroNguoiDung.USER,
        password: hashedPassword,
    });

    return res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: new ResponseNguoiDung(nguoidung),
    });
};

export const signIn = async (req, res) => {
    const { email, sdt, password } = req.body;

    if (!password || (!email && !sdt)) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu và email hoặc số điện thoại' });
    }

    const condition = buildLoginCondition(email, sdt);
    const nguoidung = await db.NguoiDung.findOne({ where: { [db.Sequelize.Op.or]: condition } });

    if (!nguoidung) {
        return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    const isValid = await argon2.verify(nguoidung.password, password);
    if (!isValid) {
        return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác' });
    }

    if (nguoidung.is_lock === TrangThaiTaiKhoan.BI_KHOA) {
        return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ Admin.' });
    }

    const accessToken = generateAccessToken(nguoidung.nguoidung_id, nguoidung.vaitro);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10));

    await db.Session.create({
        session_id: uuidv7(),
        nguoidung_id: nguoidung.nguoidung_id,
        refreshToken,
        expires_at: expiresAt,
    });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
            nguoidung: new ResponseNguoiDung(nguoidung),
            accessToken,
            refreshToken,
        },
    });
};

export const refresh = async (req, res) => {
    const { refreshToken } = req.body ?? req.cookies;
    if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Thiếu refresh token' });
    }

    const session = await verifyRefreshToken(refreshToken);
    if (!session) {
        return res.status(403).json({ success: false, message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
    }

    const accessToken = generateAccessToken(session.nguoidung_id, session.NguoiDung.vaitro);
    return res.status(200).json({ success: true, data: { accessToken } });
};

export const logout = async (req, res) => {
    const { refreshToken } = req.body ?? req.cookies;
    if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Thiếu refresh token' });
    }

    const session = await verifyRefreshToken(refreshToken);
    if (!session) {
        return res.status(403).json({ success: false, message: 'Refresh token không hợp lệ' });
    }

    await db.Session.update({ is_revoked: true }, { where: { refreshToken } });
    res.clearCookie('refreshToken');

    return res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
};

export const getMe = async (req, res) => {
    return res.status(200).json({ success: true, data: req.user })
}