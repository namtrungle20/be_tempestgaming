import db from '../models/index.js'
import { Op } from 'sequelize'
import ResponseNguoiDung from '../dtos/responses/ResponseNguoiDung.js'
import { HangThanhVien, TrangThaiDonHang, TrangThaiTaiKhoan } from '../constants/index.js';
import argon2 from 'argon2';


const NGUONG_HANG = [
    { hang: HangThanhVien.dong, tu: 0, label: 'Đồng', giamShip: 0 },
    { hang: HangThanhVien.bac, tu: 5000000, label: 'Bạc', giamShip: 5 },
    { hang: HangThanhVien.vang, tu: 20000000, label: 'Vàng', giamShip: 50 },
    { hang: HangThanhVien.kim_cuong, tu: 50000000, label: 'Kim Cương', giamShip: 100 },
];
const xacDinhHang = (tongChiTieu) => {
    for (let i = NGUONG_HANG.length - 1; i >= 0; i--) {
        if (tongChiTieu >= NGUONG_HANG[i].tu) return NGUONG_HANG[i].hang;
    }
    return HangThanhVien.dong;
};

export const layThongTinHang = (hang) => NGUONG_HANG.find(h => h.hang === hang) || NGUONG_HANG[0];

const layTienDoLenHang = (tongChiTieu, hangHienTai) => {
    if (hangHienTai >= NGUONG_HANG.length - 1) {
        return { hangTiepTheo: null, labelTiepTheo: null, conThieu: 0, phanTramTienDo: 100 };
    }

    const hangTiepTheo = hangHienTai + 1;
    const ttTiepTheo = layThongTinHang(hangTiepTheo);
    const ttHienTai = layThongTinHang(hangHienTai);

    const conThieu = Math.max(0, ttTiepTheo.tu - tongChiTieu);
    const khoangCach = ttTiepTheo.tu - ttHienTai.tu;
    const daDi = Math.max(0, tongChiTieu - ttHienTai.tu);
    const phanTramTienDo = khoangCach > 0 ? Math.min(100, Math.round((daDi / khoangCach) * 100)) : 100;

    return { hangTiepTheo, labelTiepTheo: ttTiepTheo.label, conThieu, phanTramTienDo };
};

const buildSearchWhere = (filter = {}, search = '') => {
    const where = { trangthai: { [Op.ne]: TrangThaiTaiKhoan.DA_XOA } }
    if (filter.trangthai !== undefined && filter.trangthai !== '') where.trangthai = parseInt(filter.trangthai)

    if (search?.trim()) {
        const searchTerm = search.trim()
        const searchCondition = { [Op.or]: [{ email: { [Op.like]: `%${searchTerm}%` } }, { sdt: { [Op.like]: `%${searchTerm}%` } }] }
        return Object.keys(where).length > 0 ? { [Op.and]: [where, searchCondition] } : { ...where, ...searchCondition }
    }
    return where
}

export const layTatCaNguoiDung = async ({ filter = {}, pagination = {}, sort = {}, search = '' }) => {
    const page = parseInt(pagination.page) || 1
    const limit = parseInt(pagination.perPage) || 10
    const offset = (page - 1) * limit
    const orderField = sort.field === 'id' ? 'nguoidung_id' : (sort.field || 'ngayvao')
    const orderDir = sort.order || 'DESC'
    const where = buildSearchWhere(filter, search)

    const { count, rows } = await db.NguoiDung.findAndCountAll({
        where,
        attributes: ['nguoidung_id', 'name', 'email', 'sdt', 'vaitro', 'trangthai', 'ngayvao', 'diachi', 'avatar', 'hang_thanh_vien'],
        limit, offset,
        order: [[orderField, orderDir]],
        raw: true
    })
    return { data: rows, total: count }
}

export const layNguoiDungTheoId = async (id) => {
    const user = await db.NguoiDung.findOne({
        where: {
            nguoidung_id: id,
            trangthai: { [Op.ne]: TrangThaiTaiKhoan.DA_XOA }
        },
        attributes: ['nguoidung_id', 'name', 'email', 'sdt', 'diachi', 'avatar', 'vaitro', 'trangthai', 'ngayvao', 'hang_thanh_vien'],
        raw: true
    })
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' }
    return new ResponseNguoiDung(user)
}

export const capNhatNguoiDung = async (id, { name, email, sdt, diachi, vaitro, trangthai }) => {
    const user = await db.NguoiDung.findOne({
        where: { nguoidung_id: id }
    })
    if (!user) throw { status: 404, message: 'Người dùng không tồn tại' }

    if (user.trangthai === TrangThaiTaiKhoan.DA_XOA && trangthai !== TrangThaiTaiKhoan.MO_KHOA) {
        throw { status: 403, message: 'Tài khoản đã bị xóa, không thể cập nhật' }
    }

    if (name !== undefined) user.name = name
    if (email !== undefined) user.email = email?.trim() || null
    if (sdt !== undefined) user.sdt = sdt
    if (diachi !== undefined) user.diachi = diachi
    if (vaitro !== undefined) user.vaitro = vaitro
    if (trangthai !== undefined) user.trangthai = trangthai
    await user.save()

    return new ResponseNguoiDung(user)
}


