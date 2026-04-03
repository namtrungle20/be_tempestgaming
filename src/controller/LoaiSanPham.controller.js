import * as LoaiSanPhamService from '../services/LoaiSanPham.service.js'

export const getLoaiSanPhams = async (req, res) => {
    const result = await LoaiSanPhamService.layLoaiSanPhams(req.query)
    return res.status(200).json({ success: true, ...result })
}

export const getLoaiSanPhamsById = async (req, res) => {
    const data = await LoaiSanPhamService.layLoaiSanPhamTheoId(req.params.id)
    return res.status(200).json({ success: true, data })
}

export const themLoaiSanPhams = async (req, res) => {
    const image = req.file?.filename ?? null
    const data = await LoaiSanPhamService.themLoaiSanPham({ ...req.body, image })
    return res.status(201).json({ success: true, message: 'Thêm loại sản phẩm thành công', data })
}

export const updateLoaiSanPhams = async (req, res) => {
    const image = req.file?.filename
    await LoaiSanPhamService.capNhatLoaiSanPham(req.params.id, { ...req.body, ...(image && { image }) })
    return res.status(200).json({ success: true, message: 'Cập nhật loại sản phẩm thành công' })
}

export const xoaLoaiSanPhams = async (req, res) => {
    await LoaiSanPhamService.xoaLoaiSanPham(req.params.id)
    return res.status(200).json({ success: true, message: 'Xóa loại sản phẩm thành công' })
}