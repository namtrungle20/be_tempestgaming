import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import argon2 from 'argon2'
import { v7 as uuidv7 } from 'uuid'
import db from '../models/index.js'
import ResponseNguoiDung from '../dtos/responses/ResponseNguoiDung.js'
import { VaiTroNguoiDung, TrangThaiTaiKhoan } from '../constants/index.js'
import { verifyRefreshToken } from '../helpers/refreshToken.helper.js'
import admin from '../config/firebaseConfig.js'

export const generateAccessToken = (nguoidung_id, vaitro) =>
    jwt.sign({ nguoidung_id, vaitro }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN })

export const dangKy = async ({ name, sdt, email, password }) => {
    if (!name) throw { status: 400, message: 'Vui lòng cung cấp tên' }
    if (!sdt) throw { status: 400, message: 'Vui lòng cung cấp số điện thoại' }
    if (!password) throw { status: 400, message: 'Vui lòng cung cấp mật khẩu' }

    const orConditions = [{ sdt }]
    if (email) orConditions.push({ email })

    const existed = await db.NguoiDung.findOne({ where: { [db.Sequelize.Op.or]: orConditions } })
    if (existed) throw { status: 409, message: 'Name, email hoặc số điện thoại đã được sử dụng' }

    const hashedPassword = password ? await argon2.hash(password) : null
    const nguoidung = await db.NguoiDung.create({
        nguoidung_id: uuidv7(),
        name,
        email: email || null,
        sdt,
        vaitro: VaiTroNguoiDung.USER,
        password: hashedPassword
    })
    return new ResponseNguoiDung(nguoidung)
}

export const dangNhap = async ({ sdt, password }, res) => {
    if (!sdt) throw { status: 400, message: 'Vui lòng cung cấp số điện thoại' }
    if (!password) throw { status: 400, message: 'Vui lòng cung cấp mật khẩu' }

    const nguoidung = await db.NguoiDung.findOne({ where: { sdt } })
    if (!nguoidung) throw { status: 404, message: 'Tài khoản không tồn tại' }

    if (!nguoidung.password)
        throw { status: 400, message: 'Tài khoản này đăng nhập bằng Google. Vui lòng dùng nút Đăng nhập Google.' }

    const isValid = await argon2.verify(nguoidung.password, password)
    if (!isValid) throw { status: 401, message: 'Mật khẩu không chính xác' }

    if (nguoidung.trangthai === TrangThaiTaiKhoan.BI_KHOA)
        throw { status: 403, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ Admin.' }
    if (nguoidung.trangthai === TrangThaiTaiKhoan.DA_XOA)
        throw { status: 403, message: 'Tài khoản đã bị Xóa. Vui lòng liên hệ Admin.' }

    const accessToken = generateAccessToken(nguoidung.nguoidung_id, nguoidung.vaitro)
    const refreshToken = crypto.randomBytes(64).toString('hex')
    const expiresAt = new Date(Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10))

    await db.Session.create({ session_id: uuidv7(), nguoidung_id: nguoidung.nguoidung_id, refreshToken, expires_at: expiresAt })

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10) })

    return { nguoidung: new ResponseNguoiDung(nguoidung), accessToken, refreshToken }
}

export const refreshToken = async (token) => {
    const session = await verifyRefreshToken(token)
    if (!session) throw { status: 403, message: 'Refresh token không hợp lệ hoặc đã hết hạn' }
    return generateAccessToken(session.nguoidung_id, session.NguoiDung.vaitro)
}

export const dangXuat = async (token, res) => {
    const session = await verifyRefreshToken(token)
    if (!session) throw { status: 403, message: 'Refresh token không hợp lệ' }
    await db.Session.update({ is_revoked: true }, { where: { refreshToken: token } })
    res.clearCookie('refreshToken')
}

export const loginWithGoogle = async (idToken, res) => {
    let decoded;
    try {
        decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
        throw { status: 401, message: 'Google token không hợp lệ' };
    }
    dun
    const { uid, email, name } = decoded;

    let nguoidung = await db.NguoiDung.findOne({
        where: { [db.Sequelize.Op.or]: [{ google_id: uid }, { email }] }
    });

    if (!nguoidung) {
        nguoidung = await db.NguoiDung.create({
            nguoidung_id: uuidv7(),
            name,
            email,
            google_id: uid,
            vaitro: VaiTroNguoiDung.USER,
            password: null,
        });
    } else if (!nguoidung.google_id) {
        await nguoidung.update({ google_id: uid });
    }
    if (nguoidung.trangthai === TrangThaiTaiKhoan.BI_KHOA)
        throw { status: 403, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ Admin.' };

    const accessToken = generateAccessToken(nguoidung.nguoidung_id, nguoidung.vaitro);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10));

    await db.Session.create({
        session_id: uuidv7(),
        nguoidung_id: nguoidung.nguoidung_id,
        refreshToken,
        expires_at: expiresAt
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, secure: true, sameSite: 'none',
        maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10)
    });

    return { nguoidung: new ResponseNguoiDung(nguoidung), accessToken, refreshToken };
};