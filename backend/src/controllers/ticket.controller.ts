/**
 * 工单控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';
import { v4 as uuidv4 } from 'uuid';

export class TicketController {
  /**
   * 获取工单列表
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { page = '1', limit = '10', status } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { userId: BigInt(userId) };
      if (status) where.status = parseInt(status as string, 10);

      const total = await prisma.ticket.count({ where });

      const tickets = await prisma.ticket.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 1, // 只取最新消息
          },
        },
      });

      res.json({
        success: true,
        data: {
          list: tickets,
          pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取工单详情
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      const ticket = await prisma.ticket.findFirst({
        where: { id: BigInt(id), userId: BigInt(userId) },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });

      if (!ticket) throw new NotFoundError('工单不存在');

      res.json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建工单
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { category, title, content } = req.body;

      if (!category || !title) throw new BadRequestError('分类和标题不能为空');

      const ticketNo = `T${Date.now()}${uuidv4().slice(0, 4).toUpperCase()}`;

      const ticket = await prisma.ticket.create({
        data: {
          ticketNo,
          userId: BigInt(userId),
          category,
          title,
          content,
          status: 0,
          priority: 2,
        },
      });

      res.status(201).json({ success: true, data: ticket, message: '工单创建成功' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 发送工单消息
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;
      const { content } = req.body;

      if (!content) throw new BadRequestError('消息内容不能为空');

      const ticket = await prisma.ticket.findFirst({
        where: { id: BigInt(id), userId: BigInt(userId) },
      });

      if (!ticket) throw new NotFoundError('工单不存在');

      const message = await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderType: 1, // 用户
          senderId: BigInt(userId),
          content,
        },
      });

      // 如果工单已关闭，重新打开
      if (ticket.status === 3) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: 1 },
        });
      }

      res.json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 关闭工单
   */
  async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      const ticket = await prisma.ticket.findFirst({
        where: { id: BigInt(id), userId: BigInt(userId) },
      });

      if (!ticket) throw new NotFoundError('工单不存在');

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 3, resolvedAt: new Date() },
      });

      res.json({ success: true, message: '工单已关闭' });
    } catch (error) {
      next(error);
    }
  }
}
