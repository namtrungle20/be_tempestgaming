import jwt from 'jsonwebtoken';
import db from '../models/index.js';



async function accessToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Không có token' });
        }


        // const decoded = jwt.verify(token, JWT_SECRET_KEY);
        const decodeUser = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        // 3. Tìm user bằng UUID (findByPk)
        const user = await db.NguoiDung.findByPk(decodeUser.nguoidung_id);
        
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

        req.user = user;
        return next();

    } catch (error) {
        console.error("JWT Error:", error.message);
        // Tránh gửi res lần nữa nếu headers đã được gửi
        if (!res.headersSent) {
            return res.status(403).json({ message: 'Token hết hạn hoặc không hợp lệ' });
        }
    }
};


export { accessToken };