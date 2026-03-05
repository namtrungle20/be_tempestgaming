import { Op } from 'sequelize';
import db from '../models/index.js';

const PAGE_SIZE = 10;

const includeProduct = { model: db.SanPham, as: 'SanPhams' };

export const getHinhAnhSanPhams = async (req, res) => {
    const { search = '', page = 1 } = req.query;
    const offset = (parseInt(page, 10) - 1) * PAGE_SIZE;

    const where = search.trim()
        ? { image_url: { [Op.like]: `%${search}%` } }
        : {};

    const [data, total] = await Promise.all([
        db.HinhAnhSanPham.findAll({ where, limit: PAGE_SIZE, offset, include: [includeProduct] }),
        db.HinhAnhSanPham.count({ where }),
    ]);

    return res.status(200).json({
        success: true,
        data,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(total / PAGE_SIZE),
        total,
    });
};

export const getHinhAnhSanPhamById = async (req, res) => {
    const hinhanh = await db.HinhAnhSanPham.findByPk(req.params.id, {
        include: [includeProduct],
    });

    if (!hinhanh) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hình ảnh' });
    }

    return res.status(200).json({ success: true, data: hinhanh });
};

export const themHinhAnhSanPham = async (req, res) => {
    const { sanpham_id, image_url } = req.body;

    if (!sanpham_id || !image_url) {
        return res.status(400).json({ success: false, message: 'Thiếu sanpham_id hoặc image_url' });
    }

    const sanpham = await db.SanPham.findByPk(sanpham_id);
    if (!sanpham) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const existed = await db.HinhAnhSanPham.findOne({ where: { sanpham_id, image_url } });
    if (existed) {
        return res.status(409).json({ success: false, message: 'Hình ảnh này đã được thêm cho sản phẩm' });
    }

    const hinhanh = await db.HinhAnhSanPham.create({ sanpham_id, image_url });
    return res.status(201).json({ success: true, message: 'Thêm hình ảnh thành công', data: hinhanh });
};

export const xoaHinhAnhSanPham = async (req, res) => {
    const deleted = await db.HinhAnhSanPham.destroy({ where: { id: req.params.id } });

    if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hình ảnh để xóa' });
    }

    return res.status(200).json({ success: true, message: 'Xóa hình ảnh thành công' });
};