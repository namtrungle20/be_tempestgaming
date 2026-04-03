import db from '../models/index.js';

export const getVaiTro = async (req, res) => {
    const vaitro = await db.VaiTro.findAll();
    return res.status(200).json({ success: true, data: vaitro });
};

export const themVaiTro = async (req, res) => {
    const vaitro = await db.VaiTro.create(req.body);
    return res.status(201).json({ success: true, message: 'Thêm vai trò thành công', data: vaitro });
};

export const updateVaiTro = async (req, res) => {
    const { id } = req.params;
    const [updated] = await db.VaiTro.update(req.body, { where: { vaitro_id: id } });

    if (!updated) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò để cập nhật' });
    }
    return res.status(200).json({ success: true, message: 'Cập nhật vai trò thành công' });
};

export const xoaVaiTro = async (req, res) => {
    const { id } = req.params;
    const deleted = await db.VaiTro.destroy({ where: { vaitro_id: id } });

    if (!deleted) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò để xóa' });
    }
    return res.status(200).json({ success: true, message: 'Xóa vai trò thành công' });
};