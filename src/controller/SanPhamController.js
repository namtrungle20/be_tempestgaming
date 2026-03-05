import { Sequelize, where } from "sequelize"
const { Op } = Sequelize;
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const db = require('../models'); 
import db from "../models/index.js";

export async function getSanPhams(req, res) {
    // const sanphams = await db.SanPham.findAll()
    const { search = '', page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;
    let whereClause = {};
    if (search.trim() !== '') {
        whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { mota: { [Op.like]: `%${search}%` } },
            ]
        }
    }
    const [sanphams, tongSP] = await Promise.all([
        db.SanPham.findAll({
            where: whereClause,
            limit: pageSize,
            offset,
            include: [
                { model: db.ThuongHieu, attributes: ['name'] }, // Chỉ lấy name
                { model: db.LoaiSanPham, attributes: ['name'] } // Chỉ lấy name
            ],
            // Sắp xếp mới nhất lên đầu
            order: [['createdAt', 'DESC']]
        }),
        db.SanPham.count({
            where: whereClause
        })
    ]);


    return res.status(200).json({
        message: 'Lấy danh sách sản phẩm thành công',
        data: sanphams,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(tongSP / pageSize),
        tongSP
    });
}

export async function getSanPhamsById(req, res) {
    const { id } = req.params
    const sanpham = await db.SanPham.findByPk(id, {

        include: [
            {
                model: db.HinhAnhSanPham,
                as: "HinhAnhSanPhams"
            },
            { model: db.ThuongHieu, attributes: ['name'] }, // Chỉ lấy name
            { model: db.LoaiSanPham, attributes: ['name'] }
        ],
        order: [['createdAt', 'DESC']]
    });

    if (!sanpham) {
        return res.status(404).json({
            message: 'Không tìm thấy sản phẩm'
        });
    } else {
        return res.status(200).json({
            message: 'Lấy thông tin sản phẩm',
            data: sanpham
        });
    }

}
export async function themSanPhams(req, res) {
    try {
        // 1. Bốc tách dữ liệu tường minh
        const { name, mota, gia, soluong, loai_id, thuonghieu_id } = req.body;
        const image = req.file ? req.file.filename : req.body.image;

        // 2. Kiểm tra thủ công các trường bắt buộc (phòng hờ nếu ko qua Joi)
        const validationErrors = {};
        if (!name) validationErrors.name = "Tên sản phẩm không được để trống";
        if (!loai_id) validationErrors.loai_id = "Vui lòng chọn loại sản phẩm";
        if (!thuonghieu_id) validationErrors.thuonghieu_id = "Vui lòng chọn thương hiệu";
        if (!image) validationErrors.image = "Vui lòng chèn ảnh cho sản phẩm";

        // Nếu có lỗi thì trả về ngay để Frontend hiện đỏ các ô Input
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors
            });
        }

        // 3. Kiểm tra tồn tại trong DB
        const [loaiSanPham, thuongHieu] = await Promise.all([
            db.LoaiSanPham.findByPk(loai_id),
            db.ThuongHieu.findByPk(thuonghieu_id)
        ]);

        if (!loaiSanPham) return res.status(404).json({ message: 'Loại sản phẩm không tồn tại' });
        if (!thuongHieu) return res.status(404).json({ message: 'Thương hiệu không tồn tại' });

        // 4. Tạo sản phẩm mới với dữ liệu đã lọc
        const sanpham = await db.SanPham.create({
            name,
            mota,
            gia: gia || 0,
            soluong: soluong || 0,
            loai_id,
            thuonghieu_id,
            image
        });

        return res.status(200).json({
            success: true,
            message: 'Thêm sản phẩm thành công',
            data: sanpham
        });

    } catch (error) {
        console.error("Lỗi Thêm Sản Phẩm:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi thêm sản phẩm",
            error: error.message
        });
    }
}
export async function xoaSanPhams(req, res) {
    const { id } = req.params;
    const deleted = await db.SanPham.destroy({
        where: { sanpham_id: id }
    });
    if (!deleted) {
        return res.status(404).json({
            message: 'Không tìm thấy',
            error
        })
    } else {
        return res.status(200).json({
            message: 'Xóa sản phẩm thành công',
        })
    }

}
export async function updateSanPhams(req, res) {
    try {
        const { id } = req.params;

        if (req.body.name) {
            const existed = await db.SanPham.findOne({
                where: {
                    name: req.body.name,
                    sanpham_id: { [Op.ne]: id }
                }
            });

            if (existed) {
                return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại!' });
            }
        }

        // 2. Tạo object update
        // Kỹ thuật này gọi là "Direct Property Access"
        // Nếu req.body.mota không có, nó trả về undefined chứ KHÔNG Crash server.
        const updateData = {
            name: req.body.name,
            mota: req.body.mota, // <--- Dòng này thay thế cho dòng 144 cũ
            gia: req.body.gia,
            soluong: req.body.soluong,
            loai_id: req.body.loai_id,
            thuonghieu_id: req.body.thuonghieu_id
        };

        // 3. Xử lý ảnh (nếu có)
        if (req.file) {
            updateData.image = req.file.filename;
        }

        // 4. Thực thi Update
        const [updatedRows] = await db.SanPham.update(updateData, {
            where: { sanpham_id: id }
        });

        if (updatedRows > 0) {
            return res.status(200).json({ message: 'Cập nhật sản phẩm thành công' });
        } else {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm hoặc không có thay đổi nào' });
        }

    } catch (error) {
        // Bắt lỗi để server không sập
        console.error("Lỗi Controller:", error);
        return res.status(500).json({ message: "Lỗi Server Internal", error: error.message });
    }
}
