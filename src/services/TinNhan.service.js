import db from '../models/index.js'
import { VaiTroNguoiDung } from '../constants/index.js'

export const layLichSuChat = async ({ nguoidungId, guestId, requesterId, requesterVaiTro }) => {
    const isAdmin = requesterVaiTro === VaiTroNguoiDung.ADMIN

    if (!isAdmin && nguoidungId && requesterId !== nguoidungId) {
        throw { status: 403, message: 'Không có quyền xem hội thoại này' }
    }

    const where = nguoidungId ? { nguoidung_id: nguoidungId } : { guest_id: guestId }
    if (!nguoidungId && !guestId) throw { status: 400, message: 'Thiếu thông tin hội thoại' }

    return db.TinNhan.findAll({ where, order: [['created_at', 'ASC']] })
}


export const guiTinNhan = async ({ noidung, nguoidungId, guestId, requesterId, requesterVaiTro }) => {
    if (!noidung || !noidung.trim()) throw { status: 400, message: 'Nội dung tin nhắn không được để trống' }

    const isAdmin = requesterVaiTro === VaiTroNguoiDung.ADMIN

    if (isAdmin) {
        if (!nguoidungId && !guestId) throw { status: 400, message: 'Thiếu thông tin hội thoại cần trả lời' }
        return db.TinNhan.create({
            nguoidung_id: nguoidungId || null,
            guest_id: guestId || null,
            noidung,
            nguoi_gui: VaiTroNguoiDung.ADMIN,
        })
    }

    // User đã đăng nhập — lấy id từ token, bỏ qua mọi giá trị body gửi lên
    if (requesterId) {
        return db.TinNhan.create({
            nguoidung_id: requesterId,
            noidung,
            nguoi_gui: VaiTroNguoiDung.USER,
        })
    }

    // Khách chưa đăng nhập
    if (!guestId) throw { status: 400, message: 'Thiếu guestId' }
    return db.TinNhan.create({
        guest_id: guestId,
        noidung,
        nguoi_gui: VaiTroNguoiDung.USER,
    })
}

export const layDanhSachHoiThoai = async () => {
    return db.sequelize.query(`
        SELECT tn.*, nd.name, nd.sdt
        FROM TinNhans tn
        INNER JOIN (
            SELECT COALESCE(nguoidung_id, guest_id) AS conv_key, MAX(created_at) AS max_created_at
            FROM TinNhans
            GROUP BY conv_key
        ) latest
            ON COALESCE(tn.nguoidung_id, tn.guest_id) = latest.conv_key
            AND tn.created_at = latest.max_created_at
        LEFT JOIN nguoidung nd ON nd.nguoidung_id = tn.nguoidung_id
        ORDER BY tn.created_at DESC
    `, { type: db.sequelize.QueryTypes.SELECT })
}