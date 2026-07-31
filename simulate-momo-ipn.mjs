/**
 * Script giả lập MoMo IPN callback để test backend TempestGaming.
 * Không phụ thuộc vào MoMo sandbox — tự build payload + ký signature hợp lệ
 * bằng đúng secretKey, gửi thẳng tới ipnUrl của m.
 *
 * Cách dùng:
 *   node simulate-momo-ipn.mjs success
 *   node simulate-momo-ipn.mjs fail
 *   node simulate-momo-ipn.mjs success --orderId=your_order_id --amount=50000
 */

import crypto from 'crypto';

// ─── Config: copy đúng giá trị từ .env của m ──────────────────────────────
const MOMO_PARTNER_CODE = 'MOMO';
const MOMO_ACCESS_KEY = 'F8BBA842ECF85';
const MOMO_SECRET_KEY = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const MOMO_IPN_URL = 'https://seeable-vesta-overcautiously.ngrok-free.dev/api/thanhtoan/ipn';

// ─── Parse CLI args ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const scenario = args[0] || 'success'; // 'success' | 'fail'
const getArg = (name, fallback) => {
    const found = args.find((a) => a.startsWith(`--${name}=`));
    return found ? found.split('=')[1] : fallback;
};

const orderId = getArg('orderId', `TEST_ORDER_${Date.now()}`);
const requestId = getArg('requestId', orderId);
const amount = getArg('amount', '50000');

// ─── Build raw signature (giống hệt buildCallbackRawSignature trong code m) ──
const hmacSHA256 = (data) =>
    crypto.createHmac('sha256', MOMO_SECRET_KEY).update(data).digest('hex');

function buildCallbackRawSignature(p) {
    return (
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
        `&transId=${p.transId}`
    );
}

// ─── Build payload theo từng scenario ─────────────────────────────────────
function buildPayload(kind) {
    const base = {
        partnerCode: MOMO_PARTNER_CODE,
        orderId,
        requestId,
        amount,
        orderInfo: 'Thanh toan don hang TempestGaming (SIMULATED)',
        orderType: 'momo_wallet',
        transId: `${Date.now()}`,
        payType: 'qr',
        responseTime: Date.now(),
        extraData: '',
    };

    if (kind === 'success') {
        base.resultCode = 0;
        base.message = 'Success';
    } else {
        base.resultCode = 1006; // giao dịch bị từ chối / user hủy
        base.message = 'Giao dich bi tu choi boi nguoi dung.';
    }

    base.signature = hmacSHA256(buildCallbackRawSignature(base));
    return base;
}

// ─── Gửi request ───────────────────────────────────────────────────────────
async function sendIPN() {
    const payload = buildPayload(scenario);

    console.log(`\n📦 Gửi IPN mô phỏng: ${scenario.toUpperCase()}`);
    console.log(`→ orderId: ${payload.orderId}`);
    console.log(`→ resultCode: ${payload.resultCode}`);
    console.log(`→ Payload:`, JSON.stringify(payload, null, 2));

    try {
        const res = await fetch(MOMO_IPN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const text = await res.text();
        console.log(`\n✅ Response status: ${res.status}`);
        console.log(`Response body: ${text}`);
    } catch (err) {
        console.error(`\n❌ Lỗi khi gửi IPN:`, err.message);
        console.error('Kiểm tra: ngrok còn chạy không? Backend TempestGaming có đang listen đúng port không?');
    }
}

sendIPN();

// lệnh test
// node simulate-momo-ipn.mjs success --orderId=<d04dca9e-ea99-4240-9c43-f98c493f23e2> --amount=<1.806.000>
// node simulate-momo-ipn.mjs success
// node simulate-momo-ipn.mjs fail