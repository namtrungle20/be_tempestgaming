import * as SanPhamService from '../services/SanPham.service.js'

export const getSanPhams = async (req, res) => {
    const result = await SanPhamService.laySanPham(req.query)
    return res.status(200).json({ success: true, ...result })
}

export const getSanPhamById = async (req, res) => {
    const data = await SanPhamService.laySanPhamTheoId(req.params.id)
    return res.status(200).json({ success: true, data })
}

export const themSanPham = async (req, res) => {
    const productData = req.body;
    const uploadedImages = req.uploadedImages || []; // từ middleware Cloudinary
    const newProduct = await SanPhamService.themSanPham(productData, uploadedImages);
    return res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data: newProduct });
}


export const updateSanPham = async (req, res) => {
    const { id } = req.params;
    const productData = req.body;
    const uploadedImages = req.uploadedImages || [];

    let deleteImageIds = [];
    if (req.body.deleteImageIds) {
        try { deleteImageIds = JSON.parse(req.body.deleteImageIds); } catch { deleteImageIds = req.body.deleteImageIds.split(',').map(Number); }
    }
    const setDefaultImageId = req.body.setDefaultImageId ? Number(req.body.setDefaultImageId) : null;

    const updated = await SanPhamService.capNhatSanPhamVaAnh(id, productData, uploadedImages, deleteImageIds, setDefaultImageId);
    res.json({ success: true, message: 'Cập nhật sản phẩm thành công', data: updated });
};

export const deleteSanPham = async (req, res) => {
    await SanPhamService.xoaSanPham(req.params.id)
    return res.status(200).json({ success: true, message: 'Xóa sản phẩm thành công' })
}