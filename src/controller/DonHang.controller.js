import * as DonHangService from '../services/DonHang.service.js'
import { io } from '../server.js'
import { VaiTroNguoiDung } from '../constants/index.js'

export const getDonHangs = async (req, res) => {
    const result = await DonHangService.layDonHangs(req.query)
    return res.status(200).json({ message: 'Lấy thông tin đơn hàng thành công', ...result })
}

export const getDonHangById = async (req, res) => {
    const data = await DonHangService.layDonHangTheoId(req.params.id)
    return res.status(200).json({ message: 'Lấy thông tin đơn hàng thành công', data })
}

export const getMyDonHangs = async (req, res) => {
    const result = await DonHangService.layDonHangTheoNguoiDung(req.user.nguoidung_id, req.query);
    return res.status(200).json({ message: 'Lấy lịch sử đơn hàng thành công', ...result });
};

export const xoaDonHang = async (req, res) => {
    const laAdmin = req.user.vaitro === VaiTroNguoiDung.ADMIN
    await DonHangService.xoaDonHang(req.params.id, req.user.nguoidung_id, laAdmin)
    res.json({ success: true, message: 'Huỷ đơn hàng thành công' })
}

export const updateDonHang = async (req, res) => {
    const data = await DonHangService.capNhatDonHang(req.params.id, req.body)
    io.to(`user-${data.nguoidung_id}`).emit('order-status-updated', {
        donhang_id: data.donhang_id,
        trangthai: data.trangthai,
    })
    return res.status(200).json({ message: 'Cập nhật đơn hàng thành công', data })
}

export const getThongKe = async (req, res) => {
    const [doanhThu7Ngay, topSanPham, tongTien] = await Promise.all([
        DonHangService.thongKeDoanhThu7Ngay(),
        DonHangService.topSanPhamBanChay(5),
        DonHangService.tongDoanhThu(),
    ])
    return res.status(200).json({
        success: true,
        data: { doanhThu7Ngay, topSanPham, tongTien }
    })
}