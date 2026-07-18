import * as chatService from '../services/TinNhan.service.js'
import { io } from '../server.js'
import { VaiTroNguoiDung } from '../constants/index.js'

export const getLichSuChat = async (req, res) => {
    const { id } = req.params
    const isGuest = req.query.isGuest === 'true'

    const messages = await chatService.layLichSuChat({
        nguoidungId: isGuest ? null : id,
        guestId: isGuest ? id : null,
        requesterId: req.user?.nguoidung_id,
        requesterVaiTro: req.user?.vaitro,
    })
    res.status(200).json({ success: true, data: messages })
}

export const postGuiTinNhan = async (req, res) => {
    const { noidung, nguoidung_id, guest_id } = req.body
    // console.log('BODY:', req.body)

    const tinNhan = await chatService.guiTinNhan({
        noidung,
        nguoidungId: nguoidung_id,
        guestId: guest_id,
        requesterId: req.user?.nguoidung_id,
        requesterVaiTro: req.user?.vaitro,
    })

    const room = tinNhan.nguoidung_id ? `user-${tinNhan.nguoidung_id}` : `guest-${tinNhan.guest_id}`
    io.to(room).emit('chat:receive', tinNhan)
    io.to('admin-room').emit('chat:receive', tinNhan)

    res.status(201).json({ success: true, data: tinNhan })
}

export const getDanhSachHoiThoai = async (req, res) => {
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0

    const conversations = await chatService.layDanhSachHoiThoai(limit, offset)
    res.status(200).json({ success: true, data: conversations })
}

export const deleteHoiThoai = async (req, res) => {
    const { id } = req.params
    const isGuest = req.query.isGuest === 'true'

    const result = await chatService.xoaHoiThoai({
        nguoidungId: isGuest ? null : id,
        guestId: isGuest ? id : null,
        requesterVaiTro: req.user?.vaitro,
    })

    res.status(200).json({ success: true, data: result })
}

export const postMergeGuest = async (req, res) => {
    if (req.user.vaitro === VaiTroNguoiDung.ADMIN) {
        return res.status(200).json({ success: true, data: { merged: 0 } })
    }

    const { guest_id } = req.body
    const result = await chatService.gopGuestVaoUser({
        guestId: guest_id,
        userId: req.user.nguoidung_id,
    })
    res.status(200).json({ success: true, data: result })
}