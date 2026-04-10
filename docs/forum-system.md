# 学习论坛系统设计文档

> 项目名称：AI 祖仪用学习论坛  
> 版本：v1.0  
> 设计日期：2026-04-08

---

## 一、论坛架构设计

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端层 (Frontend)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Web 端   │  │  移动端  │  │  小程序  │  │  API 接口 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      应用层 (Application)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 用户系统 │  │ 内容管理 │  │ AI 教学   │  │ 搜索服务 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 消息通知 │  │ 积分系统 │  │  moderation│  │ 数据分析 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       数据层 (Data)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ PostgreSQL│  │  Redis   │  │Elasticsearch│  │  对象存储 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 论坛板块结构

```
📚 学习论坛
│
├── 🎓 主学习区
│   ├── 编程开发
│   │   ├── Python 学习
│   │   ├── Web 前端
│   │   ├── 后端架构
│   │   └── 算法刷题
│   │
│   ├── AI 与机器学习
│   │   ├── AI 基础概念
│   │   ├── 大模型应用
│   │   ├── AI 工具实战
│   │   └── AI 伦理讨论
│   │
│   ├── 设计创意
│   │   ├── UI/UX 设计
│   │   ├── 平面设计
│   │   └── 视频剪辑
│   │
│   └── 职场技能
│       ├── 项目管理
│       ├── 沟通表达
│       └── 时间管理
│
├── 🤖 AI 智能体教学区 (特色板块)
│   ├── Agent 入门教程
│   ├── 智能体实战案例
│   ├── Prompt 工程
│   ├── 多 Agent 协作
│   └── AI 项目展示
│
├── 💬 交流互动区
│   ├── 新手报到
│   ├── 学习打卡
│   ├── 问题求助
│   ├── 经验分享
│   └── 灌水闲聊
│
├── 📢 官方区域
│   ├── 公告通知
│   ├── 活动专区
│   ├── 反馈建议
│   └── 版主申请
│
└── 🏆 精华区域
    ├── 每周精选
    ├── 大神专栏
    └── 学习资源库
```

### 1.3 内容层级结构

```
板块 (Category)
  └── 子板块 (Forum)
        └── 主题帖 (Thread)
              ├── 楼主帖子 (Original Post)
              └── 回复评论 (Reply/Comment)
                    └── 楼中楼 (Nested Reply)
```

---

## 二、AI 智能体教学板块设计

### 2.1 板块定位

打造国内领先的 AI Agent 学习社区，提供从入门到实战的完整学习路径。

### 2.2 核心功能模块

#### 2.2.1 交互式学习路径

```
📖 学习路径系统
│
├── 🌱 入门阶段 (Level 1-3)
│   ├── 什么是 AI Agent
│   ├── Agent 基础概念
│   └── 第一个 Agent 搭建
│
├── 🌿 进阶阶段 (Level 4-6)
│   ├── Prompt 工程技巧
│   ├── 工具调用 (Function Calling)
│   └── 记忆与上下文管理
│
├── 🌳 高级阶段 (Level 7-9)
│   ├── 多 Agent 协作
│   ├── Agent 工作流设计
│   └── 性能优化与调试
│
└── 🏅 专家阶段 (Level 10)
    ├── 自定义 Agent 框架
    ├── 企业级应用部署
    └── 原创项目贡献
```

#### 2.2.2 AI 助教系统

| 功能 | 描述 |
|------|------|
| 🤖 24h 答疑 | AI 助教实时回答学习问题 |
| 📝 代码审查 | 自动审查提交的代码并给出建议 |
| 🎯 个性化推荐 | 根据学习进度推荐内容 |
| 📊 学习分析 | 生成学习报告和薄弱点分析 |
| 🏆 成就系统 | 解锁徽章和等级认证 |

#### 2.2.3 实战项目库

```
项目分类：
├── 🔧 工具类 Agent
│   ├── 自动化办公助手
│   ├── 数据分析 Agent
│   └── 信息收集机器人
│
├── 💼 业务类 Agent
│   ├── 客服对话系统
│   ├── 销售助手
│   └── 内容生成工具
│
├── 🎮 创意类 Agent
│   ├── 游戏 NPC
│   ├── 故事生成器
│   └── 艺术创作助手
│
└── 🔬 研究类 Agent
    ├── 文献综述助手
    ├── 实验设计顾问
    └── 数据分析专家
```

