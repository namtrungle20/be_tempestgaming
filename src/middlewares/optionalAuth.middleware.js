import jwt from 'jsonwebtoken'

// Không chặn nếu thiếu token. Nếu có token hợp lệ -> req.user. Nếu không -> req.user = null (khách).
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1]
            req.user = jwt.verify(token, process.env.JWT_SECRET_KEY)
        } catch {
            req.user = null
        }
    } else {
        req.user = null
    }
    next()
}