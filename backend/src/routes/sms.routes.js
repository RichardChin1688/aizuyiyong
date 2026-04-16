/**
 * 短信相关 API 路由
 */
const express = require('express');
const router = express.Router();
const smsService = require('../services/sms.service');
const redis = require('../utils/redis');

/**
 * 发送验证码
 * POST /api/v1/sms/send-code
 * Body: { phone: string }
 */
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '请输入正确的 11 位手机号',
      });
    }

    // 检查是否频繁发送（60 秒内只能发送一次）
    const rateLimitKey = `sms:rate:${phone}`;
    const rateLimit = await redis.get(rateLimitKey);
    if (rateLimit) {
      return res.status(429).json({
        success: false,
        message: '发送太频繁，请稍后再试',
      });
    }

    // 生成验证码
    const code = smsService.generateCode(6);

    // 发送短信
    const result = await smsService.sendVerifyCode(phone, code);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.mock ? '模拟发送成功' : `发送失败：${result.message}`,
        mock: result.mock,
      });
    }

    // 存储验证码到 Redis（5 分钟有效期）
    const codeKey = `sms:code:${phone}`;
    await redis.setEx(codeKey, 300, code);

    // 设置发送频率限制（60 秒）
    await redis.setEx(rateLimitKey, 60, '1');

    res.json({
      success: true,
      message: '验证码已发送',
      mock: result.mock,
      expires: 300,
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
});

/**
 * 验证验证码
 * POST /api/v1/sms/verify-code
 * Body: { phone: string, code: string }
 */
router.post('/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '手机号和验证码不能为空',
      });
    }

    // 从 Redis 获取验证码
    const codeKey = `sms:code:${phone}`;
    const storedCode = await redis.get(codeKey);

    if (!storedCode) {
      return res.status(400).json({
        success: false,
        message: '验证码已过期，请重新获取',
      });
    }

    if (storedCode !== code) {
      return res.status(400).json({
        success: false,
        message: '验证码错误',
      });
    }

    // 验证成功后删除验证码（防止重复使用）
    await redis.del(codeKey);

    res.json({
      success: true,
      message: '验证成功',
    });
  } catch (error) {
    console.error('验证验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
    });
  }
});

module.exports = router;
