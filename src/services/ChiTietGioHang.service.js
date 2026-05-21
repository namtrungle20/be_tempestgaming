import db from '../models/index.js'

const sanphamInclude = { model: db.SanPham, as: 'SanPham' }

// Helper
export const capNhatTongTienGioHang = async (giohang_id) => {
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

const _xuLyCapNhatHoacXoa = async (chiTiet, soluong) => {
    if (soluong <= 0) {
        await chiTiet.destroy()
        await capNhatTongTienGioHang(chiTiet.giohang_id)
        return { deleted: true }
    }
    if (chiTiet.SanPham.soluong < soluong)
        throw { status: 400, message: 'Số lượng vượt tồn kho' }
    chiTiet.soluong = soluong
    await chiTiet.save()
    await capNhatTongTienGioHang(chiTiet.giohang_id)
    return { updated: true, data: chiTiet }
}

export const layChiTietGioHangs = async ({ page = 1, giohang_id }) => {
    const pageSize = 5
    const offset = (parseInt(page, 10) - 1) * pageSize
    const where = giohang_id ? { giohang_id } : {}
    const [data, total] = await Promise.all([
        db.ChiTietGioHang.findAll({ where, limit: pageSize, offset, include: [sanphamInclude] }),
        db.ChiTietGioHang.count({ where })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / pageSize) }
}

export const layChiTietGioHangTheoId = async (id) => {
    const chitiet = await db.ChiTietGioHang.findByPk(id, { include: [sanphamInclude] });
    if (!chitiet) throw { status: 404, message: 'Chi tiết giỏ hàng không tồn tại' };
    return chitiet
};

export const layChiTietGioHangTheoGioHangId = async (giohang_id) => {
    return await db.ChiTietGioHang.findAll({ where: { giohang_id }, include: [sanphamInclude] });
};

export const capNhatSoLuongChiTiet = async ({ id, soluong }) => {
    const chiTiet = await db.ChiTietGioHang.findByPk(id, { include: [sanphamInclude] })
    if (!chiTiet) throw { status: 404, message: 'Chi tiết giỏ hàng không tồn tại' }
    return await _xuLyCapNhatHoacXoa(chiTiet, soluong)
}


export const xoaChiTiet = async (id) => {
    const chiTiet = await db.ChiTietGioHang.findByPk(id);
    if (!chiTiet) throw { status: 404, message: 'Không tìm thấy chi tiết giỏ hàng' };
    const giohang_id = chiTiet.giohang_id;
    await chiTiet.destroy();
    await capNhatTongTienGioHang(giohang_id);
};

// Internal (dùng bởi GioHang.service)
export const upsertChiTiet = async ({ giohang_id, sanpham_id, soluong }) => {
    const [giohang, sanpham] = await Promise.all([
        db.GioHang.findByPk(giohang_id),
        db.SanPham.findByPk(sanpham_id)
    ])
    if (!giohang) throw { status: 404, message: 'Giỏ hàng không tồn tại' }
    if (!sanpham) throw { status: 404, message: 'Sản phẩm không tồn tại' }
    if (sanpham.soluong < soluong) throw { status: 400, message: 'Sản phẩm không đủ số lượng' }

    const chiTiet = await db.ChiTietGioHang.findOne({
        where: { giohang_id, sanpham_id },
        include: [sanphamInclude]
    })

    if (!chiTiet) {
        if (soluong === 0) throw { status: 400, message: 'Số lượng không hợp lệ' }
        const newChiTiet = await db.ChiTietGioHang.create({ giohang_id, sanpham_id, soluong, dongia: sanpham.gia })
        await capNhatTongTienGioHang(giohang_id)
        return { created: true, data: newChiTiet }
    }

    return await _xuLyCapNhatHoacXoa(chiTiet, soluong)
}