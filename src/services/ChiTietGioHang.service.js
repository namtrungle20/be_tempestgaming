import db from '../models/index.js'

const sanphamInclude = { model: db.SanPham, as: 'SanPham' }

export const layChiTietGioHangs = async ({ page = 1, giohang_id }) => {
    const pageSize = 5
    const offset = (parseInt(page, 10) - 1) * pageSize
    const where = giohang_id ? { giohang_id } : {}

    const [data, total] = await Promise.all([
        db.ChiTietGioHang.findAll({ where, limit: pageSize, offset, include: [sanphamInclude] }),
        db.ChiTietGioHang.count({ where })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / pageSize) }
}

export const layChiTietGioHangTheoId = async (id) => {
    const chitiet = await db.ChiTietGioHang.findByPk(id)
    if (!chitiet) throw { status: 404, message: 'Chi tiết giỏ hàng không tồn tại' }
    return chitiet
}

export const layChiTietGioHangTheoGioHangId = async (giohang_id) => {
    return await db.ChiTietGioHang.findAll({ where: { giohang_id }, include: [sanphamInclude] })
}

export const themChiTietGioHang = async ({ giohang_id, sanpham_id, soluong }) => {
    const [giohang, sanpham] = await Promise.all([
        db.GioHang.findByPk(giohang_id),
        db.SanPham.findByPk(sanpham_id)
    ])
    if (!giohang) throw { status: 404, message: 'Giỏ hàng không tồn tại' }
    if (!sanpham) throw { status: 404, message: 'Sản phẩm không tồn tại' }
    if (sanpham.soluong < soluong) throw { status: 400, message: 'Sản phẩm không đủ số lượng yêu cầu' }

    const existed = await db.ChiTietGioHang.findOne({ where: { giohang_id, sanpham_id } })

    if (existed) {
        if (soluong === 0) {
            await existed.destroy()
            return { deleted: true }
        }
        existed.soluong = soluong
        await existed.save()
        return { updated: true, data: existed }
    }

    if (soluong === 0) throw { status: 400, message: 'Không thể thêm mục giỏ hàng với số lượng bằng 0' }
    const data = await db.ChiTietGioHang.create({ giohang_id, sanpham_id, soluong })
    return { created: true, data }
}

export const xoaChiTietGioHang = async (id) => {
    const deleted = await db.ChiTietGioHang.destroy({ where: { id } })
    if (!deleted) throw { status: 404, message: 'Không tìm thấy chi tiết giỏ hàng để xóa' }
}