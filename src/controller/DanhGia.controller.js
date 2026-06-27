import * as DanhGiaService from '../services/DanhGia.service.js';

export const getDanhGia = async (req, res) => {
    const result = await DanhGiaService.layDanhGiaTheoSanPham(req.query);
    return res.status(200).json({ success: true, ...result });
};

export const checkDaMua = async (req, res) => {
    const { sanpham_id } = req.query;
    const nguoidung_id = req.user.nguoidung_id;
    const daMua = await DanhGiaService.kiemTraDaMua(nguoidung_id, sanpham_id);
    return res.status(200).json({ success: true, da_mua: daMua });
};

export const getAllDanhGia = async (req, res) => {
    const result = await DanhGiaService.layTatCaDanhGia(req.query);
    return res.status(200).json({ success: true, ...result });
}

export const postDanhGia = async (req, res) => {
    const { sanpham_id, sosao, binhluan } = req.body;
    const nguoidung_id = req.user.nguoidung_id;

    const data = await DanhGiaService.taoDanhGia({ nguoidung_id, sanpham_id, sosao, binhluan });
    return res.status(201).json({ success: true, message: 'Đánh giá thành công', data });
};

export const deleteDanhGia = async (req, res) => {
    await DanhGiaService.xoaDanhGia({
        danhgia_id: req.params.id,
        nguoidung_id: req.user.nguoidung_id,
        vaitro: req.user.vaitro,
    });
    return res.status(200).json({ success: true, message: 'Xóa đánh giá thành công' });
};