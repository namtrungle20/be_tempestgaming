import { Op } from 'sequelize'
import db from '../models/index.js'

const PAGE_SIZE = 10

export const layThuongHieus = async ({ search = '', page = 1 }) => {
    const offset = (parseInt(page, 10) - 1) * PAGE_SIZE
    const where = search.trim() ? { name: { [Op.like]: `%${search}%` } } : {}

    const [data, total] = await Promise.all([
        db.ThuongHieu.findAll({ where, limit: PAGE_SIZE, offset }),
        db.ThuongHieu.count({ where })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / PAGE_SIZE) }
}

export const layThuongHieuTheoId = async (id) => {
    const thuongHieu = await db.ThuongHieu.findByPk(id)
    if (!thuongHieu) throw { status: 404, message: 'Không tìm thấy thương hiệu' }
    return thuongHieu
}

export const themThuongHieu = async ({ name, image }) => {
    if (!name) throw { status: 400, message: 'Tên thương hiệu không được để trống' }
    return await db.ThuongHieu.create({ name, image })
}

export const capNhatThuongHieu = async (id, { name, image }) => {
    const thuongHieu = await db.ThuongHieu.findByPk(id)
    if (!thuongHieu) throw { status: 404, message: 'Không tìm thấy thương hiệu' }

    if (name) {
        const existed = await db.ThuongHieu.findOne({ where: { name, thuonghieu_id: { [Op.ne]: id } } })
        if (existed) throw { status: 409, message: 'Tên thương hiệu đã tồn tại' }
    }

    await thuongHieu.update({ name, ...(image && { image }) })
}

export const xoaThuongHieu = async (id) => {
    const deleted = await db.ThuongHieu.destroy({ where: { thuonghieu_id: id } })
    if (!deleted) throw { status: 404, message: 'Không tìm thấy thương hiệu để xóa' }
}