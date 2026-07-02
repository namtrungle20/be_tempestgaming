import { Op } from 'sequelize'
import db from '../models/index.js'
import { TrangThaiDonHang } from '../constants/index.js'
import { tinhVaCapNhatHang } from './NguoiDung.service.js'
import { io } from '../server.js'

export const layDonHangs = async ({ search = '', page = 1, trangthai }) => {
    const PAGE_SIZE = 10
    const offset = (page - 1) * PAGE_SIZE
    const where = {}

    if (search.trim()) {
        where[Op.or] = [
            { donhang_id: { [Op.like]: `%${search}%` } },
        ]
    }
    if (trangthai) where.trangthai = trangthai

    const [data, total] = await Promise.all([
        db.DonHang.findAll({ where, order: [['created_at', 'DESC']], limit: PAGE_SIZE, offset }),
        db.DonHang.count({ where })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / PAGE_SIZE) }
}

export const layDonHangTheoId = async (id) => {
    const donhang = await db.DonHang.findByPk(id, {
        attributes: ['donhang_id', 'tongtien', 'trangthai', 'diachi', 'sdt', 'created_at', 'updated_at'],
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
            attributes: ['donhang_id', 'tongtien', 'trangthai', 'diachi', 'sdt', 'created_at', 'updated_at'],
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

export const xoaDonHang = async (id) => {
    const donhang = await db.DonHang.findByPk(id, {
        include: [{ model: db.ChiTietDonHang }]
    });
    if (!donhang) throw { status: 404, message: 'Không tìm thấy đơn hàng' };
    if (donhang.trangthai !== TrangThaiDonHang.CHO_XAC_NHAN) {
        throw { status: 400, message: 'Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận' };
    }

    const transaction = await db.sequelize.transaction();
    try {
        await donhang.update({ trangthai: TrangThaiDonHang.DA_HUY }, { transaction });

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
        if (hangMoi && donhang.nguoidung_id) {
            io.to(`user-${donhang.nguoidung_id}`).emit('rank-updated', hangMoi);
        }
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
    return await db.DonHang.findByPk(id);
};
