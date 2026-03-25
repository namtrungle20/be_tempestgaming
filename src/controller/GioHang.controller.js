import * as GioHangService from '../services/GioHang.service.js'

export const getGioHangs = async (req, res) => {
    const result = await GioHangService.layGioHangs(req.query)
    return res.status(200).json({ message: 'Lấy danh sách giỏ hàng thành công', ...result })
}

export const getGioHangById = async (req, res) => {
    const data = await GioHangService.layGioHangTheoId(req.params.id)
    return res.status(200).json({ message: 'Lấy giỏ hàng thành công', data })
}

export const ThemGioHang = async (req, res) => {
    const data = await GioHangService.themGioHang(req.body)
    return res.status(201).json({ message: 'Tạo giỏ hàng thành công', data })
}

export const xoaGioHang = async (req, res) => {
    await GioHangService.xoaGioHang(req.params.id)
    return res.status(200).json({ message: 'Xóa giỏ hàng thành công' })
}

export const ThanhToanGioHang = async (req, res) => {
    const donhang_id = await GioHangService.thanhToanGioHang(req.body)
    return res.status(201).json({ message: 'Thanh toán giỏ hàng thành công', donhang_id })
}