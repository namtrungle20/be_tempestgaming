import * as SanPhamService from '../services/SanPham.service.js'

export const getSanPhams = async (req, res) => {
    const result = await SanPhamService.laySanPham(req.query)
    return res.status(200).json({ success: true, ...result })
}

export const getSanPhamById = async (req, res) => {
    const data = await SanPhamService.laySanPhamTheoId(req.params.id)
    return res.status(200).json({ success: true, data })
}

export const themSanPham = async (req, res) => {
    const image = req.file ? req.file.filename : req.body.image
    const data = await SanPhamService.themSanPham({ ...req.body, image })
    return res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data })
}

export const updateSanPham = async (req, res) => {
    const updateData = {
        ...req.body,
        ...(req.file && { image: req.file.filename })
    }
    await SanPhamService.capNhatSanPham(req.params.id, updateData)
    return res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công' })
}

export const xoaSanPham = async (req, res) => {
    await SanPhamService.xoaSanPham(req.params.id)
    return res.status(200).json({ success: true, message: 'Xóa sản phẩm thành công' })
}