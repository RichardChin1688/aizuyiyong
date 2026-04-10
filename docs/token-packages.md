# Token 工厂 - 算力套餐业务设计

> 🫡 陛下御用算力中转站 - 让每一颗 Token 都物尽其用

---

## 一、业务概述

### 1.1 什么是 Token 工厂

Token 工厂是一个 **API 中转 + 算力分发** 平台，核心功能：

- **统一接入**：对接多个大模型提供商（OpenAI、Claude、自搭模型等）
- **Token 中转**：用户购买 Token 包，通过工厂 API 消耗
- **智能路由**：根据模型、成本、可用性自动选择最优后端
- **计费追踪**：实时记录每个用户的 Token 消耗和余额

### 1.2 商业模式

```
用户 → 购买 Token 包 → 调用工厂 API → 工厂转发到后端模型 → 扣除 Token → 返回结果
```

**盈利点**：
- Token 批发零售差价（批量采购 vs 零售）
- 自搭模型成本优势（自有 GPU vs 第三方 API）
- 套餐包预付费现金流

---

## 二、Token 套餐设计

### 2.1 套餐类型

#### A. 按量付费（Pay-as-you-go）

| 套餐名 | Token 数量 | 单价 (元/1K tokens) | 有效期 | 适用场景 |
|--------|-----------|-------------------|--------|---------|
| 体验包 | 10,000 | 0.15 | 7 天 | 新用户试用 |
| 灵活包 | 100,000 | 0.12 | 30 天 | 偶尔使用 |
| 标准包 | 1,000,000 | 0.10 | 90 天 | 日常使用 |
| 企业包 | 10,000,000 | 0.08 | 180 天 | 高频使用 |
| 定制包 | 协商 | 协商 | 协商 | 超大客户 |

#### B. 套餐包（预付费）

| 套餐名 | 月费 (元) | 包含 Token | 超出单价 | 额外权益 |
|--------|---------|-----------|---------|---------|
| 入门版 | 99 | 500,000 | 0.12/1K | 基础支持 |
| 专业版 | 299 | 2,000,000 | 0.10/1K | 优先支持 + 自定义模型 |
| 企业版 | 999 | 10,000,000 | 0.08/1K | 专属支持 + SLA 保障 |
| 旗舰版 | 2999 | 50,000,000 | 0.06/1K | 私有部署 + 定制开发 |

#### C. 模型差异化定价

不同模型成本不同，支持差异化定价：

| 模型类型 | 基础系数 | 示例模型 |
|---------|---------|---------|
| 经济型 | 1.0x | Qwen、Llama、自搭模型 |
| 标准型 | 1.5x | GPT-4o-mini、Claude-Haiku |
| 高级型 | 2.5x | GPT-4o、Claude-Sonnet |
| 旗舰型 | 4.0x | GPT-4o-128k、Claude-Opus |

**计算公式**：
```
实际扣除 Token = 消耗 Token × 模型系数
```

### 2.2 Token 兑换规则

- **充值比例**：1 元 = 10 Token（基础汇率，可调整）
- **最低充值**：10 元（100 Token）
- **退款政策**：未消耗 Token 可退，扣除 10% 手续费
- **过期处理**：到期未用完可延期 1 次（30 天），或按比例折算到新套餐

---

## 三、自搭大模型接入方案

### 3.1 支持的模型后端

```yaml
后端类型:
  - 名称：OpenAI 兼容
    支持：GPT-4、GPT-3.5、兼容 API 的模型
    接入方式：API Key
    
  - 名称：自搭模型
    支持：Qwen、Llama、Mistral 等开源模型
    接入方式：vLLM / Ollama / LocalAI
    
  - 名称：Claude
    支持：Claude 系列
    接入方式：Anthropic API
    
  - 名称：其他
    支持：Gemini、Groq、DeepSeek 等
    接入方式：各自 API
```

### 3.2 自搭模型部署方案

#### 方案 A：vLLM（推荐）

```bash
# 部署命令示例
docker run --gpus all \
  -p 8000:8000 \
  -v /models:/models \
  vllm/vllm-openai:latest \
  --model /models/Qwen-7B-Chat \
  --host 0.0.0.0 \
  --port 8000
```

**优势**：
- OpenAI 兼容 API，无缝切换
- 高性能推理（PagedAttention）
- 支持多模型并发

#### 方案 B：Ollama

```bash
# 部署命令示例
docker run -d -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama

# 拉取模型
ollama pull qwen:7b
```

**优势**：
- 部署简单
- 模型管理方便
- 社区活跃

#### 方案 C：LocalAI

```bash
docker run -p 8080:8080 \
  -e MODELS_PATH=/models \
  -v /models:/models \
  localai/localai:latest
```

