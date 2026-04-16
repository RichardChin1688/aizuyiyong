/**
 * 发票控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';

export class InvoiceController {
  /**
   * 获取发票列表
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

      const total = await prisma.invoice.count({ where });

      const invoices = await prisma.invoice.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: { list: invoices, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取发票详情
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      const invoice = await prisma.invoice.findFirst({
        where: { id: BigInt(id), userId: BigInt(userId) },
      });

      if (!invoice) throw new NotFoundError('发票不存在');

      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 申请开票
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { orderNo, invoiceType, invoiceTitle, taxId, amount } = req.body;

      if (!orderNo || !invoiceType || !invoiceTitle || !amount) {
        throw new BadRequestError('缺少必填字段');
      }

      // 验证订单是否存在
      const order = await prisma.order.findFirst({
        where: { orderNo, userId: BigInt(userId) },
      });

      if (!order) throw new NotFoundError('订单不存在');

      const invoice = await prisma.invoice.create({
        data: {
          userId: BigInt(userId),
          orderNo,
          invoiceType: parseInt(invoiceType, 10),
          invoiceTitle,
          taxId,
          amount,
          status: 0,
        },
      });

      res.status(201).json({ success: true, data: invoice, message: '开票申请已提交' });
    } catch (error) {
      next(error);
    }
  }
}
