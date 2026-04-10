# AI 租易用 - 技术架构设计文档

> 版本：v1.0  
> 创建日期：2026-04-08  
> 技术负责人：王德发

---

## 一、技术选型

### 1.1 前端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **框架** | Next.js 14+ | App Router，SSR/SSG 支持，SEO 友好 |
| **语言** | TypeScript 5+ | 类型安全，开发体验好 |
| **UI 库** | Tailwind CSS + shadcn/ui | 快速开发，移动端优先 |
| **状态管理** | Zustand | 轻量级，比 Redux 更简洁 |
| **表单处理** | React Hook Form + Zod | 表单验证 |
| **HTTP 客户端** | Axios + TanStack Query | 数据请求与缓存 |
| **图表** | Recharts | 数据可视化 |
| **富文本** | Tiptap | 论坛编辑器 |

### 1.2 后端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **运行时** | Node.js 20+ | LTS 版本 |
| **API 框架** | Next.js API Routes / Hono | 轻量高效 |
| **数据库** | PostgreSQL 15+ | 关系型数据 |
| **ORM** | Prisma | 类型安全的数据库访问 |
| **缓存** | Redis 7+ | 会话、热点数据 |
| **消息队列** | BullMQ | 异步任务处理 |
| **认证** | NextAuth.js (Auth.js) | 多 Provider 支持 |
| **支付** | 支付宝 + 微信支付 | 国内主流支付 |
| **对象存储** | 阿里云 OSS / 七牛云 | 文件存储 |

### 1.3 基础设施

| 服务 | 推荐方案 | 说明 |
|------|----------|------|
| **部署** | Vercel / Docker + K8s | 前端 Vercel，后端自建 |
| **CDN** | 阿里云 CDN / Cloudflare | 静态资源加速 |
| **监控** | Sentry + Prometheus | 错误追踪 + 性能监控 |
| **日志** | ELK Stack | 日志收集分析 |
| **CI/CD** | GitHub Actions | 自动化部署 |

---

## 二、系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户层 (Users)                            │
│    C 端用户 │ 企业客户 │ 分销商 │ 管理员 │ 内容创作者              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      接入层 (Edge Layer)                         │
│         CDN │ WAF │ 负载均衡 │ SSL 终止 │ 限流                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    应用层 (Application Layer)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │  Next.js    │ │  API Gateway│ │  WebSocket  │ │  定时任务  │  │
│  │  (SSR/SSG)  │ │  (Hono)     │ │  Server     │ │  (BullMQ) │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     服务层 (Service Layer)                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ 用户服务│ │ 订单服务│ │ 支付服务│ │ 分销服务│ │ 内容服务│        │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ 租赁服务│ │ 算力服务│ │ 项目服务│ │ 论坛服务│ │ 通知服务│        │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     数据层 (Data Layer)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │ PostgreSQL  │ │   Redis     │ │    OSS      │ │  Elasticsearch│ │
│  │ (主数据库)  │ │  (缓存/会话)│ │  (文件存储)  │ │  (搜索)    │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、项目目录结构

