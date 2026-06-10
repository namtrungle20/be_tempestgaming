import * as XLSX from 'xlsx';
import db from '../models/index.js';
import { themHinhAnhSanPham } from './HinhAnhSanPham.service.js';
import { generateSanPhamId } from '../helpers/SanPham.helper.js';

const parseSheet = (workbook, name) =>
    XLSX.utils.sheet_to_json(workbook.Sheets[name] || {}, { defval: null });

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

// ── Gom các dòng cùng sanpham_id lại ─────────────────────────────────────────
const groupSanPhamRows = (rows) => {
    const map = new Map();
    let lastId = null;

    for (const row of rows) {
        const id = row.sanpham_id?.toString().trim() || null;

        // Dòng có đủ data → tạo sản phẩm mới
        if (row.name && row.gia && row.loai_id && row.thuonghieu_id) {
            const key = id || `__new__${row.name}`;
            lastId = key; // ✅ cập nhật lastId
            if (!map.has(key)) {
                map.set(key, { ...row, image_urls: [] });
            }
            if (row.image_url?.trim()) {
                map.get(key).image_urls.push(row.image_url.trim());
            }
        }
        // Dòng chỉ có image_url → gắn vào sản phẩm trước đó
        else if (row.image_url?.trim()) {
            const targetId = id || lastId;
            if (!targetId) continue;

            if (map.has(targetId)) {
                map.get(targetId).image_urls.push(row.image_url.trim());
            } else {
                map.set(targetId, { sanpham_id: targetId, image_urls: [row.image_url.trim()], _imageOnly: true });
                lastId = targetId;
            }
        }
    }
    return [...map.values()];
};

const importSanPham = async (row) => {
    // ── Chỉ thêm ảnh cho sản phẩm đã tồn tại ────────────────────────────────
    if (row._imageOnly) {
        const sanpham = await db.SanPham.findByPk(row.sanpham_id);
        if (!sanpham) throw new Error(`sanpham_id=${row.sanpham_id} không tồn tại`);

        const added = [];
        for (const url of row.image_urls) {
            try {
                await themHinhAnhSanPham({ sanpham_id: row.sanpham_id, image_url: url });
                added.push(url);
            } catch { /* bỏ qua ảnh trùng */ }
        }
        return { sanpham_id: row.sanpham_id, name: sanpham.name, images_added: added.length, status: 'images_only' };
    }

    // ── Tạo sản phẩm mới ─────────────────────────────────────────────────────
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

    // ✅ Thêm tất cả ảnh, ảnh đầu tiên là đại diện
    for (const [idx, url] of row.image_urls.entries()) {
        try {
            await themHinhAnhSanPham({
                sanpham_id,
                image_url: url,
                la_anh_dai_dien: idx === 0,
            });
        } catch (err) {
            return {
                massege: `Skip image ${idx + 1}: ${err.message}`
            }
        }
    }

    return { sanpham_id, name: row.name, images_added: row.image_urls.length };
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

    const danhMucIdMap = {};
    danhMuc.success.forEach((r, i) => { danhMucIdMap[i + 1] = r.id; });

    const loaiSP = await importSheet(loaiRows, (row) =>
        importLoaiSanPham({ ...row, danhmuc_id: danhMucIdMap[row.danhmuc_id] ?? row.danhmuc_id })
    );

    const thuongHieuIdMap = {};
    thuongHieu.success.forEach((r, i) => { thuongHieuIdMap[i + 1] = r.id; });

    const loaiIdMap = {};
    loaiSP.success.forEach((r, i) => { loaiIdMap[i + 1] = r.id; });

    // ✅ Gom rows trước khi import
    const groupedSpRows = groupSanPhamRows(
        spRows.map(row => ({
            ...row,
            loai_id: loaiIdMap[row.loai_id] ?? row.loai_id,
            thuonghieu_id: thuongHieuIdMap[row.thuonghieu_id] ?? row.thuonghieu_id,
        }))
    );

    const sanPham = await importSheet(groupedSpRows, importSanPham);

    return { danhMuc, thuongHieu, loaiSP, sanPham };
};