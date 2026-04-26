import * as DonHangService from '../services/DonHang.service.js'

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
    await DonHangService.xoaDonHang(req.params.id)
    return res.status(200).json({ message: 'Đơn hàng đã đánh dấu là Đã Hủy' })
}

export const updateDonHang = async (req, res) => {
    const data = await DonHangService.capNhatDonHang(req.params.id, req.body)
    return res.status(200).json({ message: 'Cập nhật đơn hàng thành công', data })
}