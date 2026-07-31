/**
 * Momomock.service.js
 * Business logic cho MoMo Mock Gateway: build signature, build payload IPN,
 * gọi IPN thật, build query redirect. Không chứa logic req/res.
 */

import crypto from 'crypto';

const {
    MOMO_PARTNER_CODE,
    MOMO_ACCESS_KEY,
    MOMO_SECRET_KEY,
    MOMO_IPN_URL,
    MOMO_REDIRECT_URL,
} = process.env;

const hmacSHA256 = (data) =>
    crypto.createHmac('sha256', MOMO_SECRET_KEY).update(data).digest('hex');

const buildCallbackRawSignature = (p) =>
    `accessKey=${MOMO_ACCESS_KEY}` +
    `&amount=${p.amount}` +
    `&extraData=${p.extraData}` +
    `&message=${p.message}` +
    `&orderId=${p.orderId}` +
    `&orderInfo=${p.orderInfo}` +
    `&orderType=${p.orderType}` +
    `&partnerCode=${p.partnerCode}` +
    `&payType=${p.payType}` +
    `&requestId=${p.requestId}` +
    `&responseTime=${p.responseTime}` +
    `&resultCode=${p.resultCode}` +
    `&transId=${p.transId}`;

// Build payload IPN đầy đủ (đã ký signature) từ thông tin đơn hàng + kết quả giả lập
export const buildIpnPayload = ({ orderId, amount, requestId, orderInfo, result }) => {
    const payload = {
        partnerCode: MOMO_PARTNER_CODE,
        orderId,
        requestId: requestId || orderId,
        amount,
        orderInfo: orderInfo || 'Thanh toan don hang (MOCK)',
        orderType: 'momo_wallet',
        transId: `${Date.now()}`,
        payType: 'qr',
        responseTime: Date.now(),
        extraData: '',
        resultCode: result === 'success' ? 0 : 1006,
        message: result === 'success' ? 'Success' : 'Giao dich bi tu choi.',
    };
    payload.signature = hmacSHA256(buildCallbackRawSignature(payload));
    return payload;
}

// Gọi IPN thật (server-to-server), giống hệt MoMo thật sẽ làm sau khi user thanh toán
export const sendIpnCallback = async (payload) => {
    try {
        const res = await fetch(MOMO_IPN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return { ok: res.ok, status: res.status };
    } catch (err) {
        console.error('[Momomock.service] Lỗi gọi IPN:', err.message);
        return { ok: false, error: err.message };
    }
}

// Build query string để redirect trình duyệt về redirectUrl, giống MoMo thật
export const buildRedirectUrl = (payload) => {
    const query = new URLSearchParams({
        partnerCode: payload.partnerCode || '',
        orderId: payload.orderId || '',
        requestId: payload.requestId || '',
        amount: payload.amount || 0,
        orderInfo: payload.orderInfo || '',
        orderType: payload.orderType || '',
        transId: payload.transId || '',
        resultCode: payload.resultCode,
        message: payload.message || '',
        payType: payload.payType || '',
        responseTime: payload.responseTime || '',
        extraData: payload.extraData || '',
        signature: payload.signature || '',
    }).toString();
    return `${MOMO_REDIRECT_URL}?${query}`;
}

// Xử lý toàn bộ luồng "xác nhận thanh toán" của mock gateway:
// build payload -> gọi IPN -> trả về URL redirect
export const confirmMockPayment = async ({ orderId, amount, requestId, orderInfo, result }) => {
    const payload = buildIpnPayload({ orderId, amount, requestId, orderInfo, result });
    const ipnResult = await sendIpnCallback(payload);
    const redirectUrl = buildRedirectUrl(payload);

    return { payload, ipnResult, redirectUrl };
}