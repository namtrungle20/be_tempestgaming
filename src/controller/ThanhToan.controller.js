import {
    createMomoPayment,
    processMomoIPN,
    verifyMomoReturn,
    getThanhToanById,
} from '../services/ThanhToan.service.js';
import { createVnpayPayment, processVnpayIPN, verifyVnpayReturn } from '../services/VNPay.service.js';
import CreateThanhToanRequest from '../dtos/requests/ThanhToan/CreateThanhToanRequest.js';
import { CreateThanhToanResponse, ChiTietThanhToanResponse } from '../dtos/responses/ResponseThanhToan.js';
import { parseRawQuery } from '../utils/vnpay.util.js';
import { PhuongThucThanhToan } from '../constants/index.js';

// ─── POST /api/payment/momo/create ───────────────────────────────────────────
export const createPayment = async (req, res) => {
    const { donhang_id, sotien, orderInfo } = req.body;

    const { valid, message } = CreateThanhToanRequest({ donhang_id, sotien, phuongthucthanhtoan: 1 });
    if (!valid) return res.status(400).json({ success: false, message });

    const { thanhtoan, momoResult } = await createMomoPayment({ donhang_id, sotien, orderInfo });

    return res.status(201).json({
        success: true,
        message: 'Tạo thanh toán thành công',
        data: CreateThanhToanResponse(thanhtoan, momoResult.payUrl, {
            deeplink: momoResult.deeplink,
            qrCodeUrl: momoResult.qrCodeUrl,
        }),
    });
};


export const momoIPN = async (req, res) => {
    console.log('[IPN] Nhận được:', JSON.stringify(req.body));
    try {
        await processMomoIPN(req.body);
        return res.status(200).json({ message: 'ok' });
    } catch (error) {
        console.error('[IPN] Lỗi:', error);
        return res.status(200).json({ message: 'received' });
    }
};


export const momoReturn = async (req, res) => {
    console.log('[Return] Query params:', req.query);
    const result = verifyMomoReturn(req.query);
    const frontendUrl = process.env.FRONTEND_URL;
    const query = new URLSearchParams({
        orderId: result.orderId,
        isSuccess: result.isSuccess,
        resultCode: result.resultCode,
        message: result.message,
        amount: result.amount,
    });

    return res.redirect(`${frontendUrl}/payment/result?${query}`);
};


export const createVnpay = async (req, res) => {
    const { donhang_id, sotien, orderInfo } = req.body;

    const { valid, message } = CreateThanhToanRequest({ donhang_id, sotien, phuongthucthanhtoan: PhuongThucThanhToan.VNPAY });
    if (!valid) return res.status(400).json({ success: false, message });

    const ipAddr = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const { thanhtoan, paymentUrl } = await createVnpayPayment({ donhang_id, sotien, orderInfo, ipAddr });

    return res.status(201).json({
        success: true,
        message: 'Tạo thanh toán thành công',
        data: CreateThanhToanResponse(thanhtoan, paymentUrl),
    });
};

export const vnpayIPN = async (req, res) => {
    const query = parseRawQuery(req);
    console.log('[VNPay IPN] Query:', query);
    const result = await processVnpayIPN(query);
    return res.status(200).json(result);
};

export const vnpayReturn = async (req, res) => {
    const query = parseRawQuery(req);
    console.log('[VNPay Return] Query:', query);
    const result = verifyVnpayReturn(query);
    const frontendUrl = process.env.FRONTEND_URL;
    const queryStr = new URLSearchParams({
        orderId: result.orderId,
        isSuccess: result.isSuccess,
        resultCode: result.resultCode,
        message: result.message,
        amount: result.amount,
    });

    return res.redirect(`${frontendUrl}/payment/result?${queryStr}`);
};

export const getPaymentDetail = async (req, res) => {
    const thanhtoan = await getThanhToanById(req.params.id);

    return res.status(200).json({
        success: true,
        data: ChiTietThanhToanResponse(thanhtoan),
    });
};