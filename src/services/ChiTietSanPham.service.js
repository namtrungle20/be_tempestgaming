import db from '../models/index.js';

export const layChiTietSanPham = async (sanpham_id) => {
    if (!sanpham_id) throw { status: 400, message: 'Thiếu sanpham_id' };
    return await db.ChiTietSanPham.findAll({ where: { sanpham_id } });
};

export const themChiTietSanPham = async ({ sanpham_id, name, gia_tri }) => {
    if (!sanpham_id) throw { status: 400, message: 'Thiếu sanpham_id' };
    if (!name) throw { status: 400, message: 'Thiếu name' };
    if (!gia_tri) throw { status: 400, message: 'Thiếu gia_tri' };

    const sanpham = await db.SanPham.findByPk(sanpham_id);
    if (!sanpham) throw { status: 404, message: 'Không tìm thấy sản phẩm' };

    const existed = await db.ChiTietSanPham.findOne({
        where: { sanpham_id, name }
    });
    if (existed) throw { status: 409, message: `Thuộc tính "${name}" đã tồn tại` };

    return await db.ChiTietSanPham.create({ sanpham_id, name, gia_tri });
};

export const themNhieuChiTietSanPham = async (sanpham_id, chiTiets = []) => {
    if (!sanpham_id) throw { status: 400, message: 'Thiếu sanpham_id' };

    const sanpham = await db.SanPham.findByPk(sanpham_id);
    if (!sanpham) throw { status: 404, message: 'Không tìm thấy sản phẩm' };

    const results = { success: [], errors: [] };
    for (const ct of chiTiets) {
        try {
            const existed = await db.ChiTietSanPham.findOne({
                where: { sanpham_id, name: ct.name }
            });
            if (existed) {
                results.success.push({ ...ct, status: 'skipped' });
                continue;
            }
            const created = await db.ChiTietSanPham.create({
                sanpham_id,
                name: ct.name,
                gia_tri: ct.gia_tri,
            });
            results.success.push(created);
        } catch (err) {
            results.errors.push({ ...ct, message: err.message });
        }
    }
    return results;
};

export const capNhatChiTietSanPham = async (id, { name, gia_tri }) => {
    const chiTiet = await db.ChiTietSanPham.findByPk(id);
    if (!chiTiet) throw { status: 404, message: 'Không tìm thấy thuộc tính' };

    if (name && name !== chiTiet.name) {
        const existed = await db.ChiTietSanPham.findOne({
            where: { sanpham_id: chiTiet.sanpham_id, name }
        });
        if (existed) throw { status: 409, message: `Thuộc tính "${name}" đã tồn tại` };
    }

    if (name) chiTiet.name = name;
    if (gia_tri) chiTiet.gia_tri = gia_tri;
    await chiTiet.save();
    return chiTiet;
};

export const xoaChiTietSanPham = async (id) => {
    const deleted = await db.ChiTietSanPham.destroy({ where: { id } });
    if (!deleted) throw { status: 404, message: 'Không tìm thấy thuộc tính để xóa' };
};

export const xoaHetChiTietSanPham = async (sanpham_id) => {
    const deleted = await db.ChiTietSanPham.destroy({ where: { sanpham_id } });
    return { deleted, message: `Đã xóa ${deleted} thuộc tính` };
};