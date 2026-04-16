/**
 * 租赁订单路由
 */

import { Router } from 'express';
import { RentalController } from '../controllers/rental.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const rentalController = new RentalController();

// 所有租赁路由都需要认证
router.use(authMiddleware);

/**
 * @route GET /rentals
 * @desc 获取我的租赁订单列表
 * @access Private
 */
router.get('/', rentalController.list);

/**
 * @route GET /rentals/:id
 * @desc 获取租赁订单详情
 * @access Private
 */
router.get('/:id', rentalController.getById);

/**
 * @route POST /rentals
 * @desc 创建租赁订单
 * @access Private
 */
router.post('/', rentalController.create);

/**
 * @route POST /rentals/:id/pay
 * @desc 支付租赁订单
 * @access Private
 */
router.post('/:id/pay', rentalController.pay);

/**
 * @route POST /rentals/:id/cancel
 * @desc 取消租赁订单
 * @access Private
 */
router.post('/:id/cancel', rentalController.cancel);

/**
 * @route POST /rentals/:id/confirm-receive
 * @desc 确认收货
 * @access Private
 */
router.post('/:id/confirm-receive', rentalController.confirmReceive);

/**
 * @route POST /rentals/:id/return
 * @desc 归还设备
 * @access Private
 */
router.post('/:id/return', rentalController.returnDevice);

/**
 * @route PUT /rentals/:id/address
 * @desc 更新收货地址
 * @access Private
 */
router.put('/:id/address', rentalController.updateAddress);

export default router;
