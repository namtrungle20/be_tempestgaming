import crypto from 'crypto';
import qs from 'qs';

export const sortObject = (obj) => {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');
        });
    return sorted;
};

export const generateTxnRef = () => {
    return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

export const buildSecureHash = (params, hashSecret) => {
    const signData = qs.stringify(params, { encode: false });
    return crypto.createHmac('sha512', hashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex');
};

// Luôn quy đổi về giờ Việt Nam (GMT+7), không phụ thuộc timezone server
export const formatVnpDate = (date) => {
    const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000 - date.getTimezoneOffset() * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return (
        vnDate.getUTCFullYear().toString() +
        pad(vnDate.getUTCMonth() + 1) +
        pad(vnDate.getUTCDate()) +
        pad(vnDate.getUTCHours()) +
        pad(vnDate.getUTCMinutes()) +
        pad(vnDate.getUTCSeconds())
    );
};

export const parseVnpDate = (str) => {
    const y = str.slice(0, 4), mo = str.slice(4, 6), d = str.slice(6, 8);
    const h = str.slice(8, 10), mi = str.slice(10, 12), s = str.slice(12, 14);
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}+07:00`); // gắn rõ +07:00 để không bị hiểu nhầm là UTC
};

export const parseRawQuery = (req) => {
    const rawQuery = req.originalUrl.split('?')[1] || '';
    return qs.parse(rawQuery);
};