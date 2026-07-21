import db from '../models/index.js'
import { HangThanhVien } from '../constants/index.js'

const DANH_SACH_HANG = Object.values(HangThanhVien) // [0,1,2,3]

// ADMIN - lấy danh sách toàn bộ ưu đãi (theo thứ tự hạng tăng dần)
export const layDanhSachUuDai = async () => {
    const list = await db.UuDaiHang.findAll({
        order: [['hang', 'ASC']],
    })
    return list
}

// ADMIN - cập nhật % giảm / trạng thái bật-tắt cho 1 hạng
export const capNhatUuDai = async (hang, { phan_tram_giam, trang_thai, mo_ta }) => {
    if (!DANH_SACH_HANG.includes(hang)) {
        throw { status: 400, message: 'Hạng thành viên không hợp lệ' }
    }
    if (phan_tram_giam !== undefined && (phan_tram_giam < 0 || phan_tram_giam > 100)) {
        throw { status: 400, message: 'Phần trăm giảm phải trong khoảng 0 - 100' }
    }

    const uuDai = await db.UuDaiHang.findOne({ where: { hang } })
    if (!uuDai) throw { status: 404, message: 'Không tìm thấy ưu đãi cho hạng này' }

    if (phan_tram_giam !== undefined) uuDai.phan_tram_giam = phan_tram_giam
    if (trang_thai !== undefined) uuDai.trang_thai = trang_thai
    if (mo_ta !== undefined) uuDai.mo_ta = mo_ta
    await uuDai.save()

    return uuDai
}

// DÙNG NỘI BỘ (checkout) - lấy % giảm đang active của 1 hạng, mặc định 0 nếu tắt/không có
export const layPhanTramGiamTheoHang = async (hang) => {
    const uuDai = await db.UuDaiHang.findOne({ where: { hang, trang_thai: true } })
    if (!uuDai) return 0
    return parseFloat(uuDai.phan_tram_giam) || 0
}

export const layUuDaiCuaToi = async (hang) => {
    const phanTramGiam = await layPhanTramGiamTheoHang(hang)
    return { hang, phan_tram_giam: phanTramGiam }
}