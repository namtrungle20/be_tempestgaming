import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import validate from '../middlewares/validate.middleware.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import * as SanPhamController from '../controller/SanPham.controller.js';
import ThemSanPhamRequest from '../dtos/requests/SanPham/ThemSanPhamRequest.js';
import UpdateSanPhamRequest from '../dtos/requests/SanPham/UpdateSanPhamRequest.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);

router.get('/', asyncHandler(SanPhamController.getSanPhams));
router.get('/:id', asyncHandler(SanPhamController.getSanPhamsById));
router.post('/', adminOnly, uploadSingle, validate(ThemSanPhamRequest), asyncHandler(SanPhamController.themSanPhams));
router.put('/:id', adminOnly, uploadSingle, validate(UpdateSanPhamRequest), asyncHandler(SanPhamController.updateSanPhams));
router.delete('/:id', adminOnly, asyncHandler(SanPhamController.xoaSanPhams));

export default router;
