class ResponseNguoiDung {
    constructor(nguoidung) {
        this.nguoidung_id = nguoidung.nguoidung_id;
        this.email = nguoidung.email;
        this.sdt = nguoidung.sdt;
        this.diachi = nguoidung.diachi;
        this.vaitro = nguoidung.vaitro;
        this.is_lock = nguoidung.is_lock;
        this.ngayvao = nguoidung.ngayvao;
        this.ngayhoatdong = nguoidung.ngayhoatdong;
    }
}
export default ResponseNguoiDung