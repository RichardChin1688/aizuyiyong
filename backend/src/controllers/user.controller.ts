/**
 * 用户管理控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import logger from '../utils/logger';

export const userController = {
  /**
   * 获取当前用户信息
   */
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          tokenWallet: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('获取用户信息失败', error);
      next(error);
    }
  },

  /**
   * 更新当前用户信息
   */
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { nickname, email, gender } = req.body;

      const updateData: any = {};
      if (nickname !== undefined) updateData.nickname = nickname;
      if (gender !== undefined) updateData.gender = gender;

      // 更新用户基本信息
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      // 更新用户资料
      if (email !== undefined) {
        await prisma.userProfile.upsert({
          where: { userId },
          create: { userId, email },
          update: { email },
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('更新用户信息失败', error);
      next(error);
    }
  },

  /**
   * 更新用户头像
   */
  async updateAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { avatar } = req.body;

      if (!avatar) {
        return res.status(400).json({ error: '头像 URL 不能为空' });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar },
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('更新头像失败', error);
      next(error);
    }
  },

  /**
   * 获取指定用户信息（管理员）
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: BigInt(id) },
        include: {
          profile: true,
          tokenWallet: true,
          rentalOrders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('获取用户信息失败', error);
      next(error);
    }
  },

  /**
   * 更新指定用户信息（管理员）
   */
  async updateUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { nickname, avatar, gender, userType, status } = req.body;

      const updateData: any = {};
      if (nickname !== undefined) updateData.nickname = nickname;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (gender !== undefined) updateData.gender = gender;
      if (userType !== undefined) updateData.userType = userType;
      if (status !== undefined) updateData.status = status;

      const user = await prisma.user.update({
        where: { id: BigInt(id) },
        data: updateData,
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('更新用户信息失败', error);
      next(error);
    }
  },
};
