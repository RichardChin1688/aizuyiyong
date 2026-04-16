# Nginx 配置说明

## 📋 文件说明

- `nginx.conf` - 主配置文件
- `ssl/` - SSL 证书目录

## 🚀 部署步骤

### 1. 获取 SSL 证书

使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.ai-zuyiyong.com
```

证书会自动保存到：
- `/etc/letsencrypt/live/api.ai-zuyiyong.com/fullchain.pem`
- `/etc/letsencrypt/live/api.ai-zuyiyong.com/privkey.pem`

### 2. 复制配置文件

```bash
sudo cp nginx/nginx.conf /etc/nginx/sites-available/ai-zuyiyong-api
sudo ln -s /etc/nginx/sites-available/ai-zuyiyong-api /etc/nginx/sites-enabled/
```

### 3. 测试配置

```bash
sudo nginx -t
```

### 4. 重载 Nginx

```bash
sudo systemctl reload nginx
```

## 🔧 配置要点

### 限流配置

- 短信接口：1 请求/秒 (防止短信轰炸)
- 通用 API: 10 请求/秒

### 安全头

- HSTS (强制 HTTPS)
- X-Frame-Options (防止点击劫持)
- X-Content-Type-Options (防止 MIME 嗅探)
- X-XSS-Protection (XSS 防护)

### 性能优化

- HTTP/2 支持
- SSL 会话缓存
- Keepalive 连接
- 静态文件缓存 (30 天)

## 📝 防火墙配置

确保开放端口：

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```
