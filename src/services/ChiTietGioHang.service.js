import db from '../models/index.js'

const sanphamInclude = { model: db.SanPham, as: 'SanPham' }

// export const layChiTietGioHangs = async ({ page = 1, giohang_id }) => {
//     const pageSize = 5
//     const offset = (parseInt(page, 10) - 1) * pageSize
//     const where = giohang_id ? { giohang_id } : {}

//     const [data, total] = await Promise.all([
//         db.ChiTietGioHang.findAll({ where, limit: pageSize, offset, include: [sanphamInclude] }),
//         db.ChiTietGioHang.count({ where })
//     ])
//     return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / pageSize) }
// }

// export const layChiTietGioHangTheoId = async (id) => {
//     const chitiet = await db.ChiTietGioHang.findByPk(id, { include: [sanphamInclude] })
//     if (!chitiet) throw { status: 404, message: 'Chi tiết giỏ hàng không tồn tại' }
//     return chitiet
// }

// export const layChiTietGioHangTheoGioHangId = async (giohang_id) => {
//     return await db.ChiTietGioHang.findAll({ where: { giohang_id }, include: [sanphamInclude] })
// }

// export const themChiTietGioHang = async ({ giohang_id, sanpham_id, soluong }) => {
//     const [giohang, sanpham] = await Promise.all([
//         db.GioHang.findByPk(giohang_id),
//         db.SanPham.findByPk(sanpham_id)
//     ])
//     if (!giohang) throw { status: 404, message: 'Giỏ hàng không tồn tại' }
//     if (!sanpham) throw { status: 404, message: 'Sản phẩm không tồn tại' }
//     if (sanpham.soluong < soluong) throw { status: 400, message: 'Sản phẩm không đủ số lượng yêu cầu' }

//     const existed = await db.ChiTietGioHang.findOne({ where: { giohang_id, sanpham_id } })

//     if (existed) {
//         if (soluong === 0) {
//             await existed.destroy()
//             return { deleted: true }
//         }
//         existed.soluong = soluong
//         await existed.save()
//         return { updated: true, data: existed }
//     }

//     if (soluong === 0) throw { status: 400, message: 'Không thể thêm mục giỏ hàng với số lượng bằng 0' }
//     const data = await db.ChiTietGioHang.create({ giohang_id, sanpham_id, soluong, dongia: sanpham.gia })
//     return { created: true, data }
// }

// export const xoaChiTietGioHang = async (id) => {
//     const chiTiet = await db.ChiTietGioHang.findByPk(id);
//     if (!chiTiet) throw { status: 404, message: 'Không tìm thấy chi tiết giỏ hàng' };
//     const giohang_id = chiTiet.giohang_id;
//     await chiTiet.destroy();
//     await capNhatTongTienGioHang(giohang_id);
// }

// const capNhatTongTienGioHang = async (giohang_id) => {
//     const chiTiets = await db.ChiTietGioHang.findAll({
//         where: { giohang_id },
//         include: [{ model: db.SanPham, as: 'SanPham' }]
//     });
//     let tong = 0;
//     for (const ct of chiTiets) {
//         // Nếu có dongia thì dùng, nếu không thì lấy giá hiện tại của sản phẩm
//         const dongia = ct.dongia || ct.SanPham.gia;
//         tong += ct.soluong * dongia;
//     }
//     await db.GioHang.update({ tongtien: tong }, { where: { giohang_id } });
// };

const capNhatTongTienGioHang = async (giohang_id) => {
    const chiTiets = await db.ChiTietGioHang.findAll({
        where: { giohang_id },
        include: [sanphamInclude]
    });
    let tong = 0;
    for (const ct of chiTiets) {
        const dongia = ct.dongia || ct.SanPham?.gia || 0;
        tong += ct.soluong * dongia;
    }
    await db.GioHang.update({ tongtien: tong }, { where: { giohang_id } });
};

// Lấy danh sách chi tiết giỏ hàng (admin)
export const layChiTietGioHangs = async ({ page = 1, giohang_id }) => {
    const pageSize = 5;
    const offset = (parseInt(page, 10) - 1) * pageSize;
    const where = giohang_id ? { giohang_id } : {};

    const [data, total] = await Promise.all([
        db.ChiTietGioHang.findAll({ where, limit: pageSize, offset, include: [sanphamInclude] }),
        db.ChiTietGioHang.count({ where })
    ]);
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / pageSize) };
};

