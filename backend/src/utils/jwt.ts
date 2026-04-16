/**
 * JWT 工具
 */

import jwt from 'jsonwebtoken';
import config from '../../config';
import { isTokenBlacklisted, addToBlacklist } from './redis';

export interface JWTPayload {
  userId: number;
  phone: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * 生成访问令牌
 */
export function generateAccessToken(userId: number, phone: string): string {
  const payload: JWTPayload = {
    userId,
    phone,
    type: 'access',
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * 生成刷新令牌
 */
export function generateRefreshToken(userId: number, phone: string): string {
  const payload: JWTPayload = {
    userId,
    phone,
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
}

/**
 * 验证令牌
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  // 检查是否在黑名单中
  const blacklisted = await isTokenBlacklisted(token);
  if (blacklisted) {
    throw new Error('令牌已失效');
  }

  const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
  return decoded;
}

/**
 * 将令牌加入黑名单
 */
export async function blacklistToken(token: string): Promise<void> {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    const expiresIn = decoded.exp ? Math.floor(decoded.exp - Date.now() / 1000) : 3600;
    
    if (expiresIn > 0) {
      await addToBlacklist(token, expiresIn);
    }
  } catch (error) {
    // 忽略解码错误
  }
}

/**
 * 从请求头提取令牌
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  return null;
}
