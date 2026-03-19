import { Sequelize, where } from "sequelize";
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const db = require('../models'); 
import db from "../models/index.js";
import pkg from 'joi';
import { TrangThaiDonHang } from '../constants/index.js'
const { required } = pkg;
const { Op } = Sequelize;

export async function getGioHangs(req, res) {
    const { khachhang_id, nguoidung_id, page = 1 } = req.query;
    const pageSize = 5;
    const currentPage = parseInt(page, 10) || 1;
    const offset = (currentPage - 1) * pageSize;

    let whereClause = {};
    if (khachhang_id) whereClause.khachhang_id = khachhang_id
    if (nguoidung_id) whereClause.nguoidung_id = nguoidung_id

    const [giohangs, total] = await Promise.all([
        db.GioHang.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
            include: [
                {
                    model: db.ChiTietGioHang,
                    as: "ChiTietGioHang",
                }
            ]
        }),
        db.GioHang.count({
            where: whereClause
        })
    ]);

    return res.status(200).json({
        message: 'Lấy danh sách giỏ hàng thành công',
        data: giohangs,
        currentPage,
        totalPages: Math.ceil(total / pageSize),
        total
    });
}

export async function getGioHangById(req, res) {
    const { id } = req.params;
    const giohang = await db.GioHang.findByPk(id, {
        include: [
            {
                model: db.ChiTietGioHang,
                as: "ChiTietGioHang",
            }
        ]
    });

    if (!giohang) {
        return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    return res.status(200).json({ message: 'Lấy giỏ hàng thành công', data: giohang });
}

export async function ThanhToanGioHang(req, res) {

    const { giohang_id, tongtien } = req.body

    const t = await db.sequelize.transaction(); // bắt đầu transaction
    try {
        const giohang = await db.GioHang.findByPk(giohang_id, {
            include: [{
                model: db.ChiTietGioHang,
                as: 'ChiTietGioHang',
                required: true,
                include: [{
                    model: db.SanPham,
                    as: 'SanPham'
                }]
            }]
        });
        if (!giohang || !giohang.ChiTietGioHang.length) {
            return res.status(404).json({ message: 'Giỏ Hàng Không Tồn Tại Hoặc Trống' })
        }


        const newDonHang = await db.DonHang.create({
            nguoidung_id: giohang.nguoidung_id,
            khachhang_id: giohang.khachhang_id,
            trangthai: TrangThaiDonHang.THANH_TOAN_THANH_CONG,
            sdt:giohang.sdt,
            diachi:giohang.diachi,
            tongtien: tongtien ??
                giohang.ChiTietGioHang.reduce(
                    (acc, item) => acc + item.soluong * item.SanPham.gia,
                    0
                )
        }, { transaction: t });


        for (let item of giohang.ChiTietGioHang) {
            await db.ChiTietDonHang.create({
                donhang_id: newDonHang.donhang_id,
                sanpham_id: item.sanpham_id,
                soluong: item.soluong,
                dongia: item.SanPham.gia
            }, { transaction: t });
        }

        await db.ChiTietGioHang.destroy({
            where: {
                giohang_id: giohang.giohang_id
            }
        },
            { transaction: t })
        await giohang.destroy({ transaction: t });

        await t.commit();
        res.status(201).json({
            message: 'Thanh Toán Giỏ Hàng Thành Công',
            donhang_id: newDonHang.donhang_id
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: 'Lỗi Khi Thanh Toán Giỏ Hàng',
            error: error.message
        })
    }
}

export async function ThemGioHang(req, res) {
    const { khachhang_id, nguoidung_id } = req.body;

    if ((khachhang_id && nguoidung_id) || (!khachhang_id && !nguoidung_id)) {
        return res.status(400).json({
            message: 'Chỉ được cung cấp một trong hai giá trị khachhang_id hoặc nguoidung_id'
        })
    }
    const cart = await db.GioHang.findOne({
        where: {
            [Op.or]: [
                { khachhang_id: khachhang_id ? khachhang_id : null },
                { nguoidung_id: nguoidung_id ? nguoidung_id : null }
            ]
        }
    });

    if (cart) {
        return res.status(409).json({
            message: "Một giỏ hàng đã tồn tại cùng id khách hàng "
        })
    }
    const giohang = await db.GioHang.create(req.body);
    return res.status(201).json({
        message: 'Tạo giỏ hàng thành công',
        data: giohang
    });
}

export async function xoaGioHang(req, res) {
    const { id } = req.params;
    const deleted = await db.GioHang.destroy({ where: { giohang_id: id } });
    if (!deleted) {
        return res.status(404).json({ message: 'Không tìm thấy giỏ hàng để xóa' });
    }
    return res.status(200).json({ message: 'Xóa giỏ hàng thành công' });
}

// export async function updateGioHang(req, res) {
//     const { id } = req.params;
//     const updated = await db.GioHang.update(req.body, { where: { giohang_id: id } });
//     if (updated[0] > 0) {
//         return res.status(200).json({ message: 'Update giỏ hàng thành công' });
//     }
//     return res.status(404).json({ message: 'Không tìm thấy giỏ hàng để cập nhật' });
// }
