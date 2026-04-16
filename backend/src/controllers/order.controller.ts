/**
 * 订单控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { NotFoundError, ConflictError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';

export class OrderController {
  /**
   * 获取订单列表
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const {
        page = '1',
        limit = '10',
        orderType,
        status,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { userId: BigInt(userId) };

      if (orderType) {
        where.orderType = parseInt(orderType as string, 10);
      }
      if (status) {
        where.status = parseInt(status as string, 10);
      }

      const total = await prisma.order.count({ where });

      const orders = await prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      });

      res.json({
        success: true,
        data: {
          list: orders,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取订单详情
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      const order = await prisma.order.findFirst({
        where: {
          id: BigInt(id),
          userId: BigInt(userId),
        },
        include: {
          items: true,
          payments: true,
        },
      });

      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 取消订单
   */
  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      const order = await prisma.order.findFirst({
        where: {
          id: BigInt(id),
          userId: BigInt(userId),
        },
      });

      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== 0) {
        throw new ConflictError('只能取消待支付订单');
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 3 }, // 已取消
      });

      res.json({
        success: true,
        message: '订单已取消',
      });
    } catch (error) {
      next(error);
    }
  }
}
