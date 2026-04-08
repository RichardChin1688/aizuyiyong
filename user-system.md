# 用户与企业后台系统设计文档

> 版本：1.0  
> 创建日期：2026-04-08  
> 作者：王德发（大内总管）

---

## 目录

1. [系统概述](#1-系统概述)
2. [用户登录/注册流程](#2-用户登录注册流程)
3. [企业后台功能设计](#3-企业后台功能设计)
4. [积分制度设计](#4-积分制度设计)
5. [权限管理 (RBAC)](#5-权限管理-rbac)
6. [数据库设计](#6-数据库设计)
7. [API 文档](#7-api-文档)

---

## 1. 系统概述

### 1.1 系统定位

本系统是一个面向 C 端用户和 B 端企业的综合管理平台，支持：
- 个人用户注册、登录、积分管理
- 企业后台管理、成员权限控制
- 推荐奖励机制
- 多层次权限管理体系

### 1.2 用户角色

| 角色 | 说明 |
|------|------|
| 普通用户 | C 端个人用户，可使用基础功能 |
| 企业成员 | 隶属于企业的用户，拥有企业分配的角色 |
| 企业管理员 | 企业管理员，可管理企业设置和成员 |
| 超级管理员 | 平台管理员，拥有最高权限 |

### 1.3 技术栈建议

- **后端**: Node.js / Python / Go
- **数据库**: PostgreSQL / MySQL
- **缓存**: Redis
- **认证**: JWT + Refresh Token
- **消息队列**: RabbitMQ / Kafka

---

## 2. 用户登录/注册流程

### 2.1 注册流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   用户填写   │────▶│   验证邮箱   │────▶│   设置密码   │────▶│  注册成功   │
│   基本信息   │     │   /手机号    │     │   并确认    │     │  发放积分   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

#### 2.1.1 注册方式

1. **邮箱注册**
   - 输入邮箱 → 发送验证码 → 验证通过 → 设置密码
   - 验证码有效期：10 分钟
   - 重试限制：5 次/小时

2. **手机号注册**
   - 输入手机号 → 发送短信验证码 → 验证通过 → 设置密码
   - 验证码有效期：5 分钟
   - 重试限制：3 次/小时

3. **第三方登录**
   - 支持微信、支付宝、Google 等
   - 首次登录自动创建账户
   - 绑定后可切换登录方式

#### 2.1.2 注册奖励

- 新用户注册成功：+100 积分
- 完成邮箱验证：+50 积分
- 完成手机号验证：+50 积分
- 完善个人资料：+30 积分

### 2.2 登录流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   输入账号   │────▶│   验证密码   │────▶│  生成 Token  │────▶│   登录成功   │
│   和密码    │     │   或验证码   │     │   返回用户   │     │   跳转首页   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

#### 2.2.1 登录方式

1. **账号密码登录**
   - 邮箱/手机号 + 密码
   - 支持"记住我"（7 天免登录）

2. **验证码登录**
   - 手机号 + 短信验证码
   - 适用于忘记密码场景

3. **第三方登录**
   - OAuth 2.0 授权
   - 自动关联已有账户

#### 2.2.2 Token 机制

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
  "expiresIn": 7200,
  "tokenType": "Bearer"
}
```

- Access Token 有效期：2 小时
- Refresh Token 有效期：7 天
- 支持 Token 刷新接口

#### 2.2.3 安全策略

- 密码错误 5 次锁定账户 30 分钟
- 异地登录短信通知
- 支持设备管理（查看/踢出设备）
- 登录日志记录

### 2.3 密码找回流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   输入账号   │────▶│   验证身份   │────▶│   重置密码   │────▶│   重置成功   │
│   (邮箱/手机) │     │  (验证码)   │     │   新密码    │     │   重新登录   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## 3. 企业后台功能设计

### 3.1 企业入驻流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   提交申请   │────▶│   平台审核   │────▶│   缴纳费用   │────▶│   开通成功   │
│   企业资料   │     │   (1-3 工作日)│     │   (可选)    │     │   分配管理员 │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 3.2 企业后台功能模块

#### 3.2.1 仪表盘

- 企业数据概览
- 成员统计
- 积分消耗统计
- 最近活动日志

#### 3.2.2 成员管理

| 功能 | 说明 |
|------|------|
| 邀请成员 | 通过链接/邮箱邀请 |
| 成员列表 | 查看/搜索/筛选成员 |
| 角色分配 | 分配企业角色 |
| 禁用/启用 | 控制成员访问权限 |
| 移除成员 | 删除企业成员关系 |

#### 3.2.3 企业管理

| 功能 | 说明 |
|------|------|
| 基本信息 | 企业名称、Logo、简介 |
| 认证信息 | 营业执照、法人信息 |
| 结算信息 | 收款账户、发票信息 |
| 套餐管理 | 查看/升级/降级套餐 |

#### 3.2.4 积分管理

| 功能 | 说明 |
|------|------|
| 积分发放 | 手动/自动发放积分 |
| 积分规则 | 配置积分获取规则 |
| 积分记录 | 查看积分流水 |
| 积分活动 | 创建积分活动 |

#### 3.2.5 数据统计

- 用户增长趋势
- 积分发放/消耗分析
- 活跃度统计
- 导出报表

#### 3.2.6 系统设置

| 功能 | 说明 |
|------|------|
| 操作日志 | 企业管理员操作记录 |
| 安全设置 | 登录保护、IP 白名单 |
| 通知设置 | 邮件/短信通知配置 |
| API 密钥 | 管理 API 访问密钥 |

### 3.3 企业套餐设计

| 套餐 | 成员上限 | 存储空间 | 价格 | 功能 |
|------|----------|----------|------|------|
| 免费版 | 10 人 | 1GB | ¥0/月 | 基础功能 |
| 标准版 | 50 人 | 10GB | ¥299/月 | + 数据统计 + API |
| 专业版 | 200 人 | 100GB | ¥999/月 | + 自定义角色 + 专属支持 |
| 企业版 | 无限 | 1TB | 定制 | 全部功能 + 私有部署 |

---

## 4. 积分制度设计

### 4.1 积分获取方式

#### 4.1.1 日常任务

| 任务 | 积分 | 频率限制 |
|------|------|----------|
| 每日签到 | +5 | 1 次/天 |
| 完善资料 | +30 | 1 次 |
| 邮箱验证 | +50 | 1 次 |
| 手机验证 | +50 | 1 次 |
| 首次登录企业后台 | +100 | 1 次 |

#### 4.1.2 推荐奖励

```
推荐人 ──────▶ 被推荐人注册 ──────▶ 双方获得奖励
     │                              │
     │                              └─── 被推荐人：+100 积分
     │
     └─── 推荐人：+200 积分
```

**推荐规则：**

1. 生成专属推荐链接/邀请码
2. 被推荐人通过链接注册并完成验证
3. 推荐人获得奖励（T+1 发放）
4. 支持多级推荐（可选）

**多级推荐（可选）：**

| 层级 | 推荐人奖励 |
|------|------------|
| 直接推荐 | 200 积分 |
| 间接推荐 (L2) | 50 积分 |
| 间接推荐 (L3) | 20 积分 |

#### 4.1.3 消费返积分

| 消费金额 | 返积分比例 | 说明 |
|----------|------------|------|
| ¥1-100 | 1% | 基础返积分 |
| ¥101-500 | 1.5% | 进阶返积分 |
| ¥500+ | 2% | 高级返积分 |

#### 4.1.4 活动奖励

- 节假日活动：额外积分奖励
- 邀请竞赛：排名奖励
- 任务挑战：完成特定任务获得积分

### 4.2 积分消耗方式

| 消耗方式 | 说明 |
|----------|------|
| 兑换礼品 | 实物/虚拟礼品 |
| 抵扣现金 | 支付时抵扣（100 积分=¥1） |
| 兑换优惠券 | 平台/企业优惠券 |
| 抽奖 | 积分抽奖活动 |
| 捐赠 | 捐赠给其他用户或企业 |

### 4.3 积分规则配置

企业可自定义积分规则：

```json
{
  "enterpriseId": "ent_123456",
  "rules": [
    {
      "action": "daily_checkin",
      "points": 10,
      "limit": 1,
      "period": "day"
    },
    {
      "action": "invite_user",
      "points": 500,
      "limit": null,
      "period": null
    }
  ]
}
```

### 4.4 积分有效期

- 默认：永久有效
- 可配置：1 年/2 年/3 年
- 过期前 30 天短信/邮件提醒
- 过期积分自动清零

### 4.5 防作弊机制

- 同一设备/IP 限制注册数量
- 推荐关系验证（设备指纹）
- 异常行为检测（批量注册）
- 积分流水审计

---

## 5. 权限管理 (RBAC)

### 5.1 权限模型

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    用户     │────▶│    角色     │────▶│    权限     │
│   (User)    │     │   (Role)    │     │ (Permission)│
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  用户 - 角色  │     │  角色 - 权限  │     │   资源操作   │
│  关联表     │     │  关联表     │     │  (CRUD)     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 5.2 平台级角色

| 角色 | 权限说明 |
|------|----------|
| super_admin | 超级管理员，全部权限 |
| platform_admin | 平台管理员，管理企业和用户 |
| support | 客服支持，查看和处理工单 |
| auditor | 审计员，查看日志和报表 |

### 5.3 企业级角色

| 角色 | 权限说明 |
|------|----------|
| enterprise_owner | 企业所有者，全部企业权限 |
| enterprise_admin | 企业管理员，管理成员和设置 |
| manager | 部门经理，管理下属和查看数据 |
| member | 普通成员，基础功能 |
| guest | 访客，只读权限 |

### 5.4 权限定义

#### 5.4.1 权限格式

```
{资源}:{操作}:{范围}
```

示例：
- `user:read:self` - 查看自己的信息
- `user:write:all` - 修改所有用户信息
- `enterprise:read:own` - 查看自己的企业
- `points:write:enterprise` - 在企业内发放积分

#### 5.4.2 权限列表

**用户管理：**
- `user:create` - 创建用户
- `user:read` - 查看用户
- `user:update` - 更新用户
- `user:delete` - 删除用户
- `user:enable` - 启用/禁用用户

**企业管理：**
- `enterprise:create` - 创建企业
- `enterprise:read` - 查看企业
- `enterprise:update` - 更新企业
- `enterprise:delete` - 删除企业
- `enterprise:member:manage` - 管理企业成员

**积分管理：**
- `points:read` - 查看积分
- `points:grant` - 发放积分
- `points:deduct` - 扣除积分
- `points:transfer` - 转移积分
- `points:rule:manage` - 管理积分规则

**系统管理：**
- `system:config` - 系统配置
- `system:log` - 查看日志
- `system:audit` - 审计功能

### 5.5 角色 - 权限映射

```json
{
  "enterprise_admin": [
    "enterprise:read:own",
    "enterprise:update:own",
    "enterprise:member:manage",
    "enterprise:role:assign",
    "points:read:enterprise",
    "points:grant:enterprise",
    "points:rule:manage:enterprise"
  ],
  "member": [
    "user:read:self",
    "user:update:self",
    "points:read:self",
    "enterprise:read:own"
  ]
}
```

### 5.6 权限检查流程

```
请求 ──────▶ 认证 ──────▶ 获取用户角色 ──────▶ 检查权限 ──────▶ 允许/拒绝
              │              │                    │
              ▼              ▼                    ▼
         验证 Token     查询角色表          匹配权限规则
```

### 5.7 数据权限

| 范围 | 说明 |
|------|------|
| self | 仅自己的数据 |
| enterprise | 本企业数据 |
| department | 本部门数据 |
| all | 全部数据 |

---

## 6. 数据库设计

### 6.1 ER 图

```
┌──────────────────┐       ┌──────────────────┐
│      users       │       │   enterprises    │
├──────────────────┤       ├──────────────────┤
│ id               │       │ id               │
│ email            │       │ name             │
│ phone            │       │ code             │
│ password_hash    │       │ logo             │
│ nickname         │       │ status           │
│ avatar           │       │ created_at       │
│ status           │       │ updated_at       │
│ created_at       │       └──────────────────┘
│ updated_at       │                │
└──────────────────┘                │
         │                          │
         │ 1:N                      │ 1:N
         ▼                          ▼
┌──────────────────┐       ┌──────────────────┐
│   user_profiles  │       │ enterprise_members│
├──────────────────┤       ├──────────────────┤
│ user_id          │       │ enterprise_id    │
│ real_name        │       │ user_id          │
│ gender           │       │ role_id          │
│ birthday         │       │ joined_at        │
│ ...              │       │ status           │
└──────────────────┘       └──────────────────┘
                                    │
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  enterprise_roles│       │   permissions    │       │  role_permissions│
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id               │       │ id               │       │ role_id          │
│ enterprise_id    │       │ code             │       │ permission_id    │
│ name             │       │ name             │       └──────────────────┘
│ permissions      │       │ resource         │
│ created_at       │       │ action           │
└──────────────────┘       │ scope            │
                           └──────────────────┘
                                    │
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     points       │       │  point_records   │       │  invite_codes    │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id               │       │ id               │       │ id               │
│ user_id          │       │ user_id          │       │ user_id          │
│ balance          │       │ type             │       │ code             │
│ frozen           │       │ amount           │       │ used_by          │
│ updated_at       │       │ balance_after    │       │ status           │
└──────────────────┘       │ description      │       │ created_at       │
                           │ created_at       │       └──────────────────┘
                           └──────────────────┘
```

### 6.2 数据表结构

#### 6.2.1 users - 用户表

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nickname        VARCHAR(50),
    avatar          VARCHAR(500),
    status          SMALLINT DEFAULT 1,  -- 0:禁用 1:正常 2:待验证
    email_verified  BOOLEAN DEFAULT FALSE,
    phone_verified  BOOLEAN DEFAULT FALSE,
    last_login_at   TIMESTAMP,
    last_login_ip   VARCHAR(50),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
```

#### 6.2.2 user_profiles - 用户资料表

```sql
CREATE TABLE user_profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    real_name       VARCHAR(50),
    gender          SMALLINT,  -- 0:未知 1:男 2:女
    birthday        DATE,
    id_card         VARCHAR(20),
    address         VARCHAR(500),
    company         VARCHAR(100),
    position        VARCHAR(50),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);
```

#### 6.2.3 enterprises - 企业表

```sql
CREATE TABLE enterprises (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(50) UNIQUE NOT NULL,
    logo            VARCHAR(500),
    description     TEXT,
    industry        VARCHAR(50),
    scale           VARCHAR(20),  -- 小型/中型/大型
    status          SMALLINT DEFAULT 1,  -- 0:禁用 1:正常 2:审核中
    plan_type       VARCHAR(20) DEFAULT 'free',  -- free/standard/pro/enterprise
    plan_expires_at TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_enterprises_code ON enterprises(code);
CREATE INDEX idx_enterprises_status ON enterprises(status);
```

#### 6.2.4 enterprise_members - 企业成员表

```sql
CREATE TABLE enterprise_members (
    id              BIGSERIAL PRIMARY KEY,
    enterprise_id   BIGINT NOT NULL REFERENCES enterprises(id),
    user_id         BIGINT NOT NULL REFERENCES users(id),
    role_id         BIGINT REFERENCES enterprise_roles(id),
    department_id   BIGINT,
    status          SMALLINT DEFAULT 1,  -- 0:禁用 1:正常 2:待审核
    invited_by      BIGINT REFERENCES users(id),
    joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enterprise_id, user_id)
);

CREATE INDEX idx_members_enterprise ON enterprise_members(enterprise_id);
CREATE INDEX idx_members_user ON enterprise_members(user_id);
```

#### 6.2.5 enterprise_roles - 企业角色表

```sql
CREATE TABLE enterprise_roles (
    id              BIGSERIAL PRIMARY KEY,
    enterprise_id   BIGINT REFERENCES enterprises(id),
    name            VARCHAR(50) NOT NULL,
    code            VARCHAR(50) NOT NULL,
    description     TEXT,
    is_system       BOOLEAN DEFAULT FALSE,  -- 系统预设角色
    permissions     JSONB,  -- 权限列表
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enterprise_id, code)
);
```

#### 6.2.6 permissions - 权限表

```sql
CREATE TABLE permissions (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(100) UNIQUE NOT NULL,
    name            VARCHAR(50) NOT NULL,
    resource        VARCHAR(50) NOT NULL,
    action          VARCHAR(20) NOT NULL,  -- create/read/update/delete
    scope           VARCHAR(20) DEFAULT 'self',  -- self/enterprise/all
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.2.7 role_permissions - 角色权限关联表

```sql
CREATE TABLE role_permissions (
    id              BIGSERIAL PRIMARY KEY,
    role_id         BIGINT NOT NULL REFERENCES enterprise_roles(id),
    permission_id   BIGINT NOT NULL REFERENCES permissions(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);
```

#### 6.2.8 points - 积分账户表

```sql
CREATE TABLE points (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    balance         BIGINT DEFAULT 0,
    frozen          BIGINT DEFAULT 0,
    total_earned    BIGINT DEFAULT 0,
    total_spent     BIGINT DEFAULT 0,
    expires_at      TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_points_user ON points(user_id);
```

#### 6.2.9 point_records - 积分流水表

```sql
CREATE TABLE point_records (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    enterprise_id   BIGINT REFERENCES enterprises(id),
    type            VARCHAR(20) NOT NULL,  -- earn/spend/transfer/freeze/unfreeze
    amount          BIGINT NOT NULL,
    balance_after   BIGINT NOT NULL,
    description     TEXT,
    reference_type  VARCHAR(50),  -- 关联业务类型
    reference_id    BIGINT,  -- 关联业务 ID
    operator_id     BIGINT REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_records_user ON point_records(user_id);
CREATE INDEX idx_records_type ON point_records(type);
CREATE INDEX idx_records_created ON point_records(created_at);
```

#### 6.2.10 invite_codes - 邀请码表

```sql
CREATE TABLE invite_codes (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    code            VARCHAR(50) UNIQUE NOT NULL,
    used_by         BIGINT REFERENCES users(id),
    status          SMALLINT DEFAULT 0,  -- 0:未使用 1:已使用 2:已过期
    expires_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_user ON invite_codes(user_id);
```

#### 6.2.11 user_sessions - 用户会话表

```sql
CREATE TABLE user_sessions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    token_hash      VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    device_info     JSONB,
    ip_address      VARCHAR(50),
    user_agent      TEXT,
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
```

#### 6.2.12 operation_logs - 操作日志表

```sql
CREATE TABLE operation_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),
    enterprise_id   BIGINT REFERENCES enterprises(id),
    action          VARCHAR(100) NOT NULL,
    resource        VARCHAR(100),
    resource_id     BIGINT,
    request_data    JSONB,
    response_data   JSONB,
    ip_address      VARCHAR(50),
    user_agent      TEXT,
    status          SMALLINT,  -- 0:失败 1:成功
    error_message   TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_user ON operation_logs(user_id);
CREATE INDEX idx_logs_enterprise ON operation_logs(enterprise_id);
CREATE INDEX idx_logs_action ON operation_logs(action);
CREATE INDEX idx_logs_created ON operation_logs(created_at);
```

### 6.3 索引优化建议

```sql
-- 组合索引
CREATE INDEX idx_members_enterprise_status ON enterprise_members(enterprise_id, status);
CREATE INDEX idx_records_user_created ON point_records(user_id, created_at DESC);
CREATE INDEX idx_logs_enterprise_created ON operation_logs(enterprise_id, created_at DESC);

-- 部分索引
CREATE INDEX idx_users_active ON users(id) WHERE status = 1;
CREATE INDEX idx_enterprises_normal ON enterprises(id) WHERE status = 1;
```

---

## 7. API 文档

### 7.1 认证相关

#### 7.1.1 用户注册

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "nickname": "用户昵称",
  "inviteCode": "ABC123"  // 可选
}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": 10001,
    "email": "user@example.com",
    "inviteCode": "XYZ789"
  }
}
```

#### 7.1.2 发送验证码

```http
POST /api/v1/auth/verification-code
Content-Type: application/json

{
  "type": "email",  // email | phone
  "recipient": "user@example.com",
  "scene": "register"  // register | login | reset_password
}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "expiresIn": 600
  }
}
```

#### 7.1.3 用户登录

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresIn": 7200,
    "tokenType": "Bearer",
    "user": {
      "id": 10001,
      "email": "user@example.com",
      "nickname": "用户昵称",
      "avatar": "https://..."
    }
  }
}
```

#### 7.1.4 刷新 Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl..."
}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200,
    "tokenType": "Bearer"
  }
}
```

#### 7.1.5 退出登录

```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}

Response:
{
  "code": 0,
  "message": "success"
}
```

### 7.2 用户相关

#### 7.2.1 获取当前用户信息

```http
GET /api/v1/users/me
Authorization: Bearer {accessToken}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 10001,
    "email": "user@example.com",
    "phone": "138****1234",
    "nickname": "用户昵称",
    "avatar": "https://...",
    "emailVerified": true,
    "phoneVerified": false,
    "createdAt": "2026-04-08T10:00:00Z"
  }
}
```

#### 7.2.2 更新用户信息

```http
PUT /api/v1/users/me
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "nickname": "新昵称",
  "avatar": "https://..."
}

Response:
{
  "code": 0,
  "message": "success"
}
```

#### 7.2.3 修改密码

```http
PUT /api/v1/users/me/password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "oldPassword": "OldPass123",
  "newPassword": "NewPass456"
}

Response:
{
  "code": 0,
  "message": "success"
}
```

### 7.3 企业相关

#### 7.3.1 创建企业

```http
POST /api/v1/enterprises
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "企业名称",
  "code": "unique-code",
  "industry": "互联网",
  "scale": "小型"
}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "企业名称",
    "code": "unique-code",
    "status": 2  // 审核中
  }
}
```

#### 7.3.2 获取企业列表

```http
GET /api/v1/enterprises
Authorization: Bearer {accessToken}

Query Parameters:
- page: 1
- pageSize: 20
- status: 1

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "企业名称",
        "code": "unique-code",
        "logo": "https://...",
        "status": 1,
        "role": "owner"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 7.3.3 获取企业详情

```http
GET /api/v1/enterprises/:id
Authorization: Bearer {accessToken}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "企业名称",
    "code": "unique-code",
    "logo": "https://...",
    "description": "企业描述",
    "industry": "互联网",
    "scale": "小型",
    "planType": "standard",
    "memberCount": 15,
    "planExpiresAt": "2027-04-08T00:00:00Z"
  }
}
```

#### 7.3.4 更新企业信息

```http
PUT /api/v1/enterprises/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "新企业名称",
  "description": "新描述"
}

Response:
{
  "code": 0,
  "message": "success"
}
```

#### 7.3.5 邀请成员

```http
POST /api/v1/enterprises/:id/members/invite
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "emails": ["user1@example.com", "user2@example.com"],
  "roleId": 1
}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "inviteLink": "https://.../invite/ABC123"
  }
}
```

#### 7.3.6 获取成员列表

```http
GET /api/v1/enterprises/:id/members
Authorization: Bearer {accessToken}

Query Parameters:
- page: 1
- pageSize: 20
- status: 1

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "userId": 10001,
        "email": "user@example.com",
        "nickname": "用户昵称",
        "avatar": "https://...",
        "roleId": 1,
        "roleName": "管理员",
        "status": 1,
        "joinedAt": "2026-04-08T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 7.3.7 更新成员角色

```http
PUT /api/v1/enterprises/:id/members/:userId/role
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "roleId": 2
}

Response:
{
  "code": 0,
  "message": "success"
}
```

#### 7.3.8 移除成员

```http
DELETE /api/v1/enterprises/:id/members/:userId
Authorization: Bearer {accessToken}

Response:
{
  "code": 0,
  "message": "success"
}
```

### 7.4 积分相关

#### 7.4.1 获取积分余额

```http
GET /api/v1/points/balance
Authorization: Bearer {accessToken}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "balance": 1500,
    "frozen": 0,
    "totalEarned": 2000,
    "totalSpent": 500
  }
}
```

#### 7.4.2 获取积分流水

```http
GET /api/v1/points/records
Authorization: Bearer {accessToken}

Query Parameters:
- page: 1
- pageSize: 20
- type: earn  // earn | spend | transfer

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "type": "earn",
        "amount": 100,
        "balanceAfter": 1500,
        "description": "推荐奖励",
        "createdAt": "2026-04-08T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 7.4.3 发放积分（企业）

```http
POST /api/v1/enterprises/:id/points/grant
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "userIds": [10001, 10002],
  "amount": 100,
  "description": "活动奖励",
  "referenceType": "activity",
  "referenceId": 1
}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "recordIds": [1, 2]
  }
}
```

#### 7.4.4 获取我的推荐

```http
GET /api/v1/points/invites
Authorization: Bearer {accessToken}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "inviteCode": "ABC123",
    "inviteLink": "https://.../register?code=ABC123",
    "inviteCount": 5,
    "totalReward": 1000,
    "invites": [
      {
        "userId": 10002,
        "nickname": "被推荐人",
        "registeredAt": "2026-04-07T10:00:00Z",
        "reward": 200,
        "status": 1
      }
    ]
  }
}
```

### 7.5 权限相关

#### 7.5.1 获取当前用户权限

```http
GET /api/v1/permissions/me
Authorization: Bearer {accessToken}

