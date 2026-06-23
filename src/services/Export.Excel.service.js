import db from '../models/index.js'
import * as XLSX from 'xlsx'

export const exportSanPhamToExcel = async () => {
    const sanPhams = await db.SanPham.findAll({
        where: { deleted_at: null },
        include: [
            { model: db.LoaiSanPham, as: 'LoaiSanPham', attributes: ['loai_id'] },
            { model: db.ThuongHieu, as: 'ThuongHieu', attributes: ['thuonghieu_id'] },
            { model: db.HinhAnhSanPham, as: 'HinhAnhSanPham', attributes: ['image_url'], limit: 1 },
        ],
        order: [['sanpham_id', 'ASC']],
    });

    const data = sanPhams.map(sp => ({
        'sanpham_id': sp.sanpham_id,
        'name': sp.name,
        'mota': sp.mota ? sp.mota.replace(/<[^>]*>/g, '') : '', // strip HTML tags
        'gia': Number(sp.gia),
        'soluong': sp.soluong,
        'loai_id': sp.LoaiSanPham?.loai_id || '',
        'thuonghieu_id': sp.ThuongHieu?.thuonghieu_id || '',
        'image_url': sp.HinhAnhSanPham?.[0]?.image_url || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 12 }, { wch: 30 }, { wch: 50 }, { wch: 14 },
        { wch: 10 }, { wch: 18 }, { wch: 15 }, { wch: 45 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SanPham');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}