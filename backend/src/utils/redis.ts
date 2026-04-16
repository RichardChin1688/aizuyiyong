/**
 * Redis 客户端
 */

import { createClient, RedisClientType } from 'redis';
import config from '../../config';
import logger from './logger';

let redisClient: RedisClientType | null = null;

export async function connectRedis(): Promise<void> {
  if (redisClient) {
    return;
  }

  try {
    const url = config.redisPassword
      ? `redis://:${config.redisPassword}@${config.redisHost}:${config.redisPort}`
      : `redis://${config.redisHost}:${config.redisPort}`;

    redisClient = createClient({ url });

    redisClient.on('error', (err) => {
      logger.error('Redis 错误:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis 已连接');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Redis 连接失败:', error);
    // 非致命错误，继续运行
  }
}

export function getRedisClient(): RedisClientType | null {
  return redisClient;
}

// 验证码相关操作
export async function setSmsCode(phone: string, code: string, expiresInSeconds: number): Promise<void> {
  if (!redisClient) return;
  
  const key = `sms:code:${phone}`;
  await redisClient.setEx(key, expiresInSeconds, code);
}

export async function getSmsCode(phone: string): Promise<string | null> {
  if (!redisClient) return null;
  
  const key = `sms:code:${phone}`;
  return await redisClient.get(key);
}

export async function deleteSmsCode(phone: string): Promise<void> {
  if (!redisClient) return;
  
  const key = `sms:code:${phone}`;
  await redisClient.del(key);
}

// JWT 黑名单 (用于登出)
export async function addToBlacklist(token: string, expiresInSeconds: number): Promise<void> {
  if (!redisClient) return;
  
  const key = `jwt:blacklist:${token}`;
  await redisClient.setEx(key, expiresInSeconds, '1');
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  if (!redisClient) return false;
  
  const key = `jwt:blacklist:${token}`;
  const exists = await redisClient.exists(key);
  return exists === 1;
}

export default redisClient;
