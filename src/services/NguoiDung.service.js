import db from '../models/index.js'
import { Op } from 'sequelize'
import ResponseNguoiDung from '../dtos/responses/nguoidung/ResponseNguoiDung.js'
import TrangThaiTaiKhoan from '../constants/TrangThaiTaiKhoan.js'

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
        attributes: ['nguoidung_id', 'email', 'sdt', 'vaitro', 'trangthai'],
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
        attributes: ['nguoidung_id', 'email', 'sdt', 'diachi', 'avatar', 'vaitro', 'trangthai', 'ngayvao'],
        raw: true
    })
    if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' }
    return new ResponseNguoiDung(user)
}

export const capNhatNguoiDung = async (id, { email, sdt, vaitro, trangthai }) => {
    const user = await db.NguoiDung.findOne({
        where: { nguoidung_id: id }
    })
    if (!user) throw { status: 404, message: 'Người dùng không tồn tại' }

    if (user.trangthai === TrangThaiTaiKhoan.DA_XOA && trangthai !== TrangThaiTaiKhoan.MO_KHOA) {
        throw { status: 403, message: 'Tài khoản đã bị xóa, không thể cập nhật' }
    }

    if (email !== undefined) user.email = email
    if (sdt !== undefined) user.sdt = sdt
    if (vaitro !== undefined) user.vaitro = vaitro
    if (trangthai !== undefined) user.trangthai = trangthai
    await user.save()

    return new ResponseNguoiDung(user)
}

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