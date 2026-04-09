import { Op } from 'sequelize'
import db from '../models/index.js'

const PAGE_SIZE = 10
const includeProduct = { model: db.SanPham, as: 'SanPham' }

export const layHinhAnhSanPhams = async ({ search = '', page = 1 }) => {
    const offset = (parseInt(page, 10) - 1) * PAGE_SIZE
    const where = {};
    if (search.trim()) where.image_url = { [Op.like]: `%${search}%` };
    if (sanpham_id) where.sanpham_id = sanpham_id;

    const [data, total] = await Promise.all([
        db.HinhAnhSanPham.findAll({ where, limit: PAGE_SIZE, offset, include: [includeProduct] }),
        db.HinhAnhSanPham.count({ where })
    ])
    return { data, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / PAGE_SIZE) }
}

export const layHinhAnhSanPhamTheoId = async (id) => {
    const hinhanh = await db.HinhAnhSanPham.findByPk(id, { include: [includeProduct] })
    if (!hinhanh) throw { status: 404, message: 'Không tìm thấy hình ảnh' }
    return hinhanh
}

export const themHinhAnhSanPham = async ({ sanpham_id, image_url }) => {
    if (!sanpham_id || !image_url) throw { status: 400, message: 'Thiếu sanpham_id hoặc image_url' }

    const sanpham = await db.SanPham.findByPk(sanpham_id)
    if (!sanpham) throw { status: 404, message: 'Không tìm thấy sản phẩm' }

    const existed = await db.HinhAnhSanPham.findOne({ where: { sanpham_id, image_url } })
    if (existed) throw { status: 409, message: 'Hình ảnh này đã được thêm cho sản phẩm' }

    return await db.HinhAnhSanPham.create({ sanpham_id, image_url })
}

export const xoaHinhAnhSanPham = async (id) => {
    const deleted = await db.HinhAnhSanPham.destroy({ where: { id } })
    if (!deleted) throw { status: 404, message: 'Không tìm thấy hình ảnh để xóa' }
}