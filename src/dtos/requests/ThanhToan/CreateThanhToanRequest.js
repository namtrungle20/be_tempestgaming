import Joi from 'joi';
import { PhuongThucThanhToan } from '../../../constants/index.js';

class CreateThanhToanRequest {

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