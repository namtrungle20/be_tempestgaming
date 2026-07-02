import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import * as NguoiDungController from '../controller/NguoiDung.controller.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();

const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);
const adminOrUser = requestVaiTro([VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.USER])

router.post('/danh-sach', adminOnly, asyncHandler(NguoiDungController.postTatCaNguoiDung));
router.post('/chi-tiet', adminOrUser, asyncHandler(NguoiDungController.postNguoiDungById));
router.put('/update/:id', adminOrUser, asyncHandler(NguoiDungController.updateNguoiDung));
router.delete('/delete/:id', adminOnly, asyncHandler(NguoiDungController.deleteNguoiDung));

// RANK
router.get('/rank', adminOrUser, asyncHandler(NguoiDungController.getHangThanhVien));
router.post('/rank/update', adminOrUser, asyncHandler(NguoiDungController.updateHang));
router.get('/rank/check-rank', adminOnly, asyncHandler(NguoiDungController.getKiemTraLechHang));
router.post('/rank/all-update', adminOnly, asyncHandler(NguoiDungController.postDongBoHangLoat));

export default router;