// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const db = require('../models'); 
import db from "../models/index.js";

export async function getChiTietDonHangs(req, res) {
    const { page = 1, donhang_id } = req.query;
    const pageSize = 5;
    const currentPage = parseInt(page, 10) || 1;
    const offset = (currentPage - 1) * pageSize;

    let whereClause = {};
    if (donhang_id) whereClause.donhang_id = donhang_id;

    const [chitiets, total] = await Promise.all([
        db.ChiTietDonHang.findAll({
            where: whereClause,
            limit: pageSize,
            offset,
            include: [
                {
                    model: db.SanPham,
                    as: "SanPham",
                    attributes: ["name", "gia", "image"]
                }
            ]
        }),
        db.ChiTietDonHang.count({ where: whereClause })
    ]);

    return res.status(200).json({
        message: "Lấy danh sách chi tiết đơn hàng thành công",
        data: chitiets,
        currentPage,
        totalPages: Math.ceil(total / pageSize),
        total
    });
}


export async function getChiTietDonHangById(req, res) {
    const { id } = req.params;

    const chitiet = await db.ChiTietDonHang.findByPk(id, {
        include: [
            {
                model: db.SanPham,
                as: "SanPham",
                attributes: ["name", "gia", "image"]
            }
        ]
    });

    if (!chitiet) {
        return res.status(404).json({ message: "Chi tiết đơn hàng không tồn tại" });
    }

    return res.status(200).json({
        message: "Lấy chi tiết đơn hàng thành công",
        data: chitiet
    });
}


export async function themChiTietDonHang(req, res) {
    const { donhang_id, sanpham_id, soluong, dongia } = req.body;

    const item = await db.ChiTietDonHang.findOne({
        where: { donhang_id, sanpham_id }
    });

    if (item) {
        return res.status(400).json({ message: "Sản phẩm đã tồn tại trong đơn hàng" });
    }

    const chitiet = await db.ChiTietDonHang.create({ donhang_id, sanpham_id, soluong, dongia });

    res.status(201).json({
        message: "Thêm sản phẩm vào đơn hàng thành công",
        data: chitiet
    });

}

export async function xoaChiTietDonHang(req, res) {
    const { donhang_id, sanpham_id } = req.params;

    const deleted = await db.ChiTietDonHang.destroy({
        where: { donhang_id, sanpham_id }
    });

    if (!deleted) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm để xóa khỏi đơn hàng" });
    }

    res.status(200).json({ message: "Xóa sản phẩm khỏi đơn hàng thành công" });

}

export async function updateChiTietDonHang(req, res) {
    const { donhang_id, sanpham_id } = req.params;
    const { soluong, dongia } = req.body;

    const updated = await db.ChiTietDonHang.update(
        { soluong, dongia },
        { where: { donhang_id, sanpham_id } }
    );

    if (updated[0] === 0) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }

    res.status(200).json({ message: "Cập nhật chi tiết đơn hàng thành công" });

}
