import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import * as NguoiDungController from '../controller/NguoiDung.controller.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();

const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);

router.post('/danh-sach', adminOnly, asyncHandler(NguoiDungController.postTatCaNguoiDung));
router.post('/chi-tiet', adminOnly, asyncHandler(NguoiDungController.postNguoiDungById));
router.put('/update', adminOnly, asyncHandler(NguoiDungController.updateNguoiDung));
router.delete('/delete', adminOnly, asyncHandler(NguoiDungController.deleteNguoiDung));

export default router;
