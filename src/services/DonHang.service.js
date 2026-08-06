import { Op, fn, col, literal } from 'sequelize'
import db from '../models/index.js'
import { HuyBoi, LyDoHuyDonHang, TrangThaiDonHang, VaiTroNguoiDung } from '../constants/index.js'
import { tinhVaCapNhatHang } from './NguoiDung.service.js'
import { io } from '../server.js'

export const layDonHangs = async ({ search = '', page = 1, trangthai, created_at }) => {
    const PAGE_SIZE = 10
    const offset = (page - 1) * PAGE_SIZE
    const where = {}
    // const nguoiDungWhere = {}
    let requireNguoiDung = false

    if (search.trim()) {
        const searchTerm = search.trim()
        requireNguoiDung = true
        where[Op.or] = [
            { sdt: { [Op.like]: `%${searchTerm}%` } },
            { '$NguoiDung.name$': { [Op.like]: `%${searchTerm}%` } },
            { '$NguoiDung.email$': { [Op.like]: `%${searchTerm}%` } },
            { '$DonHang.donhang_id$': { [Op.like]: `%${searchTerm}%` } },
        ]
    }

    if (created_at) {
        const startOfDay = new Date(`${created_at}T00:00:00`)
        const endOfDay = new Date(`${created_at}T23:59:59.999`)
        where.created_at = { [Op.between]: [startOfDay, endOfDay] }
    }

    if (trangthai) where.trangthai = trangthai

    const includeNguoiDung = {
        model: db.NguoiDung,
        as: 'NguoiDung',
        attributes: ['nguoidung_id', 'name', 'email', 'sdt'],
        required: requireNguoiDung
    }

    const [data, total] = await Promise.all([
        db.DonHang.findAll({ where, include: [includeNguoiDung], order: [['created_at', 'DESC']], limit: PAGE_SIZE, offset, subQuery: false }),
        db.DonHang.count({ where, include: [includeNguoiDung] })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / PAGE_SIZE) }
}

export const layDonHangTheoId = async (id) => {
    const donhang = await db.DonHang.findByPk(id, {
        attributes: ['donhang_id', 'tongtien', 'trangthai', 'diachi', 'sdt', 'name', 'created_at', 'updated_at', 'phi_van_chuyen', 'giam_gia', 'ly_do_huy', 'ghi_chu_huy', 'huy_boi'],
        include: [
            {
                model: db.NguoiDung,
                as: 'NguoiDung',
                attributes: ['email', 'diachi', 'sdt']
            },
            {
                model: db.ChiTietDonHang,
                as: 'ChiTietDonHangs',
                attributes: ['id', 'soluong', 'dongia'],
                include: [{
                    model: db.SanPham,
                    as: 'SanPham',
                    attributes: ['sanpham_id', 'name', 'gia']
                }]
            }
        ]
    })
    if (!donhang) throw { status: 404, message: 'Không tìm thấy đơn hàng' }
    return donhang
}

export const layDonHangTheoNguoiDung = async (nguoidung_id, { page = 1, trangthai }) => {
    const PAGE_SIZE = 10;
    const offset = (page - 1) * PAGE_SIZE;
    const where = { nguoidung_id };
    if (trangthai !== undefined) where.trangthai = trangthai;

    const [data, total] = await Promise.all([
        db.DonHang.findAll({
            where,
            order: [['created_at', 'DESC']],
            limit: PAGE_SIZE,
            offset,
            attributes: ['donhang_id', 'tongtien', 'trangthai', 'diachi', 'sdt', 'name', 'created_at', 'updated_at', 'phi_van_chuyen', 'giam_gia'],
            include: [{
                model: db.ChiTietDonHang,
                as: 'ChiTietDonHangs',
                attributes: ['id', 'soluong', 'dongia'],
                include: [{
                    model: db.SanPham,
                    as: 'SanPham',
                    attributes: ['sanpham_id', 'name', 'gia'],
                    include: [{
                        model: db.HinhAnhSanPham,  // ← thêm
                        as: 'HinhAnhSanPham',
                        attributes: ['image_url'],
                        limit: 1,                   // chỉ lấy 1 ảnh đại diện
                    }]
                }]
            }]
        }),
        db.DonHang.count({ where })
    ]);
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / PAGE_SIZE) };
};

