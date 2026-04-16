/**
 * 认证中间件
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { UnauthorizedError } from './errorHandler';
import { AuthenticatedRequest } from './requestLogger';

/**
 * 认证中间件 - 验证 JWT 令牌
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedError('请提供访问令牌');
    }

    const payload = await verifyToken(token);

    // 将用户信息附加到请求对象
    (req as AuthenticatedRequest).userId = payload.userId;
    (req as AuthenticatedRequest).userPhone = payload.phone;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('令牌验证失败'));
    }
  }
}

/**
 * 可选认证中间件 - 有令牌则验证，没有则继续
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload = await verifyToken(token);
      (req as AuthenticatedRequest).userId = payload.userId;
      (req as AuthenticatedRequest).userPhone = payload.phone;
    }

    next();
  } catch (error) {
    // 忽略错误，继续执行
    next();
  }
}
