import Joi from 'joi';

class UpdateLoaiSanPhamRequest {
  static validate(data) {
    const schema = Joi.object({
      name: Joi.string().min(2).max(255).optional(),
      image: Joi.string().allow('', null).optional(),
      danhmuc_id: Joi.number().integer().optional(),
    }).min(1);
    return schema.validate(data);
  }
}
export default UpdateLoaiSanPhamRequest;