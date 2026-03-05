const validate = (schema) => async (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0]?.message ?? 'Dữ liệu không hợp lệ',
        });
    }
    next();
};

export default validate;