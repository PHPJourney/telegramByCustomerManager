# SSH 隧道使用指南

本文档介绍如何通过东京服务器建立 SSH 隧道来访问 GitHub。

## 🌐 为什么需要 SSH 隧道？

由于网络限制，直接访问 GitHub 可能不稳定或无法连接。通过东京服务器的 SSH 隧道可以：
- ✅ 稳定访问 GitHub
- ✅ 加速 Git 操作
- ✅ 安全可靠

---

## 🚀 快速开始

### 方法一：使用管理脚本（推荐）

#### 1. 设置环境变量

```bash
export SSH_PASS="your_ssh_password"
```

或者编辑 `~/.zshrc` 永久设置：

```bash
echo 'export SSH_PASS="your_ssh_password"' >> ~/.zshrc
source ~/.zshrc
```

#### 2. 启动隧道

```bash
./scripts/tunnel.sh start
```

输出示例：
```
🚀 正在启动 SSH 隧道...
   服务器: 154.36.184.20
   用户: root
   SOCKS 端口: 1080
✅ SSH 隧道启动成功

📝 配置 Git 代理...
✅ Git 代理配置完成

🔗 现在可以通过隧道访问 GitHub
   测试: git push origin main
```

#### 3. 使用 Git

```bash
git push origin main
git pull origin main
# 其他 Git 操作...
```

#### 4. 停止隧道

```bash
./scripts/tunnel.sh stop
```

---

### 方法二：手动配置

#### 1. 建立 SSH 隧道

```bash
export SSH_PASS="your_password"
sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no -fN -D 1080 root@154.36.184.20
```

参数说明：
- `-f`: 后台运行
- `-N`: 不执行远程命令
- `-D 1080`: 创建 SOCKS5 代理，端口 1080

#### 2. 配置 Git 代理

```bash
git config --global http.proxy 'socks5://127.0.0.1:1080'
git config --global https.proxy 'socks5://127.0.0.1:1080'
```

#### 3. 使用 Git

```bash
git push origin main
```

#### 4. 停止隧道

```bash
# 查找进程
ps aux | grep "ssh.*-D 1080"

# 杀死进程
kill <PID>

# 清除 Git 代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

---

## 📋 脚本命令详解

### 启动隧道

```bash
./scripts/tunnel.sh start
```

功能：
- 建立 SSH 隧道
- 配置 Git SOCKS5 代理
- 检查端口冲突

### 停止隧道

```bash
./scripts/tunnel.sh stop
```

功能：
- 关闭 SSH 隧道
- 清除 Git 代理配置

### 查看状态

```bash
./scripts/tunnel.sh status
```

输出示例：
```
📊 SSH 隧道状态检查

✅ SSH 隧道正在运行
   端口: 1080
   PID: 12345

✅ Git 代理已配置
   HTTP: socks5://127.0.0.1:1080
   HTTPS: socks5://127.0.0.1:1080
```

### 测试连接

```bash
./scripts/tunnel.sh test
```

功能：
- 检查隧道是否运行
- 测试 GitHub 连接
- 显示当前分支信息

---

## 🔧 高级配置

### 修改服务器信息

编辑 `scripts/tunnel.sh`：

```bash
TOKYO_IP="your_server_ip"
SSH_USER="your_username"
SOCKS_PORT=1080  # 可以修改端口
```

### 使用 SSH 密钥（更安全）

如果服务器支持密钥认证：

```bash
# 生成密钥对
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 复制公钥到服务器
ssh-copy-id root@154.36.184.20

# 使用密钥连接（无需密码）
ssh -i ~/.ssh/id_rsa -fN -D 1080 root@154.36.184.20
```

### 自动启动隧道

添加到 `~/.zshrc`：

```bash
# 开机自动启动 SSH 隧道
auto_start_tunnel() {
    if ! lsof -i :1080 > /dev/null 2>&1; then
        echo "Starting SSH tunnel..."
        export SSH_PASS="your_password"
        ./scripts/tunnel.sh start
    fi
}

auto_start_tunnel
```

---

## ⚠️ 常见问题

### 1. sshpass 未安装

**macOS**:
```bash
brew install sshpass
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get install sshpass
```

**Linux (CentOS/RHEL)**:
```bash
sudo yum install sshpass
```

### 2. 端口被占用

```bash
# 查看占用端口的进程
lsof -i :1080

