/**
 * 工单路由
 */

import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const ticketController = new TicketController();

router.use(authMiddleware);

/**
 * @route GET /tickets
 * @desc 获取我的工单列表
 * @access Private
 */
router.get('/', ticketController.list);

/**
 * @route GET /tickets/:id
 * @desc 获取工单详情
 * @access Private
 */
router.get('/:id', ticketController.getById);

/**
 * @route POST /tickets
 * @desc 创建工单
 * @access Private
 */
router.post('/', ticketController.create);

/**
 * @route POST /tickets/:id/message
 * @desc 发送工单消息
 * @access Private
 */
router.post('/:id/message', ticketController.sendMessage);

/**
 * @route POST /tickets/:id/close
 * @desc 关闭工单
 * @access Private
 */
router.post('/:id/close', ticketController.close);

export default router;
