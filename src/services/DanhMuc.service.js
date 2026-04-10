import db from '../models/index.js';
import { Op } from 'sequelize';

const PAGE_SIZE = 10;

// Helper tìm kiếm + lọc
const buildWhere = ({ search, trang_thai }) => {
    const where = {};
    if (search && search.trim()) {
        where[Op.or] = [
            { ten: { [Op.like]: `%${search}%` } },
            { mo_ta: { [Op.like]: `%${search}%` } }
        ];
    }
    if (trang_thai !== undefined && trang_thai !== '') {
        where.trang_thai = parseInt(trang_thai);
    }
    return where;
};

// Lấy danh sách (phân trang, tìm kiếm, lọc, sắp xếp)
export const layDanhMuc = async ({ search = '', page = 1, trang_thai, sort_by = 'thu_tu', sort_order = 'ASC' }) => {
    const offset = (parseInt(page) - 1) * PAGE_SIZE;
    const where = buildWhere({ search, trang_thai });
    const order = [[sort_by, sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];

    const { count, rows } = await db.DanhMuc.findAndCountAll({
        where,
        limit: PAGE_SIZE,
        offset,
        order,
        attributes: ['danhmuc_id', 'ten', 'url', 'mo_ta', 'thu_tu', 'trang_thai', 'created_at', 'updated_at']
    });

    return {
        data: rows,
        total: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / PAGE_SIZE)
    };
};

// Lấy chi tiết theo ID
export const layDanhMucTheoId = async (id) => {
    const danhMuc = await db.DanhMuc.findByPk(id, {
        attributes: ['danhmuc_id', 'ten', 'url', 'mo_ta', 'thu_tu', 'trang_thai', 'created_at', 'updated_at']
    });
    if (!danhMuc) throw { status: 404, message: 'Danh mục không tồn tại' };
    return danhMuc;
};

// Thêm mới
export const themDanhMuc = async (data) => {
    const { ten, url, mo_ta, thu_tu, trang_thai } = data;

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
        mo_ta: mo_ta || null,
        thu_tu: thu_tu || 0,
        trang_thai: trang_thai !== undefined ? trang_thai : 1
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