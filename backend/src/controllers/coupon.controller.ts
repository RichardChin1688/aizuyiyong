/**
 * 优惠券控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError, ConflictError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';
import { v4 as uuidv4 } from 'uuid';

export class CouponController {
  /**
   * 获取优惠券列表
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupons = await prisma.coupon.findMany({
        where: { status: 1, validTo: { gte: new Date() } },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: coupons });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 领取优惠券
   */
  async receive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      const coupon = await prisma.coupon.findUnique({ where: { id: BigInt(id) } });

      if (!coupon) throw new NotFoundError('优惠券不存在');
      if (coupon.status !== 1) throw new BadRequestError('优惠券已下架');
      if (coupon.issuedCount >= coupon.totalCount) throw new ConflictError('已领完');

      const couponCode = `C${Date.now()}${uuidv4().slice(0, 4).toUpperCase()}`;

      await prisma.$transaction([
        prisma.userCoupon.create({
          data: {
            userId: BigInt(userId),
            couponId: coupon.id,
            couponCode,
            status: 0,
          },
        }),
        prisma.coupon.update({
          where: { id: coupon.id },
          data: { issuedCount: { increment: 1 } },
        }),
      ]);

      res.json({ success: true, data: { couponCode }, message: '领取成功' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取我的优惠券
   */
  async getMyCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { status } = req.query;

      const where: any = { userId: BigInt(userId) };
      if (status) where.status = parseInt(status as string, 10);

      const userCoupons = await prisma.userCoupon.findMany({
        where,
        include: { coupon: true },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: userCoupons });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 验证优惠券
   */
  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { couponCode, amount } = req.body;

      const userCoupon = await prisma.userCoupon.findFirst({
        where: { couponCode, userId: BigInt(userId), status: 0 },
        include: { coupon: true },
      });

      if (!userCoupon) throw new NotFoundError('优惠券无效');

      const coupon = userCoupon.coupon;
      if (coupon.validFrom > new Date() || coupon.validTo < new Date()) {
        throw new BadRequestError('优惠券不在有效期内');
      }

      let discount = 0;
      if (coupon.type === 1 && amount >= Number(coupon.minAmount)) {
        discount = Number(coupon.discountValue);
      } else if (coupon.type === 2) {
        discount = Number(amount) * Number(coupon.discountValue) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
      } else if (coupon.type === 3) {
        discount = Number(coupon.discountValue);
      }

      res.json({ success: true, data: { valid: true, discount, couponCode } });
    } catch (error) {
      next(error);
    }
  }
}
