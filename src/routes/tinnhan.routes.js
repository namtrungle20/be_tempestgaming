import { Router } from 'express'
import * as TinNhanController from '../controller/TinNhan.controller.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import { requestVaiTro } from '../middlewares/auth.middleware.js'
import { VaiTroNguoiDung } from '../constants/index.js'
import { optionalAuth } from '../middlewares/optionalAuth.middleware.js'

const router = Router()

const isAdmin = requestVaiTro([VaiTroNguoiDung.ADMIN])
const userAndAdmin = requestVaiTro([VaiTroNguoiDung.USER, VaiTroNguoiDung.ADMIN]);

router.get('/admin/hoithoai', isAdmin, asyncHandler(TinNhanController.getDanhSachHoiThoai))
router.get('/:id', optionalAuth, asyncHandler(TinNhanController.getLichSuChat))
router.post('/', optionalAuth, asyncHandler(TinNhanController.postGuiTinNhan))
router.delete('/:id', isAdmin, asyncHandler(TinNhanController.deleteHoiThoai))
router.post('/merge-guest', userAndAdmin, asyncHandler(TinNhanController.postMergeGuest))

export default router