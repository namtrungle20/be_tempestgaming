import * as ThuongHieuService from '../services/ThuongHieu.service.js'

export const getThuongHieus = async (req, res) => {
    const result = await ThuongHieuService.layThuongHieus(req.query)
    return res.status(200).json({ success: true, ...result })
}

export const getThuongHieuById = async (req, res) => {
    const data = await ThuongHieuService.layThuongHieuTheoId(req.params.id)
    return res.status(200).json({ success: true, data })
}

export const themThuongHieu = async (req, res) => {
    const image = req.file?.filename ?? req.body.image ?? null
    const data = await ThuongHieuService.themThuongHieu({ ...req.body, image })
    return res.status(201).json({ success: true, message: 'Thêm thương hiệu thành công', data })
}

export const updateThuongHieu = async (req, res) => {
    const image = req.file?.filename
    await ThuongHieuService.capNhatThuongHieu(req.params.id, { ...req.body, ...(image && { image }) })
    return res.status(200).json({ success: true, message: 'Cập nhật thương hiệu thành công' })
}

export const xoaThuongHieu = async (req, res) => {
    await ThuongHieuService.xoaThuongHieu(req.params.id)
    return res.status(200).json({ success: true, message: 'Xóa thương hiệu thành công' })
}