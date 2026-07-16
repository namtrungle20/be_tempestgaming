import { Sequelize } from 'sequelize'
import db from '../models/index.js'
import { generateSanPhamId } from '../helpers/SanPham.helper.js'
import * as HinhAnhSanPhamService from './HinhAnhSanPham.service.js';
const { Op } = Sequelize

// ─── Helpers ────────────────────────────────────────────────────────────────
const validateId = (value, fieldName) => {
    if (!value) return // không truyền thì bỏ qua
    if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
        throw { status: 400, message: `${fieldName} không hợp lệ` }
    }
}

const buildSearchWhere = (search) => {
    // console.log('🔵 buildSearchWhere called:', JSON.stringify(search))
    if (!search.trim()) return {}
    const term = search.trim()
    if (term.length < 2) return {}
    const escaped = term.slice(0, 100).replace(/[%_\\]/g, '\\$&')
    return {
        [Op.or]: [
            { name: { [Op.like]: `%${escaped}%` } },
            // { mota: { [Op.like]: `%${search}%` } },
            { sanpham_id: { [Op.like]: `%${escaped}%` } },
            // { '$ThuongHieu.name$': { [Op.like]: `%${escaped}%` } },
            { '$LoaiSanPham.name$': { [Op.like]: `%${escaped}%` } },
        ]
    }
}

const buildFilterWhere = ({ search, loai_id, thuonghieu_id, gia_min, gia_max }) => {

    validateId(loai_id, 'loai_id')
    validateId(thuonghieu_id, 'thuonghieu_id')

    const where = { deleted_at: null, ...buildSearchWhere(search) };

    if (loai_id) where.loai_id = loai_id
    if (thuonghieu_id) where.thuonghieu_id = thuonghieu_id
    if (gia_min || gia_max) {
        const min = Number(gia_min)
        const max = Number(gia_max)

        if (min < 0 || max < 0) throw { status: 400, message: 'Giá không hợp lệ' }
        if (min && max && min > max) throw { status: 400, message: 'Giá tối thiểu không được lớn hơn giá tối đa' }

        where.gia = {}
        if (min) where.gia[Op.gte] = min
        if (max) where.gia[Op.lte] = max
    }
    return where
}

const buildOrder = (sort_by = 'createdAt', sort_order = 'DESC') => {
    const allowedFields = ['createdAt', 'gia', 'name']
    const allowedOrders = ['ASC', 'DESC']
    const field = allowedFields.includes(sort_by) ? sort_by : 'createdAt'
    const order = allowedOrders.includes(sort_order?.toUpperCase()) ? sort_order.toUpperCase() : 'DESC'
    return [[field, order], ['sanpham_id', 'ASC']]
}

const sanphamIncludes = [
    { model: db.ThuongHieu, attributes: ['name'] },
    { model: db.LoaiSanPham, attributes: ['name'] },
    { model: db.HinhAnhSanPham, as: 'HinhAnhSanPham', attributes: ['image_url'], limit: 1 },
]

// ─── Services ────────────────────────────────────────────────────────────────

export const laySanPham = async ({ search = '', page = 1, limit, loai_id, thuonghieu_id, gia_min, gia_max, sort_by, sort_order }) => {
    const pageSize = limit ? Number(limit) : 10
    const offset = (page - 1) * pageSize

    const where = buildFilterWhere({ search, loai_id, thuonghieu_id, gia_min, gia_max })
    // console.log('🔵 WHERE:', JSON.stringify(where, null, 2))

    const [sanphams, total] = await Promise.all([
        db.SanPham.findAll({
            where,
            limit: pageSize,
            offset,
            include: sanphamIncludes,
            order: buildOrder(sort_by, sort_order),
            subQuery: false, // ✅ cần thiết khi dùng $association.field$
        }),
        db.SanPham.count({
            where,
            include: [
                { model: db.ThuongHieu, attributes: [] },
                { model: db.LoaiSanPham, attributes: [] },
            ],
            distinct: true,
            subQuery: false,
        })
    ])

    return { data: sanphams, total, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / pageSize) }
}

export const laySanPhamTheoId = async (id) => {
    const sanpham = await db.SanPham.findOne({
        where: { sanpham_id: id, deleted_at: null },
        include: [
            { model: db.ThuongHieu, attributes: ['name'] },
            { model: db.LoaiSanPham, attributes: ['name'] },
            { model: db.HinhAnhSanPham, as: 'HinhAnhSanPham' },
        ],
    })
    if (!sanpham) throw { status: 404, message: 'Không tìm thấy sản phẩm' }
    return sanpham
}

