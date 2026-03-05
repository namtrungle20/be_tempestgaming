import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { requestVaiTro } from '../middlewares/jwtMiddleware.js';
import { uploadArray, uploadCloudinarySingle } from '../middlewares/uploadImage.js';
import validateImageExists from '../middlewares/validateImageExists.js';
import * as ImageController from '../controller/ImageController.js';
import { VaiTroNguoiDung } from '../constants/index.js';

const router = Router();
const adminOrUser = requestVaiTro([VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.USER]);

router.get('/:fileName', asyncHandler(ImageController.viewImage));
router.get('/cloudinary/all', asyncHandler(ImageController.getAllCloudinaryImages));

router.post('/upload', adminOrUser, uploadArray(), asyncHandler(ImageController.uploadImages));
router.post('/cloudinary/upload', adminOrUser, uploadCloudinarySingle, asyncHandler(ImageController.uploadImageToCloudinaryStorage));
router.delete('/delete', adminOrUser, validateImageExists, ImageController.deleteImage);

export default router;