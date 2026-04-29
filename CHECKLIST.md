# 项目设置检查清单

## 📋 环境准备

### 必需软件
- [ ] Node.js 18+ 已安装 (`node -v`)
- [ ] npm 9+ 已安装 (`npm -v`)
- [ ] Git 已安装 (`git --version`)
- [ ] Docker 已安装（推荐）(`docker --version`)
- [ ] Docker Compose 已安装 (`docker-compose --version`)

### 可选软件
- [ ] PostgreSQL 客户端工具 (psql)
- [ ] Redis 客户端 (redis-cli)
- [ ] VS Code 或 preferred IDE
- [ ] Postman 或 Insomnia (API 测试)

## 🚀 项目初始化

### 1. 克隆和安装
- [ ] 克隆代码仓库
- [ ] 进入项目目录
- [ ] 运行 `npm install` 安装所有依赖
- [ ] 验证安装成功（无错误输出）

### 2. 环境配置
- [ ] 复制 `.env.example` 为 `.env`
- [ ] 修改 `JWT_SECRET` 为随机字符串
- [ ] 修改 `JWT_REFRESH_SECRET` 为随机字符串
- [ ] 配置 `DATABASE_URL`（Docker 可保持默认）
- [ ] 配置 `REDIS_URL`（Docker 可保持默认）

