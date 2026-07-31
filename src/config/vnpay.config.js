const vnpayConfig = {
    tmnCode: process.env.VNP_TMN_CODE?.trim(),
    hashSecret: process.env.VNP_HASH_SECRET?.trim(),
    url: process.env.VNP_URL?.trim(),
    returnUrl: process.env.VNP_RETURN_URL?.trim(),
    // ipnUrl: process.env.VNP_IPN_URL?.trim(),
    version: '2.1.0',
};

export default vnpayConfig;