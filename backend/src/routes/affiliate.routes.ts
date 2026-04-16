/**
 * 分销路由
 */

import { Router } from 'express';
import { AffiliateController } from '../controllers/affiliate.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const affiliateController = new AffiliateController();

router.use(authMiddleware);

/**
 * @route GET /affiliates/my-code
 * @desc 获取我的分销码
 * @access Private
 */
router.get('/my-code', affiliateController.getMyCode);

/**
 * @route GET /affiliates/stats
 * @desc 获取分销统计
 * @access Private
 */
router.get('/stats', affiliateController.getStats);

/**
 * @route GET /affiliates/records
 * @desc 获取分销记录
 * @access Private
 */
router.get('/records', affiliateController.getRecords);

/**
 * @route POST /affiliates/apply
 * @desc 申请成为分销商
 * @access Private
 */
router.post('/apply', affiliateController.apply);

export default router;
