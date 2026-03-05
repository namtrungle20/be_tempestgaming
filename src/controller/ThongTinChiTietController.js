// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const db = require('../models'); 
import db from "../models/index.js";

export async function getThongTinChiTiet(req, res) {
    const thongtinchitiet = await db.ThongTinChiTiet.findAll();
    res.status(200).json({
        message: 'Lấy thông tin thành công',
        data: thongtinchitiet
    })
}
export async function getThongTinChiTietById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin sản phẩm'
    })
}
export async function themThongTinChiTiet(req, res) {

    const thongtin = await db.ThongTinChiTiet.create(req.body);
    res.status(200).json({
        message: 'Thêm thông tin thành công',
        data: thongtin
    });
}

export async function xoaThongTinChiTiet(req, res) {
    res.status(200).json({
        message: 'Xóa thông tin thành công'
    })
}
export async function updateThongTinChiTiet(req, res) {
    res.status(200).json({
        message: 'Update thông tin thành công'
    })
}
