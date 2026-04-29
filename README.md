# Telegram Customer Service System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)
![Docker](https://img.shields.io/badge/docker-supported-blue)

一个基于 React + Node.js 的电报客服系统，支持多客服分发、Web3 钱包集成、AI 消息辅助和多语言切换。

[快速开始](./QUICKSTART.md) • [安装指南](./INSTALL.md) • [架构文档](./ARCHITECTURE.md) • [项目进度](./PROJECT_STATUS.md) • [多端打包](./MOBILE_BUILD_GUIDE.md)

</div>

---

## 功能特性

- ✅ **多客服分发系统** - 智能消息分配和负载均衡
- ✅ **Telegram Bot & Client API** - 完整的 Telegram 集成
- ✅ **自定义代理服务器** - 解决国内访问限制
- ✅ **Web3 钱包集成** - 支持多种区块链钱包
- ✅ **AI 消息辅助** - 智能回复建议和翻译
- ✅ **多语言支持** - i18n 国际化
- ✅ **实时通信** - WebSocket 实时消息推送
- ✅ **响应式设计** - PC 和移动端完美适配
- ✅ **多端支持** - Web、Android APK、iOS App、桌面应用

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (状态管理)
- i18next (国际化)
- wagmi + viem + RainbowKit (Web3)
- React Router v6

### 后端
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Redis (缓存和消息队列)
- grammy (Telegram Bot API)
- MTProto (Telegram Client API)
- Socket.IO (WebSocket)
- JWT (认证)

## 项目结构

```
telegram-customer-service/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/    # 通用组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── stores/        # 状态管理
│   │   ├── services/      # API 服务
│   │   ├── locales/       # 语言包
│   │   └── utils/         # 工具函数
├── server/                # 后端服务
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── services/      # 业务逻辑
│   │   ├── models/        # 数据模型
│   │   ├── middleware/    # 中间件
│   │   ├── telegram/      # Telegram 集成
│   │   ├── ai/            # AI 接口集成
│   │   └── routes/        # 路由定义
├── prisma/                # 数据库 Schema
└── docker-compose.yml     # Docker 配置
```

## 快速开始

### 前置要求

- Node.js 18+ 
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (可选)

### 安装

1. 克隆项目
```bash
git clone <repository-url>
cd telegram-customer-service
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填写必要的配置
```

4. 启动数据库（使用 Docker）
```bash
docker-compose up -d
```

5. 运行数据库迁移
```bash
npm run db:migrate
```

6. 启动开发服务器
```bash
npm run dev
```

访问：
- 前端: http://localhost:5173
- 后端: http://localhost:3000

## 环境配置

复制 `.env.example` 为 `.env` 并配置以下变量：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/telegram_cs"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_WEBHOOK_URL="https://your-domain.com/webhook"

# Telegram API (MTProto)
TELEGRAM_API_ID="your-api-id"
TELEGRAM_API_HASH="your-api-hash"

# AI Service
AI_SERVICE_URL="http://tokyo-server:8080/api"
AI_API_KEY="your-ai-api-key"

# Server
PORT=3000
CLIENT_URL="http://localhost:5173"
```

## 开发指南

### 可用脚本

- `npm run dev` - 同时启动前后端开发服务器
- `npm run dev:server` - 仅启动后端
- `npm run dev:client` - 仅启动前端
- `npm run build` - 构建生产版本
- `npm run test` - 运行测试
- `npm run lint` - 代码检查
- `npm run format` - 代码格式化
- `npm run db:migrate` - 数据库迁移
- `npm run db:studio` - 打开 Prisma Studio

### 代码规范

项目使用 ESLint + Prettier 进行代码规范检查，提交前会自动运行 lint-staged。

## 部署

### Docker 部署

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 手动部署

1. 构建项目
```bash
npm run build
```

2. 启动服务
```bash
npm start
```

建议使用 PM2 进行进程管理：
```bash
pm2 start ecosystem.config.js
```

## 架构说明

### 消息流转

1. 用户发送消息到 Telegram Bot
2. Bot 通过 Webhook 接收消息
3. 后端处理消息并存入数据库
4. 消息分发系统分配给合适的客服
5. 通过 WebSocket 推送到客服工作台
6. 客服回复后，通过 Bot API 或 Client API 发送回用户

### 代理服务器

为了解决国内访问 Telegram 的限制，系统内置了代理服务器：
- 中转所有 Telegram API 请求
- 连接池管理和故障转移
- 速率限制控制

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
