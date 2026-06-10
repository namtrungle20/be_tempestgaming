import Joi from "joi";

class ThemHinhAnhSanPhamRequest {
    constructor(data) {
        this.sanpham_id = data.sanpham_id;
    }
    static validate(data) {
        const schema = Joi.object({
            sanpham_id: Joi.string().required(),
            la_anh_dai_dien: Joi.boolean().optional(),
            image_url: Joi.string().uri().optional(),
        })
        return schema.validate(data);
    }

}
export default ThemHinhAnhSanPhamRequest