```
ai-zuyiyong/
├── .github/                          # GitHub 配置
│   ├── workflows/                    # CI/CD 流程
│   │   ├── ci.yml                    # 持续集成
│   │   ├── deploy-prod.yml           # 生产部署
│   │   └── deploy-staging.yml        # 测试部署
│   └── ISSUE_TEMPLATE/               # Issue 模板
│
├── apps/                             # 多应用架构
│   ├── web/                          # 主网站 (Next.js)
│   │   ├── src/
│   │   │   ├── app/                  # App Router 路由
│   │   │   │   ├── (marketing)/      # 营销页面组
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx      # 首页
│   │   │   │   │   ├── about/        # 关于我们
│   │   │   │   │   ├── pricing/      # 价格页面
│   │   │   │   │   └── contact/      # 联系我们
│   │   │   │   │
│   │   │   │   ├── (shop)/           # 商城页面组
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── products/     # 产品列表
│   │   │   │   │   │   ├── devices/  # 设备租赁
│   │   │   │   │   │   └── compute/  # 算力套餐
│   │   │   │   │   ├── product/[slug]/ # 产品详情
│   │   │   │   │   ├── cart/         # 购物车
│   │   │   │   │   └── checkout/     # 结算
│   │   │   │   │
│   │   │   │   ├── (forum)/          # 论坛页面组
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── community/    # 社区首页
│   │   │   │   │   ├── category/[slug]/ # 分类
│   │   │   │   │   ├── topic/[id]/   # 帖子详情
│   │   │   │   │   └── create/       # 发帖
│   │   │   │   │
│   │   │   │   ├── (dashboard)/      # 后台页面组
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── dashboard/    # 仪表盘
│   │   │   │   │   ├── orders/       # 订单管理
│   │   │   │   │   ├── rentals/      # 租赁管理
│   │   │   │   │   ├── compute/      # 算力管理
│   │   │   │   │   ├── projects/     # 项目管理
│   │   │   │   │   ├── distribution/ # 分销管理
│   │   │   │   │   ├── settings/     # 设置
│   │   │   │   │   └── enterprise/   # 企业后台
│   │   │   │   │
│   │   │   │   ├── api/              # API 路由
│   │   │   │   │   ├── auth/         # 认证相关
│   │   │   │   │   ├── users/        # 用户相关
│   │   │   │   │   ├── orders/       # 订单相关
│   │   │   │   │   ├── payments/     # 支付相关
│   │   │   │   │   ├── distribution/ # 分销相关
│   │   │   │   │   └── upload/       # 文件上传
│   │   │   │   │
│   │   │   │   ├── login/            # 登录
│   │   │   │   ├── register/         # 注册
│   │   │   │   └── legal/            # 法律页面
│   │   │   │       ├── privacy/      # 隐私政策
│   │   │   │       └── terms/        # 服务条款
│   │   │   │
│   │   │   ├── components/           # 组件
│   │   │   │   ├── ui/               # 基础 UI 组件 (shadcn)
│   │   │   │   ├── marketing/        # 营销组件
│   │   │   │   ├── shop/             # 商城组件
│   │   │   │   ├── forum/            # 论坛组件
│   │   │   │   ├── dashboard/        # 后台组件
│   │   │   │   └── shared/           # 共享组件
│   │   │   │
│   │   │   ├── lib/                  # 工具库
│   │   │   │   ├── api/              # API 客户端
│   │   │   │   ├── auth/             # 认证工具
│   │   │   │   ├── db/               # 数据库工具
│   │   │   │   ├── utils/            # 通用工具
│   │   │   │   └── validators/       # 数据验证
│   │   │   │
│   │   │   ├── hooks/                # 自定义 Hooks
│   │   │   ├── stores/               # Zustand 状态
│   │   │   ├── types/                # TypeScript 类型
│   │   │   └── styles/               # 样式文件
│   │   │
│   │   ├── public/                   # 静态资源
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   └── icons/
│   │   │
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── admin/                        # 管理后台 (可选独立)
│   │   └── ...                       # 类似 web 结构
│   │
│   └── api/                          # 独立 API 服务
│       ├── src/
│       │   ├── modules/              # 业务模块
│       │   │   ├── user/             # 用户模块
│       │   │   ├── order/            # 订单模块
│       │   │   ├── rental/           # 租赁模块
│       │   │   ├── compute/          # 算力模块
│       │   │   ├── project/          # 项目模块
│       │   │   ├── forum/            # 论坛模块
│       │   │   ├── distribution/     # 分销模块
│       │   │   └── notification/     # 通知模块
│       │   │
│       │   ├── common/               # 公共代码
│       │   │   ├── filters/          # 过滤器
│       │   │   ├── guards/           # 守卫
│       │   │   ├── interceptors/     # 拦截器
│       │   │   └── decorators/       # 装饰器
│       │   │
│       │   ├── config/               # 配置文件
│       │   └── main.ts               # 入口文件
│       │
│       └── package.json
│
├── packages/                         # 共享包
│   ├── database/                     # 数据库相关
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Prisma 模型
│   │   │   ├── migrations/           # 数据库迁移
│   │   │   └── seeds/                # 种子数据
│   │   └── src/
│   │       ├── client.ts             # 数据库客户端
│   │       └── index.ts
│   │
│   ├── shared/                       # 共享代码
│   │   ├── types/                    # 共享类型
│   │   ├── constants/                # 常量
│   │   ├── utils/                    # 工具函数
│   │   └── i18n/                     # 国际化
│   │
│   └── ui/                           # 共享 UI 组件
│       └── src/
│
├── infrastructure/                   # 基础设施配置
│   ├── docker/
│   │   ├── docker-compose.yml        # 本地开发
│   │   ├── docker-compose.prod.yml   # 生产环境
│   │   └── services/
│   │       ├── postgres/
│   │       ├── redis/
│   │       └── nginx/
│   │
│   ├── k8s/                          # Kubernetes 配置
│   │   ├── deployments/
│   │   ├── services/
│   │   └── ingress/
│   │
│   └── terraform/                    # IaC 配置
│
├── scripts/                          # 脚本工具
│   ├── setup.sh                      # 环境初始化
│   ├── deploy.sh                     # 部署脚本
│   ├── backup.sh                     # 备份脚本
│   └── migrate.sh                    # 数据库迁移
│
├── docs/                             # 文档
│   ├── api/                          # API 文档
│   ├── architecture/                 # 架构文档
│   ├── deployment/                   # 部署文档
│   └── user-guide/                   # 用户指南
│
├── .env.example                      # 环境变量示例
├── .gitignore
├── README.md
├── turbo.json                        # Turborepo 配置
└── package.json                      # 根 package.json
```

