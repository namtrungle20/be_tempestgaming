import db from '../models/index.js';
import { Op } from 'sequelize';


// Helper tìm kiếm + lọc
const buildWhere = ({ search, trangthai }) => {
    const where = {};
    if (search && search.trim()) {
        where[Op.or] = [
            { ten: { [Op.like]: `%${search}%` } },
            { mota: { [Op.like]: `%${search}%` } }
        ];
    }
    if (trangthai !== undefined && trangthai !== '') {
        where.trang_thai = parseInt(trangthai);
    }
    return where;
};

// Lấy danh sách (phân trang, tìm kiếm, lọc, sắp xếp)
export const layDanhMuc = async ({ search = '' }) => {
    const where = buildWhere({ search });

    const { count, rows } = await db.DanhMuc.findAndCountAll({
        where,
        attributes: ['danhmuc_id', 'ten', 'url', 'mota']
    });

    return {
        data: rows,
        total: count,
    };
};

// Lấy chi tiết theo ID
export const layDanhMucTheoId = async (id) => {
    const danhMuc = await db.DanhMuc.findByPk(id, {
        attributes: ['danhmuc_id', 'ten', 'url', 'mota']
    });
    if (!danhMuc) throw { status: 404, message: 'Danh mục không tồn tại' };
    return danhMuc;
};

// Thêm mới
export const themDanhMuc = async (data) => {
    const { ten, url, mota } = data;

    // Kiểm tra tên trùng
    const existed = await db.DanhMuc.findOne({ where: { ten } });
    if (existed) throw { status: 409, message: 'Tên danh mục đã tồn tại' };

    // Nếu không có url thì tự sinh từ tên (slug)
    let finalUrl = url;
    if (!finalUrl) {
        finalUrl = ten.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        // Kiểm tra unique url
        const urlExists = await db.DanhMuc.findOne({ where: { url: finalUrl } });
        if (urlExists) finalUrl = `${finalUrl}-${Date.now()}`;
    } else {
        const urlExists = await db.DanhMuc.findOne({ where: { url: finalUrl } });
        if (urlExists) throw { status: 409, message: 'URL đã tồn tại' };
    }

    const newDanhMuc = await db.DanhMuc.create({
        ten,
        url: finalUrl,
        mota: mota || null,
    });
    return newDanhMuc;
};

// Cập nhật
export const capNhatDanhMuc = async (id, data) => {
    const danhMuc = await db.DanhMuc.findByPk(id);
    if (!danhMuc) throw { status: 404, message: 'Danh mục không tồn tại' };

    // Nếu cập nhật tên, kiểm tra trùng
    if (data.ten && data.ten !== danhMuc.ten) {
        const existed = await db.DanhMuc.findOne({ where: { ten: data.ten, danhmuc_id: { [Op.ne]: id } } });
        if (existed) throw { status: 409, message: 'Tên danh mục đã tồn tại' };
    }

    // Nếu cập nhật url, kiểm tra unique
    if (data.url && data.url !== danhMuc.url) {
        const urlExists = await db.DanhMuc.findOne({ where: { url: data.url, danhmuc_id: { [Op.ne]: id } } });
        if (urlExists) throw { status: 409, message: 'URL đã tồn tại' };
    }

    await danhMuc.update(data);
    return danhMuc;
};

// Xóa (kiểm tra ràng buộc với LoaiSanPham)
export const xoaDanhMuc = async (id) => {
    const danhMuc = await db.DanhMuc.findByPk(id);
    if (!danhMuc) throw { status: 404, message: 'Danh mục không tồn tại' };

    // Kiểm tra xem có loại sản phẩm nào tham chiếu không
    const loaiCount = await db.LoaiSanPham.count({ where: { danhmuc_id: id } });
    if (loaiCount > 0) {
        throw { status: 400, message: 'Không thể xóa danh mục vì có loại sản phẩm đang thuộc danh mục này' };
    }

    await danhMuc.destroy();
    return true;
};