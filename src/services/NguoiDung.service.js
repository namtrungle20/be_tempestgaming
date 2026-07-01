import db from '../models/index.js'
import { Op } from 'sequelize'
import ResponseNguoiDung from '../dtos/responses/ResponseNguoiDung.js'
import { HangThanhVien, TrangThaiDonHang, TrangThaiTaiKhoan } from '../constants/index.js';


const NGUONG_HANG = [
    { hang: HangThanhVien.dong, tu: 0, label: 'Đồng', giamShip: 0 },
    { hang: HangThanhVien.bac, tu: 5_000_000, label: 'Bạc', giamShip: 50 },
    { hang: HangThanhVien.vang, tu: 20_000_000, label: 'Vàng', giamShip: 100 },
    { hang: HangThanhVien.kim_cuong, tu: 50_000_000, label: 'Kim Cương', giamShip: 100 },
];
const xacDinhHang = (tongChiTieu) => {
    for (let i = NGUONG_HANG.length - 1; i >= 0; i--) {
        if (tongChiTieu >= NGUONG_HANG[i].tu) return NGUONG_HANG[i].hang;
    }
    return HangThanhVien.dong;
};

const layThongTinHang = (hang) => NGUONG_HANG.find(h => h.hang === hang) || NGUONG_HANG[0];

const layTienDoLenHang = (tongChiTieu) => {
    const hangHienTai = xacDinhHang(tongChiTieu);

    if (hangHienTai === NGUONG_HANG.length - 1) {
        return { hangTiepTheo: null, labelTiepTheo: null, conThieu: 0, phanTramTienDo: 100 };
    }

    const hangTiepTheo = hangHienTai + 1;
    const ttTiepTheo = layThongTinHang(hangTiepTheo);
    const ttHienTai = layThongTinHang(hangHienTai);

    const conThieu = Math.max(0, ttTiepTheo.tu - tongChiTieu);
    const khoangCach = ttTiepTheo.tu - ttHienTai.tu;
    const daDi = tongChiTieu - ttHienTai.tu;
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
        attributes: ['nguoidung_id', 'name', 'email', 'sdt', 'vaitro', 'trangthai', 'ngayvao', 'diachi', 'avatar'],
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
        attributes: ['nguoidung_id', 'name', 'email', 'sdt', 'diachi', 'avatar', 'vaitro', 'trangthai', 'ngayvao'],
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
    if (email !== undefined) user.email = email
    if (sdt !== undefined) user.sdt = sdt
    if (diachi !== undefined) user.diachi = diachi
    if (vaitro !== undefined) user.vaitro = vaitro
    if (trangthai !== undefined) user.trangthai = trangthai
    await user.save()

    return new ResponseNguoiDung(user)
}


export const tinhVaCapNhatHang = async (nguoidung_id, transaction = null) => {
    const user = await db.NguoiDung.findByPk(nguoidung_id, { transaction });
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };

    const tongChiTieu = await db.DonHang.sum('tongtien', {
        where: {
            nguoidung_id,
            trangthai: TrangThaiDonHang.DA_THANH_TOAN,
        },
        transaction,
    }) || 0;


    const hangMoi = xacDinhHang(tongChiTieu);
    const hangCu = user.hang_thanh_vien;
    const hangCuoiCung = hangMoi > hangCu ? hangMoi : hangCu;

    await user.update({
        tong_chi_tieu: tongChiTieu,
        hang_thanh_vien: hangCuoiCung,
    }, { transaction });

    return {
        hang_thanh_vien: hangCuoiCung,
        tong_chi_tieu: tongChiTieu,
        da_len_hang: hangMoi > hangCu,
    };
};

export const layThongTinHangThanhVien = async (nguoidung_id) => {
    const user = await db.NguoiDung.findByPk(nguoidung_id, {
        attributes: ['nguoidung_id', 'hang_thanh_vien', 'tong_chi_tieu'],
    });
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };

    const thongTinHang = layThongTinHang(user.hang_thanh_vien);
    const tienDo = layTienDoLenHang(Number(user.tong_chi_tieu));

    return {
        hang_thanh_vien: user.hang_thanh_vien,
        label: thongTinHang.label,
        giam_ship: thongTinHang.giamShip,
        tong_chi_tieu: Number(user.tong_chi_tieu),
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
    await user.save()

    await db.Session.update(
        { is_revoked: true },
        { where: { nguoidung_id: id } }
    )
}