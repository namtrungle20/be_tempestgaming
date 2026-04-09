import { Sequelize } from 'sequelize'
import db from '../models/index.js'
import { generateSanPhamId } from '../helpers/SanPham.helper.js'

const { Op } = Sequelize

// ─── Helpers ────────────────────────────────────────────────────────────────

const buildSearchWhere = (search) => {
    if (!search.trim()) return {}
    return {
        [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { mota: { [Op.like]: `%${search}%` } },
        ]
    }
}

const buildFilterWhere = ({ search, loai_id, thuonghieu_id, gia_min, gia_max }) => {
    const where = buildSearchWhere(search)
    if (loai_id) where.loai_id = loai_id
    if (thuonghieu_id) where.thuonghieu_id = thuonghieu_id
    if (gia_min || gia_max) {
        where.gia = {}
        if (gia_min) where.gia[Op.gte] = Number(gia_min)
        if (gia_max) where.gia[Op.lte] = Number(gia_max)
    }
    return where
}

const buildOrder = (sort_by = 'createdAt', sort_order = 'DESC') => {
    const allowedFields = ['createdAt', 'gia', 'name']
    const allowedOrders = ['ASC', 'DESC']
    const field = allowedFields.includes(sort_by) ? sort_by : 'createdAt'
    const order = allowedOrders.includes(sort_order?.toUpperCase()) ? sort_order.toUpperCase() : 'DESC'
    return [[field, order]]
}

const sanphamIncludes = [
    { model: db.ThuongHieu, attributes: ['name'] },
    { model: db.LoaiSanPham, attributes: ['name'] },
    { model: db.HinhAnhSanPham, as: 'HinhAnhSanPham', attributes: ['image_url'], limit: 1 },
]

// ─── Services ────────────────────────────────────────────────────────────────

export const laySanPham = async ({ search = '', page = 1, loai_id, thuonghieu_id, gia_min, gia_max, sort_by, sort_order }) => {
    const pageSize = 10
    const offset = (page - 1) * pageSize
    const whereClause = buildFilterWhere({ search, loai_id, thuonghieu_id, gia_min, gia_max })

    const [sanphams, total] = await Promise.all([
        db.SanPham.findAll({
            where: whereClause,
            limit: pageSize,
            offset,
            include: sanphamIncludes,
            order: buildOrder(sort_by, sort_order)
        }),
        db.SanPham.count({ where: whereClause })
    ])

    return { data: sanphams, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / pageSize) }
}

export const laySanPhamTheoId = async (id) => {
    const sanpham = await db.SanPham.findByPk(id, {
        include: [
            { model: db.HinhAnhSanPham, as: 'HinhAnhSanPhams' },
            ...sanphamIncludes,
        ]
    })
    if (!sanpham) throw { status: 404, message: 'Không tìm thấy sản phẩm' }
    return sanpham
}

export const themSanPham = async ({ name, mota, gia, soluong, loai_id, thuonghieu_id, image }) => {
    const [loaiSanPham, thuongHieu] = await Promise.all([
        db.LoaiSanPham.findByPk(loai_id),
        db.ThuongHieu.findByPk(thuonghieu_id)
    ])
    if (!loaiSanPham) throw { status: 404, message: 'Loại sản phẩm không tồn tại' }
    if (!thuongHieu) throw { status: 404, message: 'Thương hiệu không tồn tại' }

    const sanpham_id = await generateSanPhamId()
    return await db.SanPham.create({
        sanpham_id,
        name,
        mota,
        gia: gia || 0,
        soluong: soluong || 0,
        loai_id,
        thuonghieu_id,
        image
    })
}

export const capNhatSanPham = async (id, data) => {
    const sanpham = await db.SanPham.findByPk(id)
    if (!sanpham) throw { status: 404, message: 'Không tìm thấy sản phẩm' }

    if (data.name) {
        const existed = await db.SanPham.findOne({
            where: { name: data.name, sanpham_id: { [Op.ne]: id } }
        })
        if (existed) throw { status: 409, message: 'Tên sản phẩm đã tồn tại' }
    }

    await sanpham.update(data)
    return sanpham
}

export const xoaSanPham = async (id) => {
    const deleted = await db.SanPham.destroy({ where: { sanpham_id: id } })
    if (!deleted) throw { status: 404, message: 'Không tìm thấy sản phẩm' }
}