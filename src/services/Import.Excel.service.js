import * as XLSX from 'xlsx';
import db from '../models/index.js';
import { themHinhAnhSanPham } from './HinhAnhSanPham.service.js';
import { generateSanPhamId } from '../helpers/SanPham.helper.js';

const parseSheet = (workbook, name) =>
    XLSX.utils.sheet_to_json(workbook.Sheets[name] || {});

const importSheet = async (rows, handler) => {
    const results = { success: [], errors: [] };
    for (const [i, row] of rows.entries()) {
        try {
            const result = await handler(row);
            results.success.push({ row: i + 2, ...result });
        } catch (err) {
            const message = err.errors?.map(e => e.message).join(', ') || err.message;
            results.errors.push({ row: i + 2, data: row, message });
        }
    }
    return results;
};

const importDanhMuc = async (row) => {
    if (!row.ten) throw new Error('Thiếu tên danh mục');
    const existed = await db.DanhMuc.findOne({ where: { ten: row.ten } });
    if (existed) return { id: existed.danhmuc_id, ten: row.ten, status: 'skipped' };

    let url = row.url || row.ten.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    const urlExisted = await db.DanhMuc.findOne({ where: { url } });
    if (urlExisted) url = `${url}-${Date.now()}`;

    const dm = await db.DanhMuc.create({
        ten: row.ten, url,
        mota: row.mota || null,
        thutu: Number(row.thutu) || 0,
        trangthai: Number(row.trangthai) ?? 1,
    });
    return { id: dm.danhmuc_id, ten: dm.ten };
};

const importThuongHieu = async (row) => {
    if (!row.name) throw new Error('Thiếu tên thương hiệu');
    const existed = await db.ThuongHieu.findOne({ where: { name: row.name } });
    if (existed) return { id: existed.thuonghieu_id, name: row.name, status: 'skipped' };

    const th = await db.ThuongHieu.create({ name: row.name, image: row.image || null });
    return { id: th.thuonghieu_id, name: th.name };
};

const importLoaiSanPham = async (row) => {
    if (!row.name) throw new Error('Thiếu tên loại sản phẩm');
    if (!row.danhmuc_id) throw new Error('Thiếu danhmuc_id');

    const dm = await db.DanhMuc.findByPk(row.danhmuc_id);
    if (!dm) throw new Error(`danhmuc_id=${row.danhmuc_id} không tồn tại`);

    const existed = await db.LoaiSanPham.findOne({ where: { name: row.name } });
    if (existed) return { id: existed.loai_id, name: row.name, status: 'skipped' };

    const loai = await db.LoaiSanPham.create({
        name: row.name,
        danhmuc_id: Number(row.danhmuc_id),
        image: row.image || null,
    });
    return { id: loai.loai_id, name: loai.name };
};

const importSanPham = async (row) => {
    if (!row.name) throw new Error('Thiếu tên sản phẩm');
    if (!row.gia || isNaN(row.gia)) throw new Error('Giá không hợp lệ');
    if (!row.loai_id) throw new Error('Thiếu loai_id');
    if (!row.thuonghieu_id) throw new Error('Thiếu thuonghieu_id');

    const [loai, thuonghieu] = await Promise.all([
        db.LoaiSanPham.findByPk(row.loai_id),
        db.ThuongHieu.findByPk(row.thuonghieu_id),
    ]);
    if (!loai) throw new Error(`loai_id=${row.loai_id} không tồn tại`);
    if (!thuonghieu) throw new Error(`thuonghieu_id=${row.thuonghieu_id} không tồn tại`);

    const sanpham_id = row.sanpham_id?.toString().trim() || await generateSanPhamId();

    const existed = await db.SanPham.findByPk(sanpham_id);
    if (existed) return { sanpham_id, name: row.name, status: 'skipped' };

    const existedByName = await db.SanPham.findOne({ where: { name: row.name } });
    if (existedByName) return { sanpham_id: existedByName.sanpham_id, name: row.name, status: 'skipped' };

    await db.SanPham.create({
        sanpham_id,
        name: row.name,
        mota: row.mota || null,
        gia: Number(row.gia),
        soluong: Number(row.soluong) || 0,
        loai_id: Number(row.loai_id),
        thuonghieu_id: Number(row.thuonghieu_id),
    });

    if (row.image_url?.trim()) {
        await themHinhAnhSanPham({ sanpham_id, image_url: row.image_url.trim(), la_anh_dai_dien: true });
    }


    return { sanpham_id, name: row.name };
};

export const fullImportFromExcel = async (buffer) => {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const [dmRows, thRows, loaiRows, spRows] = [
        parseSheet(wb, 'DanhMuc'),
        parseSheet(wb, 'ThuongHieu'),
        parseSheet(wb, 'LoaiSanPham'),
        parseSheet(wb, 'SanPham'),
    ];

    const danhMuc = await importSheet(dmRows, importDanhMuc);
    const thuongHieu = await importSheet(thRows, importThuongHieu);
    const loaiSP = await importSheet(loaiRows, importLoaiSanPham);
    const sanPham = await importSheet(spRows, importSanPham);

    return { danhMuc, thuongHieu, loaiSP, sanPham };
};