import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import validate from '../middlewares/validate.middleware.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import * as GioHangController from '../controller/GioHang.controller.js';
import * as ChiTietGioHangController from '../controller/ChiTietGioHang.controller.js';
import ThemGioHangRequest from '../dtos/requests/GioHang/ThemGioHangRequest.js';
import ThemChiTietGioHangRequest from '../dtos/requests/ChiTietGioHang/ThemChiTietGioHangRequest.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);
const userOnly = requestVaiTro([VaiTroNguoiDung.USER]);
const adminOrUser = requestVaiTro([VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.USER]);

// ========== USER: giỏ hàng của chính mình ==========
router.get('/me', userOnly, asyncHandler(GioHangController.getMyGioHang));
router.post('/me/them', adminOrUser, validate(ThemChiTietGioHangRequest), asyncHandler(GioHangController.themSanPhamVaoGio));
router.put('/me/capnhat', userOnly, asyncHandler(GioHangController.capNhatSoLuong));
router.delete('/me/xoa/:sanpham_id', userOnly, asyncHandler(GioHangController.xoaSanPhamKhoiGio));
router.post('/me/thanhtoan', userOnly, asyncHandler(GioHangController.thanhToan));

// ========== ADMIN: quản lý tất cả giỏ hàng ==========
router.get('/', adminOnly, asyncHandler(GioHangController.getGioHangs));
router.get('/:id', adminOnly, asyncHandler(GioHangController.getGioHangById));
router.delete('/:id', adminOnly, asyncHandler(GioHangController.xoaGioHang));

// ========== ADMIN: quản lý chi tiết giỏ hàng ==========
router.get('/chitiet/all', adminOnly, asyncHandler(ChiTietGioHangController.getChiTietGioHangs));
router.get('/chitiet/:id', adminOnly, asyncHandler(ChiTietGioHangController.getChiTietGioHangById));
router.get('/chitiet/giohang/:giohang_id', adminOnly, asyncHandler(ChiTietGioHangController.getChiTietGioHangByGioHangId));
router.put('/chitiet/:id', adminOnly, asyncHandler(ChiTietGioHangController.updateChiTietGioHang));
router.delete('/chitiet/:id', adminOnly, asyncHandler(ChiTietGioHangController.xoaChiTietGioHang));
export default router;
