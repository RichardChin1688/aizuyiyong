/**
 * 发票路由
 */

import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const invoiceController = new InvoiceController();

router.use(authMiddleware);

/**
 * @route GET /invoices
 * @desc 获取我的发票列表
 * @access Private
 */
router.get('/', invoiceController.list);

/**
 * @route GET /invoices/:id
 * @desc 获取发票详情
 * @access Private
 */
router.get('/:id', invoiceController.getById);

/**
 * @route POST /invoices
 * @desc 申请开票
 * @access Private
 */
router.post('/', invoiceController.create);

export default router;
