FROM node:20-alpine AS builder

WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache openssl

# 复制 package 文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci

# 生成 Prisma Client
RUN npx prisma generate

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# 生产镜像
FROM node:20-alpine AS production

WORKDIR /app

# 安装 OpenSSL (用于加密)
RUN apk add --no-cache openssl

# 复制 package 文件并安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制 Prisma schema 并生成 Client
COPY prisma ./prisma/
RUN npx prisma generate

# 从 builder 复制构建产物
COPY --from=builder /app/dist ./dist

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置权限
RUN chown -R nodejs:nodejs /app

USER nodejs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/index.js"]