### 2.3 特色功能

#### 2.3.1 Agent 沙盒环境
- 在线代码执行环境
- 预置常用 AI SDK
- 一键部署测试
- 项目模板库

#### 2.3.2 学习小组
- 组队学习功能
- 小组任务挑战
- 同伴代码互评
- 学习进度同步

#### 2.3.3 直播教学
- 定期专家直播
- 录播课程库
- 互动问答环节
- 课后作业提交

---

## 三、SEO 优化策略

### 3.1 技术 SEO

#### 3.1.1 网站结构优化

```yaml
URL 规范:
  - 板块页：/forum/{category-slug}
  - 帖子页：/thread/{thread-id}/{slug}
  - 用户页：/user/{username}
  - 标签页：/tag/{tag-slug}

Sitemap:
  - 动态生成 sitemap.xml
  - 包含所有公开帖子
  - 每日自动更新
  - 提交至搜索引擎

Robots.txt:
  - 允许抓取公开内容
  - 禁止抓取用户隐私
  - 禁止抓取管理后台
```

#### 3.1.2 页面性能优化

| 指标 | 目标值 | 优化措施 |
|------|--------|----------|
| FCP | <1.5s | CDN 加速、图片懒加载 |
| LCP | <2.5s | 服务端渲染、资源预加载 |
| CLS | <0.1 | 固定图片尺寸、字体预加载 |
| TTI | <3.8s | 代码分割、异步加载 |

#### 3.1.3 结构化数据

```json
{
  "@context": "https://schema.org",
  "@type": "DiscussionForumPosting",
  "headline": "帖子标题",
  "author": {
    "@type": "Person",
    "name": "作者名"
  },
  "datePublished": "2026-04-08",
  "discussionUrl": "https://example.com/thread/123",
  "replyCount": 45,
  "upvoteCount": 128
}
```

### 3.2 内容 SEO

#### 3.2.1 关键词策略

```
核心关键词:
  - AI Agent 教程
  - 智能体开发
  - Prompt 工程
  - 大模型应用

长尾关键词:
  - "如何搭建自己的 AI Agent"
  - "Agent 开发入门教程"
  - "AI 智能体实战案例"
  - "大模型应用开发指南"
```

#### 3.2.2 内容优化规范

| 元素 | 要求 |
|------|------|
| 标题 | 包含核心关键词，50-60 字符 |
| Meta 描述 | 150-160 字符，吸引点击 |
| H1 标签 | 每页唯一，包含主关键词 |
| 内链 | 相关帖子互相链接 |
| 图片 Alt | 描述性文字，包含关键词 |
| URL | 语义化，包含关键词 |

### 3.3 外链建设

```
外链策略:
├── 技术博客投稿
│   └── 掘金、思否、知乎专栏
│
├── 开源项目
│   └── GitHub 项目引流
│
├── 社交媒体
│   └── 微博、公众号、B 站
│
└── 合作伙伴
    └── 培训机构、技术社区互链
```

### 3.4 搜索引擎收录监控

```python
# 监控指标
监控项 = {
    "收录量": "site:域名 查询结果数",
    "关键词排名": "核心词前 10 占比",
    "有机流量": "Google Analytics 数据",
    "点击率": "Search Console CTR",
    "索引状态": "URL 检查工具"
}
```

---

## 四、用户交流和氛围营造机制

### 4.1 用户成长体系

#### 4.1.1 等级系统

```
等级 progression:
┌──────┬─────────────┬──────────────┬─────────────┐
│ 等级 │    名称     │   所需积分   │    权益     │
├──────┼─────────────┼──────────────┼─────────────┤
│ Lv1  │   萌新      │     0        │ 基础发帖    │
│ Lv2  │   学徒      │    100       │ 签名档      │
│ Lv3  │   学者      │    500       │ 自定义头像  │
│ Lv4  │   达人      │   1500       │ 专属徽章    │
│ Lv5  │   专家      │   3000       │ 版主申请    │
│ Lv6  │   大师      │   6000       │ 内容置顶    │
│ Lv7  │   宗师      │  10000       │ 专属客服    │
│ Lv8  │   传奇      │  20000       │ 终身荣誉    │
└──────┴─────────────┴──────────────┴─────────────┘
```

