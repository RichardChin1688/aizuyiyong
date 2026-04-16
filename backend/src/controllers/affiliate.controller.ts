/**
 * 分销控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { ConflictError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';
import { v4 as uuidv4 } from 'uuid';

export class AffiliateController {
  /**
   * 获取我的分销码
   */
  async getMyCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;

      let code = await prisma.affiliateCode.findUnique({
        where: { userId: BigInt(userId) },
      });

      if (!code) {
        res.json({ success: true, data: null, message: '尚未申请分销资格' });
        return;
      }

      res.json({ success: true, data: code });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取分销统计
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;

      const code = await prisma.affiliateCode.findUnique({
        where: { userId: BigInt(userId) },
      });

      if (!code) {
        throw new ConflictError('尚未申请分销资格');
      }

      const stats = {
        code: code.code,
        commissionRate: code.commissionRate,
        totalInvited: code.totalInvited,
        totalEarnings: code.totalEarnings,
        status: code.status,
      };

      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取分销记录
   */
  async getRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { page = '1', limit = '10' } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const total = await prisma.affiliateRecord.count({
        where: { inviterId: BigInt(userId) },
      });

      const records = await prisma.affiliateRecord.findMany({
        where: { inviterId: BigInt(userId) },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: { list: records, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 申请成为分销商
   */
  async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;

      const existing = await prisma.affiliateCode.findUnique({
        where: { userId: BigInt(userId) },
      });

      if (existing) {
        throw new ConflictError('已是分销商');
      }

      const code = uuidv4().slice(0, 8).toUpperCase();

      const affiliateCode = await prisma.affiliateCode.create({
        data: {
          userId: BigInt(userId),
          code,
          commissionRate: 10.00,
          status: 1,
        },
      });

      res.status(201).json({ success: true, data: affiliateCode, message: '申请成功' });
    } catch (error) {
      next(error);
    }
  }
}