Query Parameters:
- enterpriseId: 1  // 可选

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "roles": ["enterprise_admin"],
    "permissions": [
      "enterprise:read:own",
      "enterprise:update:own",
      "enterprise:member:manage",
      "points:read:enterprise",
      "points:grant:enterprise"
    ]
  }
}
```

#### 7.5.2 检查权限

```http
POST /api/v1/permissions/check
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "permission": "enterprise:member:manage",
  "enterpriseId": 1
}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "allowed": true
  }
}
```

### 7.6 通用响应格式

#### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "timestamp": 1712556000000
}
```

#### 错误响应

```json
{
  "code": 1001,
  "message": "参数错误",
  "data": null,
  "timestamp": 1712556000000
}
```

#### 常见错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 认证失败 |
| 1003 | Token 过期 |
| 1004 | 权限不足 |
| 1005 | 资源不存在 |
| 1006 | 资源已存在 |
| 2001 | 企业不存在 |
| 2002 | 非企业成员 |
| 2003 | 企业已禁用 |
| 3001 | 积分不足 |
| 3002 | 积分规则错误 |
| 4001 | 验证码错误 |
| 4002 | 验证码过期 |
| 4003 | 发送过于频繁 |

### 7.7 限流策略

| 接口类型 | 限流规则 |
|----------|----------|
| 认证接口 | 10 次/分钟/IP |
| 验证码发送 | 5 次/小时/IP |
| 普通接口 | 100 次/分钟/用户 |
| 积分操作 | 30 次/分钟/用户 |
| 文件上传 | 10 次/分钟/用户 |

