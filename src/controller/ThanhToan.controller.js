import {
    createMomoPayment,
    processMomoIPN,
    verifyMomoReturn,
    getThanhToanById,
} from '../services/ThanhToan.service.js';
import CreateThanhToanRequest from '../dtos/requests/ThanhToan/CreateThanhToanRequest.js';
import { CreateThanhToanResponse, ChiTietThanhToanResponse } from '../dtos/responses/ResponseThanhToan.js';

// ─── POST /api/payment/momo/create ───────────────────────────────────────────
export const createPayment = async (req, res) => {
    const { donhang_id, sotien, orderInfo } = req.body;

    const { valid, message } = CreateThanhToanRequest({ donhang_id, sotien, phuongthucthanhtoan: 1 });
    if (!valid) return res.status(400).json({ success: false, message });

    const { thanhtoan, momoResult } = await createMomoPayment({ donhang_id, sotien, orderInfo });

    return res.status(201).json({
        success: true,
        message: 'Tạo thanh toán thành công',
        data: CreateThanhToanResponse(thanhtoan, momoResult),
    });
};


export const momoIPN = async (req, res) => {
    await processMomoIPN(req.body);
    return res.status(200).json({ message: 'ok' });
};


export const momoReturn = async (req, res) => {
    const result = verifyMomoReturn(req.query);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const query = new URLSearchParams({
        orderId: result.orderId,
        isSuccess: result.isSuccess,
        resultCode: result.resultCode,
        message: result.message,
        amount: result.amount,
    });

    return res.redirect(`${frontendUrl}/payment/result?${query}`);
};

export const getPaymentDetail = async (req, res) => {
    const thanhtoan = await getThanhToanById(req.params.id);

    return res.status(200).json({
        success: true,
        data: ChiTietThanhToanResponse(thanhtoan),
    });
};