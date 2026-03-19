// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const db = require('../models'); 
import db from "../models/index.js";

// Lấy danh sách chi tiết giỏ hàng (có phân trang + filter theo giohang_id)
export async function getChiTietGioHangs(req, res) {
    const { page = 1, giohang_id } = req.query;
    const pageSize = 5;
    const currentPage = parseInt(page, 10) || 1;
    const offset = (currentPage - 1) * pageSize;

    let whereClause = {};
    if (giohang_id) whereClause.giohang_id = giohang_id;

    const [chitiets, total] = await Promise.all([
        db.ChiTietGioHang.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
            include: [
                {
                    model: db.SanPham, // giả sử có quan hệ với bảng Sản Phẩm
                    as: "SanPham"
                }
            ]
        }),
        db.ChiTietGioHang.count({ where: whereClause })
    ]);

    return res.status(200).json({
        message: "Lấy danh sách chi tiết giỏ hàng thành công",
        data: chitiets,
        currentPage,
        totalPages: Math.ceil(total / pageSize),
        total
    });
}

// Lấy chi tiết giỏ hàng theo id
export async function getChiTietGioHangById(req, res) {
    const { id } = req.params;
    const chitiet = await db.ChiTietGioHang.findByPk(id);

    if (!chitiet) {
        return res.status(404).json({ message: "Chi tiết giỏ hàng không tồn tại" });
    }

    return res.status(200).json({ message: "Lấy chi tiết giỏ hàng thành công", data: chitiet });
}

export async function getChiTietGioHangByGioHangId(req, res) {
    const { giohang_id } = req.params;

    // Tìm tất cả chi tiết giỏ hàng theo giohang_id
    const chitiets = await db.ChiTietGioHang.findAll({
        where: { giohang_id: giohang_id },
        include: [
            {
                model: db.SanPham, // nếu bạn có bảng sản phẩm liên kết
                as: "SanPham"
            }
        ]
    });
    return res.status(200).json({
        message: "Lấy danh sách chi tiết giỏ hàng thành công",
        data: chitiets
    });
}

// Thêm chi tiết giỏ hàng
export async function themChiTietGioHang(req, res) {
    const { giohang_id, sanpham_id, soluong } = req.body

    const giohangExists = await db.GioHang.findByPk(giohang_id);
    if (!giohangExists) {
        return res.status(404).json({
            message: 'Giỏ hàng không tồn tại'
        });
    }

    const sanphamExists = await db.SanPham.findByPk(sanpham_id);
    if (!sanphamExists) {
        return res.status(404).json({
            message: 'Sản phẩm không tồn tại'
        });
    }
    if(sanphamExists.soluong < soluong){
        return res.status(400).json({
            message: 'Sản phẩm không đủ số lượng yêu cầu'
        });
    }

    const chitietExists = await db.ChiTietGioHang.findOne({
        where: {
            giohang_id: giohang_id,
            sanpham_id: sanpham_id
        }
    });

    if (chitietExists) {
        if (soluong === 0) {
            // Nếu số lượng = 0 thì xóa chi tiết giỏ hàng
            await chitietExists.destroy();
            return res.status(200).json({
                message: "Đã xóa chi tiết giỏ hàng vì số lượng = 0"
            });
        } else {
            // Nếu đã có thì cập nhật số lượng
            chitietExists.soluong = soluong; // hoặc += soluong nếu muốn cộng dồn
            await chitietExists.save();
            return res.status(200).json({
                message: 'Cập nhập số lượng mục trong giỏ hàng thành công',
                data: chitietExists
            });
        }
    } else {
        if (soluong > 0) {
            const newCTGioHang = await db.ChiTietGioHang.create(req.body);
            return res.status(201).json({
                message: "Thêm giỏ hàng thành công",
                data: newCTGioHang
            });
        }
    }
    return res.status(400).json({
        message: 'Không thể thêm mục giỏ hàng với số lượng bằng 0'
    });
}

// Xóa chi tiết giỏ hàng
export async function xoaChiTietGioHang(req, res) {
    const { id } = req.params;
    const deleted = await db.ChiTietGioHang.destroy({ where: { id: id } });

    if (!deleted) {
        return res.status(404).json({ message: "Không tìm thấy chi tiết giỏ hàng để xóa" });
    }

    return res.status(200).json({ message: "Xóa chi tiết giỏ hàng thành công" });
}

// Cập nhật chi tiết giỏ hàng
export async function updateChiTietGioHang(req, res) {
    const { id } = req.params;
    const updated = await db.ChiTietGioHang.update(req.body, { where: { chitietgiohang_id: id } });

    if (updated[0] > 0) {
        return res.status(200).json({ message: "Update chi tiết giỏ hàng thành công" });
    }

    return res.status(404).json({ message: "Không tìm thấy chi tiết giỏ hàng để cập nhật" });
}