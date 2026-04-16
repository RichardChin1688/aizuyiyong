/**
 * 设备控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';

export class DeviceController {
  /**
   * 获取设备列表
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        category,
        brand,
        minPrice,
        maxPrice,
        isHot,
        status = '1',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // 构建筛选条件
      const where: any = { status: parseInt(status as string, 10) };

      if (category) {
        where.category = category as string;
      }
      if (brand) {
        where.brand = brand as string;
      }
      if (isHot !== undefined) {
        where.isHot = isHot === 'true';
      }
      if (minPrice || maxPrice) {
        where.dailyPrice = {};
        if (minPrice) where.dailyPrice.gte = parseFloat(minPrice as string);
        if (maxPrice) where.dailyPrice.lte = parseFloat(maxPrice as string);
      }

      // 获取总数
      const total = await prisma.device.count({ where });

      // 获取数据
      const devices = await prisma.device.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        select: {
          id: true,
          name: true,
          category: true,
          brand: true,
          model: true,
          dailyPrice: true,
          weeklyPrice: true,
          monthlyPrice: true,
          deposit: true,
          stockAvailable: true,
          isHot: true,
          imageUrls: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: {
          list: devices,
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
   * 获取热门设备
   */
  async getHotDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const devices = await prisma.device.findMany({
        where: {
          isHot: true,
          status: 1,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          category: true,
          brand: true,
          dailyPrice: true,
          deposit: true,
          imageUrls: true,
        },
      });

      res.json({
        success: true,
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取设备分类
   */
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await prisma.device.groupBy({
        by: ['category'],
        where: { status: 1 },
        _count: { id: true },
      });

      res.json({
        success: true,
        data: categories.map((c) => ({
          category: c.category,
          count: c._count.id,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取设备详情
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const device = await prisma.device.findUnique({
        where: { id: BigInt(id) },
      });

      if (!device) {
        throw new NotFoundError('设备不存在');
      }

      res.json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建设备
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        category,
        brand,
        model,
        specs,
        imageUrls,
        dailyPrice,
        weeklyPrice,
        monthlyPrice,
        deposit,
        stockTotal,
        isHot,
      } = req.body;

      // 验证必填字段
      if (!name || !category || !dailyPrice || !deposit) {
        throw new BadRequestError('缺少必填字段');
      }

      const device = await prisma.device.create({
        data: {
          name,
          category,
          brand,
          model,
          specs,
          imageUrls,
          dailyPrice,
          weeklyPrice,
          monthlyPrice,
          deposit,
          stockTotal: stockTotal || 0,
          stockAvailable: stockTotal || 0,
          isHot: isHot || false,
          status: 1,
        },
      });

      res.status(201).json({
        success: true,
        data: device,
        message: '设备创建成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新设备
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const device = await prisma.device.update({
        where: { id: BigInt(id) },
        data: updateData,
      });

      res.json({
        success: true,
        data: device,
        message: '设备更新成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除设备
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.device.delete({
        where: { id: BigInt(id) },
      });

      res.json({
        success: true,
        message: '设备删除成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 切换设备状态
   */
  async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const device = await prisma.device.findUnique({
        where: { id: BigInt(id) },
      });

      if (!device) {
        throw new NotFoundError('设备不存在');
      }

      const newStatus = device.status === 1 ? 0 : 1;

      await prisma.device.update({
        where: { id: BigInt(id) },
        data: { status: newStatus },
      });

      res.json({
        success: true,
        data: { status: newStatus },
        message: `设备已${newStatus === 1 ? '上架' : '下架'}`,
      });
    } catch (error) {
      next(error);
    }
  }
}
