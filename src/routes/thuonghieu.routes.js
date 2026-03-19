import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import validateImageExists from '../middlewares/validateImage.middleware.js';
import {
    getThuongHieus,
    getThuongHieuById,
    themThuongHieu,
    updateThuongHieu,
    xoaThuongHieu,
} from '../controller/ThuongHieu.controller.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);

router.get('/', asyncHandler(getThuongHieus));
router.get('/:id', asyncHandler(getThuongHieuById));
router.post('/', adminOnly, uploadSingle, validateImageExists, asyncHandler(themThuongHieu));
router.put('/:id', adminOnly, uploadSingle, validateImageExists, asyncHandler(updateThuongHieu));
router.delete('/:id', adminOnly, asyncHandler(xoaThuongHieu));

export default router;
