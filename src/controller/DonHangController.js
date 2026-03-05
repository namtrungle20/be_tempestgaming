import { Op, where } from "sequelize";
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const db = require('../models'); 
import db from "../models/index.js";
import TrangThaiDonHang from "../constants/TrangThaiDonHang.js";

export async function getDonHangs(req, res) {
    const { search = '', page = 1, trangthai } = req.query;
    const PAGE_SIZE = 10;
    const offset = (page - 1) * PAGE_SIZE;

    const whereClause = {};

    // Tìm kiếm theo tên khách hoặc mã đơn (tuỳ bạn chỉnh)
    if (search.trim() !== '') {
        whereClause[Op.or] = [
            { ma_don: { [Op.like]: `%${search}%` } },
            { ten_khach: { [Op.like]: `%${search}%` } }
        ];
    }

    // Lọc theo trạng thái nếu có
    if (trangthai) {
        whereClause.trangthai = trangthai;
    }


    const donhangs = await db.DonHang.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: PAGE_SIZE,
        offset
    });

    res.status(200).json({
        message: 'Lấy thông tin đơn hàng thành công',
        data: donhangs
    });
}



export async function getDonHangById(req, res) {
    const { id } = req.params;

    const donhang = await db.DonHang.findByPk(id, {
        include: [
            {
                model: db.NguoiDung,
                as: 'NguoiDung'
            },
            {
                model: db.ChiTietDonHang,
                include: [
                    {
                        model: db.SanPham,
                        as: 'SanPham'
                    }
                ]
            },
            // {
            //     model: db.ThanhToan,
            //     attributes: ["phuongthucthanhtoan", "trangthai"]
            // }
        ]
    });

    if (!donhang) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.status(200).json({
        message: 'Lấy thông tin đơn hàng thành công',
        data: donhang
    });
}

// export async function themDonHang(req, res) {
//     const donhang = await db.DonHang.create(req.body); // req.body cần chứa nguoidung_id, tongtien, etc.

//     res.status(201).json({
//         message: 'Thêm đơn hàng thành công',
//         data: donhang
//     });

// }

export async function xoaDonHang(req, res) {
    const { id } = req.params;

    const update = await db.DonHang.update({ trangthai: TrangThaiDonHang.DA_HUY }, { where: { donhang_id: id } });

    if (!update) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng để xóa' });
    }

    res.status(200).json({ message: 'Đơn hàng đã đánh dấu là Đã Hủy'});

}

export async function updateDonHang(req, res) {
    const { id } = req.params;

    const donhangCu = await db.DonHang.findByPk(id);
    if (!donhangCu) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng để cập nhật' });
    }

    const duLieuCapNhat = { ...donhangCu.toJSON(), ...req.body };

    await db.DonHang.update(duLieuCapNhat, { where: { donhang_id: id } });

    const donhangMoi = await db.DonHang.findByPk(id);
    res.status(200).json({
        message: 'Cập nhật đơn hàng thành công',
        data: donhangMoi
    });

}