// Lấy chi tiết theo ID
export const layChiTietGioHangTheoId = async (id) => {
    const chitiet = await db.ChiTietGioHang.findByPk(id, { include: [sanphamInclude] });
    if (!chitiet) throw { status: 404, message: 'Chi tiết giỏ hàng không tồn tại' };
    return chitiet;
};

// Lấy tất cả chi tiết theo giỏ hàng ID
export const layChiTietGioHangTheoGioHangId = async (giohang_id) => {
    return await db.ChiTietGioHang.findAll({ where: { giohang_id }, include: [sanphamInclude] });
};

// Thêm hoặc cập nhật chi tiết giỏ hàng (dùng cho user)
export const themHoacCapNhatChiTiet = async ({ giohang_id, sanpham_id, soluong }) => {
    const [giohang, sanpham] = await Promise.all([
        db.GioHang.findByPk(giohang_id),
        db.SanPham.findByPk(sanpham_id)
    ]);
    if (!giohang) throw { status: 404, message: 'Giỏ hàng không tồn tại' };
    if (!sanpham) throw { status: 404, message: 'Sản phẩm không tồn tại' };
    if (sanpham.soluong < soluong) throw { status: 400, message: 'Sản phẩm không đủ số lượng' };

    let chiTiet = await db.ChiTietGioHang.findOne({ where: { giohang_id, sanpham_id } });
    if (chiTiet) {
        if (soluong === 0) {
            await chiTiet.destroy();
            await capNhatTongTienGioHang(giohang_id);
            return { deleted: true };
        }
        if (sanpham.soluong < soluong) throw { status: 400, message: 'Số lượng vượt tồn kho' };
        chiTiet.soluong = soluong;
        await chiTiet.save();
        await capNhatTongTienGioHang(giohang_id);
        return { updated: true, data: chiTiet };
    } else {
        if (soluong === 0) throw { status: 400, message: 'Số lượng không hợp lệ' };
        const newChiTiet = await db.ChiTietGioHang.create({
            giohang_id,
            sanpham_id,
            soluong,
            dongia: sanpham.gia
        });
        await capNhatTongTienGioHang(giohang_id);
        return { created: true, data: newChiTiet };
    }
};

// Cập nhật số lượng chi tiết theo ID (admin)
export const capNhatSoLuongChiTiet = async ({ id, soluong }) => {
    const chiTiet = await db.ChiTietGioHang.findByPk(id, { include: [sanphamInclude] });
    if (!chiTiet) throw { status: 404, message: 'Chi tiết giỏ hàng không tồn tại' };
    if (soluong <= 0) {
        await chiTiet.destroy();
        await capNhatTongTienGioHang(chiTiet.giohang_id);
        return { deleted: true };
    }
    const sanpham = chiTiet.SanPham;
    if (sanpham.soluong < soluong) throw { status: 400, message: 'Số lượng vượt tồn kho' };
    chiTiet.soluong = soluong;
    await chiTiet.save();
    await capNhatTongTienGioHang(chiTiet.giohang_id);
    return { updated: true, data: chiTiet };
};

// Xóa chi tiết theo ID (admin)
export const xoaChiTietGioHang = async (id) => {
    const chiTiet = await db.ChiTietGioHang.findByPk(id);
    if (!chiTiet) throw { status: 404, message: 'Không tìm thấy chi tiết giỏ hàng' };
    const giohang_id = chiTiet.giohang_id;
    await chiTiet.destroy();
    await capNhatTongTienGioHang(giohang_id);
};

// Xóa sản phẩm khỏi giỏ theo giohang_id và sanpham_id (dùng cho user)
export const xoaSanPhamKhoiGio = async ({ giohang_id, sanpham_id }) => {
    const chiTiet = await db.ChiTietGioHang.findOne({ where: { giohang_id, sanpham_id } });
    if (!chiTiet) throw { status: 404, message: 'Sản phẩm không có trong giỏ' };
    await chiTiet.destroy();
    await capNhatTongTienGioHang(giohang_id);
};