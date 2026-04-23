import { v7 as uuidv7 } from 'uuid';
import db from '../models/index.js';
import * as GioHangService from '../services/GioHang.service.js';
import * as ChiTietGioHangService from '../services/ChiTietGioHang.service.js';

// ========== USER ROUTES (lấy giỏ hàng của chính user) ==========
export const getMyGioHang = async (req, res) => {
    const userId = req.user.nguoidung_id;
    const gioHang = await GioHangService.layHoacTaoGioHang(userId);
    res.status(200).json({ success: true, data: gioHang });
};

export const themSanPhamVaoGio = async (req, res) => {
    const userId = req.user.nguoidung_id;
    const { sanpham_id, soluong = 1 } = req.body;

    let gioHang = await db.GioHang.findOne({ where: { nguoidung_id: userId } });
    if (!gioHang) {
        gioHang = await db.GioHang.create({
            giohang_id: uuidv7(),
            nguoidung_id: userId,
            tongtien: 0
        });
    }

    const result = await ChiTietGioHangService.themHoacCapNhatChiTiet({
        giohang_id: gioHang.giohang_id,
        sanpham_id,
        soluong
    });

    if (result.deleted) {
        return res.status(200).json({ success: true, message: result.message });
    }
    if (result.updated) {
        return res.status(200).json({ success: true, message: result.message, data: result.data });
    }
    return res.status(201).json({ success: true, message: result.message, data: result.data });
};

export const capNhatSoLuongTrongGio = async (req, res) => {
    const userId = req.user.nguoidung_id;
    const { sanpham_id, soluong } = req.body;
    await GioHangService.capNhatSoLuong(userId, sanpham_id, soluong);
    res.status(200).json({ success: true, message: 'Cập nhật số lượng thành công' });
};

export const xoaSanPhamKhoiGio = async (req, res) => {
    const userId = req.user.nguoidung_id;
    const { sanpham_id } = req.params;
    await GioHangService.xoaSanPham(userId, sanpham_id);
    res.status(200).json({ success: true, message: 'Xóa sản phẩm khỏi giỏ thành công' });
};

export const thanhToanGioHang = async (req, res) => {
    const userId = req.user.nguoidung_id;
    const { diachi, sdt, phuongthucthanhtoan } = req.body;
    const donHang = await GioHangService.thanhToan(userId, { diachi, sdt, phuongthucthanhtoan: Number(phuongthucthanhtoan) });
    res.status(201).json({ success: true, message: 'Thanh toán thành công', data: donHang });
};

// ========== ADMIN ROUTES (quản lý tất cả giỏ hàng) ==========
export const getGioHangs = async (req, res) => {
    const result = await GioHangService.layDanhSachGioHang(req.query);
    res.status(200).json({ success: true, ...result });
};

export const getGioHangById = async (req, res) => {
    const { id } = req.params;
    const gioHang = await GioHangService.layGioHangTheoId(id);
    res.status(200).json({ success: true, data: gioHang });
};

export const xoaGioHang = async (req, res) => {
    const { id } = req.params;
    await GioHangService.xoaGioHang(id);
    res.status(200).json({ success: true, message: 'Xóa giỏ hàng thành công' });
};