const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Lỗi server';

        console.error(`[AsyncHandler Error] ${status}:`, message);
        return res.status(status).json({
            success: false,
            message: message,
            ...(process.env.NODE_ENV === 'development' && { detail: error.stack })
        });
    }
};

export default asyncHandler;