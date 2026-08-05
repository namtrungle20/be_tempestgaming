import * as AuthService from '../services/Auth.service.js'

export const signUp = async (req, res) => {
    const data = await AuthService.dangKy(req.body)
    return res.status(201).json({ success: true, message: 'Đăng ký thành công', data })
}

export const signIn = async (req, res) => {
    const data = await AuthService.dangNhap(req.body, res)
    return res.status(200).json({ success: true, message: 'Đăng nhập thành công', data })
}

export const refresh = async (req, res) => {
    const token = req.body?.refreshToken ?? req.cookies?.refreshToken
    if (!token) return res.status(400).json({ success: false, message: 'Thiếu refresh token' })
    const accessToken = await AuthService.refreshToken(token)
    return res.status(200).json({ success: true, data: { accessToken } })
}

export const logout = async (req, res) => {
    const token = req.body?.refreshToken ?? req.cookies?.refreshToken
    if (!token) return res.status(400).json({ success: false, message: 'Thiếu refresh token' })
    await AuthService.dangXuat(token, res)
    return res.status(200).json({ success: true, message: 'Đăng xuất thành công' })
}

export const getMe = async (req, res) => {
    return res.status(200).json({ success: true, data: req.user })
}

export const loginGoogle = async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'Bạn không đăng nhập vào Google' });
    const data = await AuthService.loginWithGoogle(idToken, res);
    return res.status(200).json({ success: true, data });
};

export const postQuenMatKhau = async (req, res) => {
    const { email } = req.body
    const result = await AuthService.quenMatKhau({ email })
    return res.status(200).json({ success: true, ...result })
}

export const postDatLaiMatKhau = async (req, res) => {
    const { token, matKhauMoi } = req.body
    const result = await AuthService.datLaiMatKhau(token, matKhauMoi)
    return res.status(200).json({ success: true, ...result })
}
