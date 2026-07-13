import { transporter } from '../utils/mailer.js'

/**
 * Gửi email đặt lại mật khẩu
 * @param {string} toEmail - Email của user
 * @param {string} resetLink - Link reset password có kèm token
 */
export const guiEmailResetPassword = async (toEmail, resetLink) => {
    await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_ADMIN}>`,
        to: toEmail,
        subject: 'Đặt lại mật khẩu',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #ff8906; margin-bottom: 8px;">TempestGaming</h2>
                <h3 style="color: #222; margin-bottom: 16px;">Đặt lại mật khẩu</h3>
                <p style="color: #555; line-height: 1.6;">
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                    Nhấn vào nút bên dưới để tiếp tục:
                </p>
                <a href="${resetLink}" 
                   style="display: inline-block; margin: 24px 0; padding: 12px 32px;
                          background: #ff8906; color: #fff; text-decoration: none;
                          border-radius: 6px; font-weight: 700; font-size: 15px;">
                    Đặt lại mật khẩu
                </a>
                <p style="color: #999; font-size: 13px;">
                    Link này sẽ hết hạn sau <strong>15 phút</strong>.<br/>
                    Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #bbb; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} TempestGaming. All rights reserved.
                </p>
            </div>
        `,
    })
}