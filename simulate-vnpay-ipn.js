/**
 * Script giả lập VNPay IPN callback để test local
 * Usage: node simulate-vnpay-ipn.js <vnp_TxnRef> <sotien>
 * Ví dụ: node simulate-vnpay-ipn.js 17380001234567 990000
 */
import crypto from 'crypto';
import qs from 'qs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET?.trim();
const VNP_TMN_CODE = process.env.VNP_TMN_CODE?.trim();
const IPN_URL = process.env.VNP_IPN_URL || 'http://localhost:8080/api/payment/vnpay/ipn';

const txnRef = process.argv[2];
const sotien = Number(process.argv[3]);

if (!txnRef || !sotien) {
    console.error('Usage: node simulate-vnpay-ipn.js <vnp_TxnRef> <sotien_VND>');
    console.error('Vi du: node simulate-vnpay-ipn.js 17380001234567 990000');
    process.exit(1);
}

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const payDate = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

let params = {
    vnp_Amount: sotien * 100,
    vnp_BankCode: 'NCB',
    vnp_BankTranNo: `VNP${Date.now()}`,
    vnp_CardType: 'ATM',
    vnp_OrderInfo: `Thanh toan don hang test`,
    vnp_PayDate: payDate,
    vnp_ResponseCode: '00',
    vnp_ResultCode: '00',
    vnp_TmnCode: VNP_TMN_CODE,
    vnp_TransactionNo: Math.floor(Math.random() * 1e9).toString(),
    vnp_TransactionStatus: '00',
    vnp_TxnRef: txnRef,
};

const sorted = {};
Object.keys(params).sort().forEach(k => {
    sorted[k] = encodeURIComponent(String(params[k])).replace(/%20/g, '+');
});

const signData = qs.stringify(sorted, { encode: false });
const secureHash = crypto.createHmac('sha512', VNP_HASH_SECRET)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

const queryString = qs.stringify({ ...params, vnp_SecureHash: secureHash });
const url = `${IPN_URL}?${queryString}`;

console.log('\n Gui IPN den:', IPN_URL);
console.log(' vnp_TxnRef:', txnRef);
console.log(' So tien:', sotien.toLocaleString('vi-VN'), 'VND');
console.log(' SecureHash:', secureHash.slice(0, 20) + '...\n');

const response = await fetch(url);
const text = await response.text();

console.log(' Status:', response.status);
console.log(' Response:', text);
