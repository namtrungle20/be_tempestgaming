import db from '../models/index.js';
import ResponseNguoiDung from '../dtos/responses/nguoidung/ResponseNguoiDung.js';

export const postTatCaNguoiDung = async (req, res) => {
    const { filter = {}, pagination = {}, sort = {} } = req.body;

    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.perPage) || 10;
    const offset = (page - 1) * limit;

    // React-admin gửi field 'id' nhưng DB dùng 'nguoidung_id'
    const orderField = sort.field === 'id' ? 'nguoidung_id' : (sort.field || 'ngayvao');
    const orderDir = sort.order || 'DESC';

    const { count, rows } = await db.NguoiDung.findAndCountAll({
        where: filter,
        attributes: ['nguoidung_id', 'email', 'sdt', 'vaitro', 'is_lock'],
        limit,
        offset,
        order: [[orderField, orderDir]],
        raw: true,
    });

    return res.status(200).json({ data: rows, total: count });
};

export const postNguoiDungById = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ success: false, message: 'Thiếu ID người dùng' });
    }

    const user = await db.NguoiDung.findOne({
        where: { nguoidung_id: id },
        attributes: ['nguoidung_id', 'email', 'sdt', 'diachi', 'avatar', 'vaitro', 'is_lock', 'ngayvao'],
        raw: true,
    });

    if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    return res.status(200).json({ success: true, data: new ResponseNguoiDung(user) });
};

export const updateNguoiDung = async (req, res) => {
    const { id, email, vaitro, is_lock } = req.body;
    if (!id) {
        return res.status(400).json({ success: false, message: 'Thiếu ID người dùng' });
    }

    const user = await db.NguoiDung.findByPk(id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    if (email !== undefined) user.email = email;
    if (vaitro !== undefined) user.vaitro = vaitro;
    if (is_lock !== undefined) user.is_lock = is_lock;
    await user.save();

    return res.status(200).json({
        success: true,
        message: 'Cập nhật người dùng thành công',
        data: new ResponseNguoiDung(user),
    });
};

export const deleteNguoiDung = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ success: false, message: 'Thiếu ID người dùng' });
    }

    const deleted = await db.NguoiDung.destroy({ where: { nguoidung_id: id } });
    if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để xóa' });
    }

    return res.status(200).json({ success: true, message: 'Xóa người dùng thành công' });
};