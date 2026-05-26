import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import validate from '../middlewares/validate.middleware.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import { uploadSingle, uploadCloudinaryArray, toCloudinaryArray } from '../middlewares/upload.middleware.js';
import { getSanPhams, getSanPhamById, themSanPham, updateSanPham, deleteSanPham, uploadExcel, fullImport } from '../controller/SanPham.controller.js'

import ThemSanPhamRequest from '../dtos/requests/SanPham/ThemSanPhamRequest.js';
import UpdateSanPhamRequest from '../dtos/requests/SanPham/UpdateSanPhamRequest.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);

router.post('/import/full', adminOnly, uploadExcel, asyncHandler(fullImport))

router.get('/', asyncHandler(getSanPhams))
router.get('/:id', asyncHandler(getSanPhamById))
router.post('/', adminOnly, uploadCloudinaryArray, toCloudinaryArray, validate(ThemSanPhamRequest), asyncHandler(themSanPham))
router.put('/:id', adminOnly, uploadCloudinaryArray, toCloudinaryArray, validate(UpdateSanPhamRequest), asyncHandler(updateSanPham))
router.delete('/:id', adminOnly, asyncHandler(deleteSanPham))



export default router;
