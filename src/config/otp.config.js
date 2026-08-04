export const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_MINUTES) || 5;
export const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 5;
export const RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;