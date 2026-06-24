import { Op } from 'sequelize'
import db from '../models/index.js'


export const layThuongHieus = async ({ search = '' }) => {
    const where = search.trim() ? { name: { [Op.like]: `%${search}%` } } : {}

    const data = await db.ThuongHieu.findAll({ where, order: [['thuonghieu_id', 'ASC']] })
    return { data, total: data.length }
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