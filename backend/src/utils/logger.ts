/**
 * 日志工具 - Winston
 */

import winston from 'winston';
import path from 'path';
import config from '../../config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// 自定义日志格式
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// 创建 logger 实例
const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: 'ai-zuyiyong-backend' },
  transports: [
    // 控制台输出 (带颜色)
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // 文件输出
    new winston.transports.File({
      filename: path.resolve(__dirname, '../../', config.logFile),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 错误日志单独文件
    new winston.transports.File({
      filename: path.resolve(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

export default logger;
