import * as DanhMucService from '../services/DanhMuc.service.js';
import asyncHandler from '../middlewares/asyncHandler.js';

export const getDanhMucs = async (req, res) => {
    const result = await DanhMucService.layDanhMuc(req.query);
    res.status(200).json({ success: true, ...result });
};

export const getDanhMucById = async (req, res) => {
    const data = await DanhMucService.layDanhMucTheoId(req.params.id);
    res.status(200).json({ success: true, data });
};

export const themDanhMuc = async (req, res) => {
    const data = await DanhMucService.themDanhMuc(req.body);
    res.status(201).json({ success: true, message: 'Thêm danh mục thành công', data });
};

export const updateDanhMuc = async (req, res) => {
    const { id } = req.params;
    const updated = await DanhMucService.capNhatDanhMuc(id, req.body);
    res.status(200).json({ success: true, message: 'Cập nhật danh mục thành công', data: updated });
};

export const xoaDanhMuc = async (req, res) => {
    await DanhMucService.xoaDanhMuc(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
};