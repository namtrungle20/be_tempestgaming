import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import asyncHandler from './asyncHandler.js';
import TrangThaiTaiKhoan from '../constants/TrangThaiTaiKhoan.js'

const verifyToken = (token) =>
    new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
            if (err) reject(err);
            else resolve(payload);
        });
    });

export const requestVaiTro = (allowedRoles) =>
    asyncHandler(async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập hoặc thiếu Token' });
        }

        let decoded;
        try {
            decoded = await verifyToken(token);
        } catch {
            return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        const user = await db.NguoiDung.findByPk(decoded.nguoidung_id);
        if (!user || user.trangthai === TrangThaiTaiKhoan.DA_XOA) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' })
        }

        if (user.trangthai === TrangThaiTaiKhoan.BI_KHOA) {
            return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' })
        }

        const roles = allowedRoles.map(String);
        if (!roles.includes(String(user.vaitro))) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }

        req.user = user;
        next();
    });