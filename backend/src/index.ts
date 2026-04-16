/**
 * AI 租易用后端服务
 * 主入口文件
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 导入配置
import config from '../config';

// 导入路由
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import deviceRoutes from './routes/device.routes';
import rentalRoutes from './routes/rental.routes';
import orderRoutes from './routes/order.routes';
import tokenRoutes from './routes/token.routes';
import paymentRoutes from './routes/payment.routes';
import ticketRoutes from './routes/ticket.routes';
import notificationRoutes from './routes/notification.routes';
import affiliateRoutes from './routes/affiliate.routes';
import couponRoutes from './routes/coupon.routes';
import invoiceRoutes from './routes/invoice.routes';
import communityRoutes from './routes/community.routes';
import smsRoutes from './routes/sms.routes';

// 导入中间件
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// 导入工具
import logger from './utils/logger';
import { connectRedis } from './utils/redis';
import { prisma } from './utils/prisma';

// 创建 Express 应用
const app: Express = express();

// ==================== 中间件配置 ====================

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // API 服务不需要 CSP
}));

// CORS 配置
app.use(cors({
  origin: config.corsOrigin.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// 请求限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 个请求
  message: { error: '请求过于频繁，请稍后再试' },
});
app.use('/api/', limiter);

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use(requestLogger);

// 静态文件 (上传目录)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// 前端静态文件（网页文件）
app.use(express.static(path.resolve(__dirname, '../../')));

// ==================== API 路由 ====================

const apiPrefix = config.apiPrefix;

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ai-zuyiyong-backend',
    version: '1.0.0',
  });
});

// API 路由
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/devices`, deviceRoutes);
app.use(`${apiPrefix}/rentals`, rentalRoutes);
app.use(`${apiPrefix}/orders`, orderRoutes);
app.use(`${apiPrefix}/tokens`, tokenRoutes);
app.use(`${apiPrefix}/payments`, paymentRoutes);
app.use(`${apiPrefix}/tickets`, ticketRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
app.use(`${apiPrefix}/affiliates`, affiliateRoutes);
app.use(`${apiPrefix}/coupons`, couponRoutes);
app.use(`${apiPrefix}/invoices`, invoiceRoutes);
app.use(`${apiPrefix}/community`, communityRoutes);
app.use(`${apiPrefix}/sms`, smsRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `路由 ${req.method} ${req.path} 不存在`,
  });
});

// 错误处理中间件
app.use(errorHandler);

// ==================== 服务启动 ====================

async function bootstrap() {
  try {
    // 测试数据库连接
    await prisma.$connect();
    logger.info('✅ 数据库连接成功');

    // 连接 Redis
    await connectRedis();
    logger.info('✅ Redis 连接成功');

    // 启动 HTTP 服务器
    app.listen(config.port, () => {
      logger.info(`
╔════════════════════════════════════════════════════════╗
║           AI 租易用后端服务已启动                       ║
╠════════════════════════════════════════════════════════╣
║  环境：${config.nodeEnv.padEnd(10)}端口：${String(config.port).padEnd(6)}                   
║  API: http://localhost:${config.port}${apiPrefix}                   
║  健康检查：http://localhost:${config.port}/health                   
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  logger.info('👋 正在关闭服务...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('👋 收到 SIGTERM 信号，正在关闭...');
  await prisma.$disconnect();
  process.exit(0);
});

// 启动服务
bootstrap();

export default app;
