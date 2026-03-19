import { Sequelize } from 'sequelize'
import db from '../models/index.js'

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

const sanphamIncludes = [
    { model: db.ThuongHieu, attributes: ['name'] },
    { model: db.LoaiSanPham, attributes: ['name'] },
]

// ─── Controllers ────────────────────────────────────────────────────────────

export const getSanPhams = async (req, res) => {
    const { search = '', page = 1 } = req.query
    const pageSize = 10
    const offset = (page - 1) * pageSize
    const whereClause = buildSearchWhere(search)

    const [sanphams, total] = await Promise.all([
        db.SanPham.findAll({
            where: whereClause,
            limit: pageSize,
            offset,
            include: sanphamIncludes,
            order: [['createdAt', 'DESC']]
        }),
        db.SanPham.count({ where: whereClause })
    ])

    return res.status(200).json({
        success: true,
        data: sanphams,
        total,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(total / pageSize),
    })
}

export const getSanPhamById = async (req, res) => {
    const { id } = req.params
    const sanpham = await db.SanPham.findByPk(id, {
        include: [
            { model: db.HinhAnhSanPham, as: 'HinhAnhSanPhams' },
            ...sanphamIncludes,
        ]
    })

    if (!sanpham)
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' })

    return res.status(200).json({ success: true, data: sanpham })
}

export const themSanPham = async (req, res) => {
    const { name, mota, gia, soluong, loai_id, thuonghieu_id } = req.body
    const image = req.file ? req.file.filename : req.body.image

    const [loaiSanPham, thuongHieu] = await Promise.all([
        db.LoaiSanPham.findByPk(loai_id),
        db.ThuongHieu.findByPk(thuonghieu_id)
    ])

    if (!loaiSanPham)
        return res.status(404).json({ success: false, message: 'Loại sản phẩm không tồn tại' })
    if (!thuongHieu)
        return res.status(404).json({ success: false, message: 'Thương hiệu không tồn tại' })

    const sanpham = await db.SanPham.create({
        name, mota, gia: gia || 0, soluong: soluong || 0,
        loai_id, thuonghieu_id, image
    })

    return res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data: sanpham })
}

export const updateSanPham = async (req, res) => {
    const { id } = req.params

    const existed = req.body.name && await db.SanPham.findOne({
        where: { name: req.body.name, sanpham_id: { [Op.ne]: id } }
    })
    if (existed)
        return res.status(409).json({ success: false, message: 'Tên sản phẩm đã tồn tại' })

    const updateData = {
        name: req.body.name,
        mota: req.body.mota,
        gia: req.body.gia,
        soluong: req.body.soluong,
        loai_id: req.body.loai_id,
        thuonghieu_id: req.body.thuonghieu_id,
        ...(req.file && { image: req.file.filename })
    }

    const [updatedRows] = await db.SanPham.update(updateData, { where: { sanpham_id: id } })
    if (!updatedRows)
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' })

    return res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công' })
}

export const xoaSanPham = async (req, res) => {
    const { id } = req.params
    const deleted = await db.SanPham.destroy({ where: { sanpham_id: id } })

    if (!deleted)
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' })

    return res.status(200).json({ success: true, message: 'Xóa sản phẩm thành công' })
}