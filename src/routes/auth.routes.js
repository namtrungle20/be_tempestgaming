import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import validate from '../middlewares/validate.middleware.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js'
import * as AuthController from '../controller/Auth.controller.js';
import * as OtpController from '../controller/Otp.controller.js';
import ThemNguoiDungRequest from '../dtos/requests/NguoiDung/ThemNguoiDungRequest.js';
import { VaiTroNguoiDung } from '../constants/VaiTroNguoiDung.js';

const router = Router();

const adminOrUser = requestVaiTro([VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.USER])

router.post('/dangky', validate(ThemNguoiDungRequest), asyncHandler(AuthController.signUp));
router.post('/dangnhap', asyncHandler(AuthController.signIn));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));
router.get('/me', adminOrUser, asyncHandler(AuthController.getMe))

router.post('/google', asyncHandler(AuthController.loginGoogle))

router.post('/quenmatkhau', asyncHandler(AuthController.postQuenMatKhau))
router.post('/datlaimatkhau', asyncHandler(AuthController.postDatLaiMatKhau))
router.post('/quenmatkhau/yeu-cau', asyncHandler(OtpController.quenMatKhauYeuCau))
router.post('/quenmatkhau/xac-thuc', asyncHandler(OtpController.quenMatKhauXacThuc))

export default router;
