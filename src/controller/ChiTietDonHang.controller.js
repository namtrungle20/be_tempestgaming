import * as ChiTietDonHangService from '../services/ChiTietDonHang.service.js'

export const getChiTietDonHangs = async (req, res) => {
    const result = await ChiTietDonHangService.layChiTietDonHangs(req.query)
    return res.status(200).json({ message: 'Lấy danh sách chi tiết đơn hàng thành công', ...result })
}

export const getChiTietDonHangById = async (req, res) => {
    const data = await ChiTietDonHangService.layChiTietDonHangTheoId(req.params.id)
    return res.status(200).json({ message: 'Lấy chi tiết đơn hàng thành công', data })
}

export const themChiTietDonHang = async (req, res) => {
    const data = await ChiTietDonHangService.themChiTietDonHang(req.body)
    return res.status(201).json({ message: 'Thêm sản phẩm vào đơn hàng thành công', data })
}

export const xoaChiTietDonHang = async (req, res) => {
    await ChiTietDonHangService.xoaChiTietDonHang(req.params)
    return res.status(200).json({ message: 'Xóa sản phẩm khỏi đơn hàng thành công' })
}

export const updateChiTietDonHang = async (req, res) => {
    await ChiTietDonHangService.capNhatChiTietDonHang(req.params, req.body)
    return res.status(200).json({ message: 'Cập nhật chi tiết đơn hàng thành công' })
}