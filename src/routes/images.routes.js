import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { requestVaiTro } from '../middlewares/auth.middleware.js';
import { uploadArray } from '../middlewares/upload.middleware.js';
import validateImageExists from '../middlewares/validateImage.middleware.js';
import * as ImageController from '../controller/Image.controller.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOrUser = requestVaiTro([VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.USER]);

router.get('/:fileName', asyncHandler(ImageController.viewImage));
router.get('/cloudinary/all', asyncHandler(ImageController.getAllCloudinaryImages));

router.post('/upload', adminOrUser, uploadArray(), asyncHandler(ImageController.uploadImages));
router.delete('/delete', adminOrUser, validateImageExists, ImageController.deleteImage);

export default router;
