import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import * as OtpController from '../controller/Otp.controller.js';

const router = Router();

// Không cần đăng nhập vì user vừa đăng ký, chưa có token
router.post('/xac-thuc-email', asyncHandler(OtpController.postXacThucEmail));
router.post('/gui-lai-otp', asyncHandler(OtpController.postGuiLaiOtp));

export default router;