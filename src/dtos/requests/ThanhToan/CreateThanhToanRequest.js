import Joi from 'joi';
import { PhuongThucThanhToan } from '../../../constants/index.js';

class CreateThanhToanRequest {
    constructor(data) {
        this.donhang_id = data.donhang_id;
        this.sotien = data.sotien;
        this.phuongthucthanhtoan = data.phuongthucthanhtoan;
        this.orderInfo = data.orderInfo;
    }

    static validate(data) {
        const schema = Joi.object({
            donhang_id: Joi.string().uuid().required(),
            sotien: Joi.number().integer().positive().required(),
            phuongthucthanhtoan: Joi.number()
                .integer()
                .valid(...Object.values(PhuongThucThanhToan))
                .required(),
            orderInfo: Joi.string().min(3).max(255).optional(),
        });
        return schema.validate(data);
    }
}

export default CreateThanhToanRequest;