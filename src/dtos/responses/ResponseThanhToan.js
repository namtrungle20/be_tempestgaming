
export const CreateThanhToanResponse = (thanhtoan, payUrl, extra = {}) => ({
    thanhtoan_id: thanhtoan.thanhtoan_id,
    donhang_id: thanhtoan.donhang_id,
    sotien: thanhtoan.sotien,
    trangthai: thanhtoan.trangthai,
    pay_url: payUrl,
    deeplink: extra.deeplink ?? null,
    qr_code_url: extra.qrCodeUrl ?? null,
});


export const ChiTietThanhToanResponse = (thanhtoan) => ({
    thanhtoan_id: thanhtoan.thanhtoan_id,
    donhang_id: thanhtoan.donhang_id,
    phuongthucthanhtoan: thanhtoan.phuongthucthanhtoan,
    sotien: thanhtoan.sotien,
    trangthai: thanhtoan.trangthai,
    momo_trans_id: thanhtoan.momo_trans_id,
    momo_pay_type: thanhtoan.momo_pay_type,
    momo_time_pay: thanhtoan.momo_time_pay,
    magiaodich: thanhtoan.magiaodich, // dùng chung cho VNPay (và có thể cả MoMo nếu bạn thống nhất lại field)
    created_at: thanhtoan.created_at,
});