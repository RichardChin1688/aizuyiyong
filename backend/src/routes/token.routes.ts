/**
 * Token 管理路由
 */

import { Router } from 'express';
import { TokenController } from '../controllers/token.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const tokenController = new TokenController();

/**
 * @route GET /tokens/packages
 * @desc 获取 Token 套餐列表
 * @access Public
 */
router.get('/packages', tokenController.getPackages);

/**
 * @route GET /tokens/packages/:id
 * @desc 获取套餐详情
 * @access Public
 */
router.get('/packages/:id', tokenController.getPackageById);

/**
 * @route GET /tokens/wallet
 * @desc 获取用户 Token 钱包
 * @access Private
 */
router.get('/wallet', authMiddleware, tokenController.getWallet);

/**
 * @route GET /tokens/transactions
 * @desc 获取 Token 流水
 * @access Private
 */
router.get('/transactions', authMiddleware, tokenController.getTransactions);

/**
 * @route POST /tokens/recharge
 * @desc 充值 Token
 * @access Private
 */
router.post('/recharge', authMiddleware, tokenController.recharge);

/**
 * @route POST /tokens/consume
 * @desc 消费 Token
 * @access Private
 */
router.post('/consume', authMiddleware, tokenController.consume);

export default router;