#### 4.1.2 积分获取

| 行为 | 积分 | 每日上限 |
|------|------|----------|
| 签到 | +5 | 1 次 |
| 发帖 | +10 | 200 |
| 回复 | +5 | 100 |
| 精华帖 | +100 | - |
| 被点赞 | +2/次 | 50 |
| 分享资源 | +20 | 100 |
| 帮助他人 (采纳) | +50 | - |
| 举报违规 (有效) | +30 | 60 |

### 4.2 社区氛围营造

#### 4.2.1 欢迎机制

```
新用户流程:
1. 注册成功 → 发送欢迎私信 (含新手指南)
2. 首次发帖 → 自动推送至"新手报到"板块
3. 前 3 帖 → 版主优先回复指导
4. 7 天新手期 → 专属新手任务
5. 完成任务 → 获得"新人王"徽章
```

#### 4.2.2 内容激励机制

```
🏆 每周榜单:
├── 热门帖子榜 (按浏览量)
├── 优质内容榜 (按点赞/收藏)
├── 活跃用户榜 (按发帖量)
└── 最佳新人榜 (注册<30 天)

📅 每月活动:
├── 主题征文比赛
├── 技术分享大会
├── 项目展示日
└── 问答挑战赛
```

#### 4.2.3 互动功能

| 功能 | 描述 |
|------|------|
| 👍 点赞 | 表达对内容的认可 |
| ⭐ 收藏 | 保存感兴趣的内容 |
| 🔖 书签 | 标记待读内容 |
| 📤 分享 | 一键分享至社交平台 |
| 📝 引用 | 引用他人回复进行讨论 |
| 🎁 打赏 | 用积分打赏优质内容 |
| 🏷️ 标签 | 为内容添加分类标签 |

### 4.3 社区治理

#### 4.3.1 版主体系

```
版主层级:
├── 超级管理员 (1-2 人)
│   └── 全站管理权限
│
├── 分区版主 (每大区 1 人)
│   └── 管理下辖所有板块
│
├── 板块版主 (每板块 1-3 人)
│   └── 管理单一板块
│
└── 实习版主 (若干)
    └── 学习期，有限权限
```

#### 4.3.2 内容审核

```
审核机制:
├── 自动审核
│   ├── 敏感词过滤
│   ├── 垃圾内容识别
│   └── 重复内容检测
│
├── 人工审核
│   ├── 举报内容处理
│   ├── 新用户首帖
│   └── 争议内容判定
│
└── 社区众裁
    ├── 争议内容投票
    └── 规则修订讨论
```

#### 4.3.3 违规处理

| 违规类型 | 处理方式 |
|----------|----------|
| 轻度违规 | 警告 + 删帖 |
| 中度违规 | 禁言 1-7 天 |
| 重度违规 | 禁言 30 天 + 降权 |
| 严重违规 | 永久封禁 |

### 4.4 社交功能

#### 4.4.1 用户关系

```
关系链:
├── 关注/粉丝
├── 好友 (双向确认)
├── 学习小组
└── 项目团队
```

#### 4.4.2 消息系统

```
消息类型:
├── 系统通知
│   ├── 点赞/评论通知
│   ├── 关注通知
│   └── 系统公告
│
├── 互动消息
│   ├── @提及
│   ├── 回复通知
│   └── 私信
│
└── 任务提醒
    ├── 活动提醒
    └── 学习进度提醒
```

---

## 五、数据库设计

