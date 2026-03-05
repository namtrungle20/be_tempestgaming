import Joi from "joi";
import { TrangThaiDonHang } from "../../../constants/index.js";

class UpdateDonHangRequest {
    constructor(data) {
        this.tongtien = data.tongtien;
        this.trangthai = data.trangthai;
    }
    static validate(data) {
        const schema = Joi.object({
            tongtien: Joi.number().precision(2).min(0).optional(),
            trangthai: Joi.number().integer().valid(...Object.values(TrangThaiDonHang)).optional()
        });

        return schema.validate(data);
    }
}

export default UpdateDonHangRequest;
