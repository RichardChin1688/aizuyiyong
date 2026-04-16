/**
 * 支付控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';

export class PaymentController {
  /**
   * 创建支付
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { orderNo, paymentMethod } = req.body;

      if (!orderNo || !paymentMethod) {
        throw new BadRequestError('订单号和支付方式不能为空');
      }

      // 查找订单
      const order = await prisma.order.findFirst({
        where: {
          orderNo,
          userId: BigInt(userId),
        },
      });

      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== 0) {
        throw new BadRequestError('订单状态不允许支付');
      }

      // 创建支付记录
      const payment = await prisma.payment.create({
        data: {
          orderNo,
          paymentMethod,
          amount: order.payableAmount,
          status: 0, // 待支付
        },
      });

      // TODO: 调用第三方支付 API 获取支付参数
      const paymentParams = {
        // 微信支付参数
        appId: 'wx_app_id',
        timeStamp: Date.now().toString(),
        nonceStr: 'random_string',
        package: `prepay_id=${payment.id}`,
        signType: 'RSA',
        paySign: 'signature',
      };

      res.json({
        success: true,
        data: {
          paymentId: payment.id,
          orderNo,
          amount: order.payableAmount,
          paymentMethod,
          paymentParams,
        },
        message: '请完成支付',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 微信支付回调
   */
  async wechatNotify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { out_trade_no, transaction_id, total, trade_state } = req.body;

      if (trade_state === 'SUCCESS') {
        // 更新支付记录
        await prisma.payment.update({
          where: { orderNo: out_trade_no },
          data: {
            paymentNo: transaction_id,
            status: 1, // 成功
            paidAt: new Date(),
            callbackData: req.body,
          },
        });

        // 更新订单状态
        await prisma.order.update({
          where: { orderNo: out_trade_no },
          data: {
            status: 1, // 已支付
            paidAt: new Date(),
          },
        });

        // TODO: 处理 Token 充值或租赁订单发货
      }

      // 返回成功响应给微信
      res.status(200).send('SUCCESS');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 支付宝支付回调
   */
  async alipayNotify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { out_trade_no, trade_no, total_amount, trade_status } = req.body;

      if (trade_status === 'TRADE_SUCCESS') {
        // 更新支付记录
        await prisma.payment.update({
          where: { orderNo: out_trade_no },
          data: {
            paymentNo: trade_no,
            status: 1,
            paidAt: new Date(),
            callbackData: req.body,
          },
        });

        // 更新订单状态
        await prisma.order.update({
          where: { orderNo: out_trade_no },
          data: {
            status: 1,
            paidAt: new Date(),
          },
        });
      }

      res.status(200).send('success');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查询支付状态
   */
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNo } = req.params;

      const payment = await prisma.payment.findUnique({
        where: { orderNo },
      });

      if (!payment) {
        throw new NotFoundError('支付记录不存在');
      }

      res.json({
        success: true,
        data: {
          orderNo: payment.orderNo,
          status: payment.status,
          amount: payment.amount,
          paidAt: payment.paidAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
