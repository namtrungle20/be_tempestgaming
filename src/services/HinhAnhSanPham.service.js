import { Op } from 'sequelize'
import db from '../models/index.js'
import ResponseHinhAnhSanPham from '../dtos/responses/ResponseHinhAnhSanPham.js';


const includeProduct = { model: db.SanPham, as: 'SanPham', attributes: ['sanpham_id', 'name', 'gia', 'url'] };

export const layHinhAnhSanPhams = async ({ page = 1 }) => {
    const data = await db.HinhAnhSanPham.findAll({
        include: [includeProduct],
        limit: 10,
        offset: (page - 1) * 10
    });
    // Map qua DTO
    const formattedData = data.map(item => new ResponseHinhAnhSanPham(item));
    return { data: formattedData, total: await db.HinhAnhSanPham.count() };
}

export const layHinhAnhSanPhamTheoId = async (id) => {
    const hinhanh = await db.HinhAnhSanPham.findByPk(id, { include: [includeProduct] })
    if (!hinhanh) throw { status: 404, message: 'Không tìm thấy hình ảnh' }
    return hinhanh
}

export const themHinhAnhSanPham = async ({ sanpham_id, image_url, public_id, la_anh_dai_dien = false }) => {
    if (!sanpham_id || !image_url) throw { status: 400, message: 'Thiếu sanpham_id hoặc image_url' }

    const sanpham = await db.SanPham.findByPk(sanpham_id)
    if (!sanpham) throw { status: 404, message: 'Không tìm thấy sản phẩm' }

    const existed = await db.HinhAnhSanPham.findOne({ where: { sanpham_id, image_url } })
    if (existed) throw { status: 409, message: 'Hình ảnh này đã được thêm cho sản phẩm' }

    const imageCount = await db.HinhAnhSanPham.count({ where: { sanpham_id } });

    let isDefault = false;
    if (imageCount === 0) {
        // Ảnh đầu tiên tự động là đại diện
        isDefault = true;
    } else if (la_anh_dai_dien === true) {
        // Nếu yêu cầu set làm đại diện, gỡ cờ của ảnh cũ
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
        la_anh_dai_dien: isDefault
    });
}

export const xoaHinhAnhSanPham = async (id) => {
    const deleted = await db.HinhAnhSanPham.destroy({ where: { id } })
    if (!deleted) throw { status: 404, message: 'Không tìm thấy hình ảnh để xóa' }
}