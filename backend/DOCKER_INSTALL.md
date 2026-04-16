# 🐳 Docker 安装手册 - AI 租易用后端

**问题：** 当前系统无法直接安装 Docker（需要 sudo 权限）

---

## 📋 解决方案

### 方案一：手动安装 Docker（推荐）

**在终端执行以下命令：**

```bash
# 1. 更新 apt 包索引
sudo apt-get update

# 2. 安装必要的依赖包
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 3. 添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 4. 设置 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. 验证安装
docker --version
docker compose version

# 7. 将当前用户加入 docker 组（避免每次都用 sudo）
sudo usermod -aG docker $USER

# 8. 重启终端或执行
newgrp docker
```

**安装完成后：**

```bash
cd /home/richardchin/.openclaw/workspace/desktop/ai-zuyiyong/backend

# 启动 PostgreSQL + Redis
docker compose up -d postgres redis

# 验证容器运行
docker compose ps

# 查看日志
docker compose logs -f postgres
```

---

### 方案二：使用 WSL2 内置 Docker（如果适用）

**如果您使用的是 WSL2，可能已经安装了 Docker：**

```bash
# 检查 Docker 是否可用
docker --version

# 如果可用，直接启动
cd backend
docker compose up -d postgres redis
```

---

### 方案三：使用云数据库（无需 Docker）

**使用免费的云数据库服务：**

1. **Neon** (PostgreSQL): https://neon.tech
   - 免费 0.5GB
   - 无需安装，注册即得连接字符串

2. **Supabase** (PostgreSQL): https://supabase.com
   - 免费 500MB
   - 自带认证、存储等功能

3. **Aiven** (MySQL/PostgreSQL): https://aiven.io
   - 免费 5GB

**注册后，修改 `.env` 文件：**
```
DATABASE_URL="postgresql://user:password@host:port/database"
```

---

## 🚀 启动开发环境

**Docker 安装完成后：**

```bash
cd /home/richardchin/.openclaw/workspace/desktop/ai-zuyiyong/backend

# 1. 启动数据库
docker compose up -d postgres redis

# 2. 等待数据库就绪（约 10 秒）
sleep 10

# 3. 生成 Prisma Client
npx prisma generate

# 4. 运行数据库迁移
npx prisma migrate dev --name init

# 5. 播种测试数据（可选）
npm run prisma:seed

# 6. 启动开发服务器
npm run dev
```

**访问：** http://localhost:3000

**健康检查：** http://localhost:3000/health

---

## 📞 需要帮助？

联系：大内总管·王德发 🫡
