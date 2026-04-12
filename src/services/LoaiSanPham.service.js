import { Op } from 'sequelize'
import db from '../models/index.js'

const PAGE_SIZE = 10
const buildWhere = ({ search, danhmuc_id }) => {
    const where = {};
    if (search && search.trim()) {
        where.name = { [Op.like]: `%${search}%` };
    }
    if (danhmuc_id) {
        where.danhmuc_id = danhmuc_id;
    }
    return where;
};

export const layLoaiSanPhams = async ({ search = '', page = 1, danhmuc_id = null }) => {
    const offset = (parseInt(page, 10) - 1) * PAGE_SIZE
    const where = buildWhere({ search, danhmuc_id });

    const [data, total] = await Promise.all([
        db.LoaiSanPham.findAll({
            where,
            limit: PAGE_SIZE,
            offset,
            include: [{ model: db.DanhMuc, as: 'DanhMuc', attributes: ['danhmuc_id', 'ten'] }]
        }),
        db.LoaiSanPham.count({ where })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / PAGE_SIZE) }
}

export const layLoaiSanPhamTheoId = async (id) => {
    const loaiSP = await db.LoaiSanPham.findByPk(id, {
        include: [{ model: db.DanhMuc, as: 'DanhMuc', attributes: ['danhmuc_id', 'ten'] }]
    });
    if (!loaiSP) throw { status: 404, message: 'Không tìm thấy loại sản phẩm' };
    return loaiSP;
}

export const themLoaiSanPham = async ({ name, image, danhmuc_id }) => {
    const danhMuc = await db.DanhMuc.findByPk(danhmuc_id);
    if (!danhMuc) throw { status: 404, message: 'Danh mục cha không tồn tại' };

    // Kiểm tra tên trùng
    const existed = await db.LoaiSanPham.findOne({ where: { name } });
    if (existed) throw { status: 409, message: 'Tên loại sản phẩm đã tồn tại' };

    return await db.LoaiSanPham.create({ name, image, danhmuc_id });
}

export const capNhatLoaiSanPham = async (id, { name, image, danhmuc_id }) => {
    const loaiSP = await db.LoaiSanPham.findByPk(id)
    if (!loaiSP) throw { status: 404, message: 'Không tìm thấy loại sản phẩm' };

    if (name && name !== loaiSP.name) {
        const existed = await db.LoaiSanPham.findOne({ where: { name, loai_id: { [Op.ne]: id } } });
        if (existed) throw { status: 409, message: 'Tên loại sản phẩm đã tồn tại' };
    }

    if (danhmuc_id) {
        const danhMuc = await db.DanhMuc.findByPk(danhmuc_id);
        if (!danhMuc) throw { status: 404, message: 'Danh mục cha không tồn tại' };
    }

    await loaiSP.update({ name, image, danhmuc_id });
    return loaiSP;
};

export const xoaLoaiSanPham = async (id) => {
    const productCount = await db.SanPham.count({ where: { loai_id: id } });
    if (productCount > 0) {
        throw { status: 400, message: 'Không thể xóa loại sản phẩm vì có sản phẩm đang thuộc loại này' };
    }
    const deleted = await db.LoaiSanPham.destroy({ where: { loai_id: id } });
    if (!deleted) throw { status: 404, message: 'Không tìm thấy loại sản phẩm để xóa' };
};