/**
 * 认证路由
 */

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /auth/sms/send
 * @desc 发送短信验证码
 * @access Public
 */
router.post('/sms/send', authController.sendSmsCode);

/**
 * @route POST /auth/sms/login
 * @desc 短信验证码登录
 * @access Public
 */
router.post('/sms/login', authController.smsLogin);

/**
 * @route POST /auth/wechat
 * @desc 微信 OAuth 登录
 * @access Public
 */
router.post('/wechat', authController.wechatLogin);

/**
 * @route GET /auth/wechat/callback
 * @desc 微信 OAuth 回调
 * @access Public
 */
router.get('/wechat/callback', authController.wechatCallback);

/**
 * @route POST /auth/alipay
 * @desc 支付宝 OAuth 登录
 * @access Public
 */
router.post('/alipay', authController.alipayLogin);

/**
 * @route GET /auth/alipay/callback
 * @desc 支付宝 OAuth 回调
 * @access Public
 */
router.get('/alipay/callback', authController.alipayCallback);

/**
 * @route POST /auth/refresh
 * @desc 刷新访问令牌
 * @access Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route POST /auth/logout
 * @desc 登出 (将令牌加入黑名单)
 * @access Private
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route GET /auth/me
 * @desc 获取当前用户信息
 * @access Private
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;
