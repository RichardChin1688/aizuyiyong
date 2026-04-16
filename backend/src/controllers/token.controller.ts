/**
 * Token 管理控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError, ConflictError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';
import { v4 as uuidv4 } from 'uuid';

export class TokenController {
  /**
   * 获取 Token 套餐列表
   */
  async getPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const packages = await prisma.tokenPackage.findMany({
        where: { status: 1 },
        orderBy: { price: 'asc' },
      });

      res.json({
        success: true,
        data: packages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取套餐详情
   */
  async getPackageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const pkg = await prisma.tokenPackage.findUnique({
        where: { id: BigInt(id) },
      });

      if (!pkg) {
        throw new NotFoundError('套餐不存在');
      }

      res.json({
        success: true,
        data: pkg,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户 Token 钱包
   */
  async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;

      const wallet = await prisma.userTokenWallet.findUnique({
        where: { userId: BigInt(userId) },
      });

      if (!wallet) {
        // 初始化钱包
        const newWallet = await prisma.userTokenWallet.create({
          data: {
            userId: BigInt(userId),
          },
        });
        res.json({
          success: true,
          data: newWallet,
        });
      } else {
        res.json({
          success: true,
          data: wallet,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取 Token 流水
   */
  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const {
        page = '1',
        limit = '10',
        type,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { userId: BigInt(userId) };

      if (type) {
        where.type = parseInt(type as string, 10);
      }

      const total = await prisma.tokenTransaction.count({ where });

      const transactions = await prisma.tokenTransaction.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: {
          list: transactions,
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
   * 充值 Token
   */
  async recharge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { packageId, paymentMethod } = req.body;

      if (!packageId) {
        throw new BadRequestError('请选择充值套餐');
      }

      // 获取套餐信息
      const pkg = await prisma.tokenPackage.findUnique({
        where: { id: BigInt(packageId) },
      });

      if (!pkg) {
        throw new NotFoundError('套餐不存在');
      }

      if (pkg.status !== 1) {
        throw new BadRequestError('套餐已下架');
      }

      // 生成订单号
      const orderNo = `T${Date.now()}${uuidv4().slice(0, 4).toUpperCase()}`;

      // 创建综合订单
      const order = await prisma.order.create({
        data: {
          orderNo,
          userId: BigInt(userId),
          orderType: 2, // Token 充值
          totalAmount: pkg.price,
          payableAmount: pkg.price,
          status: 0, // 待支付
        },
      });

      // 创建订单明细
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productType: 'token',
          productId: Number(pkg.id),
          productName: pkg.name,
          quantity: 1,
          unitPrice: pkg.price,
          subtotal: pkg.price,
        },
      });

      res.json({
        success: true,
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          amount: pkg.price,
          tokenAmount: pkg.tokenAmount,
          paymentMethod,
        },
        message: '请完成支付',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 消费 Token
   */
  async consume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { amount, description, relatedOrderNo } = req.body;

      if (!amount || amount <= 0) {
        throw new BadRequestError('消费金额必须大于 0');
      }

      // 获取钱包
      const wallet = await prisma.userTokenWallet.findUnique({
        where: { userId: BigInt(userId) },
      });

      if (!wallet) {
        throw new ConflictError('请先充值 Token');
      }

      if (wallet.balance < BigInt(amount)) {
        throw new ConflictError('Token 余额不足');
      }

      // 更新钱包
      const updatedWallet = await prisma.userTokenWallet.update({
        where: { userId: BigInt(userId) },
        data: {
          balance: { decrement: BigInt(amount) },
          totalConsumed: { increment: BigInt(amount) },
        },
      });

      // 记录流水
      await prisma.tokenTransaction.create({
        data: {
          userId: BigInt(userId),
          type: 2, // 消费
          amount: BigInt(amount),
          balanceAfter: updatedWallet.balance,
          relatedOrderNo,
          description,
        },
      });

      res.json({
        success: true,
        data: {
          balance: updatedWallet.balance,
          consumed: amount,
        },
        message: '消费成功',
      });
    } catch (error) {
      next(error);
    }
  }
}
