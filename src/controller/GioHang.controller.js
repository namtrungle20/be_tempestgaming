import { io } from '../server.js';
import {
    layHoacTaoGioHang,
    themSanPham,
    capNhatSoLuong,
    xoaSanPham,
    thanhToan,
    layDanhSachGioHang,
    layGioHangTheoId,
    xoaGioHang
} from '../services/GioHang.service.js'

// ========== USER ROUTES (lấy giỏ hàng của chính user) ==========
export const getMyGioHang = async (req, res) => {
    const userId = req.user.nguoidung_id;
    const gioHang = await layHoacTaoGioHang(userId);
    res.status(200).json({ success: true, data: gioHang });
};

export const themSanPhamVaoGio = async (req, res) => {
    const { sanpham_id, soluong = 1 } = req.body
    const result = await themSanPham(req.user.nguoidung_id, sanpham_id, soluong)
    if (result.created)
        return res.status(201).json({ success: true, message: 'Thêm sản phẩm vào giỏ thành công', data: result.data })
    if (result.updated)
        return res.status(200).json({ success: true, message: 'Cập nhật số lượng thành công', data: result.data })
    res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ' })
}

export const capNhatSoLuongTrongGio = async (req, res) => {
    const userId = req.user.nguoidung_id;
    const { sanpham_id, soluong } = req.body;
    await capNhatSoLuong(userId, sanpham_id, soluong);
    res.status(200).json({ success: true, message: 'Cập nhật số lượng thành công' })
};

export const xoaSanPhamKhoiGio = async (req, res) => {
    const userId = req.user.nguoidung_id;
    const { sanpham_id } = req.params;
    await xoaSanPham(userId, sanpham_id);
    res.status(200).json({ success: true, message: 'Xóa sản phẩm khỏi giỏ thành công' })
};

export const thanhToanGioHang = async (req, res) => {
    const userId = req.user.nguoidung_id;
    const { diachi, sdt, phuongthucthanhtoan } = req.body;
    const donHang = await thanhToan(userId, { diachi, sdt, phuongthucthanhtoan: Number(phuongthucthanhtoan) });

    io.to('admin-room').emit('new-order', {
        donhang_id: donHang.donhang_id,
        tongtien: donHang.tongtien,
    })

    for (const item of donHang.chitiet || []) {
        io.to(`product-${item.sanpham_id}`).emit('stock-updated', {
            sanpham_id: item.sanpham_id,
            soluong: item.sanpham.soluong,
        })
    }
    res.status(201).json({ success: true, message: 'Thanh toán thành công', data: donHang })
};

// ========== ADMIN ROUTES (quản lý tất cả giỏ hàng) ==========
export const getGioHangs = async (req, res) => {
    const result = await layDanhSachGioHang(req.query);
    res.status(200).json({ success: true, ...result })
};

export const getGioHangById = async (req, res) => {
    const { id } = req.params;
    const gioHang = await layGioHangTheoId(id);
    res.status(200).json({ success: true, data: gioHang })
};

export const deleteGioHang = async (req, res) => {
    const { id } = req.params;
    await xoaGioHang(id);
    res.status(200).json({ success: true, message: 'Xóa giỏ hàng thành công' })
};