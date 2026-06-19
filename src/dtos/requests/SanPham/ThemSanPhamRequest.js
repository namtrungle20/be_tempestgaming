import Joi from "joi"

class ThemSanPhamRequest {
    constructor(data) {
        this.name = data.name;
        this.mota = data.mota;
        this.thong_so = data.thong_so;
        this.gia = data.gia;
        this.soluong = data.soluong;
        this.loai_id = data.loai_id;
        this.thuonghieu_id = data.thuonghieu_id;
    }
    static validate(data) {
        const schema = Joi.object({
            name: Joi.string().min(3).max(255).required(),
            mota: Joi.string().min(10).required(),
            thong_so: Joi.alternatives().try(
                Joi.object(),
                Joi.string()
            ).optional(),
            gia: Joi.number().positive().required(),
            soluong: Joi.number().integer().min(0).required(),
            loai_id: Joi.number().integer().required(),
            thuonghieu_id: Joi.number().integer().required()
        });
        return schema.validate(data);
    }
}
export default ThemSanPhamRequest