# 杀死进程
kill -9 <PID>

# 或使用其他端口
./scripts/tunnel.sh start  # 修改脚本中的 SOCKS_PORT
```

### 3. 连接失败

**检查步骤**：

```bash
# 1. 测试服务器连通性
ping 154.36.184.20

# 2. 测试 SSH 连接
ssh root@154.36.184.20

# 3. 检查隧道状态
./scripts/tunnel.sh status

# 4. 重启隧道
./scripts/tunnel.sh stop
./scripts/tunnel.sh start
```

### 4. Git 仍然无法连接

**解决方案**：

```bash
# 检查代理配置
git config --get http.proxy
git config --get https.proxy

# 重新配置代理
git config --global http.proxy 'socks5://127.0.0.1:1080'
git config --global https.proxy 'socks5://127.0.0.1:1080'

# 测试连接
git ls-remote --heads origin
```

### 5. 隧道断开

**自动重连脚本**：

创建 `~/.ssh/tunnel_monitor.sh`：

```bash
#!/bin/bash

while true; do
    if ! lsof -i :1080 > /dev/null 2>&1; then
        echo "$(date): Tunnel disconnected, restarting..."
        export SSH_PASS="your_password"
        sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no -fN -D 1080 root@154.36.184.20
    fi
    sleep 30
done
```

后台运行：
```bash
nohup ~/.ssh/tunnel_monitor.sh > /tmp/tunnel_monitor.log 2>&1 &
```

---

## 🔐 安全建议

### 1. 不要硬编码密码

❌ **不安全**：
```bash
export SSH_PASS="my_password"
```

✅ **推荐**：
```bash
# 使用 .env 文件
echo "SSH_PASS=my_password" >> .env
source .env

# 或使用密钥认证
ssh-keygen -t rsa -b 4096
```

### 2. 限制代理范围

只代理 GitHub：

```bash
git config --global http.https://github.com.proxy socks5://127.0.0.1:1080
git config --global https.https://github.com.proxy socks5://127.0.0.1:1080
```

### 3. 定期更换密码

建议每 3-6 个月更换一次服务器密码。

### 4. 使用防火墙规则

在服务器上限制 SSH 访问来源 IP。

---

## 📊 性能优化

### 1. SSH 连接优化

编辑 `~/.ssh/config`：

```
Host github-tunnel
    HostName 154.36.184.20
    User root
    Port 22
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
```

使用：
```bash
ssh -fN -D 1080 github-tunnel
```

### 2. Git 配置优化

```bash
# 增加缓冲区大小
git config --global http.postBuffer 524288000

# 启用压缩
git config --global core.compression 9

# 并行获取
git config --global fetch.parallel 8
```

---

## 🎯 最佳实践

### 开发工作流

```bash
# 1. 启动隧道
./scripts/tunnel.sh start

# 2. 验证连接
./scripts/tunnel.sh test

# 3. 进行 Git 操作
git add .
git commit -m "your message"
git push origin main

# 4. 完成后停止隧道
./scripts/tunnel.sh stop
```

### CI/CD 集成

在 GitHub Actions 中使用自托管 runner，避免代理问题。

### 团队协作

为团队成员提供：
1. 统一的服务器访问权限
2. 标准化的隧道配置脚本
3. 文档和培训

---

## 📚 相关资源

- [SSH 隧道原理](https://www.ssh.com/academy/ssh/tunneling)
- [Git 代理配置](https://git-scm.com/docs/git-config)
- [SOCKS5 协议](https://en.wikipedia.org/wiki/SOCKS)

---

## 🆘 技术支持

如果遇到问题：

1. 检查脚本状态：`./scripts/tunnel.sh status`
2. 测试连接：`./scripts/tunnel.sh test`
3. 查看日志：`tail -f /tmp/tunnel_monitor.log`
4. 重启隧道：`./scripts/tunnel.sh stop && ./scripts/tunnel.sh start`

---

**提示**: 建议将 `scripts/tunnel.sh` 添加到 PATH，方便全局使用：

```bash
echo 'export PATH="$PATH:/path/to/telegramByCustomerManager/scripts"' >> ~/.zshrc
source ~/.zshrc

# 之后可以直接使用
tunnel.sh start
tunnel.sh stop
```

祝您使用愉快！🚀