export const themSanPham = async (productData, uploadedImages = []) => {
    // Lấy các trường cần thiết
    const { name, mota, gia, soluong, loai_id, thuonghieu_id } = productData;

    // Kiểm tra loại, thương hiệu
    const [loaiSanPham, thuongHieu] = await Promise.all([
        db.LoaiSanPham.findByPk(loai_id),
        db.ThuongHieu.findByPk(thuonghieu_id)
    ]);
    if (!loaiSanPham) throw { status: 404, message: 'Loại sản phẩm không tồn tại' };
    if (!thuongHieu) throw { status: 404, message: 'Thương hiệu không tồn tại' };

    // Tạo mã sản phẩm
    const sanpham_id = await generateSanPhamId();

    // Tạo sản phẩm (không có image)
    const newProduct = await db.SanPham.create({
        sanpham_id,
        name,
        mota,
        gia: gia || 0,
        soluong: soluong || 0,
        loai_id,
        thuonghieu_id,
    });

    // Xử lý ảnh từ Cloudinary (nếu có)
    if (uploadedImages && uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
            const img = uploadedImages[i];
            const la_anh_dai_dien = (i === 0);
            await HinhAnhSanPhamService.themHinhAnhSanPham({
                sanpham_id,
                image_url: img.url,
                la_anh_dai_dien
            });
        }
    }

    return newProduct;
};
// export const capNhatSanPham = async (id, data) => {
//     const sanpham = await db.SanPham.findByPk(id)
//     if (!sanpham) throw { status: 404, message: 'Không tìm thấy sản phẩm' }

//     if (data.name) {
//         const existed = await db.SanPham.findOne({
//             where: { name: data.name, sanpham_id: { [Op.ne]: id } }
//         })
//         if (existed) throw { status: 409, message: 'Tên sản phẩm đã tồn tại' }
//     }

//     await sanpham.update(data)
//     return sanpham
// }
export const capNhatSanPhamVaAnh = async (
    id,
    productData,
    uploadedImages = [],
    deleteImageIds = [],
    setDefaultImageId = null) => {
    const sanpham = await db.SanPham.findOne({
        where: {
            sanpham_id: id,
            deleted_at: null
        }
    });
    if (!sanpham) {
        throw {
            status: 404,
            message: `Sản phẩm ID ${id} không tồn tại hoặc đã bị xóa`,
            debug: { id, productDataKeys: Object.keys(productData || {}) }
        };
    }


    // Cập nhật thông tin cơ bản
    const allowedFields = ['name', 'mota', 'gia', 'soluong', 'loai_id', 'thuonghieu_id'];
    allowedFields.forEach(field => {
        // ✅ ĐÃ FIX: Kiểm tra field tồn tại và không undefined
        if (productData.hasOwnProperty(field) && productData[field] !== undefined) {
            sanpham[field] = productData[field];
        }
    });
    await sanpham.save();

    // Xóa ảnh cũ (trên Cloudinary và DB)
    if (deleteImageIds.length > 0) {
        const imagesToDelete = await db.HinhAnhSanPham.findAll({
            where: { hinhanh_id: deleteImageIds, sanpham_id: id }
        });
        for (const img of imagesToDelete) {
            if (img.public_id) await cloudinary.uploader.destroy(img.public_id).catch(e => console.error(e));
        }
        await db.HinhAnhSanPham.destroy({ where: { hinhanh_id: deleteImageIds, sanpham_id: id } });
    }

    // Thêm ảnh mới
    for (const img of uploadedImages) {
        await HinhAnhSanPhamService.themHinhAnhSanPham({
            sanpham_id: id, image_url: img.url, public_id: img.public_id, la_anh_dai_dien: false
        });
    }

    // Xử lý ảnh đại diện
    if (setDefaultImageId) {
        await db.HinhAnhSanPham.update({ la_anh_dai_dien: false }, { where: { sanpham_id: id, la_anh_dai_dien: true } });
        const [updated] = await db.HinhAnhSanPham.update({ la_anh_dai_dien: true }, { where: { hinhanh_id: setDefaultImageId, sanpham_id: id } });
        if (updated === 0) throw { status: 404, message: 'Không tìm thấy ảnh để đặt làm đại diện' };
    } else if (uploadedImages.length > 0) {
        const remainingCount = await db.HinhAnhSanPham.count({ where: { sanpham_id: id } });
        if (remainingCount === 1) {
            await db.HinhAnhSanPham.update({ la_anh_dai_dien: true }, { where: { sanpham_id: id } });
        }
    }
    return sanpham;
};

export const xoaSanPham = async (id) => {
    const sanpham = await db.SanPham.findOne({ where: { sanpham_id: id, deleted_at: null } });
    if (!sanpham) throw { status: 404, message: 'Sản phẩm không tồn tại hoặc đã bị xóa' };
    await sanpham.update({ deleted_at: new Date() });
    // Không xóa ảnh vật lý, chỉ xóa mềm sản phẩm. Nếu muốn xóa ảnh trên Cloudinary, bạn cần lấy danh sách public_id và xóa.
};