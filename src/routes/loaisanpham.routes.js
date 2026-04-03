import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import validateImageExists from '../middlewares/validateImage.middleware.js';
import {
    getLoaiSanPhams,
    getLoaiSanPhamsById,
    themLoaiSanPhams,
    updateLoaiSanPhams,
    xoaLoaiSanPhams,
} from '../controller/LoaiSanPham.controller.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);

router.get('/', asyncHandler(getLoaiSanPhams));
router.get('/:id', asyncHandler(getLoaiSanPhamsById));
router.post('/', adminOnly, uploadSingle, validateImageExists, asyncHandler(themLoaiSanPhams));
router.put('/:id', adminOnly, uploadSingle, validateImageExists, asyncHandler(updateLoaiSanPhams));
router.delete('/:id', adminOnly, asyncHandler(xoaLoaiSanPhams));

export default router;
