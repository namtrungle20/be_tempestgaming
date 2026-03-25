import { Op } from 'sequelize'
import db from '../models/index.js'
import TrangThaiDonHang from '../constants/TrangThaiSanPham.js'

export const layDonHangs = async ({ search = '', page = 1, trangthai }) => {
    const PAGE_SIZE = 10
    const offset = (page - 1) * PAGE_SIZE
    const where = {}

    if (search.trim()) {
        where[Op.or] = [
            { ma_don: { [Op.like]: `%${search}%` } },
            { ten_khach: { [Op.like]: `%${search}%` } }
        ]
    }
    if (trangthai) where.trangthai = trangthai

    const [data, total] = await Promise.all([
        db.DonHang.findAll({ where, order: [['created_at', 'DESC']], limit: PAGE_SIZE, offset }),
        db.DonHang.count({ where })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / PAGE_SIZE) }
}

export const layDonHangTheoId = async (id) => {
    const donhang = await db.DonHang.findByPk(id, {
        include: [
            { model: db.NguoiDung, as: 'NguoiDung' },
            { model: db.ChiTietDonHang, include: [{ model: db.SanPham, as: 'SanPham' }] }
        ]
    })
    if (!donhang) throw { status: 404, message: 'Không tìm thấy đơn hàng' }
    return donhang
}

export const xoaDonHang = async (id) => {
    const [updated] = await db.DonHang.update({ trangthai: TrangThaiDonHang.DA_HUY }, { where: { donhang_id: id } })
    if (!updated) throw { status: 404, message: 'Không tìm thấy đơn hàng để hủy' }
}

export const capNhatDonHang = async (id, data) => {
    const donhang = await db.DonHang.findByPk(id)
    if (!donhang) throw { status: 404, message: 'Không tìm thấy đơn hàng để cập nhật' }
    await donhang.update({ ...donhang.toJSON(), ...data })
    return await db.DonHang.findByPk(id)
}