---

## 四、核心业务模块设计

### 4.1 设备租赁模块

```
功能：
- 设备展示（分类、筛选、搜索）
- 库存管理
- 租赁周期管理（日租/周租/月租）
- 押金管理
- 物流跟踪
- 设备归还/续租

数据库表：
- devices (设备信息)
- device_inventory (库存)
- rentals (租赁订单)
- rental_logs (租赁日志)
- shipments (物流信息)
```

### 4.2 算力套餐模块

```
功能：
- 套餐展示（按 Token 量/时长）
- 在线充值
- Token 余额查询
- 使用记录
- 自动续费

数据库表：
- compute_plans (算力套餐)
- user_compute_balance (用户余额)
- compute_transactions (交易记录)
- compute_usage_logs (使用日志)
```

### 4.3 AI 定制开发模块

```
功能：
- 需求提交表单
- 项目报价
- 合同管理
- 进度跟踪
- 交付验收
- 售后服务

数据库表：
- projects (项目)
- project_requirements (需求)
- project_quotes (报价)
- project_contracts (合同)
- project_milestones (里程碑)
- project_deliverables (交付物)
```

### 4.4 学习论坛模块

```
功能：
- 分类管理
- 帖子 CRUD
- 评论/回复
- 点赞/收藏
- 用户等级/积分
- 内容审核
- 搜索

数据库表：
- forum_categories (分类)
- forum_topics (主题)
- forum_posts (帖子)
- forum_comments (评论)
- forum_likes (点赞)
- forum_bookmarks (收藏)
- user_reputations (用户声望)
```

### 4.5 用户/企业后台模块

```
功能：
- 多角色权限（RBAC）
- 个人/企业资料
- 订单管理
- 发票管理
- API Key 管理
- 操作日志

数据库表：
- users (用户)
- enterprises (企业)
- enterprise_members (企业成员)
- roles (角色)
- permissions (权限)
- user_roles (用户角色)
- api_keys (API 密钥)
- audit_logs (审计日志)
```

### 4.6 三级分销模块

```
功能：
- 推广码生成
- 推广链接追踪
- 三级佣金计算
- 佣金提现
- 分销商等级
- 业绩统计

数据库表：
- distributors (分销商)
- distribution_codes (推广码)
- distribution_relations (推广关系)
- distribution_commissions (佣金)
- distribution_withdrawals (提现)
- distribution_levels (等级)
```