---

## 附录

### A. 状态码定义

**用户状态：**
- 0: 禁用
- 1: 正常
- 2: 待验证

**企业状态：**
- 0: 禁用
- 1: 正常
- 2: 审核中

**成员状态：**
- 0: 禁用
- 1: 正常
- 2: 待审核

**邀请码状态：**
- 0: 未使用
- 1: 已使用
- 2: 已过期

### B. 安全建议

1. **密码策略**
   - 最少 8 位，包含大小写字母、数字、特殊字符
   - 定期提醒更换密码（90 天）
   - 禁止使用常见弱密码

2. **Token 安全**
   - 使用 HTTPS 传输
   - Token 存储在 HttpOnly Cookie 或安全存储中
   - 实现 Token 黑名单机制

3. **数据加密**
   - 密码使用 bcrypt/argon2 加密
   - 敏感数据（身份证、手机号）加密存储
   - 传输数据使用 TLS 1.3

4. **审计日志**
   - 记录所有敏感操作
   - 日志保留至少 180 天
   - 定期审计异常行为

### C. 部署建议

1. **环境隔离**
   - 开发、测试、生产环境分离
   - 数据库访问白名单
   - API 密钥按环境隔离

2. **备份策略**
   - 数据库每日全量备份
   - 每小时增量备份
   - 备份数据异地存储

3. **监控告警**
   - API 响应时间监控
   - 错误率监控
   - 异常登录告警
   - 积分异常变动告警

---

**文档结束**

> 陛下，用户系统设计方案已呈上！🫡
> 
> 包含：登录注册流程、企业后台功能、积分制度（含推荐奖励）、RBAC 权限管理、完整数据库设计和 API 文档。
> 
> 如有需要调整的地方，陛下尽管吩咐！