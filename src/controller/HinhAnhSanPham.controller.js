import * as HinhAnhSanPhamService from '../services/HinhAnhSanPham.service.js'

export const getHinhAnhSanPhams = async (req, res) => {
    const result = await HinhAnhSanPhamService.layHinhAnhSanPhams(req.query)
    return res.status(200).json({ success: true, ...result })
}

export const getHinhAnhSanPhamById = async (req, res) => {
    const data = await HinhAnhSanPhamService.layHinhAnhSanPhamTheoId(req.params.id)
    return res.status(200).json({ success: true, data })
}

export const themHinhAnhSanPham = async (req, res) => {
    if (!req.uploadedImages?.length) throw { status: 400, message: 'Thiếu file ảnh' };

    const { sanpham_id, la_anh_dai_dien } = req.body;

    const results = await Promise.all(
        req.uploadedImages.map(img =>
            HinhAnhSanPhamService.themHinhAnhSanPham({
                sanpham_id,
                image_url: img.url,
                public_id: img.public_id,
                file_hash: img.file_hash,
                la_anh_dai_dien: la_anh_dai_dien === 'true',
            })
        )
    );


    return res.status(201).json({
        success: true,
        message: `Thêm ${results.length} hình ảnh thành công`,
        data: results,
    });
}

export const xoaHinhAnhSanPham = async (req, res) => {
    await HinhAnhSanPhamService.xoaHinhAnhSanPham(req.params.id)
    return res.status(200).json({ success: true, message: 'Xóa hình ảnh thành công' })
}

export const xoaAnhTrungLap = async (req, res) => {
    const result = await HinhAnhSanPhamService.xoaAnhTrungLap(req.query.sanpham_id);
    return res.status(200).json({ success: true, ...result });
};

export const bulkUploadHinhAnh = async (req, res) => {
    if (!req.uploadedImages?.length) throw { status: 400, message: 'Thiếu file ảnh' };

    const buffer = await HinhAnhSanPhamService.bulkUploadTaoExcel(req.uploadedImages);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=images.xlsx');
    return res.send(buffer);
};