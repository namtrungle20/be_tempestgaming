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
            name: Joi.string().min(2).max(100).required()
                .messages({
                    'string.empty': 'Vui lòng cung cấp tên',
                    'string.min': 'Tên phải có ít nhất 2 ký tự',
                    'string.max': 'Tên không được vượt quá 100 ký tự',
                    'any.required': 'Vui lòng cung cấp tên'
                }),
            email: Joi.string().trim()
                .lowercase()
                .email({
                    minDomainSegments: 2,
                    tlds: { allow: false }
                })
                .required()
                .messages({
                    'string.empty': 'Vui lòng cung cấp email',
                    'string.email': 'Email không đúng định dạng',
                    'any.required': 'Vui lòng cung cấp email'
                }),
            password: Joi.string()
                .min(6)
                .max(100)
                .required()
                .messages({
                    'string.empty': 'Vui lòng cung cấp mật khẩu',
                    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
                    'string.max': 'Mật khẩu không được vượt quá 100 ký tự',
                    'any.required': 'Vui lòng cung cấp mật khẩu'
                }),
            // sdt: Joi.string()
            //     .trim()
            //     .min(10)
            //     .max(12)
            //     .pattern(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/)
            //     .required(),
            // .messages({
            //     'string.empty': 'Vui lòng nhập số điện thoại',
            //     'string.min': 'Số điện thoại phải có ít nhất 10 ký tự',
            //     'string.max': 'Số điện thoại không được vượt quá 12 ký tự',
            //     'string.pattern.base': 'Số điện thoại không hợp lệ (VD: 0912345678)',
            //     'any.required': 'Vui lòng nhập số điện thoại',
            // }),
            diachi: Joi.string().max(255).allow(""),
            avatar: Joi.string()
                .uri()
                .allow("")
                .optional(),
        });

        return schema.validate(data);
    }
}

export default ThemNguoiDungRequest;
