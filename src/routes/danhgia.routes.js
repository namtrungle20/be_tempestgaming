import { getDanhGia, postDanhGia, deleteDanhGia, checkDaMua } from '../controller/DanhGia.controller.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import VaiTroNguoiDung from '../constants/VaiTroNguoiDung.js';
import { Router } from 'express';


const router = Router()
const AdminOrUser = requestVaiTro([VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.USER])

router.get('/', asyncHandler(getDanhGia));
router.get('/check-mua', AdminOrUser, asyncHandler(checkDaMua));
router.post('/', AdminOrUser, asyncHandler(postDanhGia));
router.delete('/:id', AdminOrUser, asyncHandler(deleteDanhGia));

export default router;