
export const CreateThanhToanResponse = (thanhtoan, momoResult) => ({
    thanhtoan_id: thanhtoan.thanhtoan_id,
    donhang_id: thanhtoan.donhang_id,
    sotien: thanhtoan.sotien,
    trangthai: thanhtoan.trangthai,
    pay_url: momoResult.payUrl,
    deeplink: momoResult.deeplink,
    qr_code_url: momoResult.qrCodeUrl,
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
    created_at: thanhtoan.created_at,
});