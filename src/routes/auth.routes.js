import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import validate from '../middlewares/validate.js';
import * as AuthController from '../controller/AuthController.js';
import ThemNguoiDungRequest from '../dtos/requests/NguoiDung/ThemNguoiDungRequest.js';

const router = Router();

router.post('/dangky', validate(ThemNguoiDungRequest), asyncHandler(AuthController.signUp));
router.post('/dangnhap', asyncHandler(AuthController.signIn));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));

export default router;