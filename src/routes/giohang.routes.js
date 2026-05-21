import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import validate from '../middlewares/validate.middleware.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import * as GioHangController from '../controller/GioHang.controller.js';
import * as ChiTietGioHangController from '../controller/ChiTietGioHang.controller.js';
import ThemChiTietGioHangUserRequest from '../dtos/requests/ChiTietGioHang/ThemChiTietGioHangRequest.js';
import CapNhatSoLuongRequest from '../dtos/requests/GioHang/CapNhapSoLuongRequest.js';
import ThanhToanRequest from '../dtos/requests/GioHang/ThanhToanRequest.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();

const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);
const adminOrUser = requestVaiTro([VaiTroNguoiDung.USER, VaiTroNguoiDung.ADMIN])

// USER routes
router.get('/me', adminOrUser, asyncHandler(GioHangController.getMyGioHang));
router.post('/me/them', adminOrUser, validate(ThemChiTietGioHangUserRequest), asyncHandler(GioHangController.themSanPhamVaoGio));
router.put('/me/capnhat', adminOrUser, validate(CapNhatSoLuongRequest), asyncHandler(GioHangController.capNhatSoLuongTrongGio));
router.delete('/me/xoa/:sanpham_id', adminOrUser, asyncHandler(GioHangController.xoaSanPhamKhoiGio));
router.post('/me/thanhtoan', adminOrUser, validate(ThanhToanRequest), asyncHandler(GioHangController.thanhToanGioHang));

// ADMIN routes (giữ nguyên)
router.get('/', adminOnly, asyncHandler(GioHangController.getGioHangs));
router.get('/:id', adminOnly, asyncHandler(GioHangController.getGioHangById));
router.delete('/:id', adminOnly, asyncHandler(GioHangController.deleteGioHang));

router.get('/chitiet/all', adminOnly, asyncHandler(ChiTietGioHangController.getChiTietGioHangs));
router.get('/chitiet/:id', adminOnly, asyncHandler(ChiTietGioHangController.getChiTietGioHangById));
router.get('/chitiet/giohang/:id', adminOnly, asyncHandler(ChiTietGioHangController.getChiTietGioHangByGioHangId));
router.put('/chitiet/:id', adminOnly, asyncHandler(ChiTietGioHangController.capNhatSoLuongChiTietGioHang));
router.delete('/chitiet/:id', adminOnly, asyncHandler(ChiTietGioHangController.xoaChiTietGioHang));

export default router;