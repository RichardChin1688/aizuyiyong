/**
 * 优惠券路由
 */

import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const couponController = new CouponController();

/**
 * @route GET /coupons
 * @desc 获取优惠券列表
 * @access Public
 */
router.get('/', couponController.list);

/**
 * @route POST /coupons/:id/receive
 * @desc 领取优惠券
 * @access Private
 */
router.post('/:id/receive', authMiddleware, couponController.receive);

/**
 * @route GET /coupons/my
 * @desc 获取我的优惠券
 * @access Private
 */
router.get('/my', authMiddleware, couponController.getMyCoupons);

/**
 * @route POST /coupons/validate
 * @desc 验证优惠券
 * @access Private
 */
router.post('/validate', authMiddleware, couponController.validate);

export default router;
