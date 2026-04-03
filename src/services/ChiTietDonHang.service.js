import db from '../models/index.js'

const sanphamInclude = { model: db.SanPham, as: 'SanPham', attributes: ['name', 'gia', 'image'] }

export const layChiTietDonHangs = async ({ page = 1, donhang_id }) => {
    const pageSize = 5
    const offset = (parseInt(page, 10) - 1) * pageSize
    const where = donhang_id ? { donhang_id } : {}

    const [data, total] = await Promise.all([
        db.ChiTietDonHang.findAll({ where, limit: pageSize, offset, include: [sanphamInclude] }),
        db.ChiTietDonHang.count({ where })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / pageSize) }
}

export const layChiTietDonHangTheoId = async (id) => {
    const chitiet = await db.ChiTietDonHang.findByPk(id, { include: [sanphamInclude] })
    if (!chitiet) throw { status: 404, message: 'Chi tiết đơn hàng không tồn tại' }
    return chitiet
}

export const themChiTietDonHang = async ({ donhang_id, sanpham_id, soluong, dongia }) => {
    const item = await db.ChiTietDonHang.findOne({ where: { donhang_id, sanpham_id } })
    if (item) throw { status: 400, message: 'Sản phẩm đã tồn tại trong đơn hàng' }
    return await db.ChiTietDonHang.create({ donhang_id, sanpham_id, soluong, dongia })
}

export const xoaChiTietDonHang = async ({ donhang_id, sanpham_id }) => {
    const deleted = await db.ChiTietDonHang.destroy({ where: { donhang_id, sanpham_id } })
    if (!deleted) throw { status: 404, message: 'Không tìm thấy sản phẩm để xóa khỏi đơn hàng' }
}

export const capNhatChiTietDonHang = async ({ donhang_id, sanpham_id }, { soluong, dongia }) => {
    const [updated] = await db.ChiTietDonHang.update({ soluong, dongia }, { where: { donhang_id, sanpham_id } })
    if (!updated) throw { status: 404, message: 'Không tìm thấy sản phẩm để cập nhật' }
}