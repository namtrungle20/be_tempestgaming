import { Router } from 'express'
import asyncHandler from '../middlewares/asyncHandler.js'
import { requestVaiTro } from '../middlewares/auth.middleware.js'
import { VaiTroNguoiDung } from '../constants/index.js'
import * as UuDaiController from '../controller/UuDai.controller.js'

const router = Router()
const adminOnly = requestVaiTro([VaiTroNguoiDung.ADMIN])
const adminOrUser = requestVaiTro([VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.USER])

router.get('/', adminOnly, asyncHandler(UuDaiController.getDanhSachUuDai))
router.get('/me', adminOrUser, asyncHandler(UuDaiController.getUuDaiCuaToi))
router.put('/:hang', adminOnly, asyncHandler(UuDaiController.putCapNhatUuDai))

export default router