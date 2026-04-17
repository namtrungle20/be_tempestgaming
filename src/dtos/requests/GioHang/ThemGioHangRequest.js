import Joi from "joi";

class ThemGioHangRequest {
    constructor(data) {
        this.giohang_id = data.giohang_id;
        this.nguoidung_id = data.nguoidung_id;
    }

    static validate(data) {
        const schema = Joi.object({
            giohang_id: Joi.string().uuid().optional(),
            nguoidung_id: Joi.string().uuid().optional(),
        }).xor('nguoidung_id');

        return schema.validate(data);
    }
}

export default ThemGioHangRequest;
