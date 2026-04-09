import Joi from "joi"

class ThemSanPhamRequest {
    constructor(data) {
        this.name = data.name;
        this.mota = data.mota;
        this.gia = data.gia;
        this.soluong = data.soluong;
        this.url = data.url;
        this.loai_id = data.loai_id;
        this.thuonghieu_id = data.thuonghieu_id;
    }
    static validate(data) {
        const schema = Joi.object({
            name: Joi.string().min(3).max(255).required(),
            mota: Joi.string().min(10).required(),
            gia: Joi.number().positive().required(),
            soluong: Joi.number().integer().min(0).required(),
            url: Joi.string().allow("", null).optional(),
            loai_id: Joi.number().integer().required(),
            thuonghieu_id: Joi.number().integer().required()
        });
        return schema.validate(data);
    }
}
export default ThemSanPhamRequest