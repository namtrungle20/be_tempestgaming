import * as NguoiDungService from '../services/NguoiDung.service.js'

export const postTatCaNguoiDung = async (req, res) => {
    const result = await NguoiDungService.layTatCaNguoiDung(req.body)
    return res.status(200).json(result)
}

export const postNguoiDungById = async (req, res) => {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'Thiếu ID người dùng' })
    const data = await NguoiDungService.layNguoiDungTheoId(req.body.id)
    return res.status(200).json({ success: true, data })
}

export const updateNguoiDung = async (req, res) => {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'Thiếu ID người dùng' })
    const data = await NguoiDungService.capNhatNguoiDung(req.body.id, req.body)
    return res.status(200).json({ success: true, message: 'Cập nhật người dùng thành công', data })
}

export const deleteNguoiDung = async (req, res) => {
    if (!req.body.id) return res.status(400).json({ success: false, message: 'Thiếu ID người dùng' })
    await NguoiDungService.xoaNguoiDung(req.body.id)
    return res.status(200).json({ success: true, message: 'Xóa người dùng thành công' })
}