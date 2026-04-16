/**
 * 阿里云短信服务
 */
// 阿里云短信服务（如果未安装 SDK，使用模拟模式）
let Dysmsapi20170525, OpenApi;
try {
  Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
  OpenApi = require('@alicloud/openapi-client');
} catch (e) {
  console.log('⚠️ 阿里云 SDK 未安装，使用模拟模式');
}

class SmsService {
  constructor() {
    this.config = new OpenApi.Config({
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      endpoint: 'dysmsapi.aliyuncs.com',
    });
    this.client = new Dysmsapi20170525.default(this.config);
    this.signName = process.env.ALIYUN_SMS_SIGN_NAME || 'AI 租易用';
    this.templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE;
  }

  /**
   * 发送验证码短信
   * @param {string} phone - 手机号
   * @param {string} code - 验证码
   * @returns {Promise<object>} - 发送结果
   */
  async sendVerifyCode(phone, code) {
    if (!this.templateCode) {
      console.warn('⚠️ 阿里云短信模板未配置，使用模拟模式');
      return {
        success: true,
        mock: true,
        message: '模拟发送（模板未配置）',
        code: code,
      };
    }

    try {
      const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
        phoneNumbers: phone,
        signName: this.signName,
        templateCode: this.templateCode,
        templateParam: JSON.stringify({ code: code }),
      });

      const response = await this.client.sendSms(sendSmsRequest);
      
      console.log(`✅ 短信发送成功：${phone}, 验证码：${code}`);
      
      return {
        success: response.body.code === 'OK',
        mock: false,
        message: response.body.message,
        bizId: response.body.bizId,
        code: response.body.code,
      };
    } catch (error) {
      console.error('❌ 短信发送失败:', error.message);
      return {
        success: false,
        mock: false,
        message: error.message,
      };
    }
  }

  /**
   * 生成随机验证码
   * @param {number} length - 验证码长度
   * @returns {string}
   */
  generateCode(length = 6) {
    const chars = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

module.exports = new SmsService();
