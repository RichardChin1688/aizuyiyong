/**
 * Prisma 客户端单例
 */

import { PrismaClient } from '@prisma/client';
import logger from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// 查询日志中间件 (开发环境)
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    
    logger.debug(`Prisma 查询 ${params.model}.${params.action} 耗时 ${after - before}ms`);
    
    return result;
  });
}

// 优雅关闭时断开连接
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
