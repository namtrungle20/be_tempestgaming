/**
 * Momomock.controller.js
 * Xử lý request/response cho MoMo Mock Gateway. Không chứa business logic
 * (build signature, gọi IPN...) — toàn bộ nằm ở Momomock.service.js.
 */

import * as momoMockService from '../services/Momomock.service.js';

// GET /momo-mock/pay
// Render trang giao diện giả lập checkout MoMo
export const renderPayPage = (req, res) => {
  const { orderId, amount, requestId, orderInfo } = req.query;
  if (!orderId || !amount) return res.status(400).json({ success: false, message: 'Thiếu orderId hoặc amount trên URL.' })

  return res.status(200).send(`
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<title>MoMo Mock Gateway (TEST)</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #f5f5f7; display: flex;
         align-items: center; justify-content: center; height: 100vh; margin: 0; }
  .card { background: #fff; border-radius: 16px; padding: 32px; width: 360px;
          box-shadow: 0 8px 24px rgba(0,0,0,.08); }
  .badge { background: #fff3cd; color: #856404; font-size: 12px; padding: 4px 10px;
           border-radius: 20px; display: inline-block; margin-bottom: 16px; }
  h2 { color: #a50064; margin: 0 0 4px; }
  .row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 14px; color: #444; }
  .row b { color: #111; }
  button { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 15px;
           font-weight: 600; margin-top: 10px; cursor: pointer; }
  .btn-success { background: #a50064; color: #fff; }
  .btn-fail { background: #eee; color: #333; }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">⚠️ MOCK GATEWAY — không phải MoMo thật</span>
    <h2>MoMo Payment</h2>
    <div class="row"><span>Mã đơn hàng</span><b>${orderId}</b></div>
    <div class="row"><span>Số tiền</span><b>${Number(amount).toLocaleString('vi-VN')}đ</b></div>
    <div class="row"><span>Nội dung</span><b>${orderInfo || 'Thanh toan don hang'}</b></div>

    <form method="POST" action="/api/momo-mock/confirm">
      <input type="hidden" name="orderId" value="${orderId}" />
      <input type="hidden" name="amount" value="${amount}" />
      <input type="hidden" name="requestId" value="${requestId || orderId}" />
      <input type="hidden" name="orderInfo" value="${orderInfo || ''}" />
      <button class="btn-success" name="result" value="success" type="submit">
        ✅ Giả lập thanh toán THÀNH CÔNG
      </button>
      <button class="btn-fail" name="result" value="fail" type="submit">
        ❌ Giả lập thanh toán THẤT BẠI
      </button>
    </form>
  </div>
</body>
</html>
  `);
}

// POST /momo-mock/confirm
// Nhận lựa chọn của user (success/fail) -> gọi service xử lý -> redirect
export const confirmPayment = async (req, res) => {
  const { orderId, amount, requestId, orderInfo, result } = req.body;
  if (!orderId || !amount || !result) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu xác nhận thanh toán.' })

  const { redirectUrl, ipnResult } = await momoMockService.confirmMockPayment({ orderId, amount, requestId, orderInfo, result })

  if (!ipnResult.ok) {
    console.warn('[momoMock.controller] IPN không nhận được phản hồi thành công:', ipnResult);
  }

  return res.redirect(redirectUrl);
}