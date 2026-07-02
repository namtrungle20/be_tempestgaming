import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import validate from '../middlewares/validate.middleware.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js'
import * as AuthController from '../controller/Auth.controller.js';
import ThemNguoiDungRequest from '../dtos/requests/NguoiDung/ThemNguoiDungRequest.js';
import { VaiTroNguoiDung } from '../constants/VaiTroNguoiDung.js';

const router = Router();

router.post('/dangky', validate(ThemNguoiDungRequest), asyncHandler(AuthController.signUp));
router.post('/dangnhap', asyncHandler(AuthController.signIn));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));
router.get('/me', requestVaiTro([VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.USER]), asyncHandler(AuthController.getMe))

router.post('/google', asyncHandler(AuthController.loginGoogle))

export default router;
