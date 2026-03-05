import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import validate from '../middlewares/validate.js';
import { requestVaiTro } from '../middlewares/jwtMiddleware.js';
import * as GioHangController from '../controller/GioHangController.js';
import * as ChiTietGioHangController from '../controller/ChiTietGioHangController.js';
import ThemGioHangRequest from '../dtos/requests/GioHang/ThemGioHangRequest.js';
import ThemChiTietGioHangRequest from '../dtos/requests/ChiTietGioHang/ThemChiTietGioHangRequest.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);
const userOnly = requestVaiTro([VaiTroNguoiDung.USER]);
const adminOrUser = requestVaiTro([VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.USER]);

// Giỏ hàng
router.get('/', asyncHandler(GioHangController.getGioHangs));
router.get('/:id', asyncHandler(GioHangController.getGioHangById));
router.post('/', adminOnly, validate(ThemGioHangRequest), asyncHandler(GioHangController.ThemGioHang));
router.post('/thanhtoan', asyncHandler(GioHangController.ThanhToanGioHang));
router.delete('/:id', userOnly, asyncHandler(GioHangController.xoaGioHang));

// Chi tiết giỏ hàng
router.get('/chitiet/all', asyncHandler(ChiTietGioHangController.getChiTietGioHangs));
router.get('/chitiet/:id', asyncHandler(ChiTietGioHangController.getChiTietGioHangById));
router.get('/chitiet/giohang/:giohang_id', asyncHandler(ChiTietGioHangController.getChiTietGioHangByGioHangId));
router.post('/chitiet', userOnly, validate(ThemChiTietGioHangRequest), asyncHandler(ChiTietGioHangController.themChiTietGioHang));
router.put('/chitiet/:id', adminOnly, asyncHandler(ChiTietGioHangController.updateChiTietGioHang));
router.delete('/chitiet/:id', adminOrUser, asyncHandler(ChiTietGioHangController.xoaChiTietGioHang));

export default router;