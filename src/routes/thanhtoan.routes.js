import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import {
    createPayment,
    momoIPN,
    momoReturn,
    getPaymentDetail,
} from '../controller/ThanhToan.controller.js';
import { VaiTroNguoiDung } from '../constants/index.js';
import TaoThanhToanRequest from '../dtos/requests/ThanhToan/CreateThanhToanRequest.js';
import validate from '../middlewares/validate.middleware.js';

const router = Router();
const userAndAdmin = requestVaiTro([VaiTroNguoiDung.USER, VaiTroNguoiDung.ADMIN]);

router.post('/create', userAndAdmin, validate(TaoThanhToanRequest), asyncHandler(createPayment));

router.post('/ipn', asyncHandler(momoIPN));

router.get('/return', asyncHandler(momoReturn));

// Lấy chi tiết thanh toán — user đã login
router.get('/:id', userAndAdmin, asyncHandler(getPaymentDetail));

export default router;