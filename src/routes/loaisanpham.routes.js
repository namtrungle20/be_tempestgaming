import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { requestVaiTro } from '../middlewares/jwtMiddleware.js';
import { uploadSingle } from '../middlewares/uploadImage.js';
import validateImageExists from '../middlewares/validateImageExists.js';
import {
    getLoaiSanPhams,
    getLoaiSanPhamsById,
    themLoaiSanPhams,
    updateLoaiSanPhams,
    xoaLoaiSanPhams,
} from '../controller/LoaiSanPhamController.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);

router.get('/', asyncHandler(getLoaiSanPhams));
router.get('/:id', asyncHandler(getLoaiSanPhamsById));
router.post('/', adminOnly, uploadSingle, validateImageExists, asyncHandler(themLoaiSanPhams));
router.put('/:id', adminOnly, uploadSingle, validateImageExists, asyncHandler(updateLoaiSanPhams));
router.delete('/:id', adminOnly, asyncHandler(xoaLoaiSanPhams));

export default router;