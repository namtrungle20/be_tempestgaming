import jwt from 'jsonwebtoken';
import db from '../models/index.js';



async function verifyRefreshToken(token) {
    try {
        const stored = await db.Session.findOne({
            where: { refreshToken: token, is_revoked: false }
        });

        if (!stored) {
            return null;
        }

        if (stored.expires_at < new Date()) {
            return null;
        }

        return stored; // trả về session hoặc user_id
    } catch (error) {
        return null;
    }

}

export { verifyRefreshToken };
