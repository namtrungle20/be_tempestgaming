import { Op } from 'sequelize'
import db from '../models/index.js'
import { v7 as uuidv7 } from 'uuid';
import { TrangThaiDonHang } from '../constants/index.js'

// export const layGioHangs = async ({ page = 1, khachhang_id, nguoidung_id }) => {
//     const pageSize = 5
//     const offset = (parseInt(page, 10) - 1) * pageSize
//     const where = {}
//     if (khachhang_id) where.khachhang_id = khachhang_id
//     if (nguoidung_id) where.nguoidung_id = nguoidung_id

//     const [data, total] = await Promise.all([
//         db.GioHang.findAll({ where, limit: pageSize, offset, include: [{ model: db.ChiTietGioHang, as: 'ChiTietGioHang' }] }),
//         db.GioHang.count({ where })
//     ])
//     return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / pageSize) }
// }

// export const layGioHangTheoId = async (id) => {
//     const giohang = await db.GioHang.findByPk(id, {
//         include: [{ model: db.ChiTietGioHang, as: 'ChiTietGioHang' }]
//     })
//     if (!giohang) throw { status: 404, message: 'Giỏ hàng không tồn tại' }
//     return giohang
// }

// export const themGioHang = async ({ khachhang_id, nguoidung_id }) => {
//     if ((khachhang_id && nguoidung_id) || (!khachhang_id && !nguoidung_id))
//         throw { status: 400, message: 'Chỉ được cung cấp một trong hai giá trị khachhang_id hoặc nguoidung_id' }

//     const cart = await db.GioHang.findOne({
//         where: {
//             [Op.or]: [
//                 { khachhang_id: khachhang_id ?? null },
//                 { nguoidung_id: nguoidung_id ?? null }
//             ]
//         }
//     })
//     if (cart) throw { status: 409, message: 'Giỏ hàng đã tồn tại với id khách hàng này' }

//     return await db.GioHang.create({ khachhang_id, nguoidung_id })
// }

// export const xoaGioHang = async (id) => {
//     const deleted = await db.GioHang.destroy({ where: { giohang_id: id } })
//     if (!deleted) throw { status: 404, message: 'Không tìm thấy giỏ hàng để xóa' }
// }

// export const thanhToanGioHang = async ({ giohang_id, tongtien, sdt, diachi }) => {
//     const t = await db.sequelize.transaction()
//     try {
//         const giohang = await db.GioHang.findByPk(giohang_id, {
//             include: [{ model: db.ChiTietGioHang, as: 'ChiTietGioHang', required: true, include: [{ model: db.SanPham, as: 'SanPham' }] }]
//         })
//         if (!giohang || !giohang.ChiTietGioHang.length)
//             throw { status: 404, message: 'Giỏ hàng không tồn tại hoặc trống' }

//         const newDonHang = await db.DonHang.create({
//             nguoidung_id: giohang.nguoidung_id,
//             khachhang_id: giohang.khachhang_id,
//             trangthai: TrangThaiDonHang.CHO_XAC_NHAN,
//             tongtien: tongtien ?? giohang.ChiTietGioHang.reduce((acc, item) => acc + item.soluong * item.SanPham.gia, 0),
//             sdt,
//             diachi
//         }, { transaction: t })

//         for (const item of giohang.ChiTietGioHang) {
//             // Check stock again
//             if (item.SanPham.soluong < item.soluong) {
//                 throw { status: 400, message: `Sản phẩm ${item.SanPham.name} không đủ số lượng tồn kho` }
//             }

//             await db.ChiTietDonHang.create({
//                 donhang_id: newDonHang.donhang_id,
//                 sanpham_id: item.sanpham_id,
//                 soluong: item.soluong,
//                 dongia: item.SanPham.gia
//             }, { transaction: t })

//             // Decrement stock
//             await item.SanPham.decrement('soluong', { by: item.soluong, transaction: t })
//         }

//         await db.ChiTietGioHang.destroy({ where: { giohang_id: giohang.giohang_id }, transaction: t })
//         await giohang.destroy({ transaction: t })
//         await t.commit()

//         return newDonHang.donhang_id
//     } catch (error) {
//         await t.rollback()
//         throw error
//     }
// }

// const capNhatTongTien = async (giohang_id) => {
//     const chiTiets = await db.ChiTietGioHang.findAll({
//         where: { giohang_id },
//         include: [{ model: db.SanPham, as: 'SanPham' }]
//     });
//     let tong = 0;
//     for (const ct of chiTiets) {
//         tong += ct.soluong * ct.san_pham.gia;
//     }
//     await db.GioHang.update({ tongtien: tong }, { where: { giohang_id } });
// };

// export const layHoacTaoGioHang = async (nguoidung_id) => {
//     let gioHang = await db.GioHang.findOne({
//         where: { nguoidung_id },
//         include: [{
//             model: db.ChiTietGioHang,
//             as: 'ChiTietGioHang',
//             include: [{ model: db.SanPham, as: 'SanPham' }]
//         }]
//     });
//     if (!gioHang) {
//         gioHang = await db.GioHang.create({
//             giohang_id: uuidv7(),
//             nguoidung_id,
//             tongtien: 0
//         });
//         gioHang.chi_tiet_gio_hangs = [];
//     }
//     return gioHang;
// };