**优势**：
- 支持多种模型格式
- 完整 API 兼容性
- 支持 GPU/CPU 混合

### 3.3 模型路由策略

```python
# 伪代码示例
def route_request(user_request):
    # 1. 检查用户偏好
    if user_request.preferred_model:
        return get_backend(user_request.preferred_model)
    
    # 2. 检查成本最优
    if user_request.mode == "economy":
        return get_cheapest_available_backend()
    
    # 3. 检查性能最优
    if user_request.mode == "performance":
        return get_fastest_available_backend()
    
    # 4. 默认轮询
    return round_robin_backend()
```

---

## 四、计费和消耗追踪

### 4.1 计费流程

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│  用户请求   │ →  │  Token 估算   │ →  │  余额检查   │ →  │  执行请求   │
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
                                                      ↓
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│  返回结果   │ ←  │  实际扣费   │ ←  │  记录日志   │ ←  │  获取用量   │
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
```

### 4.2 Token 计算方式

**输入 Token**：
```python
input_tokens = count_tokens(request.messages)
```

**输出 Token**：
```python
output_tokens = count_tokens(response.content)
```

**总消耗**（考虑模型系数）：
```python
total_tokens = (input_tokens + output_tokens) * model_multiplier
```

### 4.3 实时余额检查

```python
def check_balance(user_id, estimated_tokens):
    balance = get_user_balance(user_id)
    if balance < estimated_tokens:
        raise InsufficientBalanceError(
            f"余额不足：需要 {estimated_tokens}，可用 {balance}"
        )
    # 预冻结
    freeze_tokens(user_id, estimated_tokens)
```

### 4.4 消耗记录

每条请求记录以下信息：

| 字段 | 说明 |
|-----|------|
| request_id | 请求唯一 ID |
| user_id | 用户 ID |
| model | 使用的模型 |
| input_tokens | 输入 Token 数 |
| output_tokens | 输出 Token 数 |
| total_tokens | 总消耗（含系数） |
| cost | 折合金额 |
| backend | 实际后端服务 |
| latency | 响应时间 |
| timestamp | 请求时间 |

---

## 五、数据库设计

### 5.1 ER 图概览

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │     │   packages   │     │  orders      │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │────<│ id           │     │ id           │
│ username     │     │ user_id      │     │ user_id      │
│ email        │     │ package_type │     │ package_id   │
│ balance      │     │ token_amount │     │ amount       │
│ status       │     │ price        │     │ status       │
│ created_at   │     │ created_at   │     │ created_at   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    │
       v                    v                    v
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  consumption │     │   backends   │     │  api_keys    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ user_id      │     │ name         │     │ user_id      │
│ request_id   │     │ type         │     │ key          │
│ model        │     │ endpoint     │     │ status       │
│ input_tokens │     │ api_key      │     │ created_at   │
│ output_tokens│     │ status       │     └──────────────┘
│ total_tokens │     │ created_at   │
│ cost         │     └──────────────┘
│ timestamp    │
└──────────────┘
```

### 5.2 表结构详情

#### users（用户表）

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance BIGINT DEFAULT 0 COMMENT 'Token 余额',
    frozen_balance BIGINT DEFAULT 0 COMMENT '冻结 Token',
    status TINYINT DEFAULT 1 COMMENT '1-正常 0-禁用',
    tier VARCHAR(20) DEFAULT 'free' COMMENT '用户等级',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);
