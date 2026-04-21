import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import nguoiDungRoutes from './routes/nguoidung.routes.js';
import sanPhamRoutes from './routes/sanpham.routes.js';
import loaiSanPhamRoutes from './routes/loaisanpham.routes.js';
import thuongHieuRoutes from './routes/thuonghieu.routes.js';
import donHangRoutes from './routes/donhang.routes.js';
import gioHangRoutes from './routes/giohang.routes.js';
import imageRoutes from './routes/images.routes.js';
import danhMucRouter from './routes/danhmuc.routes.js'
import thanhtoanRouter from './routes/thanhtoan.routes.js'
import { vaiTroRouter, hinhAnhRouter, thongTinRouter } from './routes/misc.routes.js';

export const AppRoute = (app) => {
    app.use(cookieParser());
    app.use('/api/thanhtoan', thanhtoanRouter)
    app.use('/api/auth', authRoutes);
    app.use('/api/nguoidung', nguoiDungRoutes);
    app.use('/api/danhmuc', danhMucRouter);
    app.use('/api/sanpham', sanPhamRoutes);
    app.use('/api/loaisanpham', loaiSanPhamRoutes);
    app.use('/api/thuonghieu', thuongHieuRoutes);
    app.use('/api/donhang', donHangRoutes);
    app.use('/api/giohang', gioHangRoutes);
    app.use('/api/images', imageRoutes);
    app.use('/api/vaitro', vaiTroRouter);
    app.use('/api/hinhanhsanpham', hinhAnhRouter);
    app.use('/api/thongtinchitiet', thongTinRouter);
};