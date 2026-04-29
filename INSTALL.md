# 安装和运行指南

## 🚀 快速启动（3 步）

### 第一步：安装依赖

```bash
# 在项目根目录执行
npm install

# 这会安装 monorepo 的所有依赖
# 包括根目录、server 和 client 的依赖
```

### 第二步：配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，至少修改以下配置：
# - JWT_SECRET (改为随机字符串)
# - DATABASE_URL (如果使用 Docker，保持默认即可)
# - TELEGRAM_BOT_TOKEN (从 @BotFather 获取)
```

### 第三步：启动服务

#### 选项 A：使用 Docker（最简单）

```bash
# 启动所有服务（数据库 + 后端 + 前端）
docker-compose up -d

# 初始化数据库
docker-compose exec server npx prisma migrate deploy
docker-compose exec server npm run db:seed

# 访问应用
# 前端: http://localhost
# 后端: http://localhost:3000
```

#### 选项 B：本地开发模式

```bash
# 1. 启动数据库和 Redis（使用 Docker）
docker-compose up -d postgres redis

# 2. 初始化数据库
cd server
npx prisma migrate dev
npx prisma generate
npm run db:seed
cd ..

# 3. 启动开发服务器
npm run dev

# 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:3000
```

## 📦 依赖说明

### 根目录依赖
- `concurrently`: 同时运行多个命令
- `husky`: Git hooks 管理
- `lint-staged`: 提交前代码检查
- `prettier`: 代码格式化

### 后端依赖 (server/)
核心依赖：
- `express`: Web 框架
- `@prisma/client`: 数据库 ORM
- `grammy`: Telegram Bot API
- `socket.io`: WebSocket 实时通信
- `jsonwebtoken`: JWT 认证
- `bcryptjs`: 密码加密
- `ioredis`: Redis 客户端
- `winston`: 日志记录
- `zod`: 数据验证

开发依赖：
- `typescript`: TypeScript 编译器
- `tsx`: TypeScript 执行器
- `prisma`: Prisma CLI
- `eslint`: 代码检查
- `jest`: 测试框架

### 前端依赖 (client/)
核心依赖：
- `react`: UI 框架
- `react-router-dom`: 路由管理
- `zustand`: 状态管理
- `@tanstack/react-query`: 数据请求
- `axios`: HTTP 客户端
- `socket.io-client`: WebSocket 客户端
- `i18next`: 国际化
- `wagmi` + `viem` + `@rainbow-me/rainbowkit`: Web3 钱包
- `tailwindcss`: CSS 框架

开发依赖：
- `vite`: 构建工具
- `typescript`: TypeScript
- `eslint`: 代码检查
- `vitest`: 测试框架

## 🔧 常用命令

### 开发命令

```bash
# 同时启动前后端
npm run dev

# 仅启动后端
npm run dev:server

# 仅启动前端
npm run dev:client

# 数据库操作
npm run db:migrate    # 运行迁移
npm run db:studio     # 打开 Prisma Studio
npm run db:seed       # 填充种子数据
```

### 构建命令

```bash
# 构建所有项目
npm run build

# 仅构建后端
npm run build:server

# 仅构建前端
npm run build:client
```

### 测试命令

```bash
# 运行所有测试
npm test

# 仅测试后端
npm run test:server

# 仅测试前端
npm run test:client
```

### 代码质量

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format
```

## ⚠️ 常见问题

### 1. npm install 失败

**原因**: 网络问题或 Node.js 版本不兼容

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 lock 文件
rm -rf node_modules server/node_modules client/node_modules
rm -f package-lock.json server/package-lock.json client/package-lock.json

# 重新安装
npm install
```

### 2. TypeScript 错误

**原因**: 依赖未安装或类型定义缺失

**解决方案**:
```bash
# 确保所有依赖已安装
npm install

# 重新生成 Prisma Client
cd server && npx prisma generate
```

### 3. 端口被占用

**解决方案**: 修改 `.env` 文件
```env
PORT=3001        # 改为你想要的端口
WS_PORT=3002
```

前端端口在 `client/vite.config.ts` 中修改。

### 4. Docker 启动失败

**检查**:
```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart
```

### 5. 数据库连接失败

**检查**:
```bash
# 确认 PostgreSQL 正在运行
docker-compose ps postgres

# 测试连接
docker-compose exec postgres pg_isready -U postgres

# 查看数据库日志
docker-compose logs postgres
```

## 🎯 首次运行检查清单

- [ ] Node.js 18+ 已安装
- [ ] Docker 和 Docker Compose 已安装（如使用 Docker）
- [ ] 已运行 `npm install`
- [ ] 已创建并配置 `.env` 文件
- [ ] 数据库正在运行
- [ ] Redis 正在运行
- [ ] 已运行数据库迁移 (`npx prisma migrate dev`)
- [ ] 已生成 Prisma Client (`npx prisma generate`)
- [ ] 已填充种子数据 (`npm run db:seed`)
- [ ] 后端服务器启动成功
- [ ] 前端应用启动成功
- [ ] 可以访问登录页面

## 📞 需要帮助？

1. 查看 [QUICKSTART.md](./QUICKSTART.md) 详细指南
2. 查看 [PROJECT_STATUS.md](./PROJECT_STATUS.md) 了解项目进度
3. 查看 [README.md](./README.md) 了解项目概述
4. 检查控制台和日志文件中的错误信息

## 🎉 成功标志

如果看到以下输出，说明启动成功：

**后端**:
```
🚀 Server running on port 3000
📝 Environment: development
✅ Database connected successfully
```

**前端**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Docker**:
```
✔ Container telegram_cs_postgres   Healthy
✔ Container telegram_cs_redis      Healthy
✔ Container telegram_cs_server     Started
✔ Container telegram_cs_client     Started
```

---

祝开发顺利！🚀
