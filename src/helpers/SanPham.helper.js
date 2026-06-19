import db from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Sinh mã sản phẩm tự động theo định dạng SP-XXXX
 * Ví dụ: SP-0001, SP-0002, SP-0099, SP-0100...
 */
export const generateSanPhamId = async () => {
    const last = await db.SanPham.findOne({
        where: { sanpham_id: { [Op.like]: 'SP-%' } },
        order: [['sanpham_id', 'DESC']],
        attributes: ['sanpham_id'],
    });

    if (!last) return 'SP-0001';

    const lastNum = parseInt(last.sanpham_id.split('-')[1], 10);
    return `SP-${String(lastNum + 1).padStart(4, '0')}`;
};