import { Op } from 'sequelize';
import db from '../models/index.js';

const PAGE_SIZE = 10;

const buildSearchWhere = (search) =>
    search.trim() ? { name: { [Op.like]: `%${search}%` } } : {};

export const getThuongHieus = async (req, res) => {
    const { search = '', page = 1 } = req.query;
    const offset = (parseInt(page, 10) - 1) * PAGE_SIZE;
    const where = buildSearchWhere(search);

    const [data, total] = await Promise.all([
        db.ThuongHieu.findAll({ where, limit: PAGE_SIZE, offset }),
        db.ThuongHieu.count({ where }),
    ]);

    return res.status(200).json({
        success: true,
        data,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(total / PAGE_SIZE),
        total,
    });
};

export const getThuongHieuById = async (req, res) => {
    const thuongHieu = await db.ThuongHieu.findByPk(req.params.id);
    if (!thuongHieu) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' });
    }
    return res.status(200).json({ success: true, data: thuongHieu });
};

export const themThuongHieu = async (req, res) => {
    const { name } = req.body;
    const image = req.file?.filename ?? req.body.image ?? null;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Tên thương hiệu không được để trống' });
    }

    const thuongHieu = await db.ThuongHieu.create({ name, image });
    return res.status(201).json({
        success: true,
        message: 'Thêm thương hiệu thành công',
        data: thuongHieu,
    });
};

export const updateThuongHieu = async (req, res) => {
    const { id } = req.params
    const { name } = req.body

    const thuongHieu = await db.ThuongHieu.findByPk(id)
    if (!thuongHieu)
        return res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' })

    if (name) {
        const existed = await db.ThuongHieu.findOne({
            where: { name, thuonghieu_id: { [Op.ne]: id } }
        })
        if (existed)
            return res.status(409).json({ success: false, message: 'Tên thương hiệu đã tồn tại' })
    }

    const updateData = { name }
    if (req.file) updateData.image = req.file.filename

    await thuongHieu.update(updateData) // ✅ instance update
    return res.status(200).json({ success: true, message: 'Cập nhật thương hiệu thành công' })
}

export const xoaThuongHieu = async (req, res) => {
    const deleted = await db.ThuongHieu.destroy({ where: { thuonghieu_id: req.params.id } });
    if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu để xóa' });
    }
    return res.status(200).json({ success: true, message: 'Xóa thương hiệu thành công' });
};