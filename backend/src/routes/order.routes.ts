/**
 * 订单路由
 */

import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const orderController = new OrderController();

router.use(authMiddleware);

/**
 * @route GET /orders
 * @desc 获取订单列表
 * @access Private
 */
router.get('/', orderController.list);

/**
 * @route GET /orders/:id
 * @desc 获取订单详情
 * @access Private
 */
router.get('/:id', orderController.getById);

/**
 * @route POST /orders/:id/cancel
 * @desc 取消订单
 * @access Private
 */
router.post('/:id/cancel', orderController.cancel);

export default router;
