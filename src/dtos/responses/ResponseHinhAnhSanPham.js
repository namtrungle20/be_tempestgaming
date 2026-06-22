class ResponseHinhAnhSanPham {
    constructor(hinhanh) {
        this.id = hinhanh.id;
        this.sanpham_id = hinhanh.sanpham_id;
        this.image_url = hinhanh.image_url;
        this.la_anh_dai_dien = hinhanh.la_anh_dai_dien;
        this.type = hinhanh.type || "image"
        // Nếu có include SanPham, có thể thêm thông tin sản phẩm
        if (hinhanh.SanPham) {
            this.sanpham = {
                sanpham_id: hinhanh.SanPham.sanpham_id,
                name: hinhanh.SanPham.name,
                gia: hinhanh.SanPham.gia
            };
        }
    }
}
export default ResponseHinhAnhSanPham;