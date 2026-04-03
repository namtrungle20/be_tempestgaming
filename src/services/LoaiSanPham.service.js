import { Op } from 'sequelize'
import db from '../models/index.js'

const PAGE_SIZE = 10

export const layLoaiSanPhams = async ({ search = '', page = 1 }) => {
    const offset = (parseInt(page, 10) - 1) * PAGE_SIZE
    const where = search.trim() ? { name: { [Op.like]: `%${search}%` } } : {}

    const [data, total] = await Promise.all([
        db.LoaiSanPham.findAll({ where, limit: PAGE_SIZE, offset }),
        db.LoaiSanPham.count({ where })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / PAGE_SIZE) }
}

export const layLoaiSanPhamTheoId = async (id) => {
    const loaiSP = await db.LoaiSanPham.findByPk(id)
    if (!loaiSP) throw { status: 404, message: 'Không tìm thấy loại sản phẩm' }
    return loaiSP
}

export const themLoaiSanPham = async ({ name, image }) => {
    return await db.LoaiSanPham.create({ name, image })
}

export const capNhatLoaiSanPham = async (id, { name, image }) => {
    const loaiSP = await db.LoaiSanPham.findByPk(id)
    if (!loaiSP) throw { status: 404, message: 'Không tìm thấy loại sản phẩm' }

    if (name) {
        const existed = await db.LoaiSanPham.findOne({ where: { name, loai_id: { [Op.ne]: id } } })
        if (existed) throw { status: 409, message: 'Tên loại sản phẩm đã tồn tại' }
    }

    await loaiSP.update({ name, ...(image && { image }) })
}

export const xoaLoaiSanPham = async (id) => {
    const deleted = await db.LoaiSanPham.destroy({ where: { loai_id: id } })
    if (!deleted) throw { status: 404, message: 'Không tìm thấy loại sản phẩm để xóa' }
}