```

#### packages（套餐表）

```sql
CREATE TABLE packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '套餐名称',
    package_type VARCHAR(20) NOT NULL COMMENT '套餐类型：payg/subscription',
    token_amount BIGINT NOT NULL COMMENT 'Token 数量',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    unit_price DECIMAL(10,4) COMMENT '单价（元/1K tokens）',
    validity_days INT COMMENT '有效期（天）',
    overage_rate DECIMAL(10,4) COMMENT '超出单价',
    features JSON COMMENT '额外权益',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (package_type),
    INDEX idx_active (is_active)
);
```

#### orders（订单表）

```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) UNIQUE NOT NULL COMMENT '订单号',
    user_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    token_amount BIGINT NOT NULL COMMENT '获得 Token',
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/paid/failed/refunded',
    payment_method VARCHAR(20) COMMENT '支付方式',
    payment_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES packages(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_order_no (order_no)
);
```

#### consumption（消耗记录表）

```sql
CREATE TABLE consumption (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(64) UNIQUE NOT NULL COMMENT '请求 ID',
    user_id BIGINT NOT NULL,
    model VARCHAR(50) NOT NULL COMMENT '模型名称',
    backend_id BIGINT COMMENT '后端服务 ID',
    input_tokens BIGINT NOT NULL,
    output_tokens BIGINT NOT NULL,
    model_multiplier DECIMAL(3,2) DEFAULT 1.0 COMMENT '模型系数',
    total_tokens BIGINT NOT NULL COMMENT '实际扣除',
    cost DECIMAL(10,4) COMMENT '折合金额',
    latency_ms INT COMMENT '响应时间 (ms)',
    status VARCHAR(20) DEFAULT 'success' COMMENT 'success/failed/timeout',
    error_message TEXT,
    request_body JSON COMMENT '请求内容（可选）',
    response_summary JSON COMMENT '响应摘要（可选）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_time (user_id, created_at),
    INDEX idx_request (request_id),
    INDEX idx_model (model)
);
```

#### backends（后端服务表）

```sql
CREATE TABLE backends (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '后端名称',
    type VARCHAR(30) NOT NULL COMMENT '类型：openai/ollama/vllm/claude',
    endpoint VARCHAR(255) NOT NULL COMMENT 'API 端点',
    api_key VARCHAR(255) COMMENT 'API Key（加密存储）',
    models JSON COMMENT '支持的模型列表',
    priority INT DEFAULT 100 COMMENT '优先级（越小越优先）',
    weight INT DEFAULT 1 COMMENT '权重（负载均衡）',
    status VARCHAR(20) DEFAULT 'active' COMMENT 'active/inactive/maintenance',
    health_check_url VARCHAR(255),
    last_health_check TIMESTAMP NULL,
    rate_limit INT COMMENT '每分钟请求限制',
    cost_per_1k_tokens DECIMAL(10,6) COMMENT '成本价',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_type (type)
);
```

#### api_keys（API Key 表）

```sql
CREATE TABLE api_keys (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    key_hash VARCHAR(64) UNIQUE NOT NULL COMMENT 'Key 的哈希',
    key_prefix VARCHAR(10) NOT NULL COMMENT 'Key 前缀（用于显示）',
    name VARCHAR(50) COMMENT 'Key 名称',
    permissions JSON COMMENT '权限配置',
    rate_limit INT COMMENT '每分钟请求限制',
    token_limit BIGINT COMMENT 'Token 使用上限',
    token_used BIGINT DEFAULT 0 COMMENT '已用 Token',
    status VARCHAR(20) DEFAULT 'active' COMMENT 'active/revoked/expired',
    expires_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_key (key_hash),
    INDEX idx_status (status)
);
```

#### user_subscriptions（用户订阅表）

```sql
CREATE TABLE user_subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    token_total BIGINT NOT NULL COMMENT '套餐总 Token',
    token_remaining BIGINT NOT NULL COMMENT '剩余 Token',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' COMMENT 'active/expired/cancelled',
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES packages(id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_end_date (end_date)
);
```

### 5.3 关键查询示例

#### 查询用户余额

```sql
SELECT 
    u.balance,
    u.frozen_balance,
    COALESCE(SUM(s.token_remaining), 0) as subscription_remaining
FROM users u
LEFT JOIN user_subscriptions s ON u.id = s.user_id AND s.status = 'active'
WHERE u.id = ?
GROUP BY u.id;
```

#### 查询消耗统计（按天）

```sql
SELECT 
    DATE(created_at) as date,
    model,
    SUM(input_tokens) as input_total,
    SUM(output_tokens) as output_total,
    SUM(total_tokens) as total_consumed,
    SUM(cost) as total_cost
FROM consumption
WHERE user_id = ? 
    AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), model
ORDER BY date DESC;
```

#### 查询后端负载

```sql
SELECT 
    b.name,
    b.type,
    COUNT(c.id) as request_count,
    AVG(c.latency_ms) as avg_latency,
    SUM(c.total_tokens) as tokens_processed
FROM backends b
LEFT JOIN consumption c ON b.id = c.backend_id 
    AND c.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
WHERE b.status = 'active'
GROUP BY b.id
ORDER BY request_count DESC;
```

---

## 六、API 设计

### 6.1 核心接口

#### 聊天完成（统一入口）

```http
POST /api/v1/chat/completions
Content-Type: application/json
Authorization: Bearer {api_key}

