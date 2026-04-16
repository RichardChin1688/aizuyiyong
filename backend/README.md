# AI 租易用后端服务

基于 **Node.js + TypeScript + PostgreSQL + Supabase** 的设备租赁平台后端服务。

## 🚀 技术栈

- **运行时**: Node.js 20+
- **语言**: TypeScript 5
- **框架**: Express 4
- **数据库**: PostgreSQL 15
- **ORM**: Prisma
- **缓存**: Redis 7
- **认证**: JWT
- **部署**: Docker + Docker Compose

## 📦 快速开始

### 1. 环境要求

- Node.js >= 20
- Docker & Docker Compose
- Git

### 2. 克隆项目

```bash
cd /home/richardchin/.openclaw/workspace/desktop/ai-zuyiyong/backend
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

### 5. 启动开发环境

**方式 A: 使用 Docker Compose (推荐)**

```bash
docker-compose up -d
```

启动后访问：
- API: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

**方式 B: 本地运行**

```bash
# 确保 PostgreSQL 和 Redis 已启动
docker-compose up -d postgres redis

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 启动开发服务器
npm run dev
```

### 6. 种子数据 (可选)

```bash
npm run prisma:seed
```

## 📁 项目结构

```
backend/
├── src/
│   ├── controllers/      # 控制器
│   ├── routes/           # 路由
│   ├── services/         # 业务服务
│   ├── middleware/       # 中间件
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型
│   └── index.ts          # 入口文件
├── prisma/
│   ├── schema.prisma     # 数据库模型
│   └── migrations/       # 迁移文件
├── config/               # 配置文件
├── uploads/              # 上传文件
├── logs/                 # 日志文件
├── .env.example          # 环境变量示例
├── docker-compose.yml    # Docker 配置
└── package.json
```

## 🔌 API 文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/sms/send` | 发送验证码 |
| POST | `/api/v1/auth/sms/login` | 验证码登录 |
| POST | `/api/v1/auth/refresh` | 刷新令牌 |
| POST | `/api/v1/auth/logout` | 登出 |
| GET | `/api/v1/auth/me` | 获取当前用户 |

### 设备接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/devices` | 设备列表 |
| GET | `/api/v1/devices/:id` | 设备详情 |
| GET | `/api/v1/devices/hot` | 热门设备 |
| POST | `/api/v1/devices` | 创建设备 (管理员) |
| PUT | `/api/v1/devices/:id` | 更新设备 (管理员) |

### 租赁订单接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/rentals` | 我的订单列表 |
| GET | `/api/v1/rentals/:id` | 订单详情 |
| POST | `/api/v1/rentals` | 创建订单 |
| POST | `/api/v1/rentals/:id/pay` | 支付订单 |
| POST | `/api/v1/rentals/:id/cancel` | 取消订单 |

### Token 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/tokens/packages` | 套餐列表 |
| GET | `/api/v1/tokens/wallet` | 我的钱包 |
| POST | `/api/v1/tokens/recharge` | 充值 |
| POST | `/api/v1/tokens/consume` | 消费 |

完整 API 文档请参考 [API.md](./docs/API.md)

## 🧪 测试

```bash
# 运行测试
npm test

# 运行 ESLint
npm run lint

# TypeScript 检查
npx tsc --noEmit
```

## 📦 生产部署

### Docker 部署

```bash
# 构建镜像
docker build -t ai-zuyiyong-backend .

# 运行容器
docker run -d \
  --name ai-zuyiyong-backend \
  -p 3000:3000 \
  --env-file .env.production \
  ai-zuyiyong-backend
```

### Docker Compose 部署

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 环境变量 (生产)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/ai_zuyiyong
REDIS_HOST=redis-host
JWT_SECRET=your-super-secret-key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

## 🔧 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建 TypeScript
npm run start            # 启动生产服务器

# Prisma
npm run prisma:generate  # 生成 Client
npm run prisma:migrate   # 开发迁移
npm run prisma:studio    # 打开 Studio

# 代码质量
npm run lint             # ESLint
npm test                 # 测试
```

## 📝 数据库模型

项目包含 20 张数据表：

1. **用户模块**: users, user_profiles, user_auth_logs
2. **设备租赁**: devices, rental_orders, rental_addresses
3. **Token 管理**: token_packages, user_token_wallets, token_transactions
4. **订单支付**: orders, order_items, payments
5. **工单客服**: tickets, ticket_messages
6. **消息通知**: notifications
7. **分销系统**: affiliate_codes, affiliate_records
8. **优惠券**: coupons, user_coupons
9. **发票**: invoices
10. **社区**: community_posts, community_comments

详细设计参考 [数据库模型设计.md](../docs/数据库模型设计.md)

## 🛡️ 安全

- JWT 认证 + 刷新令牌
- 请求限流 (防止暴力攻击)
- CORS 配置
- Helmet 安全头
- SQL 注入防护 (Prisma ORM)
- 密码/敏感数据加密存储

## 📄 许可证

MIT

---

**AI 租易用团队** © 2026