// Helper: cập nhật tổng tiền giỏ hàng
const capNhatTongTien = async (giohang_id) => {
    const chiTiets = await db.ChiTietGioHang.findAll({
        where: { giohang_id },
        include: [{ model: db.SanPham, as: 'SanPham' }]
    });
    let tong = 0;
    for (const ct of chiTiets) {
        tong += ct.soluong * ct.san_pham.gia;
    }
    await db.GioHang.update({ tongtien: tong }, { where: { giohang_id } });
};

// Lấy hoặc tạo giỏ hàng của user (đảm bảo luôn có)
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
        gioHang.chi_tiet_gio_hangs = [];
    }
    return gioHang;
};

export const layDanhSachGioHang = async ({ page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await db.GioHang.findAndCountAll({
        limit, offset,
        include: [{ model: db.ChiTietGioHang, as: 'ChiTietGioHang' }]
    });
    return { data: rows, total: count, page, totalPages: Math.ceil(count / limit) };
};
// Thêm sản phẩm vào giỏ
export const themSanPham = async (nguoidung_id, sanpham_id, soluong = 1) => {
    const gioHang = await layHoacTaoGioHang(nguoidung_id);
    const sanpham = await db.SanPham.findByPk(sanpham_id);
    if (!sanpham) throw { status: 404, message: 'Sản phẩm không tồn tại' };
    if (sanpham.soluongton < soluong) throw { status: 400, message: 'Số lượng vượt quá tồn kho' };

    let chiTiet = await db.ChiTietGioHang.findOne({
        where: { giohang_id: gioHang.giohang_id, sanpham_id }
    });
    if (chiTiet) {
        const newSoluong = chiTiet.soluong + soluong;
        if (sanpham.soluongton < newSoluong) throw { status: 400, message: 'Tổng số lượng vượt tồn kho' };
        chiTiet.soluong = newSoluong;
        await chiTiet.save();
    } else {
        chiTiet = await db.ChiTietGioHang.create({
            giohang_id: gioHang.giohang_id,
            sanpham_id,
            soluong,
            dongia: sanpham.gia
        });
    }
    await capNhatTongTien(gioHang.giohang_id);
    return chiTiet;
};

// Cập nhật số lượng sản phẩm trong giỏ
export const capNhatSoLuong = async (nguoidung_id, sanpham_id, soluong) => {
    if (soluong < 0) throw { status: 400, message: 'Số lượng không hợp lệ' };
    const gioHang = await db.GioHang.findOne({ where: { nguoidung_id } });
    if (!gioHang) throw { status: 404, message: 'Giỏ hàng không tồn tại' };
    const chiTiet = await db.ChiTietGioHang.findOne({
        where: { giohang_id: gioHang.giohang_id, sanpham_id },
        include: [{ model: db.SanPham, as: 'SanPham' }]
    });
    if (!chiTiet) throw { status: 404, message: 'Sản phẩm không có trong giỏ' };
    if (soluong === 0) {
        await chiTiet.destroy();
    } else {
        if (chiTiet.san_pham.soluongton < soluong) throw { status: 400, message: 'Số lượng vượt quá tồn kho' };
        chiTiet.soluong = soluong;
        await chiTiet.save();
    }
    await capNhatTongTien(gioHang.giohang_id);
};

// Xóa sản phẩm khỏi giỏ
export const xoaSanPham = async (nguoidung_id, sanpham_id) => {
    const gioHang = await db.GioHang.findOne({ where: { nguoidung_id } });
    if (!gioHang) throw { status: 404, message: 'Giỏ hàng không tồn tại' };
    const deleted = await db.ChiTietGioHang.destroy({
        where: { giohang_id: gioHang.giohang_id, sanpham_id }
    });
    if (!deleted) throw { status: 404, message: 'Sản phẩm không có trong giỏ' };
    await capNhatTongTien(gioHang.giohang_id);
};

// Thanh toán: chuyển giỏ hàng thành đơn hàng
export const thanhToan = async (nguoidung_id, { diachi, sdt, phuongthuc = 'COD' }) => {
    const gioHang = await db.GioHang.findOne({
        where: { nguoidung_id },
        include: [{
            model: db.ChiTietGioHang,
            as: 'ChiTietGioHang',
            include: [{ model: db.SanPham, as: 'SanPham' }]
        }]
    });
    if (!gioHang || !gioHang.chi_tiet_gio_hangs.length) {
        throw { status: 400, message: 'Giỏ hàng trống, không thể thanh toán' };
    }

    const transaction = await db.sequelize.transaction();
    try {
        // Tạo đơn hàng
        const donHang = await db.DonHang.create({
            nguoidung_id,
            tongtien: gioHang.tongtien,
            trangthai: TrangThaiDonHang.CHO_XAC_NHAN,
            diachi_giao_hang: diachi,
            sdt_nguoi_nhan: sdt,
            phuongthuc_thanh_toan: phuongthuc
        }, { transaction });

        // Tạo chi tiết đơn hàng và cập nhật tồn kho
        for (const item of gioHang.chi_tiet_gio_hangs) {
            await db.ChiTietDonHang.create({
                donhang_id: donHang.donhang_id,
                sanpham_id: item.sanpham_id,
                soluong: item.soluong,
                dongia: item.san_pham.gia
            }, { transaction });

            await db.SanPham.decrement('soluongton', {
                by: item.soluong,
                where: { sanpham_id: item.sanpham_id },
                transaction
            });
        }

        // Xóa giỏ hàng (cascade sẽ xóa chi tiết)
        await gioHang.destroy({ transaction });
        await transaction.commit();
        return donHang;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};