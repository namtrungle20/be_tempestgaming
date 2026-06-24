import * as XLSX from 'xlsx';
import db from '../models/index.js';

export const exportSanPhamToExcel = async () => {
    const [danhMucs, thuongHieus, loaiSanPhams, sanPhams, chiTietSanPhams] = await Promise.all([
        db.DanhMuc.findAll({ order: [['danhmuc_id', 'ASC']] }),
        db.ThuongHieu.findAll({ order: [['thuonghieu_id', 'ASC']] }),
        db.LoaiSanPham.findAll({ order: [['loai_id', 'ASC']] }),
        db.SanPham.findAll({
            where: { deleted_at: null },
            include: [
                { model: db.LoaiSanPham, as: 'LoaiSanPham', attributes: ['name'] },
                { model: db.ThuongHieu, as: 'ThuongHieu', attributes: ['name'] },
                { model: db.HinhAnhSanPham, as: 'HinhAnhSanPham', attributes: ['image_url'], limit: 1 },
            ],
            order: [['sanpham_id', 'ASC']],
        }),
        db.ChiTietSanPham.findAll({ order: [['sanpham_id', 'ASC']] }),
    ]);

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: DanhMuc ──
    const ws1 = XLSX.utils.json_to_sheet(danhMucs.map(dm => ({
        danhmuc_id: dm.danhmuc_id, ten: dm.ten, url: dm.url,
        mota: dm.mota || '', thutu: dm.thutu, trangthai: dm.trangthai,
    })));
    ws1['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 40 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'DanhMuc');

    // ── Sheet 2: ThuongHieu ──
    const ws2 = XLSX.utils.json_to_sheet(thuongHieus.map(th => ({
        thuonghieu_id: th.thuonghieu_id, name: th.name, image: th.image || '',
    })));
    ws2['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'ThuongHieu');

    // ── Sheet 3: LoaiSanPham ──
    const ws3 = XLSX.utils.json_to_sheet(loaiSanPhams.map(l => ({
        loai_id: l.loai_id, name: l.name, danhmuc_id: l.danhmuc_id, image: l.image || '',
    })));
    ws3['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, ws3, 'LoaiSanPham');

    // ── Sheet 4: SanPham ──
    const ws4 = XLSX.utils.json_to_sheet(sanPhams.map(sp => ({
        sanpham_id: sp.sanpham_id,
        name: sp.name,
        mota: sp.mota ? sp.mota.replace(/<[^>]*>/g, '').slice(0, 500) : '',
        gia: Number(sp.gia),
        soluong: sp.soluong,
        loai_id: sp.loai_id,
        loai_ten: sp.LoaiSanPham?.name || '',
        thuonghieu_id: sp.thuonghieu_id,
        thuonghieu_ten: sp.ThuongHieu?.name || '',
        image_url: sp.HinhAnhSanPham?.[0]?.image_url || '',
    })));
    ws4['!cols'] = [
        { wch: 14 }, { wch: 30 }, { wch: 50 }, { wch: 14 }, { wch: 10 },
        { wch: 10 }, { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 45 },
    ];
    XLSX.utils.book_append_sheet(wb, ws4, 'SanPham');

    // ── Sheet 5: ChiTietSanPham (thông số kỹ thuật key-value) ──
    const ws5 = XLSX.utils.json_to_sheet(chiTietSanPhams.map(ct => ({
        sanpham_id: ct.sanpham_id,
        name: ct.name,
        gia_tri: ct.gia_tri,
    })));
    ws5['!cols'] = [{ wch: 14 }, { wch: 25 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws5, 'ChiTietSanPham');

    // ── Sheet 6: Hướng dẫn ──
    const ws6 = XLSX.utils.json_to_sheet([
        { 'Sheet': 'DanhMuc', 'Ghi chú': 'Danh mục hiện có trong hệ thống' },
        { 'Sheet': 'ThuongHieu', 'Ghi chú': 'Thương hiệu hiện có' },
        { 'Sheet': 'LoaiSanPham', 'Ghi chú': 'Loại sản phẩm, cột danhmuc_id tham chiếu sheet DanhMuc' },
        { 'Sheet': 'SanPham', 'Ghi chú': 'Thông tin sản phẩm cơ bản, mota đã strip HTML' },
        { 'Sheet': 'ChiTietSanPham', 'Ghi chú': 'Thông số kỹ thuật dạng key-value, tham chiếu sanpham_id' },
    ]);
    ws6['!cols'] = [{ wch: 15 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, ws6, 'Huong_Dan');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};