### 5.1 ER 图概览

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │     │  categories │     │    forums   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │────<│ id          │     │ id          │
│ username    │     │ name        │     │ category_id │───┐
│ email       │     │ slug        │     │ name        │    │
│ password    │     │ description │     │ slug        │    │
│ avatar      │     │ sort_order  │     │ description │    │
│ level       │     │ parent_id   │     │ sort_order  │    │
│ points      │     └─────────────┘     └─────────────┘    │
│ created_at  │                                            │
└─────────────┘                                            │
       │                                                   │
       │>──────────────────────────────────────────────────┘
       │
       │     ┌─────────────┐     ┌─────────────┐
       └────>│   threads   │────>│    posts    │
             ├─────────────┤     ├─────────────┤
             │ id          │     │ id          │
             │ forum_id    │     │ thread_id   │
             │ user_id     │     │ user_id     │
             │ title       │     │ content     │
             │ content     │     │ parent_id   │
             │ view_count  │     │ like_count  │
             │ like_count  │     │ created_at  │
             │ created_at  │     └─────────────┘
             └─────────────┘
```

### 5.2 核心表结构

#### 5.2.1 用户表 (users)

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(500),
    signature       VARCHAR(500),
    level           INTEGER DEFAULT 1,
    points          INTEGER DEFAULT 0,
    post_count      INTEGER DEFAULT 0,
    like_count      INTEGER DEFAULT 0,
    follower_count  INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    last_login_at   TIMESTAMP,
    last_login_ip   INET,
    status          VARCHAR(20) DEFAULT 'active',
    banned_until    TIMESTAMP,
    banned_reason   TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_points ON users(points);
```

#### 5.2.2 分类表 (categories)

```sql
CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon        VARCHAR(50),
    color       VARCHAR(20),
    sort_order  INTEGER DEFAULT 0,
    parent_id   BIGINT REFERENCES categories(id),
    is_visible  BOOLEAN DEFAULT true,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```

#### 5.2.3 板块表 (forums)

```sql
CREATE TABLE forums (
    id              BIGSERIAL PRIMARY KEY,
    category_id     BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    icon            VARCHAR(50),
    sort_order      INTEGER DEFAULT 0,
    thread_count    INTEGER DEFAULT 0,
    post_count      INTEGER DEFAULT 0,
    last_post_id    BIGINT,
    last_post_at    TIMESTAMP,
    is_visible      BOOLEAN DEFAULT true,
    is_locked       BOOLEAN DEFAULT false,
    seo_title       VARCHAR(200),
    seo_description VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forums_category ON forums(category_id);
CREATE INDEX idx_forums_slug ON forums(slug);
```

#### 5.2.4 主题帖表 (threads)

```sql
CREATE TABLE threads (
    id              BIGSERIAL PRIMARY KEY,
    forum_id        BIGINT REFERENCES forums(id) ON DELETE CASCADE,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(500),
    content         TEXT NOT NULL,
    content_html    TEXT,
    view_count      INTEGER DEFAULT 0,
    like_count      INTEGER DEFAULT 0,
    dislike_count   INTEGER DEFAULT 0,
    reply_count     INTEGER DEFAULT 0,
    is_pinned       BOOLEAN DEFAULT false,
    is_locked       BOOLEAN DEFAULT false,
    is_featured     BOOLEAN DEFAULT false,
    is_hidden       BOOLEAN DEFAULT false,
    tags            VARCHAR(500)[],
    seo_title       VARCHAR(200),
    seo_description VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_reply_at   TIMESTAMP,
    last_reply_user_id BIGINT
);

CREATE INDEX idx_threads_forum ON threads(forum_id);
CREATE INDEX idx_threads_user ON threads(user_id);
CREATE INDEX idx_threads_created ON threads(created_at DESC);
CREATE INDEX idx_threads_featured ON threads(is_featured) WHERE is_featured = true;
CREATE INDEX idx_threads_tags ON threads USING GIN(tags);
```

#### 5.2.5 回复表 (posts)

```sql
CREATE TABLE posts (
    id              BIGSERIAL PRIMARY KEY,
    thread_id       BIGINT REFERENCES threads(id) ON DELETE CASCADE,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    parent_id       BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    content_html    TEXT,
    like_count      INTEGER DEFAULT 0,
    dislike_count   INTEGER DEFAULT 0,
    is_best_answer  BOOLEAN DEFAULT false,
    is_hidden       BOOLEAN DEFAULT false,
    edited_at       TIMESTAMP,
    edited_by       BIGINT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_thread ON posts(thread_id);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_parent ON posts(parent_id);
CREATE INDEX idx_posts_created ON posts(created_at);
```

