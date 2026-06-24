import db from '../models/index.js';

// Lấy danh sách đánh giá theo sản phẩm
export const layDanhGiaTheoSanPham = async ({ sanpham_id, page = 1, limit = 10 }) => {
    if (!sanpham_id) throw { status: 400, message: 'Thiếu sanpham_id' };

    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await db.DanhGia.findAndCountAll({
        where: { sanpham_id },
        include: [{
            model: db.NguoiDung,
            as: 'NguoiDung',
            attributes: ['nguoidung_id', 'name', 'avatar'],
        }],
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset,
    });

    // Tổng hợp sao
    const allReviews = await db.DanhGia.findAll({
        where: { sanpham_id },
        attributes: ['sosao'],
        raw: true,
    });

    const tongSao = allReviews.reduce((acc, r) => acc + r.sosao, 0);
    const trungBinhSao = allReviews.length > 0
        ? Math.round((tongSao / allReviews.length) * 10) / 10
        : 0;

    // Phân phối sao 1-5
    const phanPhoi = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach(r => { phanPhoi[r.sosao] = (phanPhoi[r.sosao] || 0) + 1 });

    return {
        data: data.map(dg => ({
            danhgia_id: dg.danhgia_id,
            sosao: dg.sosao,
            binhluan: dg.binhluan,
            created_at: dg.created_at,
            nguoidung: {
                id: dg.NguoiDung?.nguoidung_id,
                name: dg.NguoiDung?.name || 'Người dùng ẩn danh',
                avatar: dg.NguoiDung?.avatar || null,
            }
        })),
        total,
        tong_danh_gia: allReviews.length,
        trung_binh_sao: trungBinhSao,
        phan_phoi_sao: phanPhoi,
    };
};

// Tạo đánh giá mới
export const taoDanhGia = async ({ nguoidung_id, sanpham_id, sosao, binhluan }) => {
    if (!nguoidung_id || !sanpham_id) throw { status: 400, message: 'Thiếu thông tin' };
    if (!sosao || sosao < 1 || sosao > 5) throw { status: 400, message: 'Số sao không hợp lệ (1-5)' };

    const sanpham = await db.SanPham.findByPk(sanpham_id);
    if (!sanpham) throw { status: 404, message: 'Không tìm thấy sản phẩm' };

    // Mỗi user chỉ review 1 lần / 1 sản phẩm
    const existed = await db.DanhGia.findOne({ where: { nguoidung_id, sanpham_id } });
    if (existed) throw { status: 409, message: 'Bạn đã đánh giá sản phẩm này rồi' };

    const danhgia = await db.DanhGia.create({
        nguoidung_id,
        sanpham_id,
        sosao: Number(sosao),
        binhluan: binhluan?.trim() || null,
    });

    // Trả về kèm thông tin user
    const nguoidung = await db.NguoiDung.findByPk(nguoidung_id, {
        attributes: ['nguoidung_id', 'name', 'avatar'],
    });

    return {
        danhgia_id: danhgia.danhgia_id,
        sosao: danhgia.sosao,
        binhluan: danhgia.binhluan,
        created_at: danhgia.created_at,
        nguoidung: {
            id: nguoidung?.nguoidung_id,
            name: nguoidung?.name || 'Người dùng ẩn danh',
            avatar: nguoidung?.avatar || null,
        }
    };
};

// Xóa đánh giá — chỉ chủ sở hữu hoặc admin (vaitro === 1)
export const xoaDanhGia = async ({ danhgia_id, nguoidung_id, vaitro }) => {
    const danhgia = await db.DanhGia.findByPk(danhgia_id);
    if (!danhgia) throw { status: 404, message: 'Không tìm thấy đánh giá' };

    const isOwner = danhgia.nguoidung_id === nguoidung_id;
    const isAdmin = vaitro === 1;

    if (!isOwner && !isAdmin) {
        throw { status: 403, message: 'Bạn không có quyền xóa đánh giá này' };
    }

    await danhgia.destroy();
};