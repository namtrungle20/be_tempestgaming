import Joi from 'joi';
class ThanhToanRequest {
    static validate(data) {
        const schema = Joi.object({
            diachi: Joi.string().required(),
            // sdt: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
            sdt: Joi.string().required(),
            phuongthucthanhtoan: Joi.number().valid(0, 1, 2).default(0)
        });
        return schema.validate(data);
    }
}
export default ThanhToanRequest;