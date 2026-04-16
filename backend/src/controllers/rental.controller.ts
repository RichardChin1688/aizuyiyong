/**
 * 租赁订单控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError, ConflictError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';
import { v4 as uuidv4 } from 'uuid';

export class RentalController {
  /**
   * 获取租赁订单列表
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const {
        page = '1',
        limit = '10',
        status,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { userId: BigInt(userId) };

      if (status) {
        where.status = parseInt(status as string, 10);
      }

      const total = await prisma.rentalOrder.count({ where });

      const orders = await prisma.rentalOrder.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          device: {
            select: {
              id: true,
              name: true,
              imageUrls: true,
              category: true,
            },
          },
          address: true,
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
   * 获取租赁订单详情
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      const order = await prisma.rentalOrder.findFirst({
        where: {
          id: BigInt(id),
          userId: BigInt(userId),
        },
        include: {
          device: true,
          address: true,
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
   * 创建租赁订单
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const {
        deviceId,
        rentalType,
        rentalDays,
        startDate,
        endDate,
        address,
      } = req.body;

      // 验证必填字段
      if (!deviceId || !rentalType || !rentalDays || !startDate || !endDate) {
        throw new BadRequestError('缺少必填字段');
      }

      // 查找设备
      const device = await prisma.device.findUnique({
        where: { id: BigInt(deviceId) },
      });

      if (!device) {
        throw new NotFoundError('设备不存在');
      }

      if (device.status !== 1) {
        throw new BadRequestError('设备已下架');
      }

      if (device.stockAvailable < 1) {
        throw new ConflictError('设备库存不足');
      }

      // 计算价格
      let unitPrice = device.dailyPrice;
      if (rentalType === 2) {
        unitPrice = device.weeklyPrice || device.dailyPrice.mul(7);
      } else if (rentalType === 3) {
        unitPrice = device.monthlyPrice || device.dailyPrice.mul(30);
      }

      const totalAmount = unitPrice;
      const depositAmount = device.deposit;

      // 生成订单号
      const orderNo = `R${Date.now()}${uuidv4().slice(0, 4).toUpperCase()}`;

      // 创建订单
      const order = await prisma.rentalOrder.create({
        data: {
          orderNo,
          userId: BigInt(userId),
          deviceId: BigInt(deviceId),
          rentalType,
          rentalDays,
          unitPrice,
          totalAmount,
          depositAmount,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 0, // 待支付
        },
        include: {
          device: {
            select: {
              id: true,
              name: true,
              imageUrls: true,
            },
          },
        },
      });

      // 创建收货地址
      if (address) {
        await prisma.rentalAddress.create({
          data: {
            rentalOrderId: order.id,
            ...address,
          },
        });
      }

      res.status(201).json({
        success: true,
        data: order,
        message: '订单创建成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 支付订单
   */
  async pay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;
      const { paymentMethod } = req.body;

      const order = await prisma.rentalOrder.findFirst({
        where: {
          id: BigInt(id),
          userId: BigInt(userId),
        },
      });

      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== 0) {
        throw new ConflictError('订单状态不允许支付');
      }

      // TODO: 调用支付接口

      // 更新订单状态
      const updatedOrder = await prisma.rentalOrder.update({
        where: { id: order.id },
        data: {
          status: 1, // 待发货
          paidAt: new Date(),
        },
      });

      // 扣减库存
      await prisma.device.update({
        where: { id: order.deviceId },
        data: {
          stockAvailable: { decrement: 1 },
        },
      });

      res.json({
        success: true,
        data: updatedOrder,
        message: '支付成功',
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

      const order = await prisma.rentalOrder.findFirst({
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

      await prisma.rentalOrder.update({
        where: { id: order.id },
        data: { status: 5 }, // 已取消
      });

      res.json({
        success: true,
        message: '订单已取消',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 确认收货
   */
  async confirmReceive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      const order = await prisma.rentalOrder.findFirst({
        where: {
          id: BigInt(id),
          userId: BigInt(userId),
        },
      });

      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== 1) {
        throw new ConflictError('订单状态不允许确认收货');
      }

      const updatedOrder = await prisma.rentalOrder.update({
        where: { id: order.id },
        data: {
          status: 2, // 租赁中
          receivedAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: updatedOrder,
        message: '已确认收货',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 归还设备
   */
  async returnDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      const order = await prisma.rentalOrder.findFirst({
        where: {
          id: BigInt(id),
          userId: BigInt(userId),
        },
      });

      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== 3) {
        throw new ConflictError('订单状态不允许归还');
      }

      const updatedOrder = await prisma.rentalOrder.update({
        where: { id: order.id },
        data: {
          status: 4, // 已完成
          returnedAt: new Date(),
        },
      });

      // 恢复库存
      await prisma.device.update({
        where: { id: order.deviceId },
        data: {
          stockAvailable: { increment: 1 },
        },
      });

      res.json({
        success: true,
        data: updatedOrder,
        message: '设备已归还',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新收货地址
   */
  async updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;
      const addressData = req.body;

      const order = await prisma.rentalOrder.findFirst({
        where: {
          id: BigInt(id),
          userId: BigInt(userId),
        },
        include: { address: true },
      });

      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== 0 && order.status !== 1) {
        throw new ConflictError('订单已发货，无法修改地址');
      }

      if (order.address) {
        await prisma.rentalAddress.update({
          where: { rentalOrderId: order.id },
          data: addressData,
        });
      } else {
        await prisma.rentalAddress.create({
          data: {
            rentalOrderId: order.id,
            ...addressData,
          },
        });
      }

      res.json({
        success: true,
        message: '地址更新成功',
      });
    } catch (error) {
      next(error);
    }
  }
}
