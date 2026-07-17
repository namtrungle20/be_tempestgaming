import { Router } from 'express'
import * as TinNhanController from '../controller/TinNhan.controller.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import { requestVaiTro } from '../middlewares/auth.middleware.js'
import { VaiTroNguoiDung } from '../constants/index.js'
import { optionalAuth } from '../middlewares/optionalAuth.middleware.js'

const router = Router()

const isAdmin = requestVaiTro([VaiTroNguoiDung.ADMIN])

router.get('/admin/hoithoai', isAdmin, asyncHandler(TinNhanController.getDanhSachHoiThoai))
router.get('/:id', optionalAuth, asyncHandler(TinNhanController.getLichSuChat))
router.post('/', optionalAuth, asyncHandler(TinNhanController.postGuiTinNhan))

export default router