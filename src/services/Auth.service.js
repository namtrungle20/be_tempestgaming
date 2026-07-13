import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import argon2 from 'argon2'
import { v7 as uuidv7 } from 'uuid'
import db from '../models/index.js'
import ResponseNguoiDung from '../dtos/responses/ResponseNguoiDung.js'
import { VaiTroNguoiDung, TrangThaiTaiKhoan } from '../constants/index.js'
import { verifyRefreshToken } from '../helpers/refreshToken.helper.js'
import admin from '../config/firebaseConfig.js'
import { guiEmailResetPassword } from './Email.service.js'

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
    const { uid, email, name } = decoded;

    let nguoidung = await db.NguoiDung.findOne({
        where: { [db.Sequelize.Op.or]: [{ google_id: uid }, { email }] }
    });

    if (!nguoidung) {
        nguoidung = await db.NguoiDung.create({
            nguoidung_id: uuidv7(),
            name,
            sdt: null,
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


export const quenMatKhau = async ({ email, sdt }) => {
    console.log('🔵 quenMatKhau called:', email, sdt)
    if (!sdt) throw { status: 400, message: 'Vui lòng nhập số điện thoại' }
    if (!email) throw { status: 400, message: 'Vui lòng nhập email' }

    const GENERIC_MESSAGE = 'Nếu email hoặc số điện thoại tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.'

    const user = await db.NguoiDung.findOne({ where: { [db.Sequelize.Op.or]: [{ sdt }, { email }] } })
    console.log('🔵 user found:', user?.nguoidung_id, user?.email)

    if (!user) return { message: GENERIC_MESSAGE }

    if (user.trangthai === TrangThaiTaiKhoan.BI_KHOA)
        throw { status: 403, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ Admin.' }

    if (user.trangthai === TrangThaiTaiKhoan.DA_XOA)
        throw { status: 403, message: 'Tài khoản không tồn tại.' }

    if (!user.password)
        throw { status: 400, message: 'Tài khoản này đăng nhập bằng Google. Vui lòng dùng nút Đăng nhập Google.' }

    const emailTrim = email.trim().toLowerCase()
    if (!user.email) {
        // Tài khoản chưa có email -> gắn email mới nhập vào tài khoản
        await user.update({ email: emailTrim })
        // console.log('🟢 đã gắn email mới vào tài khoản:', user.nguoidung_id, emailTrim)
    } else if (user.email.toLowerCase() !== emailTrim) {
        // console.log('🟡 tài khoản đã có email khác, từ chối gắn email mới:', user.nguoidung_id)
        throw {
            status: 400,
            message: 'Số điện thoại này đã liên kết với một email khác. Vui lòng nhập đúng email đã đăng ký.'
        }
    }

    // Tạo JWT reset token — hết hạn 15 phút
    const resetToken = jwt.sign(
        { nguoidung_id: user.nguoidung_id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    console.log('🔵 resetLink:', resetLink)
    console.log('🔵 sending email to:', email)

    await guiEmailResetPassword(email, resetLink)
    console.log('🔵 email sent successfully')

    return { message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.' }
}

export const datLaiMatKhau = async (token, matKhauMoi) => {
    if (!token) throw { status: 400, message: 'Thiếu token' }
    if (!matKhauMoi || matKhauMoi.length < 6)
        throw { status: 400, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }

    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw { status: 400, message: 'Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.' }
        }
        throw { status: 400, message: 'Link không hợp lệ.' }
    }

    const user = await db.NguoiDung.findByPk(decoded.nguoidung_id)
    if (!user) throw { status: 404, message: 'Không tìm thấy tài khoản' }

    if (user.password) {
        const isSamePassword = await argon2.verify(user.password, matKhauMoi)
        if (isSamePassword) {
            throw { status: 400, message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' }
        }
    }

    // Hash và lưu mật khẩu mới
    const hashedPassword = await argon2.hash(matKhauMoi)
    await user.update({ password: hashedPassword })

    // Revoke toàn bộ session hiện tại — bắt đăng nhập lại
    await db.Session.update(
        { is_revoked: true },
        { where: { nguoidung_id: user.nguoidung_id } }
    )

    return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' }
}
