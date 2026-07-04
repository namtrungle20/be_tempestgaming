import { Op } from 'sequelize'
import db from '../models/index.js'
import { v7 as uuidv7 } from 'uuid';
import { TrangThaiDonHang } from '../constants/index.js'
import { PhuongThucThanhToan, TrangThaiThanhToan } from '../constants/index.js';
import { createMomoPayment } from './ThanhToan.service.js';
import { upsertChiTiet, capNhatTongTienGioHang } from './ChiTietGioHang.service.js'
import { tinhPhiShip } from '../utils/phiship.until.js';
import { layThongTinHang } from './NguoiDung.service.js';



// USER
export const layHoacTaoGioHang = async (nguoidung_id) => {
    let gioHang = await db.GioHang.findOne({
        where: { nguoidung_id },
        include: [{
            model: db.ChiTietGioHang,
            as: 'ChiTietGioHang',
            include: [{ model: db.SanPham, as: 'SanPham' }]
        }]
    });
    if (!gioHang) {
        gioHang = await db.GioHang.create({
            giohang_id: uuidv7(),
            nguoidung_id,
            tongtien: 0
        });
        gioHang.ChiTietGioHang = [];
    }
    return gioHang;
};


// Thêm sản phẩm vào giỏ
export const themSanPham = async (nguoidung_id, sanpham_id, soluong = 1) => {
    const gioHang = await layHoacTaoGioHang(nguoidung_id);
    const chiTiet = await db.ChiTietGioHang.findOne({
        where: { giohang_id: gioHang.giohang_id, sanpham_id }
    })
    const soLuongMoi = chiTiet ? chiTiet.soluong + soluong : soluong
    return await upsertChiTiet({ giohang_id: gioHang.giohang_id, sanpham_id, soluong: soLuongMoi })

};

// Cập nhật số lượng sản phẩm trong giỏ
export const capNhatSoLuong = async (nguoidung_id, sanpham_id, soluong) => {
    if (soluong < 0) throw { status: 400, message: 'Số lượng không hợp lệ' };
    const gioHang = await db.GioHang.findOne({ where: { nguoidung_id } });
    if (!gioHang) throw { status: 404, message: 'Giỏ hàng không tồn tại' }
    return await upsertChiTiet({ giohang_id: gioHang.giohang_id, sanpham_id, soluong })

};

// Xóa sản phẩm khỏi giỏ
export const xoaSanPham = async (nguoidung_id, sanpham_id) => {
    const gioHang = await db.GioHang.findOne({ where: { nguoidung_id } });
    if (!gioHang) throw { status: 404, message: 'Giỏ hàng không tồn tại' };
    const deleted = await db.ChiTietGioHang.destroy({
        where: { giohang_id: gioHang.giohang_id, sanpham_id }
    });
    if (!deleted) throw { status: 404, message: 'Sản phẩm không có trong giỏ' };
    await capNhatTongTienGioHang(gioHang.giohang_id);
};

// Thanh toán: chuyển giỏ hàng thành đơn hàng
export const thanhToan = async (nguoidung_id, { diachi, sdt, phuongthucthanhtoan }) => {

    const items = await db.GioHang.findAll({
        where: { nguoidung_id },
        include: [{
            model: db.ChiTietGioHang,
            as: 'ChiTietGioHang',
            include: [{ model: db.SanPham, as: 'SanPham' }]
        }]
    });

    const giohang = items[0] // GioHang của user (thường chỉ có 1)
    const chiTiets = giohang?.ChiTietGioHang || []

    if (!chiTiets.length) {
        throw { status: 404, message: 'Giỏ hàng trống, không thể thanh toán' }
    }
    const tienSP = chiTiets.reduce((sum, ct) => sum + ct.soluong * parseFloat(ct.SanPham.gia), 0);

    const user = await db.NguoiDung.findByPk(nguoidung_id);
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };

    const thongTinHang = layThongTinHang(user.hang_thanh_vien);
    const phiVanChuyen = tinhPhiShip(thongTinHang.giamShip);

    const tongtien = tienSP + phiVanChuyen;

    const COD_MAX_AMOUNT = 5000000;
    if (phuongthucthanhtoan === PhuongThucThanhToan.COD && tongtien > COD_MAX_AMOUNT) {
        throw {
            status: 400,
            message: `Đơn hàng trên ${COD_MAX_AMOUNT.toLocaleString('vi-VN')}đ chỉ hỗ trợ thanh toán qua MoMo để đảm bảo an toàn giao dịch.`
        };
    }

    const transaction = await db.sequelize.transaction();
    let donHang;
    try {
        donHang = await db.DonHang.create({
            nguoidung_id, tongtien,
            phi_van_chuyen: phiVanChuyen,
            trangthai: TrangThaiDonHang.CHO_XAC_NHAN,
            diachi, sdt, phuongthucthanhtoan
        }, { transaction });

        for (const ct of chiTiets) {
            if (ct.SanPham.soluong < ct.soluong)
                throw { status: 400, message: `Sản phẩm ${ct.SanPham.name} không đủ tồn kho` }


            await db.ChiTietDonHang.create({
                donhang_id: donHang.donhang_id,
                sanpham_id: ct.sanpham_id,
                soluong: ct.soluong,
                dongia: ct.SanPham.gia
            }, { transaction });

            await db.SanPham.decrement('soluong', {
                by: ct.soluong,
                where: { sanpham_id: ct.sanpham_id },
                transaction
            });
        }

        // ✅ Xóa giỏ hàng sau khi tạo đơn thành công
        await db.GioHang.destroy({ where: { nguoidung_id }, transaction });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }

    if (phuongthucthanhtoan === PhuongThucThanhToan.MOMO) {
        const sotien = Number(tongtien);
        if (sotien > 50000000) throw { status: 400, message: 'Số tiền vượt quá giới hạn MoMo' };
        const { momoResult } = await createMomoPayment({
            donhang_id: donHang.donhang_id,
            sotien,
            orderInfo: `Thanh toan don hang ${donHang.donhang_id}`,
        });
        return { donHang, payUrl: momoResult.payUrl };
    }

    return { donHang };
};

// ADMIN
export const layDanhSachGioHang = async ({ page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit
    const { count, rows } = await db.GioHang.findAndCountAll({
        limit, offset,
        include: [{ model: db.ChiTietGioHang, as: 'ChiTietGioHang' }]
    })
    return { data: rows, total: count, page, totalPages: Math.ceil(count / limit) }
}

export const layGioHangTheoId = async (giohang_id) => {
    const gioHang = await db.GioHang.findByPk(giohang_id, {
        include: [{
            model: db.ChiTietGioHang,
            as: 'ChiTietGioHang',
            include: [{ model: db.SanPham, as: 'SanPham' }]
        }]
    })
    if (!gioHang) throw { status: 404, message: 'Giỏ hàng không tồn tại' }
    return gioHang
}

export const xoaGioHang = async (giohang_id) => {
    const gioHang = await db.GioHang.findByPk(giohang_id)
    if (!gioHang) throw { status: 404, message: 'Giỏ hàng không tồn tại' }
    await gioHang.destroy()
}