export const tinhVaCapNhatHang = async (nguoidung_id, { transaction = null, choPhepHaHang = false } = {}) => {
    const user = await db.NguoiDung.findByPk(nguoidung_id, { transaction });
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };

    const tongChiTieu = await db.DonHang.sum('tongtien', {
        where: {
            nguoidung_id,
            trangthai: TrangThaiDonHang.DA_THANH_TOAN,
        },
        transaction,
    }) || 0;

    const hangTinhDuoc = xacDinhHang(tongChiTieu);
    const hangCu = user.hang_thanh_vien;

    // Mặc định chỉ nâng hạng (giữ hạng cao nhất); nếu choPhepHaHang thì lấy đúng hạng tính được
    const hangCuoiCung = choPhepHaHang
        ? hangTinhDuoc
        : (hangTinhDuoc > hangCu ? hangTinhDuoc : hangCu);

    await user.update({
        tong_chi_tieu: tongChiTieu,
        hang_thanh_vien: hangCuoiCung,
    }, { transaction });

    return {
        hang_thanh_vien: hangCuoiCung,
        tong_chi_tieu: tongChiTieu,
        da_thay_doi: hangCuoiCung !== hangCu,
        huong: hangCuoiCung > hangCu ? 'len_hang' : hangCuoiCung < hangCu ? 'xuong_hang' : 'khong_doi',
    };
};


export const kiemTraLechHang = async () => {
    const users = await db.NguoiDung.findAll({
        where: { trangthai: { [Op.ne]: TrangThaiTaiKhoan.DA_XOA } },
        attributes: ['nguoidung_id', 'name', 'hang_thanh_vien'],
        raw: true,
    });

    const ketQua = [];
    for (const user of users) {
        const tongChiTieuThucTe = await db.DonHang.sum('tongtien', {
            where: {
                nguoidung_id: user.nguoidung_id,
                trangthai: TrangThaiDonHang.DA_THANH_TOAN,
            },
        }) || 0;

        const hangTinhLai = xacDinhHang(tongChiTieuThucTe);

        if (hangTinhLai !== user.hang_thanh_vien) {
            ketQua.push({
                nguoidung_id: user.nguoidung_id,
                name: user.name,
                hang_dang_luu: user.hang_thanh_vien,
                hang_tinh_lai: hangTinhLai,
                tong_chi_tieu_thuc_te: tongChiTieuThucTe,
                se_bi: hangTinhLai > user.hang_thanh_vien ? 'len_hang' : 'xuong_hang',
            });
        }
    }

    return { data: ketQua, total_lech: ketQua.length };
};

export const dongBoHangLoat = async (nguoidungIds) => {
    let ids = nguoidungIds;

    // Nếu không truyền ids → lấy tất cả user (trừ đã xóa)
    if (!Array.isArray(ids) || ids.length === 0) {
        const allUsers = await db.NguoiDung.findAll({
            where: { trangthai: { [Op.ne]: TrangThaiTaiKhoan.DA_XOA } },
            attributes: ['nguoidung_id'],
            raw: true,
        });
        ids = allUsers.map(u => u.nguoidung_id);
    }

    if (ids.length === 0) {
        throw { status: 400, message: 'Không có người dùng nào để đồng bộ' };
    }

    const ketQua = [];
    for (const id of ids) {
        try {
            const data = await tinhVaCapNhatHang(id, { choPhepHaHang: true });
            ketQua.push({ nguoidung_id: id, success: true, ...data });
        } catch (err) {
            ketQua.push({ nguoidung_id: id, success: false, message: err.message });
        }
    }
    return {
        data: ketQua,
        tong_so: ketQua.length,
        thanh_cong: ketQua.filter(r => r.success).length,
    };
};

export const layThongTinHangThanhVien = async (nguoidung_id) => {
    const user = await db.NguoiDung.findByPk(nguoidung_id, {
        attributes: ['nguoidung_id', 'hang_thanh_vien', 'tong_chi_tieu'],
    });
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };

    const tongChiTieu = Number(user.tong_chi_tieu);
    const thongTinHang = layThongTinHang(user.hang_thanh_vien);
    const tienDo = layTienDoLenHang(tongChiTieu, user.hang_thanh_vien);

    return {
        hang_thanh_vien: user.hang_thanh_vien,
        label: thongTinHang.label,
        giam_ship: thongTinHang.giamShip,
        tong_chi_tieu: tongChiTieu,
        ...tienDo,
    };
};

export const xoaNguoiDung = async (id) => {
    const user = await db.NguoiDung.findOne({
        where: {
            nguoidung_id: id,
            trangthai: { [Op.ne]: TrangThaiTaiKhoan.DA_XOA }
        }
    })
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' }

    user.trangthai = TrangThaiTaiKhoan.DA_XOA
    user.deleted_at = new Date()

    if (user.email) user.email = `deleted_${Date.now()}_${user.email}`
    if (user.name) user.name = `deleted_${Date.now()}_${user.name}`
    await user.save()

    await db.Session.update(
        { is_revoked: true },
        { where: { nguoidung_id: id } }
    )
}

export const doiMatKhau = async ({ userId, matKhauCu, matKhauMoi }) => {
    const user = await db.NguoiDung.findByPk(userId)
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' }

    const isMatch = await argon2.verify(user.password, matKhauCu)
    if (!isMatch) throw { status: 400, message: 'Mật khẩu hiện tại không đúng' }

    const hashed = await argon2.hash(matKhauMoi)
    await user.update({ password: hashed })

    return { success: true }
}