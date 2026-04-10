import Joi from 'joi';

class UpdateDanhMucRequest {
    static validate(data) {
        const schema = Joi.object({
            ten: Joi.string().min(2).max(255).optional(),
            url: Joi.string().max(255).optional().allow('', null),
            mota: Joi.string().optional().allow('', null),
            thutu: Joi.number().integer().min(0).optional(),
            trangthai: Joi.number().integer().valid(0, 1).optional()
        }).min(1); // ít nhất một trường được cập nhật
        return schema.validate(data);
    }
}
export default UpdateDanhMucRequest;