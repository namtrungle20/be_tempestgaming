import Joi from "joi";


class ThemDonHangRequest {
    constructor(data) {
        this.nguoidung_id = data.nguoidung_id;
        this.tongtien = data.tongtien;
        this.trangthai = data.trangthai;
        this.sdt = data.sdt;
        this.diachi = data.diachi
    }
    static validate(data) {
        const schema = Joi.object({
            nguoidung_id: Joi.number().integer().required(),
            tongtien: Joi.number().precision(2).min(0).required(),
            trangthai: Joi.number().integer().min(1).required(),
            sdt: Joi.string().pattern(/^[0-9]+$/).required(),
            diachi: Joi.string().allow('').optional()
        });

        return schema.validate(data);
    }
}
export default ThemDonHangRequest;