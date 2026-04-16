/**
 * 通知路由
 */

import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

router.use(authMiddleware);

/**
 * @route GET /notifications
 * @desc 获取通知列表
 * @access Private
 */
router.get('/', notificationController.list);

/**
 * @route GET /notifications/unread-count
 * @desc 获取未读通知数量
 * @access Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route POST /notifications/:id/read
 * @desc 标记为已读
 * @access Private
 */
router.post('/:id/read', notificationController.markAsRead);

/**
 * @route POST /notifications/read-all
 * @desc 全部标记为已读
 * @access Private
 */
router.post('/read-all', notificationController.markAllAsRead);

export default router;
