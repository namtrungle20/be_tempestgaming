import Joi from 'joi';

class ThemLoaiSanPhamRequest {
  static validate(data) {
    const schema = Joi.object({
      name: Joi.string().min(2).max(255).required(),
      image: Joi.string().allow('', null).optional(),
      danhmuc_id: Joi.number().integer().required(), // bắt buộc chọn danh mục cha
    });
    return schema.validate(data);
  }
}
export default ThemLoaiSanPhamRequest;