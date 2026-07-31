// test-query.js — tạo file tạm ở gốc backend để test nhanh
import axios from 'axios';
import { buildMomoQueryBody, MOMO_QUERY_ENDPOINT } from './src/utils/momo.util.js';

const orderId = '6a3e46da-bd6a-40aa-b7ab-11e9638d57f6';
const requestId = 'MOMO_1785479907228';

const body = buildMomoQueryBody({ orderId, requestId });

const { data } = await axios.post(MOMO_QUERY_ENDPOINT, body, { timeout: 15000 });
console.log(data);