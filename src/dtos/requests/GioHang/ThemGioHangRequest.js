import Joi from "joi";

class ThemGioHangRequest {
    constructor(data) {
        this.giohang_id = data.giohang_id;
        this.khachhang_id = data.khachhang_id;
    }

    static validate(data) {
        const schema = Joi.object({
            giohang_id: Joi.number().integer().optional(),
            khachhang_id: Joi.string().required(),
        });

        return schema.validate(data);
    }
}

export default ThemGioHangRequest;
