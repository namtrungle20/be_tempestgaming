import * as uuDaiService from '../services/UuDai.service.js'

export const getDanhSachUuDai = async (req, res) => {
    const data = await uuDaiService.layDanhSachUuDai()
    res.status(200).json({ success: true, data })
}

export const getUuDaiCuaToi = async (req, res) => {
    const data = await uuDaiService.layUuDaiCuaToi(req.user.hang_thanh_vien)
    res.status(200).json({ success: true, data })
}

export const putCapNhatUuDai = async (req, res) => {
    const { hang } = req.params
    const { phan_tram_giam, trang_thai, mo_ta } = req.body

    const data = await uuDaiService.capNhatUuDai(parseInt(hang), {
        phan_tram_giam,
        trang_thai,
        mo_ta,
    })
    res.status(200).json({ success: true, data })
}