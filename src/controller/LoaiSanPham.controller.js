import { Op } from 'sequelize';
import db from '../models/index.js';

const PAGE_SIZE = 10;

const buildSearchWhere = (search) =>
    search.trim() ? { name: { [Op.like]: `%${search}%` } } : {};

export const getLoaiSanPhams = async (req, res) => {
    const { search = '', page = 1 } = req.query;
    const offset = (parseInt(page, 10) - 1) * PAGE_SIZE;
    const where = buildSearchWhere(search);

    const [data, total] = await Promise.all([
        db.LoaiSanPham.findAll({ where, limit: PAGE_SIZE, offset }),
        db.LoaiSanPham.count({ where }),
    ]);

    return res.status(200).json({
        success: true,
        data,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(total / PAGE_SIZE),
        total,
    });
};

export const getLoaiSanPhamsById = async (req, res) => {
    const loaiSP = await db.LoaiSanPham.findByPk(req.params.id);
    if (!loaiSP) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy loại sản phẩm' });
    }
    return res.status(200).json({ success: true, data: loaiSP });
};

export const themLoaiSanPhams = async (req, res) => {
    const { name } = req.body;
    const image = req.file?.filename ?? null;

    const loaiSanPham = await db.LoaiSanPham.create({ name, image });
    return res.status(201).json({
        success: true,
        message: 'Thêm loại sản phẩm thành công',
        data: loaiSanPham,
    });
};

export const updateLoaiSanPhams = async (req, res) => {
    const { id } = req.params
    const { name } = req.body

    const loaiSP = await db.LoaiSanPham.findByPk(id)
    if (!loaiSP)
        return res.status(404).json({ success: false, message: 'Không tìm thấy loại sản phẩm' })

    if (name) {
        const existed = await db.LoaiSanPham.findOne({
            where: { name, loai_id: { [Op.ne]: id } }
        })
        if (existed)
            return res.status(409).json({ success: false, message: 'Tên loại sản phẩm đã tồn tại' })
    }

    const updateData = { name }
    if (req.file) updateData.image = req.file.filename

    await loaiSP.update(updateData) // ✅ instance update
    return res.status(200).json({ success: true, message: 'Cập nhật loại sản phẩm thành công' })
}

export const xoaLoaiSanPhams = async (req, res) => {
    const deleted = await db.LoaiSanPham.destroy({ where: { loai_id: req.params.id } });
    if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy loại sản phẩm để xóa' });
    }
    return res.status(200).json({ success: true, message: 'Xóa loại sản phẩm thành công' });
};