import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import {
    createPayment,
    momoIPN,
    momoReturn,
    createVnpay,
    vnpayIPN,
    vnpayReturn,
    getPaymentDetail,
} from '../controller/ThanhToan.controller.js';
import { VaiTroNguoiDung } from '../constants/index.js';
import TaoThanhToanRequest from '../dtos/requests/ThanhToan/CreateThanhToanRequest.js';
import validate from '../middlewares/validate.middleware.js';

const router = Router();
const userAndAdmin = requestVaiTro([VaiTroNguoiDung.USER, VaiTroNguoiDung.ADMIN]);

// ─── MoMo ──────────────────────────────────────────────
router.post('/create', userAndAdmin, validate(TaoThanhToanRequest), asyncHandler(createPayment));
router.post('/ipn', asyncHandler(momoIPN));
router.get('/return', asyncHandler(momoReturn));

// ─── VNPay ──────────────────────────────────────────────
router.post('/vnpay/create', userAndAdmin, validate(TaoThanhToanRequest), asyncHandler(createVnpay));
router.get('/vnpay/ipn', asyncHandler(vnpayIPN));
router.get('/vnpay/return', asyncHandler(vnpayReturn));

// Lấy chi tiết thanh toán
router.get('/:id', userAndAdmin, asyncHandler(getPaymentDetail));

export default router;