import Joi from 'joi';
class ThanhToanRequest {
    static validate(data) {
        const schema = Joi.object({
            diachi: Joi.string().required(),
            sdt: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
            phuongthuc: Joi.string().valid('COD', 'BANKING').default('COD')
        });
        return schema.validate(data);
    }
}
export default ThanhToanRequest;