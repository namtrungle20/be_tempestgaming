import * as ChiTietSanPhamService from '../services/ChiTietSanPham.service.js';

export const getChiTietSanPham = async (req, res) => {
    const data = await ChiTietSanPhamService.layChiTietSanPham(req.query.sanpham_id);
    return res.status(200).json({ success: true, data });
};

export const themChiTietSanPham = async (req, res) => {
    const data = await ChiTietSanPhamService.themChiTietSanPham(req.body);
    return res.status(201).json({ success: true, message: 'Thêm thuộc tính thành công', data });
};

export const themNhieuChiTietSanPham = async (req, res) => {
    const { sanpham_id, chiTiets } = req.body;
    const result = await ChiTietSanPhamService.themNhieuChiTietSanPham(sanpham_id, chiTiets);
    return res.status(201).json({ success: true, message: 'Thêm thuộc tính thành công', data: result });
};

export const capNhatChiTietSanPham = async (req, res) => {
    const data = await ChiTietSanPhamService.capNhatChiTietSanPham(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Cập nhật thuộc tính thành công', data });
};

export const xoaChiTietSanPham = async (req, res) => {
    await ChiTietSanPhamService.xoaChiTietSanPham(req.params.id);
    return res.status(200).json({ success: true, message: 'Xóa thuộc tính thành công' });
};

export const xoaHetChiTietSanPham = async (req, res) => {
    const result = await ChiTietSanPhamService.xoaHetChiTietSanPham(req.query.sanpham_id);
    return res.status(200).json({ success: true, ...result });
};