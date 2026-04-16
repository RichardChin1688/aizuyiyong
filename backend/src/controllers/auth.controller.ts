/**
 * 认证控制器
 */

import { Request, Response, NextFunction } from 'express';
import { 
  generateAccessToken, 
  generateRefreshToken,
  blacklistToken 
} from '../utils/jwt';
import { prisma } from '../utils/prisma';
import { setSmsCode, getSmsCode, deleteSmsCode } from '../utils/redis';
import config from '../../config';
import { 
  BadRequestError, 
  UnauthorizedError, 
  NotFoundError,
  ConflictError 
} from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';
import logger from '../utils/logger';

export class AuthController {
  /**
   * 发送短信验证码
   */
  async sendSmsCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.body;

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phone || !phoneRegex.test(phone)) {
        throw new BadRequestError('请输入有效的手机号');
      }

      // 生成验证码
      const code = Math.random().toString().slice(-6);

      // 存储到 Redis
      await setSmsCode(phone, code, config.smsCodeExpiresIn);

      // TODO: 实际项目中需要调用短信服务商 API
      logger.info(`验证码已发送：${phone} - ${code} (开发环境)`);

      res.json({
        success: true,
        message: '验证码已发送',
        expiresIn: config.smsCodeExpiresIn,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 短信验证码登录
   */
  async smsLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, code } = req.body;

      // 验证参数
      if (!phone || !code) {
        throw new BadRequestError('手机号和验证码不能为空');
      }

      // 验证验证码
      const storedCode = await getSmsCode(phone);
      if (!storedCode || storedCode !== code) {
        throw new BadRequestError('验证码错误或已过期');
      }

      // 查找或创建用户
      let user = await prisma.user.findUnique({
        where: { phone },
      });

      if (!user) {
        // 创建新用户
        user = await prisma.user.create({
          data: {
            phone,
            nickname: `用户${phone.slice(-4)}`,
          },
        });

        // 初始化 Token 钱包
        await prisma.userTokenWallet.create({
          data: {
            userId: user.id,
          },
        });
      }

      // 检查用户状态
      if (user.status !== 1) {
        throw new UnauthorizedError('账号已被禁用');
      }

      // 删除验证码
      await deleteSmsCode(phone);

      // 生成令牌
      const accessToken = generateAccessToken(Number(user.id), user.phone);
      const refreshToken = generateRefreshToken(Number(user.id), user.phone);

      // 记录登录日志
      await prisma.userAuthLog.create({
        data: {
          userId: user.id,
          loginType: 1, // 验证码登录
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            nickname: user.nickname,
            avatar: user.avatar,
            userType: user.userType,
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: config.jwtExpiresIn,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 微信 OAuth 登录
   */
  async wechatLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.body;

      if (!code) {
        throw new BadRequestError('授权码不能为空');
      }

      // TODO: 调用微信 OAuth API 获取用户信息
      // const response = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', { ... });
      
      throw new BadRequestError('微信登录暂未实现');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 微信 OAuth 回调
   */
  async wechatCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, state } = req.query;

      // TODO: 处理微信回调
      res.redirect('/auth/wechat/success');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 支付宝 OAuth 登录
   */
  async alipayLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auth_code } = req.body;

      if (!auth_code) {
        throw new BadRequestError('授权码不能为空');
      }

      // TODO: 调用支付宝 OAuth API 获取用户信息
      
      throw new BadRequestError('支付宝登录暂未实现');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 支付宝 OAuth 回调
   */
  async alipayCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auth_code } = req.query;

      // TODO: 处理支付宝回调
      res.redirect('/auth/alipay/success');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new BadRequestError('刷新令牌不能为空');
      }

      // 验证刷新令牌
      const payload = await verifyToken(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('无效的刷新令牌');
      }

      // 生成新的访问令牌
      const newAccessToken = generateAccessToken(payload.userId, payload.phone);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn: config.jwtExpiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 登出
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (token) {
        await blacklistToken(token);
      }

      res.json({
        success: true,
        message: '已登出',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId!) },
        include: {
          profile: true,
          tokenWallet: true,
        },
      });

      if (!user) {
        throw new NotFoundError('用户不存在');
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          gender: user.gender,
          userType: user.userType,
          profile: user.profile,
          tokenWallet: user.tokenWallet,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// 导入 verifyToken (避免循环依赖)
import { verifyToken } from '../utils/jwt';
