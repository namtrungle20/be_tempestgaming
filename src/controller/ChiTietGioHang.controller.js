import {
    layChiTietGioHangs,
    layChiTietGioHangTheoId,
    layChiTietGioHangTheoGioHangId,
    capNhatSoLuongChiTiet,
    xoaChiTiet
} from '../services/ChiTietGioHang.service.js'

export const getChiTietGioHangs = async (req, res) => {
    const result = await layChiTietGioHangs(req.query)
    return res.status(200).json({ message: 'Lấy danh sách chi tiết giỏ hàng thành công', ...result })
}

export const getChiTietGioHangById = async (req, res) => {
    const data = await layChiTietGioHangTheoId(req.params.id)
    return res.status(200).json({ message: 'Lấy chi tiết giỏ hàng thành công', data })
}

export const getChiTietGioHangByGioHangId = async (req, res) => {
    const data = await layChiTietGioHangTheoGioHangId(req.params.giohang_id)
    return res.status(200).json({ message: 'Lấy danh sách chi tiết giỏ hàng thành công', data })
}

export const capNhatSoLuongChiTietGioHang = async (req, res) => {
    const result = await capNhatSoLuongChiTiet({ id: req.params.id, soluong: req.body.soluong })
    if (result.deleted)
        return res.status(200).json({ success: true, message: 'Đã xóa chi tiết giỏ hàng vì số lượng = 0' })
    res.status(200).json({ success: true, message: 'Cập nhật số lượng thành công', data: result.data })
}

export const xoaChiTietGioHang = async (req, res) => {
    await xoaChiTiet(req.params.id)
    return res.status(200).json({ message: 'Xóa chi tiết giỏ hàng thành công' })
}