{
    "model": "gpt-4o",
    "messages": [
        {"role": "user", "content": "Hello"}
    ],
    "stream": false,
    "max_tokens": 1000
}
```

**响应**：
```json
{
    "id": "req_xxx",
    "choices": [...],
    "usage": {
        "prompt_tokens": 10,
        "completion_tokens": 50,
        "total_tokens": 60
    },
    "meta": {
        "backend": "self-hosted-qwen",
        "cost_tokens": 60,
        "remaining_balance": 99940
    }
}
```

#### 查询余额

```http
GET /api/v1/user/balance
Authorization: Bearer {api_key}
```

**响应**：
```json
{
    "balance": 99940,
    "frozen": 0,
    "subscriptions": [
        {
            "package": "专业版",
            "remaining": 1500000,
            "expires": "2026-05-08"
        }
    ]
}
```

#### 消耗记录

```http
GET /api/v1/user/consumption?start=2026-04-01&end=2026-04-08
Authorization: Bearer {api_key}
```

#### 创建 API Key

```http
POST /api/v1/api-keys
Authorization: Bearer {api_key}

{
    "name": "Production Key",
    "permissions": ["chat", "embedding"],
    "rate_limit": 100,
    "token_limit": 1000000
}
```

---

## 七、风控与安全

### 7.1 限流策略

| 用户等级 | 每分钟请求 | 每分钟 Token | 并发请求 |
|---------|----------|------------|---------|
| 免费 | 10 | 10,000 | 2 |
| 入门版 | 60 | 50,000 | 5 |
| 专业版 | 300 | 200,000 | 10 |
| 企业版 | 1000 | 1,000,000 | 50 |
| 旗舰版 | 定制 | 定制 | 定制 |

### 7.2 异常检测

- **高频请求**：单 IP/单 Key 短时间内大量请求
- **异常消耗**：Token 消耗速率远超正常水平
- **内容风险**：敏感内容检测（可选）
- **余额预警**：余额低于阈值时通知

### 7.3 安全措施

- API Key 加密存储（bcrypt + salt）
- 传输加密（HTTPS/TLS）
- 请求签名（可选）
- IP 白名单（企业版）
- 操作日志审计

---

## 八、运营指标

### 8.1 核心指标

| 指标 | 说明 | 目标值 |
|-----|------|-------|
| DAU/MAU | 日/月活跃用户 | - |
| ARPU | 每用户平均收入 | >50 元/月 |
| Token 毛利率 | (售价 - 成本)/售价 | >30% |
| 后端可用性 | 服务正常运行时间 | >99.5% |
| 平均响应时间 | P95 延迟 | <2s |
| 用户留存率 | 30 日留存 | >40% |

### 8.2 监控告警

- 后端服务健康检查（每 30 秒）
- Token 余额预警（自动充值建议）
- 异常消耗告警
- API 错误率监控

---

## 九、实施路线图

### Phase 1 - MVP（2 周）
- [ ] 基础用户系统 + API Key 管理
- [ ] 单一后端接入（自搭 Qwen）
- [ ] Token 计费 + 余额追踪
- [ ] 基础套餐（按量付费）

### Phase 2 - 多后端（2 周）
- [ ] 支持 OpenAI/Claude 接入
- [ ] 智能路由 + 负载均衡
- [ ] 套餐包系统
- [ ] 消耗统计 dashboard

### Phase 3 - 商业化（2 周）
- [ ] 支付接入（微信/支付宝）
- [ ] 订阅管理 + 自动续费
- [ ] 风控限流
- [ ] 运营后台

### Phase 4 - 优化迭代（持续）
- [ ] 性能优化
- [ ] 更多模型支持
- [ ] 企业功能（私有部署等）
- [ ] 数据分析 + 推荐

---

## 十、附录

### A. Token 计算参考

| 内容类型 | 估算方式 |
|---------|---------|
| 中文文本 | 1 Token ≈ 1.5 字符 |
| 英文文本 | 1 Token ≈ 4 字符 |
| 代码 | 1 Token ≈ 2-3 字符 |
| 图片（多模态） | 按分辨率计算 |

### B. 成本参考（2026 年）

| 模型 | 成本价（元/1K tokens） |
|-----|---------------------|
| 自搭 Qwen-7B | 0.02-0.05 |
| 自搭 Qwen-72B | 0.15-0.30 |
| GPT-4o-mini | 0.03 |
| GPT-4o | 0.30 |
| Claude-Haiku | 0.06 |
| Claude-Sonnet | 0.60 |

### C. 技术栈推荐

```yaml
后端:
  语言：Go / Python / Node.js
  框架：Gin / FastAPI / Express
  数据库：MySQL 8.0 + Redis
  消息队列：RabbitMQ / Kafka
  
部署:
  容器：Docker + Docker Compose
  编排：Kubernetes（可选）
  监控：Prometheus + Grafana
  日志：ELK Stack
```

---

> 📜 **文档版本**: v1.0  
> 👑 **御批**: 待陛下审阅  
> 📅 **创建时间**: 2026-04-08  
> 🫡 **制作者**: 王德发 - 大内总管
