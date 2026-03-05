import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { requestVaiTro } from '../middlewares/jwtMiddleware.js';
import { uploadSingle } from '../middlewares/uploadImage.js';
import validateImageExists from '../middlewares/validateImageExists.js';
import {
    getThuongHieus,
    getThuongHieuById,
    themThuongHieu,
    updateThuongHieu,
    xoaThuongHieu,
} from '../controller/ThuongHieuController.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);

router.get('/', asyncHandler(getThuongHieus));
router.get('/:id', asyncHandler(getThuongHieuById));
router.post('/', adminOnly, uploadSingle, validateImageExists, asyncHandler(themThuongHieu));
router.put('/:id', adminOnly, uploadSingle, validateImageExists, asyncHandler(updateThuongHieu));
router.delete('/:id', adminOnly, asyncHandler(xoaThuongHieu));

export default router;