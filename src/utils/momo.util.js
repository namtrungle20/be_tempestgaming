import crypto from 'crypto';

const {
    MOMO_PARTNER_CODE,
    MOMO_ACCESS_KEY,
    MOMO_SECRET_KEY,
    MOMO_REDIRECT_URL,
    MOMO_IPN_URL,
    MOMO_ENDPOINT,
} = process.env;

export { MOMO_ENDPOINT };

// ─── Signature ────────────────────────────────────────────────────────────────

const hmacSHA256 = (data) =>
    crypto.createHmac('sha256', MOMO_SECRET_KEY).update(data).digest('hex');

// ─── Build raw signature strings ──────────────────────────────────────────────

const buildCreateRawSignature = ({ requestId, amount, orderId, orderInfo, requestType, extraData }) =>
    `accessKey=${MOMO_ACCESS_KEY}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${MOMO_IPN_URL}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${MOMO_PARTNER_CODE}` +
    `&redirectUrl=${MOMO_REDIRECT_URL}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

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

// ─── Public utils ─────────────────────────────────────────────────────────────

/**
 * Build toàn bộ request body để gọi API tạo payment URL
 */
export const buildMomoPaymentBody = ({ orderId, amount, orderInfo, requestType = 'payWithATM' }) => {
    const requestId = `${MOMO_PARTNER_CODE}_${Date.now()}`;
    const extraData = '';

    const signature = hmacSHA256(
        buildCreateRawSignature({ requestId, amount, orderId, orderInfo, requestType, extraData })
    );

    return {
        partnerCode: MOMO_PARTNER_CODE,
        accessKey: MOMO_ACCESS_KEY,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: MOMO_REDIRECT_URL,
        ipnUrl: MOMO_IPN_URL,
        requestType,
        extraData,
        autoCapture: true,
        lang: 'vi',
        signature,
    };
};

export const verifyMomoSignature = (params) => {
    const expected = hmacSHA256(buildCallbackRawSignature(params));
    return expected === params.signature;
};