import * as ChiTietGioHangService from '../services/ChiTietGioHang.service.js'

export const getChiTietGioHangs = async (req, res) => {
    const result = await ChiTietGioHangService.layChiTietGioHangs(req.query)
    return res.status(200).json({ message: 'Lấy danh sách chi tiết giỏ hàng thành công', ...result })
}

export const getChiTietGioHangById = async (req, res) => {
    const data = await ChiTietGioHangService.layChiTietGioHangTheoId(req.params.id)
    return res.status(200).json({ message: 'Lấy chi tiết giỏ hàng thành công', data })
}

export const getChiTietGioHangByGioHangId = async (req, res) => {
    const data = await ChiTietGioHangService.layChiTietGioHangTheoGioHangId(req.params.giohang_id)
    return res.status(200).json({ message: 'Lấy danh sách chi tiết giỏ hàng thành công', data })
}

export const themHoacCapNhatChiTietGioHang = async (req, res) => {
    const result = await ChiTietGioHangService.themHoacCapNhatChiTiet(req.body)
    if (result.deleted) return res.status(200).json({ message: 'Đã xóa chi tiết giỏ hàng vì số lượng = 0' })
    if (result.updated) return res.status(200).json({ message: 'Cập nhật số lượng mục trong giỏ hàng thành công', data: result.data })
    return res.status(201).json({ message: 'Thêm giỏ hàng thành công', data: result.data })
}

export const xoaChiTietGioHang = async (req, res) => {
    await ChiTietGioHangService.xoaChiTietGioHang(req.params.id)
    return res.status(200).json({ message: 'Xóa chi tiết giỏ hàng thành công' })
}