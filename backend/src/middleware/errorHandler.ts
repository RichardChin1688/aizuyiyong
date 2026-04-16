/**
 * 错误处理中间件
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '未授权访问') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '禁止访问') {
    super(message, 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message = '请求参数错误') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = '资源冲突') {
    super(message, 409);
  }
}

export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
}

/**
 * 错误处理中间件
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 记录错误日志
  logger.error(`错误：${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 处理 Prisma 错误
  if (err.name === 'PrismaClientKnownRequestError') {
    const error = err as any;
    res.status(400).json({
      error: 'DATABASE_ERROR',
      message: '数据库操作失败',
      code: error.code,
    } as ErrorResponse);
    return;
  }

  // 处理 Prisma 验证错误
  if (err.name === 'PrismaClientValidationError') {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: '数据验证失败',
    } as ErrorResponse);
    return;
  }

  // 处理 JWT 错误
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'INVALID_TOKEN',
      message: '令牌无效',
    } as ErrorResponse);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'TOKEN_EXPIRED',
      message: '令牌已过期',
    } as ErrorResponse);
    return;
  }

  // 处理自定义应用错误
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: getErrorName(err.statusCode),
      message: err.message,
    } as ErrorResponse);
    return;
  }

  // 未知错误 (生产环境不暴露详细信息)
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message;

  res.status(statusCode).json({
    error: 'INTERNAL_ERROR',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  } as ErrorResponse);
}

function getErrorName(statusCode: number): string {
  const errorNames: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    500: 'INTERNAL_ERROR',
  };
  return errorNames[statusCode] || 'ERROR';
}
