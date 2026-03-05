import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import validate from '../middlewares/validate.js';
import { requestVaiTro } from '../middlewares/jwtMiddleware.js';
import * as DonHangController from '../controller/DonHangController.js';
import * as ChiTietDonHangController from '../controller/ChiTietDonHangController.js';
import UpdateDonHangRequest from '../dtos/requests/DonHang/UpdateDonHangRequest.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);
const adminOrUser = requestVaiTro([VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.USER]);

// Đơn hàng
router.get('/', asyncHandler(DonHangController.getDonHangs));
router.get('/:id', asyncHandler(DonHangController.getDonHangById));
router.put('/:id', adminOrUser, validate(UpdateDonHangRequest), asyncHandler(DonHangController.updateDonHang));
router.delete('/:id', adminOnly, asyncHandler(DonHangController.xoaDonHang));

// Chi tiết đơn hàng
router.get('/chitiet/all', asyncHandler(ChiTietDonHangController.getChiTietDonHangs));
router.get('/chitiet/:id', asyncHandler(ChiTietDonHangController.getChiTietDonHangById));
router.post('/chitiet', adminOnly, asyncHandler(ChiTietDonHangController.themChiTietDonHang));
router.put('/chitiet/:id', asyncHandler(ChiTietDonHangController.updateChiTietDonHang));
router.delete('/chitiet/:id', adminOnly, asyncHandler(ChiTietDonHangController.xoaChiTietDonHang));

export default router;