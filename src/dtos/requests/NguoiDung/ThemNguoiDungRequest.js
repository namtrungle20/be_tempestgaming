import Joi from "joi";
// import { VaiTroNguoiDung, TrangThaiKhoa } from "../../../constants/index.js";

// import bcrypt from 'bcrypt'

class ThemNguoiDungRequest {
    constructor(data) {
        this.name = data.name;
        this.email = data.email;
        this.password = data.password
        this.sdt = data.sdt;
        this.diachi = data.diachi;
        this.avatar = data.avatar;
        this.ngayvao = new Date();
        this.ngayhoatdong = new Date();

    }

    encryptPassword(password) {
        return "fake password"
    }

    static validate(data) {
        const schema = Joi.object({
            name: Joi.string().min(2).max(100).required(),
            email: Joi.string().email().optional(),
            password: Joi.string().min(6).max(100).required(),
            sdt: Joi.string().min(9).max(15).required(),
            diachi: Joi.string().max(255).allow(""),
            avatar: Joi.string()
                .uri() // nếu bạn lưu URL ảnh
                .allow("") // cho phép rỗng
                .optional(),
        });

        return schema.validate(data);
    }
}

export default ThemNguoiDungRequest;
