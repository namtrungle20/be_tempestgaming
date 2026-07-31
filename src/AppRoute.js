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
import danhgiaRouter from './routes/danhgia.routes.js'
import tinNhanRouter from './routes/tinnhan.routes.js'
import uuDaiHangRouter from './routes/uudai.routes.js'
import { vaiTroRouter, hinhAnhRouter, chiTietRouter } from './routes/misc.routes.js';
import momoMockRouter from './routes/momomock.routes.js'

export const AppRoute = (app) => {
    app.use(cookieParser());
    app.use('/api/payment', thanhtoanRouter);
    app.use('/api/momo-mock', momoMockRouter)
    app.use('/api/auth', authRoutes);
    app.use('/api/nguoidung', nguoiDungRoutes);
    app.use('/api/danhmuc', danhMucRouter);
    app.use('/api/sanpham', sanPhamRoutes);
    app.use('/api/danhgia', danhgiaRouter);
    app.use('/api/loaisanpham', loaiSanPhamRoutes);
    app.use('/api/thuonghieu', thuongHieuRoutes);
    app.use('/api/donhang', donHangRoutes);
    app.use('/api/giohang', gioHangRoutes);
    app.use('/api/images', imageRoutes);
    app.use('/api/vaitro', vaiTroRouter);
    app.use('/api/hinhanhsanpham', hinhAnhRouter);
    app.use('/api/chitiet', chiTietRouter);
    app.use('/api/chat', tinNhanRouter)
    app.use('/api/uudai', uuDaiHangRouter)
};