---

## 五、数据库设计（核心表）

### 5.1 Prisma Schema 示例

```prisma
// 用户
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phone         String?   @unique
  password      String
  name          String?
  avatar        String?
  role          Role      @default(USER)
  enterpriseId  String?
  enterprise    Enterprise? @relation(fields: [enterpriseId], references: [id])
  
  // 分销关系
  distributorId String?
  distributor   Distributor? @relation(fields: [distributorId], references: [id])
  invitees      User[]    @relation("Inviter")
  inviter       User?     @relation("Inviter", fields: [inviterId], references: [id])
  inviterId     String?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  orders        Order[]
  rentals       Rental[]
  projects      Project[]
}

enum Role {
  USER
  ENTERPRISE
  DISTRIBUTOR
  ADMIN
  SUPER_ADMIN
}

// 设备
model Device {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String
  specs       Json
  images      String[]
  category    String
  status      DeviceStatus @default(AVAILABLE)
  
  // 租赁信息
  dailyRate   Decimal
  weeklyRate  Decimal
  monthlyRate Decimal
  deposit     Decimal
  inventory   Int
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  rentals     Rental[]
}

enum DeviceStatus {
  AVAILABLE
  RENTING
  MAINTENANCE
  SOLD_OUT
}

// 租赁订单
model Rental {
  id          String   @id @default(uuid())
  orderNo     String   @unique
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  deviceId    String
  device      Device   @relation(fields: [deviceId], references: [id])
  
  startDate   DateTime
  endDate     DateTime
  totalAmount Decimal
  deposit     Decimal
  status      RentalStatus @default(PENDING)
  
  // 物流
  shippingAddress Json
  trackingNo  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum RentalStatus {
  PENDING
  PAID
  SHIPPED
  RENTING
  RETURNED
  COMPLETED
  CANCELLED
}

// 算力套餐
model ComputePlan {
  id          String   @id @default(uuid())
  name        String
  tokenAmount Int
  price       Decimal
  validityDays Int
  description String?
  isPopular   Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  transactions ComputeTransaction[]
}

// 佣金
model DistributionCommission {
  id          String   @id @default(uuid())
  userId      String
  orderId     String
  level       Int      // 1/2/3 级
  rate        Decimal  // 佣金比例
  amount      Decimal  // 佣金金额
  status      CommissionStatus @default(PENDING)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum CommissionStatus {
  PENDING
  CONFIRMED
  PAID
  CANCELLED
}
```

---

## 六、SEO 优化策略

### 6.1 技术方案

```yaml
静态生成 (SSG):
  - 首页
  - 产品列表页
  - 产品分类页
  - 论坛分类页
  - 法律页面

服务端渲染 (SSR):
  - 产品详情页
  - 帖子详情页
  - 用户个人主页
  - 搜索结果页

增量静态再生 (ISR):
  - 价格页面
  - 热门帖子
  - 产品列表（定期更新）
```

### 6.2 SEO 配置

```typescript
// next.config.js
module.exports = {
  // Sitemap
  sitemap: {
    paths: ['/'],
    exclude: ['/dashboard/*', '/admin/*'],
  },
  
  // 元数据
  metadata: {
    title: 'AI 租易用 - 设备租赁 | 算力套餐 | AI 定制开发',
    description: '专业的 AI 设备租赁平台，提供预装 OpenClaw 的电脑租赁、Token 算力套餐、AI 定制开发服务',
    keywords: ['AI 设备租赁', '算力套餐', 'OpenClaw', 'AI 定制'],
  },
  
  // 结构化数据
  structuredData: {
    organization: {...},
    product: {...},
    breadcrumb: {...},
  },
}
```

### 6.3 移动端适配

```css
/* Tailwind 响应式断点 */
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 小屏笔记本 */
xl: 1280px  /* 桌面 */
2xl: 1536px /* 大屏 */

/* 移动优先设计 */
- 使用 flex/grid 布局
- 图片响应式 (next/image)
- 触摸友好的按钮尺寸 (最小 44px)
- 避免悬停依赖
- 测试 PWA 支持
```

