# Supabase 配置说明

## 📋 目录结构

```
supabase/
├── config.toml          # Supabase 本地开发配置
├── migrations/          # 数据库迁移文件
│   └── 20260411000000_init.sql
├── seed.sql             # 种子数据
└── storage/             # 存储桶配置
    └── buckets.sql
```

## 🚀 本地开发

### 1. 安装 Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Linux/WSL
brew install supabase/tap/supabase

# 或使用 npm
npm install -g supabase
```

### 2. 启动本地 Supabase

```bash
cd backend
supabase start
```

启动后会显示：
- API URL: http://localhost:54321
- Studio URL: http://localhost:54323
- DB URL: postgresql://postgres:postgres@localhost:54322/postgres

### 3. 应用迁移

```bash
supabase db reset  # 重置并应用所有迁移
supabase db push   # 推送 schema 变更
```

### 4. 创建线上项目

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

## 📦 存储桶配置

创建以下存储桶：

1. `avatars` - 用户头像
2. `devices` - 设备图片
3. `invoices` - 发票文件
4. `tickets` - 工单附件
5. `community` - 社区图片

## 🔐 RLS 策略

所有表都需要配置 Row Level Security (RLS)：

```sql
-- 示例：users 表
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的数据
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 用户只能更新自己的数据
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

## 📝 环境变量

从 Supabase Dashboard 获取：
- `SUPABASE_URL`: 项目 URL
- `SUPABASE_ANON_KEY`: 匿名 key (用于前端)
- `SUPABASE_SERVICE_ROLE_KEY`: 服务角色 key (用于后端，保密!)
