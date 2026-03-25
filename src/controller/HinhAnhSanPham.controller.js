import * as HinhAnhSanPhamService from '../services/HinhAnhSanPham.service.js'

export const getHinhAnhSanPhams = async (req, res) => {
    const result = await HinhAnhSanPhamService.layHinhAnhSanPhams(req.query)
    return res.status(200).json({ success: true, ...result })
}

export const getHinhAnhSanPhamById = async (req, res) => {
    const data = await HinhAnhSanPhamService.layHinhAnhSanPhamTheoId(req.params.id)
    return res.status(200).json({ success: true, data })
}

export const themHinhAnhSanPham = async (req, res) => {
    const data = await HinhAnhSanPhamService.themHinhAnhSanPham(req.body)
    return res.status(201).json({ success: true, message: 'Thêm hình ảnh thành công', data })
}

export const xoaHinhAnhSanPham = async (req, res) => {
    await HinhAnhSanPhamService.xoaHinhAnhSanPham(req.params.id)
    return res.status(200).json({ success: true, message: 'Xóa hình ảnh thành công' })
}