---

## 七、安全策略

### 7.1 认证与授权

```
- JWT Token (短期) + Refresh Token (长期)
- 双因素认证 (2FA) 可选
- 会话管理 (Redis 存储)
- RBAC 权限控制
- API 速率限制
```

### 7.2 数据安全

```
- HTTPS 强制
- 敏感数据加密存储
- SQL 注入防护 (Prisma ORM)
- XSS 防护 (React 默认转义)
- CSRF Token
- 输入验证 (Zod)
```

### 7.3 支付安全

```
- 支付宝/微信官方 SDK
- 支付回调签名验证
- 金额二次确认
- 防重放攻击
- 交易日志审计
```

---

## 八、性能优化

### 8.1 前端优化

```
- 代码分割 (动态 import)
- 图片优化 (WebP, next/image)
- 字体优化 (font-display: swap)
- 预加载关键资源
- 缓存策略 (SWR/TanStack Query)
- Bundle 分析
```

### 8.2 后端优化

```
- 数据库连接池
- Redis 缓存热点数据
- 异步任务队列 (BullMQ)
- API 响应压缩
- 数据库索引优化
- 慢查询监控
```

### 8.3 CDN 策略

```
静态资源:
  - JS/CSS: 长期缓存 + 哈希文件名
  - 图片: 按需加载 + WebP
  - 字体: 子集化 + 长期缓存

动态内容:
  - API 响应：不缓存或短期缓存
  - 用户页面：不缓存
```

---

## 九、部署架构

### 9.1 开发环境

```bash
# 本地开发
docker-compose up -d postgres redis

# 启动开发服务器
pnpm dev  # Turborepo 并行启动所有应用
```

### 9.2 生产环境

```
方案 A: Vercel + 自建后端
  - 前端：Vercel (全球 CDN)
  - API: 阿里云 ECS / 腾讯云 CVM
  - 数据库：阿里云 RDS PostgreSQL
  - 缓存：阿里云 Redis

方案 B: 全自建 (K8s)
  - 前端 + 后端：Kubernetes 集群
  - 数据库：PostgreSQL 主从
  - 缓存：Redis Cluster
  - 负载均衡：Nginx Ingress
```

### 9.3 CI/CD 流程

```
1. 代码提交 → GitHub
2. 触发 GitHub Actions
3. 运行测试 (单元测试 + E2E)
4. 构建 Docker 镜像
5. 推送镜像到 Registry
6. 部署到 Staging
7. 人工审核
8. 部署到 Production
9. 健康检查
10. 通知 (钉钉/企业微信)
```

---

## 十、技术债务管理

### 10.1 代码质量

```
- ESLint + Prettier (代码规范)
- TypeScript strict 模式
- 单元测试覆盖率 > 80%
- E2E 测试 (关键流程)
- Code Review 流程
```

### 10.2 监控告警

```
- Sentry: 错误追踪
- Prometheus + Grafana: 性能监控
- Uptime Robot: 可用性监控
- 日志聚合：ELK Stack
- 告警通知：钉钉/企业微信
```

---

## 十一、开发路线图

### Phase 1 (MVP - 4 周)
```
- [ ] 基础框架搭建
- [ ] 用户认证系统
- [ ] 设备租赁核心流程
- [ ] 支付集成
- [ ] 基础后台
```

### Phase 2 (6 周)
```
- [ ] 算力套餐模块
- [ ] 分销系统
- [ ] 论坛模块
- [ ] 企业后台
```

### Phase 3 (4 周)
```
- [ ] AI 定制开发模块
- [ ] 数据分析仪表盘
- [ ] 移动端优化
- [ ] SEO 优化
```

### Phase 4 (持续)
```
- [ ] 性能优化
- [ ] 功能迭代
- [ ] 用户反馈改进
```

---

## 十二、联系方式

**技术负责人**: 王德发  
**邮箱**: [待填写]  
**项目仓库**: [待填写]  

---

*文档版本控制：每次重大架构变更需更新此文档并通知团队成员*
