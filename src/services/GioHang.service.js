import { Op } from 'sequelize'
import db from '../models/index.js'
import { v7 as uuidv7 } from 'uuid';
import { TrangThaiDonHang } from '../constants/index.js'
import { PhuongThucThanhToan, TrangThaiThanhToan } from '../constants/index.js';
import { createMomoPayment } from './ThanhToan.service.js';
import { upsertChiTiet, capNhatTongTienGioHang } from './ChiTietGioHang.service.js'
import { tinhPhiShip } from '../utils/phiship.until.js';
import { layThongTinHang } from './NguoiDung.service.js';
import { layPhanTramGiamTheoHang } from './UuDai.service.js';


const GIOI_HAN_COD = 5000000;
const GIOI_HAN_MOMO = 50000000;

const kiemTraGioiHanMomo = (chiTietGioHang, sanphamIdDangSua, soLuongMoi, giaSanPhamDangSua) => {
    const chiTietKhac = (chiTietGioHang || []).filter(ct => ct.sanpham_id !== sanphamIdDangSua);
    const tongTienKhac = chiTietKhac.reduce(
        (sum, ct) => sum + ct.soluong * parseFloat(ct.SanPham?.gia || 0),
        0
    );
    const tongTienDuKien = tongTienKhac + soLuongMoi * parseFloat(giaSanPhamDangSua || 0);

    if (tongTienDuKien > GIOI_HAN_MOMO) {
        throw {
            status: 400,
            message: `Tổng tiền giỏ hàng không được vượt quá ${GIOI_HAN_MOMO.toLocaleString('vi-VN')}đ (giới hạn thanh toán MoMo)`
        };
    }
};

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

    // Tính tổng tiền giỏ hàng sau khi thêm, để chặn sớm nếu vượt mức MoMo
    const sanPham = await db.SanPham.findByPk(sanpham_id);
    if (!sanPham) throw { status: 404, message: 'Sản phẩm không tồn tại' };

    kiemTraGioiHanMomo(gioHang.ChiTietGioHang, sanpham_id, soLuongMoi, sanPham.gia);

    return await upsertChiTiet({ giohang_id: gioHang.giohang_id, sanpham_id, soluong: soLuongMoi })

};

// Cập nhật số lượng sản phẩm trong giỏ
export const capNhatSoLuong = async (nguoidung_id, sanpham_id, soluong) => {
    if (soluong < 0) throw { status: 400, message: 'Số lượng không hợp lệ' };

    const gioHang = await db.GioHang.findOne({
        where: { nguoidung_id },
        include: [{
            model: db.ChiTietGioHang,
            as: 'ChiTietGioHang',
            include: [{ model: db.SanPham, as: 'SanPham' }]
        }]
    });
    if (!gioHang) throw { status: 404, message: 'Giỏ hàng không tồn tại' }
    const sanPham = await db.SanPham.findByPk(sanpham_id);
    if (!sanPham) throw { status: 404, message: 'Sản phẩm không tồn tại' };

    kiemTraGioiHanMomo(gioHang.ChiTietGioHang, sanpham_id, soluong, sanPham.gia);

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

    const phanTramGiam = await layPhanTramGiamTheoHang(user.hang_thanh_vien);
    const soTienGiam = Math.round(tienSP * (phanTramGiam / 100));

    const tongtien = tienSP - soTienGiam + phiVanChuyen;

    if (phuongthucthanhtoan === PhuongThucThanhToan.COD && tongtien > GIOI_HAN_COD) {
        throw {
            status: 400,
            message: `Đơn hàng trên ${GIOI_HAN_COD.toLocaleString('vi-VN')}đ chỉ hỗ trợ thanh toán qua MoMo để đảm bảo an toàn giao dịch.`
        };
    }

    if (phuongthucthanhtoan === PhuongThucThanhToan.MOMO && tongtien > GIOI_HAN_MOMO) {
        throw {
            status: 400,
            message: `Tổng tiền đơn hàng vượt quá ${GIOI_HAN_MOMO.toLocaleString('vi-VN')}đ (giới hạn thanh toán MoMo)`
        };
    }

    const transaction = await db.sequelize.transaction();
    let donHang;
    try {
        donHang = await db.DonHang.create({
            nguoidung_id, tongtien,
            phi_van_chuyen: phiVanChuyen,
            giam_gia: soTienGiam,
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
        if (sotien > GIOI_HAN_MOMO) throw { status: 400, message: 'Số tiền vượt quá giới hạn MoMo' };
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