export const xoaDonHang = async (id, nguoidung_id, isAdmin = false, { ly_do_huy, ghi_chu_huy } = {}) => {
    const donhang = await db.DonHang.findByPk(id, {
        include: [{ model: db.ChiTietDonHang, as: 'ChiTietDonHangs' }]
    });
    if (!donhang) throw { status: 404, message: 'Không tìm thấy đơn hàng' };

    if (!isAdmin && donhang.nguoidung_id !== nguoidung_id) {
        throw { status: 403, message: 'Bạn không có quyền huỷ đơn hàng này' };
    }

    if (donhang.trangthai !== TrangThaiDonHang.CHO_XAC_NHAN) {
        throw { status: 400, message: 'Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận' };
    }
    if (ly_do_huy !== undefined && !Object.values(LyDoHuyDonHang).includes(ly_do_huy)) {
        throw { status: 400, message: 'Lý do hủy không hợp lệ' };
    }

    const transaction = await db.sequelize.transaction();
    try {
        await donhang.update({
            trangthai: TrangThaiDonHang.DA_HUY,
            ly_do_huy: ly_do_huy ?? LyDoHuyDonHang.KHAC,
            ghi_chu_huy: ghi_chu_huy || null,
            huy_boi: isAdmin ? HuyBoi.ADMIN : HuyBoi.KHACH_HANG,
        }, { transaction });

        // Hoàn lại số lượng tồn kho
        for (const item of donhang.ChiTietDonHangs) {
            await db.SanPham.increment('soluong', {
                by: item.soluong,
                where: { sanpham_id: item.sanpham_id },
                transaction
            });
        }
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

export const capNhatDonHang = async (id, data) => {
    const donhang = await db.DonHang.findByPk(id);
    if (!donhang) throw { status: 404, message: 'Không tìm thấy đơn hàng' };

    const oldStatus = donhang.trangthai;
    const newStatus = data.trangthai;
    let hangMoi = null;

    if (newStatus === TrangThaiDonHang.DA_HUY && oldStatus !== TrangThaiDonHang.DA_HUY && data.huy_boi === undefined) {
        data.huy_boi = HuyBoi.ADMIN;
    }

    const transaction = await db.sequelize.transaction();
    try {
        await donhang.update(data, { transaction });

        // Nếu chuyển từ trạng thái khác (không phải hủy) sang hủy -> hoàn kho
        if (newStatus === TrangThaiDonHang.DA_HUY && oldStatus !== TrangThaiDonHang.DA_HUY) {
            const chiTiet = await db.ChiTietDonHang.findAll({
                where: { donhang_id: id },
                transaction
            });

            for (const item of chiTiet) {
                await db.SanPham.increment('soluong', {
                    by: item.soluong,
                    where: { sanpham_id: item.sanpham_id },
                    transaction
                });
            }
        }
        if (newStatus === TrangThaiDonHang.DA_THANH_TOAN
            && oldStatus !== TrangThaiDonHang.DA_THANH_TOAN
            && donhang.nguoidung_id) {
            hangMoi = await tinhVaCapNhatHang(donhang.nguoidung_id, { transaction, choPhepHaHang: false });
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }

    if (hangMoi && donhang.nguoidung_id) {
        try {
            io.to(`user-${donhang.nguoidung_id}`).emit('rank-updated', hangMoi);
        } catch (socketError) {
            console.error('Lỗi emit socket rank-updated:', socketError);
        }
    }

    return await db.DonHang.findByPk(id);
};

export const thongKeDoanhThu7Ngay = async () => {
    const ngayBatDau = new Date()
    ngayBatDau.setDate(ngayBatDau.getDate() - 6)
    ngayBatDau.setHours(0, 0, 0, 0)

    const result = await db.DonHang.findAll({
        where: {
            trangthai: { [Op.in]: [TrangThaiDonHang.DA_THANH_TOAN] },
            createdAt: { [Op.gte]: ngayBatDau }
        },
        attributes: [
            [fn('DATE', col('created_at')), 'ngay'],
            [fn('SUM', col('tongtien')), 'doanhthu'],
        ],
        group: [fn('DATE', col('created_at'))],
        order: [[fn('DATE', col('created_at')), 'ASC']],
        raw: true,
    })

    // Fill đủ 7 ngày kể cả ngày không có đơn
    const map = {}
    result.forEach(r => { map[r.ngay] = Number(r.doanhthu) })

    const days = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        days.push({
            ngay: d.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }),
            doanhthu: map[key] || 0,
        })
    }
    return days
}

export const topSanPhamBanChay = async (limit = 5) => {
    const result = await db.ChiTietDonHang.findAll({
        attributes: [
            'sanpham_id',
            [fn('SUM', col('ChiTietDonHang.soluong')), 'soLuongBan'],
        ],
        include: [{
            model: db.SanPham,
            as: 'SanPham',
            attributes: ['name'],
        }],
        group: ['ChiTietDonHang.sanpham_id', 'SanPham.sanpham_id'],
        order: [[literal('soLuongBan'), 'DESC']],
        limit,
        raw: true,
        nest: true,
    })

    return result.map(r => ({
        sanpham_id: r.sanpham_id,
        ten: r.SanPham?.name || r.sanpham_id,
        soLuongBan: Number(r.soLuongBan),
    }))
}

export const tongDoanhThu = async () => {
    const result = await db.DonHang.findOne({
        where: {
            trangthai: { [Op.in]: [TrangThaiDonHang.DA_THANH_TOAN] }
        },
        attributes: [[fn('SUM', col('tongtien')), 'total']],
        raw: true,
    })
    return Number(result?.total || 0)
}

export const huyDonHang = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { ly_do_huy, ghi_chu_huy } = req.body;
        const isAdmin = req.user.vaitro === VaiTroNguoiDung.ADMIN;
        await xoaDonHang(id, req.user.nguoidung_id, isAdmin, { ly_do_huy, ghi_chu_huy });
        res.json({ success: true, message: 'Hủy đơn hàng thành công' });
    } catch (error) {
        next(error);
    }
};