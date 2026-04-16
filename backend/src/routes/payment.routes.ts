/**
 * 支付路由
 */

import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

/**
 * @route POST /payments/create
 * @desc 创建支付
 * @access Private
 */
router.post('/create', authMiddleware, paymentController.create);

/**
 * @route POST /payments/wechat/notify
 * @desc 微信支付回调
 * @access Public
 */
router.post('/wechat/notify', paymentController.wechatNotify);

/**
 * @route POST /payments/alipay/notify
 * @desc 支付宝支付回调
 * @access Public
 */
router.post('/alipay/notify', paymentController.alipayNotify);

/**
 * @route GET /payments/:orderNo/status
 * @desc 查询支付状态
 * @access Private
 */
router.get('/:orderNo/status', authMiddleware, paymentController.getStatus);

export default router;
