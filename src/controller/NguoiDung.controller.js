import * as NguoiDungService from '../services/NguoiDung.service.js'
import { io } from '../server.js'

export const postTatCaNguoiDung = async (req, res) => {
    const result = await NguoiDungService.layTatCaNguoiDung(req.body)
    return res.status(200).json(result)
}

export const postNguoiDungById = async (req, res) => {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'Thiếu ID người dùng' })
    const data = await NguoiDungService.layNguoiDungTheoId(req.body.id)
    return res.status(200).json({ success: true, data })
}

export const updateNguoiDung = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Thiếu ID người dùng' })
    const data = await NguoiDungService.capNhatNguoiDung(id, req.body)

    io.to(`user-${id}`).emit('profile-updated', data)

    return res.status(200).json({ success: true, message: 'Cập nhật người dùng thành công', data })
}

export const getHangThanhVien = async (req, res) => {
    const nguoidung_id = req.user.nguoidung_id;
    const data = await NguoiDungService.layThongTinHangThanhVien(nguoidung_id);
    return res.status(200).json({ success: true, data });
};

export const updateHang = async (req, res) => {
    const nguoidung_id = req.body?.nguoidung_id || req.user.nguoidung_id;
    const choPhepHaHang = req.body?.choPhepHaHang === true;

    if (choPhepHaHang && req.user.vaitro !== 1) {
        throw { status: 403, message: 'Chỉ admin mới có quyền hạ hạng' };
    }

    const data = await NguoiDungService.tinhVaCapNhatHang(nguoidung_id, { choPhepHaHang });

    return res.status(200).json({
        success: true,
        message: data.huong === 'xuong_hang'
            ? 'Đã đồng bộ lại hạng — hạng đã giảm theo dữ liệu thực tế'
            : data.huong === 'len_hang'
                ? 'Chúc mừng! Bạn đã lên hạng mới'
                : 'Hạng không đổi',
        data,
    });
};

export const getKiemTraLechHang = async (req, res) => {
    const result = await NguoiDungService.kiemTraLechHang();
    return res.status(200).json({ success: true, ...result });
};


export const postDongBoHangLoat = async (req, res) => {
    const { nguoidung_id } = req.body;
    const result = await NguoiDungService.dongBoHangLoat(nguoidung_id);
    return res.status(200).json({
        success: true,
        message: `Đã đồng bộ ${result.thanh_cong}/${result.tong_so} người dùng`,
        ...result,
    });
};


export const deleteNguoiDung = async (req, res) => {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'Thiếu ID người dùng' })
    await NguoiDungService.xoaNguoiDung(req.body.id)
    return res.status(200).json({ success: true, message: 'Xóa người dùng thành công' })
}

export const doiMatKhau = async (req, res) => {
    const { matKhauCu, matKhauMoi } = req.body
    const result = await NguoiDungService.doiMatKhau({
        userId: req.user.nguoidung_id,
        matKhauCu,
        matKhauMoi,
    })
    res.status(200).json({ success: true, data: result })
}