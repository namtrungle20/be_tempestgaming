import Joi from "joi";

class ThemChiTietGioHangRequest {

    static validate(data) {
        const schema = Joi.object({
            sanpham_id: Joi.string().required(),
            soluong: Joi.number().integer().min(0).required()
        });

        return schema.validate(data);
    }
}

export default ThemChiTietGioHangRequest;
