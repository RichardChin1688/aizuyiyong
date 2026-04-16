#!/bin/bash
# 安装阿里云短信 SDK

echo "📦 安装阿里云短信 SDK..."
cd /home/richardchin/.openclaw/workspace/desktop/ai-zuyiyong/backend

npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client

echo ""
echo "✅ 安装完成！"
echo ""
echo "📝 请配置以下环境变量到 .env 文件："
echo "  ALIYUN_ACCESS_KEY_ID=你的 AccessKey ID"
echo "  ALIYUN_ACCESS_KEY_SECRET=你的 AccessKey Secret"
echo "  ALIYUN_SMS_SIGN_NAME=你的短信签名（如：AI 租易用）"
echo "  ALIYUN_SMS_TEMPLATE_CODE=你的短信模板 CODE（如：SMS_2026xxxxx）"
echo ""
