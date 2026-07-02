import { requestVaiTro } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import ThemDanhMucRequest from '../dtos/requests/DanhMuc/ThemDanhMucRequest.js';
import UpdateDanhMucRequest from '../dtos/requests/DanhMuc/UpdateDanhMuc.js';
import { getDanhMucs, getDanhMucById, themDanhMuc, updateDanhMuc, xoaDanhMuc } from '../controller/DanhMuc.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { VaiTroNguoiDung } from '../constants/VaiTroNguoiDung.js';
import { Router } from 'express';

const router = Router();
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);

// Các route công khai (xem danh sách, xem chi tiết)
router.get('/', asyncHandler(getDanhMucs));
router.get('/:id', asyncHandler(getDanhMucById));

// Các route yêu cầu quyền admin
router.post('/', adminOnly, validate(ThemDanhMucRequest), asyncHandler(themDanhMuc));
router.put('/:id', adminOnly, validate(UpdateDanhMucRequest), asyncHandler(updateDanhMuc));
router.delete('/:id', adminOnly, asyncHandler(xoaDanhMuc));

export default router;