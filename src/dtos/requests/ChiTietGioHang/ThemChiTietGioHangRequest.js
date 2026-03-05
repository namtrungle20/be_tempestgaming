import Joi from "joi";

class ThemChiTietGioHangRequest {
    constructor(data) {
        this.giohang_id = data.giohang_id;
        this.sanpham_id = data.sanpham_id;
        this.soluong = data.soluong;
    }

    static validate(data) {
        const schema = Joi.object({
            giohang_id: Joi.number().integer().required(),
            sanpham_id: Joi.number().integer().required(),
            soluong: Joi.number().integer().min(0).required()
        });

        return schema.validate(data);
    }
}

export default ThemChiTietGioHangRequest;
