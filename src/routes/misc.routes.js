import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import validate from '../middlewares/validate.middleware.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import * as VaiTroController from '../controller/VaiTro.controller.js';
import * as HinhAnhSanPham from '../controller/HinhAnhSanPham.controller.js';
import * as ThongTinChiTietController from '../controller/ThongTinChiTiet.controller.js';
import ThemHinhAnhSanPhamRequest from '../dtos/requests/HinhAnhSanPham/ThemHinhAnhSanPham.js';
import { VaiTroNguoiDung } from '../constants/index.js';
import { toCloudinaryArray, uploadCloudinaryArray } from '../middlewares/upload.middleware.js';

const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN]);

// ─── Vai Trò ─────────────────────────────────────────────────────────────────
export const vaiTroRouter = Router();
vaiTroRouter.get('/', asyncHandler(VaiTroController.getVaiTro));
vaiTroRouter.post('/', asyncHandler(VaiTroController.themVaiTro));
vaiTroRouter.put('/:id', asyncHandler(VaiTroController.updateVaiTro));
vaiTroRouter.delete('/:id', asyncHandler(VaiTroController.xoaVaiTro));

// ─── Hình Ảnh Sản Phẩm ───────────────────────────────────────────────────────
export const hinhAnhRouter = Router();
hinhAnhRouter.get('/', asyncHandler(HinhAnhSanPham.getHinhAnhSanPhams));
hinhAnhRouter.post('/bulk-upload',
    adminOnly,
    uploadCloudinaryArray,
    toCloudinaryArray,
    asyncHandler(HinhAnhSanPham.bulkUploadHinhAnh)
);

hinhAnhRouter.post('/url',
    adminOnly,
    asyncHandler(HinhAnhSanPham.themHinhAnhTuURL)
);

hinhAnhRouter.delete('/trung-lap', asyncHandler(HinhAnhSanPham.xoaAnhTrungLap));

hinhAnhRouter.get('/:id', asyncHandler(HinhAnhSanPham.getHinhAnhSanPhamById));
hinhAnhRouter.post('/',
    adminOnly,
    uploadCloudinaryArray,
    toCloudinaryArray,
    validate(ThemHinhAnhSanPhamRequest),
    asyncHandler(HinhAnhSanPham.themHinhAnhSanPham)
);
hinhAnhRouter.delete('/:id', asyncHandler(HinhAnhSanPham.xoaHinhAnhSanPham));


// ─── Thông Tin Chi Tiết ───────────────────────────────────────────────────────
export const thongTinRouter = Router();
thongTinRouter.get('/', asyncHandler(ThongTinChiTietController.getThongTinChiTiet));
thongTinRouter.get('/:id', asyncHandler(ThongTinChiTietController.getThongTinChiTietById));
thongTinRouter.post('/', asyncHandler(ThongTinChiTietController.themThongTinChiTiet));
thongTinRouter.put('/:id', asyncHandler(ThongTinChiTietController.updateThongTinChiTiet));
thongTinRouter.delete('/:id', asyncHandler(ThongTinChiTietController.xoaThongTinChiTiet));
