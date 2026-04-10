# 网站开发技能清单

> 为 AI 足弈佣项目准备的开发技能和工具清单

---

## ✅ OpenClaw 安装状态

| 项目 | 状态 | 版本 |
|------|------|------|
| OpenClaw CLI | ✅ 已安装 | 2026.4.5 |
| npm 全局包 | ✅ 已安装 | openclaw@2026.4.7 |
| Node.js | ✅ 已安装 | v22.22.2 |
| npm | ✅ 已安装 | 10.9.7 |

**结论：** OpenClaw 已正确安装，无需额外安装步骤。

---

## 🛠️ 核心开发技能

### 1. 前端开发

| 技能 | 工具/框架 | 用途 |
|------|-----------|------|
| HTML5/CSS3 | - | 页面结构和样式 |
| JavaScript (ES6+) | - | 交互逻辑 |
| TypeScript | - | 类型安全的 JS |
| React / Vue / Svelte | 任选其一 | 前端框架 |
| Tailwind CSS | - | 实用优先的 CSS 框架 |
| Vite | - | 前端构建工具 |

### 2. 后端开发

| 技能 | 工具/框架 | 用途 |
|------|-----------|------|
| Node.js | ✅ 已安装 | 运行时环境 |
| Express / Fastify / Koa | 任选其一 | Web 框架 |
| RESTful API 设计 | - | API 规范 |
| WebSocket | - | 实时通信 |

### 3. 数据库

| 技能 | 工具 | 用途 |
|------|------|------|
| SQL 基础 | PostgreSQL / MySQL | 关系型数据库 |
| NoSQL | MongoDB / Redis | 文档/缓存数据库 |
| ORM | Prisma / Drizzle | 数据库操作 |

### 4. 版本控制

| 技能 | 工具 | 用途 |
|------|------|------|
| Git 基础 | Git | 版本管理 |
| GitHub / GitLab | - | 代码托管 |
| Git Flow | - | 分支管理策略 |

### 5. 部署与 DevOps

| 技能 | 工具 | 用途 |
|------|------|------|
| Docker | Docker | 容器化 |
| CI/CD | GitHub Actions | 自动化部署 |
| Linux 基础 | Bash | 服务器操作 |
| Nginx | - | 反向代理 |

---

## 🤖 OpenClaw 技能

### 已内置技能

| 技能 | 描述 |
|------|------|
| `feishu-doc` | 飞书文档读写 |
| `feishu-drive` | 飞书云盘管理 |
| `feishu-perm` | 飞书权限管理 |
| `feishu-wiki` | 飞书知识库 |
| `healthcheck` | 主机安全审计 |
| `node-connect` | 节点连接诊断 |
| `skill-creator` | 技能创作工具 |
| `tmux` | 远程终端控制 |
| `weather` | 天气查询 |

### 建议扩展技能

| 技能 | 用途 | 状态 |
|------|------|------|
| `web-dev` | 网站开发辅助 | 待创建 |
| `git-helper` | Git 操作辅助 | 待创建 |
| `deploy-helper` | 部署流程辅助 | 待创建 |
| `code-review` | 代码审查辅助 | 待创建 |

---

## 📦 推荐安装工具

### 开发环境

```bash
# 包管理器 (已安装 npm)
npm --version

# 建议安装
pnpm    # 更快的 npm 替代
yarn    # 另一个包管理器
```

### 代码编辑器

- **VS Code** (推荐)
  - 扩展：Prettier, ESLint, GitLens, Live Server
- **Cursor** (AI 增强版 VS Code)

### 开发工具

```bash
# Git (检查是否安装)
git --version

# Docker (容器化)
docker --version

# 数据库客户端
# - DBeaver (通用数据库)
# - Redis Insight (Redis)
# - MongoDB Compass (MongoDB)
```

### API 测试

- **Postman** / **Insomnia** - API 测试
- **curl** / **httpie** - 命令行 HTTP 客户端

---

## 🚀 快速开始命令

```bash
# 创建新项目
npm create vite@latest ai-zuyiyong -- --template react-ts

# 进入项目
cd ai-zuyiyong

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

---

## 📋 待办事项

- [ ] 确认前端框架选择 (React/Vue/Svelte)
- [ ] 确认后端框架选择 (Express/Fastify)
- [ ] 确认数据库选择 (PostgreSQL/MongoDB)
- [ ] 安装 Git (如未安装)
- [ ] 安装 Docker (如需要容器化)
- [ ] 创建 OpenClaw 自定义技能 (web-dev, git-helper 等)

---

*最后更新：2026-04-08*
*生成者：王德发 (大内总管) 🫡*
