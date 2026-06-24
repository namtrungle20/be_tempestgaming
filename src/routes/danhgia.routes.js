import express from 'express';
import { getDanhGia, postDanhGia, deleteDanhGia } from '../controller/DanhGia.controller.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(getDanhGia));
router.post('/', requestVaiTro([0, 1]), asyncHandler(postDanhGia));
router.delete('/:id', requestVaiTro([0, 1]), asyncHandler(deleteDanhGia));

export default router;