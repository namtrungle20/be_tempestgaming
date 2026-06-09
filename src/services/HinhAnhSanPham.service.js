import { Op } from 'sequelize'
import db from '../models/index.js'
import ExcelJS from 'exceljs';
import ResponseHinhAnhSanPham from '../dtos/responses/ResponseHinhAnhSanPham.js';


const includeProduct = { model: db.SanPham, as: 'SanPham', attributes: ['sanpham_id', 'name', 'gia', 'url'] };

export const layHinhAnhSanPhams = async ({ page = 1, sanpham_id }) => {
    const where = sanpham_id ? { sanpham_id } : {};

    const [data, total] = await Promise.all([
        db.HinhAnhSanPham.findAll({
            where,
            include: [includeProduct],
            limit: 10,
            offset: (page - 1) * 10
        }),
        db.HinhAnhSanPham.count({ where })
    ]);
    // Map qua DTO
    const formattedData = data.map(item => new ResponseHinhAnhSanPham(item));
    return { data: formattedData, total };
}

export const layHinhAnhSanPhamTheoId = async (id) => {
    const hinhanh = await db.HinhAnhSanPham.findByPk(id, { include: [includeProduct] })
    if (!hinhanh) throw { status: 404, message: 'Không tìm thấy hình ảnh' }
    return hinhanh
}

export const themHinhAnhSanPham = async ({ sanpham_id, image_url, file_hash, public_id, la_anh_dai_dien = false }) => {
    if (!sanpham_id || !image_url) throw { status: 400, message: 'Thiếu sanpham_id hoặc image_url' }

    const sanpham = await db.SanPham.findByPk(sanpham_id)
    if (!sanpham) throw { status: 404, message: 'Không tìm thấy sản phẩm' }

    const existed = await db.HinhAnhSanPham.findOne({ where: { sanpham_id, image_url } })
    if (existed) throw { status: 409, message: 'Hình ảnh này đã được thêm cho sản phẩm' }

    if (public_id) {
        const existedPublicId = await db.HinhAnhSanPham.findOne({ where: { sanpham_id, public_id } })
        if (existedPublicId) throw { status: 409, message: 'Ảnh này đã tồn tại (public_id trùng)' }
    }

    const imageCount = await db.HinhAnhSanPham.count({ where: { sanpham_id } });

    let isDefault = false;
    if (imageCount === 0) {
        isDefault = true;
    } else if (la_anh_dai_dien === true) {
        await db.HinhAnhSanPham.update(
            { la_anh_dai_dien: false },
            { where: { sanpham_id, la_anh_dai_dien: true } }
        );
        isDefault = true;
    }

    return await db.HinhAnhSanPham.create({
        sanpham_id,
        image_url,
        public_id,
        file_hash: file_hash || null,
        la_anh_dai_dien: isDefault
    });
}

export const xoaHinhAnhSanPham = async (id) => {
    const deleted = await db.HinhAnhSanPham.destroy({ where: { id } })
    if (!deleted) throw { status: 404, message: 'Không tìm thấy hình ảnh để xóa' }
}

export const xoaAnhTrungLap = async (sanpham_id) => {
    const where = sanpham_id ? { sanpham_id } : {};

    const allImages = await db.HinhAnhSanPham.findAll({
        where,
        attributes: ['id', 'sanpham_id', 'image_url', 'public_id', 'la_anh_dai_dien'],
        order: [['id', 'ASC']],
        raw: true,
    });

    const seen = new Map();
    const toDelete = [];

    for (const img of allImages) {
        const key = `${img.sanpham_id}__${img.image_url}`;
        if (seen.has(key)) {
            toDelete.push(img.id);
        } else {
            seen.set(key, img.id);
        }
    }

    if (!toDelete.length) return { deleted: 0, message: 'Không có ảnh trùng lặp' };

    await db.HinhAnhSanPham.destroy({ where: { id: { [Op.in]: toDelete } } });

    return {
        deleted: toDelete.length,
        message: `Đã xóa ${toDelete.length} ảnh trùng lặp`,
    };
}

export const bulkUploadTaoExcel = async (uploadedImages) => {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Images');

    ws.columns = [
        { header: 'originalname', key: 'originalname', width: 30 },
        { header: 'image_url', key: 'image_url', width: 60 },
    ];

    ws.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E4057' } };
        cell.alignment = { horizontal: 'center' };
    });

    uploadedImages.forEach(img => {
        ws.addRow({ originalname: img.originalname, image_url: img.url });
    });

    return await wb.xlsx.writeBuffer();
};