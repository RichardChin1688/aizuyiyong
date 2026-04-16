/**
 * 应用配置
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  // 服务器配置
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Supabase 配置
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // 数据库配置
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis 配置
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || '',

  // JWT 配置
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // 验证码配置
  smsCodeExpiresIn: parseInt(process.env.SMS_CODE_EXPIRES_IN || '300', 10),
  smsCodeLength: parseInt(process.env.SMS_CODE_LENGTH || '6', 10),

  // 微信 OAuth 配置
  wechatAppId: process.env.WECHAT_APP_ID || '',
  wechatAppSecret: process.env.WECHAT_APP_SECRET || '',
  wechatRedirectUri: process.env.WECHAT_REDIRECT_URI || '',

  // 支付宝 OAuth 配置
  alipayAppId: process.env.ALIPAY_APP_ID || '',
  alipayPrivateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
  alipayRedirectUri: process.env.ALIPAY_REDIRECT_URI || '',

  // 邮件配置
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',

  // 日志配置
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',

  // 跨域配置
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // 上传配置
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
};

export default config;
