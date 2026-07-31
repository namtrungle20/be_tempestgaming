import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { renderPayPage, confirmPayment } from '../controller/Momomock.controller.js';

const router = Router();

router.get('/pay', asyncHandler(renderPayPage));
router.post('/confirm', asyncHandler(confirmPayment));

export default router;
