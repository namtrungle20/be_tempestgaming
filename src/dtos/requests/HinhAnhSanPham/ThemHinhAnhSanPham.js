import Joi from "joi";

class ThemHinhAnhSanPhamRequest  {
    constructor(data) {
        this.sanpham_id = data.sanpham_id;
        this.image_url = data.image_url;
    }
    static validate(data){
        const schema = Joi.object({
            sanpham_id: Joi.number().integer().required(),
            image_url: Joi.string().required()
        })
        return schema.validate(data);
    }

}
export default ThemHinhAnhSanPhamRequest