#### 5.2.6 用户积分记录表 (user_points_log)

```sql
CREATE TABLE user_points_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
    points      INTEGER NOT NULL,
    reason      VARCHAR(100) NOT NULL,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_points_log_user ON user_points_log(user_id);
CREATE INDEX idx_points_log_created ON user_points_log(created_at);
```

#### 5.2.7 点赞表 (likes)

```sql
CREATE TABLE likes (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
    target_type     VARCHAR(50) NOT NULL,  -- 'thread' or 'post'
    target_id       BIGINT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_likes_user ON likes(user_id);
```

#### 5.2.8 关注表 (follows)

```sql
CREATE TABLE follows (
    id              BIGSERIAL PRIMARY KEY,
    follower_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
    following_id    BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

#### 5.2.9 收藏表 (favorites)

```sql
CREATE TABLE favorites (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
    thread_id       BIGINT REFERENCES threads(id) ON DELETE CASCADE,
    folder_name     VARCHAR(100) DEFAULT '默认',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, thread_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
```

#### 5.2.10 标签表 (tags)

```sql
CREATE TABLE tags (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) UNIQUE NOT NULL,
    slug            VARCHAR(50) UNIQUE NOT NULL,
    description     TEXT,
    thread_count    INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_slug ON tags(slug);
```

#### 5.2.11 学习进度表 (learning_progress)

```sql
CREATE TABLE learning_progress (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
    course_id       BIGINT NOT NULL,
    lesson_id       BIGINT NOT NULL,
    status          VARCHAR(20) DEFAULT 'not_started',
    progress        INTEGER DEFAULT 0,
    completed_at    TIMESTAMP,
    score           INTEGER,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id, lesson_id)
);

CREATE INDEX idx_progress_user ON learning_progress(user_id);
CREATE INDEX idx_progress_course ON learning_progress(course_id);
```

#### 5.2.12 成就徽章表 (achievements)

```sql
CREATE TABLE achievements (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
    badge_id        BIGINT NOT NULL,
    earned_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_displayed    BOOLEAN DEFAULT true,
    UNIQUE(user_id, badge_id)
);

