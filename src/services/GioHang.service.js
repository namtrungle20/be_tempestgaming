import { Op } from 'sequelize'
import db from '../models/index.js'
import TrangThaiGioHang from '../constants/TrangThaiSanPham.js'

export const layGioHangs = async ({ page = 1, khachhang_id, nguoidung_id }) => {
    const pageSize = 5
    const offset = (parseInt(page, 10) - 1) * pageSize
    const where = {}
    if (khachhang_id) where.khachhang_id = khachhang_id
    if (nguoidung_id) where.nguoidung_id = nguoidung_id

    const [data, total] = await Promise.all([
        db.GioHang.findAll({ where, limit: pageSize, offset, include: [{ model: db.ChiTietGioHang, as: 'ChiTietGioHang' }] }),
        db.GioHang.count({ where })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / pageSize) }
}

export const layGioHangTheoId = async (id) => {
    const giohang = await db.GioHang.findByPk(id, {
        include: [{ model: db.ChiTietGioHang, as: 'ChiTietGioHang' }]
    })
    if (!giohang) throw { status: 404, message: 'Giỏ hàng không tồn tại' }
    return giohang
}

export const themGioHang = async ({ khachhang_id, nguoidung_id }) => {
    if ((khachhang_id && nguoidung_id) || (!khachhang_id && !nguoidung_id))
        throw { status: 400, message: 'Chỉ được cung cấp một trong hai giá trị khachhang_id hoặc nguoidung_id' }

    const cart = await db.GioHang.findOne({
        where: {
            [Op.or]: [
                { khachhang_id: khachhang_id ?? null },
                { nguoidung_id: nguoidung_id ?? null }
            ]
        }
    })
    if (cart) throw { status: 409, message: 'Giỏ hàng đã tồn tại với id khách hàng này' }

    return await db.GioHang.create({ khachhang_id, nguoidung_id })
}

export const xoaGioHang = async (id) => {
    const deleted = await db.GioHang.destroy({ where: { giohang_id: id } })
    if (!deleted) throw { status: 404, message: 'Không tìm thấy giỏ hàng để xóa' }
}

export const thanhToanGioHang = async ({ giohang_id, tongtien }) => {
    const t = await db.sequelize.transaction()
    try {
        const giohang = await db.GioHang.findByPk(giohang_id, {
            include: [{ model: db.ChiTietGioHang, as: 'ChiTietGioHang', required: true, include: [{ model: db.SanPham, as: 'SanPham' }] }]
        })
        if (!giohang || !giohang.ChiTietGioHang.length)
            throw { status: 404, message: 'Giỏ hàng không tồn tại hoặc trống' }

        const newDonHang = await db.DonHang.create({
            nguoidung_id: giohang.nguoidung_id,
            khachhang_id: giohang.khachhang_id,
            trangthai: TrangThaiGioHang.THANH_TOAN_THANH_CONG,
            tongtien: tongtien ?? giohang.ChiTietGioHang.reduce((acc, item) => acc + item.soluong * item.SanPham.gia, 0)
        }, { transaction: t })

        for (const item of giohang.ChiTietGioHang) {
            await db.ChiTietDonHang.create({
                donhang_id: newDonHang.donhang_id,
                sanpham_id: item.sanpham_id,
                soluong: item.soluong,
                dongia: item.SanPham.gia
            }, { transaction: t })
        }

        await db.ChiTietGioHang.destroy({ where: { giohang_id: giohang.giohang_id } }, { transaction: t })
        await giohang.destroy({ transaction: t })
        await t.commit()

        return newDonHang.donhang_id
    } catch (error) {
        await t.rollback()
        throw error
    }
}