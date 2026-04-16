/**
 * 请求日志中间件
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userPhone?: string;
  requestId: string;
}

/**
 * 请求日志中间件
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = uuidv4();
  (req as AuthenticatedRequest).requestId = requestId;

  const start = Date.now();

  // 响应结束后记录日志
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, path } = req;
    const { statusCode } = res;

    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](`${method} ${path}`, {
      requestId,
      statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}