CREATE TABLE badges (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    icon_url        VARCHAR(500),
    requirement     JSONB,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.3 数据库优化策略

```sql
-- 分区表 (按时间分区)
CREATE TABLE posts_partitioned (
    LIKE posts INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- 物化视图 (热门帖子)
CREATE MATERIALIZED VIEW mv_hot_threads AS
SELECT 
    t.id,
    t.title,
    t.forum_id,
    t.view_count,
    t.like_count,
    t.reply_count,
    (t.view_count * 0.3 + t.like_count * 0.5 + t.reply_count * 0.2) as hot_score
FROM threads t
WHERE t.is_hidden = false
ORDER BY hot_score DESC;

-- 定期刷新
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hot_threads;
```

---

## 六、功能模块清单

### 6.1 核心功能

| 模块 | 功能点 | 优先级 |
|------|--------|--------|
| 用户系统 | 注册/登录/找回密码 | P0 |
| 用户系统 | 个人信息管理 | P0 |
| 用户系统 | 头像上传 | P1 |
| 内容系统 | 发帖/编辑/删除 | P0 |
| 内容系统 | 回复/楼中楼 | P0 |
| 内容系统 | 富文本编辑器 | P0 |
| 内容系统 | 代码高亮 | P1 |
| 内容系统 | 图片上传 | P0 |
| 互动系统 | 点赞/点踩 | P0 |
| 互动系统 | 收藏 | P1 |
| 互动系统 | 关注 | P1 |
| 互动系统 | 私信 | P2 |
| 搜索系统 | 全文搜索 | P0 |
| 搜索系统 | 高级筛选 | P1 |
| 通知系统 | 站内通知 | P0 |
| 通知系统 | 邮件通知 | P1 |

### 6.2 AI 教学特色功能

| 模块 | 功能点 | 优先级 |
|------|--------|--------|
| 学习路径 | 课程目录展示 | P0 |
| 学习路径 | 进度追踪 | P0 |
| 学习路径 | 成就系统 | P1 |
| AI 助教 | 智能答疑 | P0 |
| AI 助教 | 代码审查 | P1 |
| AI 助教 | 个性化推荐 | P1 |
| 实战项目 | 项目模板库 | P0 |
| 实战项目 | 在线沙盒 | P1 |
| 实战项目 | 项目展示 | P1 |
| 学习小组 | 组队功能 | P2 |
| 学习小组 | 任务挑战 | P2 |

### 6.3 管理功能

| 模块 | 功能点 | 优先级 |
|------|--------|--------|
| 内容管理 | 帖子审核 | P0 |
| 内容管理 | 置顶/加精/锁定 | P0 |
| 内容管理 | 移动/删除 | P0 |
| 用户管理 | 禁言/封禁 | P0 |
| 用户管理 | 权限管理 | P0 |
| 板块管理 | 板块增删改 | P0 |
| 数据统计 | 访问统计 | P1 |
| 数据统计 | 用户分析 | P1 |
| 系统设置 | SEO 配置 | P1 |
| 系统设置 | 敏感词管理 | P0 |

---

## 七、技术栈推荐

### 7.1 后端

```yaml
语言: 
  - Node.js (TypeScript) / Go / Python

框架:
  - NestJS / Express / FastAPI

数据库:
  - PostgreSQL (主库)
  - Redis (缓存/会话)
  - Elasticsearch (搜索)

消息队列:
  - RabbitMQ / Kafka

对象存储:
  - AWS S3 / 阿里云 OSS / 七牛云
```

### 7.2 前端

```yaml
框架:
  - Next.js (SSR/SEO 友好)
  - React / Vue 3

UI 库:
  - Tailwind CSS + Headless UI
  - Ant Design / Element Plus

状态管理:
  - Zustand / Pinia

编辑器:
  - TipTap / Quill
```

### 7.3 部署

```yaml
容器化:
  - Docker + Docker Compose

编排:
  - Kubernetes (生产环境)

CI/CD:
  - GitHub Actions / GitLab CI

监控:
  - Prometheus + Grafana
  - Sentry (错误追踪)
```

---

## 八、项目里程碑

```
Phase 1 (MVP - 4 周):
├── 用户系统 (注册/登录/个人信息)
├── 基础发帖功能
├── 板块管理
└── 基础搜索

Phase 2 (核心功能 - 4 周):
├── 回复/楼中楼
├── 点赞/收藏/关注
├── 通知系统
└── 富文本编辑器

Phase 3 (AI 教学 - 6 周):
├── 学习路径系统
├── AI 助教集成
├── 实战项目库
└── 成就系统

Phase 4 (优化运营 - 4 周):
├── SEO 优化
├── 数据分析
├── 管理后台
└── 性能优化

Phase 5 (扩展功能 - 持续):
├── 移动端适配
├── 小程序
├── 直播功能
└── 国际化
```

---

## 附录

### A. API 设计规范

```yaml
RESTful 规范:
  - GET    /api/threads          # 获取帖子列表
  - POST   /api/threads          # 创建帖子
  - GET    /api/threads/:id      # 获取帖子详情
  - PUT    /api/threads/:id      # 更新帖子
  - DELETE /api/threads/:id      # 删除帖子

响应格式:
{
  "code": 200,
  "message": "success",
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

### B. 敏感词过滤规则

```
分类:
  - 政治敏感
  - 色情低俗
  - 暴力恐怖
  - 广告 spam
  - 人身攻击
  - 隐私泄露

处理方式:
  - 自动替换 (*)
  - 进入审核队列
  - 直接拦截
```

### C. 备份策略

```
数据库备份:
  - 每日全量备份 (凌晨 3 点)
  - 每小时增量备份
  - 保留 30 天

文件备份:
  - 实时同步到对象存储
  - 跨区域冗余

恢复测试:
  - 每月一次恢复演练
```

---

*文档版本：v1.0*  
*最后更新：2026-04-08*  
*设计者：小学子 - 论坛系统*
