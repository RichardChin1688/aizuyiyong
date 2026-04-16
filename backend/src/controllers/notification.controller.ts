/**
 * 通知控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/requestLogger';

export class NotificationController {
  /**
   * 获取通知列表
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { page = '1', limit = '20', type, isRead } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { userId: BigInt(userId) };
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead === 'true';

      const total = await prisma.notification.count({ where });

      const notifications = await prisma.notification.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: {
          list: notifications,
          pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;

      const count = await prisma.notification.count({
        where: { userId: BigInt(userId), isRead: false },
      });

      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 标记为已读
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      await prisma.notification.updateMany({
        where: { id: BigInt(id), userId: BigInt(userId) },
        data: { isRead: true, readAt: new Date() },
      });

      res.json({ success: true, message: '已标记为已读' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 全部标记为已读
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;

      await prisma.notification.updateMany({
        where: { userId: BigInt(userId), isRead: false },
        data: { isRead: true, readAt: new Date() },
      });

      res.json({ success: true, message: '全部已标记为已读' });
    } catch (error) {
      next(error);
    }
  }
}
