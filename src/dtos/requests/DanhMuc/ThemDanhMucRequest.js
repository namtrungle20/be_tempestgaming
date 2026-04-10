import Joi from 'joi';

class ThemDanhMucRequest {
    static validate(data) {
        const schema = Joi.object({
            ten: Joi.string().min(2).max(255).required(),
            url: Joi.string().max(255).optional().allow('', null),
            mota: Joi.string().optional().allow('', null),
            thutu: Joi.number().integer().min(0).default(0),
            trangthai: Joi.number().integer().valid(0, 1).default(1)
        });
        return schema.validate(data);
    }
}
export default ThemDanhMucRequest;