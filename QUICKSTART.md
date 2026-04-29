# 快速开始指南

## 前置要求

在开始之前，请确保您的系统已安装以下软件：

- **Node.js** 18+ ([下载](https://nodejs.org/))
- **npm** 9+ (随 Node.js 一起安装)
- **Docker** 和 **Docker Compose** ([下载](https://www.docker.com/)) - 可选但推荐
- **PostgreSQL** 15+ (如果不使用 Docker)
- **Redis** 7+ (如果不使用 Docker)

## 方式一：使用 Docker（推荐）

### 1. 克隆项目

```bash
git clone <repository-url>
cd telegram-customer-service
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，至少配置以下变量：

```env
# JWT 密钥（必须修改）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Telegram Bot Token（从 @BotFather 获取）
TELEGRAM_BOT_TOKEN=your-bot-token-here

# Telegram API（从 https://my.telegram.org 获取）
TELEGRAM_API_ID=your-api-id
TELEGRAM_API_HASH=your-api-hash

# AI 服务配置（如果有）
AI_SERVICE_URL=http://your-tokyo-server:8080/api/v1
AI_API_KEY=your-ai-api-key
```

### 3. 启动服务

```bash
docker-compose up -d
```

这将启动：
- PostgreSQL 数据库
- Redis 缓存
- 后端服务器
- 前端应用（Nginx）

### 4. 初始化数据库

```bash
# 进入后端容器
docker-compose exec server sh

# 运行数据库迁移
npx prisma migrate deploy

# 生成 Prisma Client
npx prisma generate

# 填充种子数据
npm run db:seed

# 退出容器
exit
```

### 5. 访问应用

- **前端**: http://localhost
- **后端 API**: http://localhost:3000
- **健康检查**: http://localhost:3000/health

### 6. 测试登录

使用种子数据创建的测试账号：

```
管理员:
邮箱: admin@example.com
密码: admin123

客服1:
邮箱: agent1@example.com
密码: agent1123

客服2:
邮箱: agent2@example.com
密码: agent2123

客服3:
邮箱: agent3@example.com
密码: agent3123
```

## 方式二：本地开发环境

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
cd ..
```

### 2. 启动数据库和 Redis

#### 选项 A：使用 Docker

```bash
docker-compose up -d postgres redis
```

#### 选项 B：本地安装

确保 PostgreSQL 和 Redis 正在运行，并更新 `.env` 中的连接字符串。

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件
```

### 4. 数据库迁移

```bash
cd server
npx prisma migrate dev
npx prisma generate
npm run db:seed
cd ..
```

### 5. 启动开发服务器

#### 同时启动前后端（推荐）

```bash
npm run dev
```

#### 或分别启动

```bash
# 终端 1 - 后端
npm run dev:server

# 终端 2 - 前端
npm run dev:client
```

### 6. 访问应用

- **前端**: http://localhost:5173
- **后端**: http://localhost:3000
- **WebSocket**: ws://localhost:3001

## 常见问题

### 1. 端口被占用

如果默认端口已被占用，修改 `.env` 文件：

```env
PORT=3001
WS_PORT=3002
```

前端端口在 `client/vite.config.ts` 中修改。

### 2. 数据库连接失败

检查 PostgreSQL 是否运行：

```bash
# Docker
docker-compose ps

# 本地
pg_isready -h localhost -p 5432
```

### 3. Redis 连接失败

检查 Redis 是否运行：

```bash
# Docker
docker-compose ps

# 本地
redis-cli ping
```

### 4. Prisma 错误

重新生成 Prisma Client：

```bash
cd server
npx prisma generate
```

重置数据库（⚠️ 会删除所有数据）：

```bash
cd server
npx prisma migrate reset
npm run db:seed
```

### 5. TypeScript 类型错误

首次运行时可能会看到一些 TypeScript 错误，这是因为依赖尚未安装。运行 `npm install` 后这些错误会消失。

## 下一步

1. **配置 Telegram Bot**
   - 在 [@BotFather](https://t.me/BotFather) 创建机器人
   - 获取 Bot Token
   - 更新 `.env` 中的 `TELEGRAM_BOT_TOKEN`

2. **配置 Telegram API**
   - 访问 [https://my.telegram.org](https://my.telegram.org)
   - 创建应用获取 API ID 和 Hash
   - 更新 `.env` 中的相关配置

3. **设置 Webhook**（生产环境）
   - 配置 HTTPS 域名
   - 设置 webhook URL
   - 测试消息接收

4. **配置 AI 服务**
   - 部署或连接到东京服务器的 AI 服务
   - 更新 `.env` 中的 AI 配置

5. **自定义配置**
   - 修改客服分发策略
   - 配置快捷回复模板
   - 设置多语言支持

## 开发工具

### Prisma Studio（数据库管理）

```bash
cd server
npx prisma studio
```

访问 http://localhost:5555

### 查看日志

```bash
# Docker
docker-compose logs -f server
docker-compose logs -f client

# 本地开发
# 日志会输出到控制台和 logs/ 目录
```

### 运行测试

```bash
# 所有测试
npm test

# 仅后端测试
cd server && npm test

# 仅前端测试
cd client && npm test
```

## 生产部署

参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解详细的生产部署指南。

## 获取帮助

- 查看 [README.md](./README.md) 了解项目概述
- 查看 [API 文档](./docs/API.md)（待创建）
- 提交 Issue 或 Pull Request

## 贡献代码

欢迎贡献！请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)（待创建）。