### 3. Telegram 配置
- [ ] 在 [@BotFather](https://t.me/BotFather) 创建 Bot
- [ ] 获取 Bot Token
- [ ] 更新 `.env` 中的 `TELEGRAM_BOT_TOKEN`
- [ ] 访问 [my.telegram.org](https://my.telegram.org)
- [ ] 创建应用获取 API ID
- [ ] 获取 API Hash
- [ ] 更新 `.env` 中的 `TELEGRAM_API_ID` 和 `TELEGRAM_API_HASH`

### 4. AI 服务配置（可选）
- [ ] 部署或获取东京服务器 AI 服务地址
- [ ] 获取 AI API Key
- [ ] 更新 `.env` 中的 `AI_SERVICE_URL` 和 `AI_API_KEY`

### 5. Web3 配置（可选）
- [ ] 获取 Alchemy API Key（可选）
- [ ] 获取 Infura API Key（可选）
- [ ] 更新 `.env` 中的相关配置

## 🗄️ 数据库设置

### 使用 Docker（推荐）
- [ ] 运行 `docker-compose up -d postgres redis`
- [ ] 等待容器启动（约 30 秒）
- [ ] 验证容器状态: `docker-compose ps`
- [ ] 应该看到 postgres 和 redis 都是 "Up" 状态

### 本地数据库（备选）
- [ ] 启动 PostgreSQL 服务
- [ ] 创建数据库: `CREATE DATABASE telegram_cs;`
- [ ] 更新 `.env` 中的 `DATABASE_URL`
- [ ] 启动 Redis 服务
- [ ] 更新 `.env` 中的 `REDIS_URL`

### 数据库迁移
- [ ] 进入 server 目录: `cd server`
- [ ] 运行迁移: `npx prisma migrate dev`
- [ ] 生成 Prisma Client: `npx prisma generate`
- [ ] 填充种子数据: `npm run db:seed`
- [ ] 验证数据创建成功

## 🔧 开发环境启动

### 方式一：Docker（最简单）
- [ ] 运行 `docker-compose up -d`
- [ ] 等待所有容器启动（约 1-2 分钟）
- [ ] 检查容器状态: `docker-compose ps`
- [ ] 所有容器应该是 "Up" 状态
- [ ] 访问前端: http://localhost
- [ ] 访问后端: http://localhost:3000/health
- [ ] 查看日志: `docker-compose logs -f`

### 方式二：本地开发
- [ ] 确保 PostgreSQL 和 Redis 正在运行
- [ ] 运行 `npm run dev` 或分别启动:
  - [ ] 终端 1: `npm run dev:server`
  - [ ] 终端 2: `npm run dev:client`
- [ ] 等待编译完成
- [ ] 访问前端: http://localhost:5173
- [ ] 访问后端: http://localhost:3000/health

## ✅ 功能验证

### 基础功能测试
- [ ] 前端页面可以正常访问
- [ ] 后端健康检查返回 `{"status": "ok"}`
- [ ] 可以看到登录页面
- [ ] 使用测试账号可以登录（需要先实现认证模块）

### 数据库验证
- [ ] 打开 Prisma Studio: `cd server && npx prisma studio`
- [ ] 可以在浏览器访问 http://localhost:5555
- [ ] 可以看到创建的测试用户
- [ ] 可以看到测试客户数据
- [ ] 可以看到快捷回复模板

### 日志检查
- [ ] 后端启动日志无错误
- [ ] 前端编译无错误
- [ ] 数据库连接成功
- [ ] Redis 连接成功

## 🔐 安全配置检查

### 生产环境必做
- [ ] 修改所有默认密钥
- [ ] 配置 HTTPS/SSL 证书
- [ ] 设置强密码策略
- [ ] 配置 CORS 白名单
- [ ] 启用 Rate Limiting
- [ ] 配置防火墙规则
- [ ] 禁用调试端点
- [ ] 设置环境变量（不使用 .env 文件）

### 密钥管理
- [ ] JWT_SECRET 足够随机（至少 32 字符）
- [ ] JWT_REFRESH_SECRET 足够随机
- [ ] 不使用默认的 Telegram credentials
- [ ] API Keys 不在代码中硬编码
- [ ] 敏感信息不在版本控制中

## 📊 性能检查

### 开发环境
- [ ] 前端热重载正常工作
- [ ] 后端重启快速（< 5 秒）
- [ ] 数据库查询响应时间 < 100ms
- [ ] 无明显内存泄漏

### 生产环境
- [ ] 启用生产模式构建
- [ ] 启用 Gzip 压缩
- [ ] 配置 CDN（静态资源）
- [ ] 数据库索引已创建
- [ ] Redis 缓存生效
- [ ] 响应时间监控

## 🧪 测试

### 单元测试
- [ ] 后端测试通过: `cd server && npm test`
- [ ] 前端测试通过: `cd client && npm test`
- [ ] 测试覆盖率达标（> 70%）

### 集成测试
- [ ] API 端点测试
- [ ] 数据库操作测试
- [ ] WebSocket 连接测试
- [ ] Telegram Webhook 测试

### E2E 测试（可选）
- [ ] 用户登录流程
- [ ] 消息收发流程
- [ ] 客服分发流程
- [ ] 钱包连接流程

## 📝 代码质量

### 代码规范
- [ ] ESLint 无错误: `npm run lint`
- [ ] Prettier 格式化: `npm run format`
- [ ] TypeScript 无类型错误
- [ ] 遵循项目代码风格

### Git 配置
- [ ] 配置 Git user.name
- [ ] 配置 Git user.email
- [ ] Husky hooks 正常工作
- [ ] 提交前自动 lint 和 format

## 🚢 部署准备

### Docker 部署
- [ ] 构建镜像: `docker-compose build`
- [ ] 测试本地镜像
- [ ] 配置生产环境变量
- [ ] 配置持久化存储
- [ ] 设置重启策略
- [ ] 配置日志轮转

### CI/CD
- [ ] GitHub Actions 配置正确
- [ ] 添加 Docker Hub secrets
- [ ] 测试自动化流水线
- [ ] 配置分支保护规则

### 监控和日志
- [ ] 配置日志收集
- [ ] 设置错误告警
- [ ] 配置性能监控
- [ ] 设置健康检查

## 📚 文档

### 技术文档
- [ ] README.md 完整
- [ ] ARCHITECTURE.md 清晰
- [ ] API 文档（待创建）
- [ ] 数据库 ER 图（待创建）

### 用户文档
- [ ] 安装指南 (INSTALL.md)
- [ ] 快速开始 (QUICKSTART.md)
- [ ] 常见问题 FAQ
- [ ] 故障排除指南

## 🎯 上线前最终检查

### 功能完整性
- [ ] 所有核心功能已实现
- [ ] 所有页面可以正常访问
- [ ] 所有 API 端点正常工作
- [ ] WebSocket 实时通信正常
- [ ] Telegram 集成正常
- [ ] 错误处理完善

### 安全性
- [ ] 渗透测试通过
- [ ] 依赖漏洞扫描通过
- [ ] SSL 证书有效
- [ ] 备份策略就绪

### 性能
- [ ] 压力测试通过
- [ ] 响应时间达标
- [ ] 并发处理能力满足需求
- [ ] 资源使用合理

### 可靠性
- [ ] 容错机制完善
- [ ] 灾备方案就绪
- [ ] 回滚计划制定
- [ ] 监控告警配置

## 🆘 故障排查

### 常见问题速查

**问题**: npm install 失败
```bash
# 解决方案
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**问题**: 端口被占用
```bash
# 查看占用端口的进程
lsof -i :3000
lsof -i :5173

# 杀死进程或修改端口
kill -9 <PID>
```

**问题**: 数据库连接失败
```bash
# 检查 PostgreSQL 状态
docker-compose ps postgres
docker-compose logs postgres

# 重启数据库
docker-compose restart postgres
```

**问题**: TypeScript 错误
```bash
# 重新生成类型
cd server
npx prisma generate
```

**问题**: Docker 容器无法启动
```bash
# 查看详细日志
docker-compose logs <service-name>

# 重建容器
docker-compose up -d --force-recreate
```

## 📞 获取帮助

1. **查看日志**
   ```bash
   # 后端日志
   docker-compose logs -f server
   
   # 前端日志
   docker-compose logs -f client
   
   # 数据库日志
   docker-compose logs -f postgres
   ```

2. **检查状态**
   ```bash
   # 所有容器状态
   docker-compose ps
   
   # 系统资源使用
   docker stats
   ```

3. **重启服务**
   ```bash
   # 重启所有服务
   docker-compose restart
   
   # 重启特定服务
   docker-compose restart server
   ```

4. **重置环境**
   ```bash
   # ⚠️ 警告：这会删除所有数据
   docker-compose down -v
   docker-compose up -d
   cd server && npx prisma migrate dev && npm run db:seed
   ```

---

## ✨ 完成标志

当您勾选了以上所有适用项后，您的项目应该已经完全设置好并可以正常运行！

**成功指标**:
- ✅ 前端应用可以访问
- ✅ 后端 API 响应正常
- ✅ 数据库连接成功
- ✅ Redis 连接成功
- ✅ 可以登录系统
- ✅ 无控制台错误
- ✅ 日志显示所有服务正常

**下一步**:
1. 配置 Telegram Bot Webhook
2. 测试消息收发功能
3. 实现剩余功能模块
4. 编写更多测试
5. 优化性能和用户体验

祝您使用愉快！🎉
