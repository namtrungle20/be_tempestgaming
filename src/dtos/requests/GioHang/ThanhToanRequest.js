import Joi from 'joi';
class ThanhToanRequest {
    static validate(data) {
        const schema = Joi.object({
            diachi: Joi.string().required(),
            // sdt: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
            sdt: Joi.string()
                .trim()
                .min(10)
                .max(12)
                .pattern(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/)
                .required()
                .messages({
                    'string.empty': 'Vui lòng nhập số điện thoại',
                    'string.min': 'Số điện thoại phải có ít nhất 10 ký tự',
                    'string.max': 'Số điện thoại không được vượt quá 12 ký tự',
                    'string.pattern.base': 'Số điện thoại không hợp lệ (VD: 0912345678)',
                    'any.required': 'Vui lòng nhập số điện thoại',
                }),
            name: Joi.string().required(),
            phuongthucthanhtoan: Joi.number().valid(0, 1, 2).default(0)
        });
        return schema.validate(data);
    }
}
export default ThanhToanRequest;