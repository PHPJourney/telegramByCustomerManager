#!/bin/bash

# SSH 隧道管理脚本
# 用于通过东京服务器代理 GitHub 访问

TOKYO_IP="154.36.184.20"
SSH_USER="root"
SOCKS_PORT=1080

# 从环境变量读取密码，如果未设置则提示输入
if [ -z "$SSH_PASS" ]; then
    echo "⚠️  警告: SSH_PASS 环境变量未设置"
    read -s -p "请输入 SSH 密码: " SSH_PASS
    echo ""
fi

export SSH_PASS

# 检查 sshpass 是否安装
if ! command -v sshpass &> /dev/null; then
    echo "❌ 错误: sshpass 未安装"
    echo "请运行: brew install sshpass (macOS) 或 apt-get install sshpass (Linux)"
    exit 1
fi

case "$1" in
    start)
        echo "🚀 正在启动 SSH 隧道..."
        echo "   服务器: ${TOKYO_IP}"
        echo "   用户: ${SSH_USER}"
        echo "   SOCKS 端口: ${SOCKS_PORT}"
        
        # 检查是否已有隧道运行
        if lsof -i :${SOCKS_PORT} > /dev/null 2>&1; then
            echo "⚠️  警告: 端口 ${SOCKS_PORT} 已被占用"
            echo "   是否已存在运行的隧道？"
            read -p "   是否重启隧道？(y/n): " restart
            if [ "$restart" = "y" ]; then
                $0 stop
            else
                exit 0
            fi
        fi
        
        # 建立 SSH 隧道
        sshpass -p "${SSH_PASS}" ssh -o StrictHostKeyChecking=no -fN -D ${SOCKS_PORT} ${SSH_USER}@${TOKYO_IP}
        
        if [ $? -eq 0 ]; then
            echo "✅ SSH 隧道启动成功"
            echo ""
            echo "📝 配置 Git 代理..."
            git config --global http.proxy "socks5://127.0.0.1:${SOCKS_PORT}"
            git config --global https.proxy "socks5://127.0.0.1:${SOCKS_PORT}"
            echo "✅ Git 代理配置完成"
            echo ""
            echo "🔗 现在可以通过隧道访问 GitHub"
            echo "   测试: git push origin main"
        else
            echo "❌ SSH 隧道启动失败"
            exit 1
        fi
        ;;
    
    stop)
        echo "🛑 正在停止 SSH 隧道..."
        
        # 查找并杀死 SSH 隧道进程
        PID=$(ps aux | grep "ssh.*-D ${SOCKS_PORT}" | grep -v grep | awk '{print $2}')
        
        if [ -n "$PID" ]; then
            kill $PID
            echo "✅ SSH 隧道已停止 (PID: $PID)"
        else
            echo "ℹ️  未找到运行中的 SSH 隧道"
        fi
        
        # 清除 Git 代理配置
        echo "📝 清除 Git 代理配置..."
        git config --global --unset http.proxy 2>/dev/null
        git config --global --unset https.proxy 2>/dev/null
        echo "✅ Git 代理已清除"
        ;;
    
    status)
        echo "📊 SSH 隧道状态检查"
        echo ""
        
        # 检查端口占用
        if lsof -i :${SOCKS_PORT} > /dev/null 2>&1; then
            echo "✅ SSH 隧道正在运行"
            echo "   端口: ${SOCKS_PORT}"
            PID=$(lsof -ti :${SOCKS_PORT})
            echo "   PID: $PID"
        else
            echo "❌ SSH 隧道未运行"
        fi
        
        echo ""
        
        # 检查 Git 代理配置
        HTTP_PROXY=$(git config --get http.proxy)
        HTTPS_PROXY=$(git config --get https.proxy)
        
        if [ -n "$HTTP_PROXY" ] && [ -n "$HTTPS_PROXY" ]; then
            echo "✅ Git 代理已配置"
            echo "   HTTP: $HTTP_PROXY"
            echo "   HTTPS: $HTTPS_PROXY"
        else
            echo "❌ Git 代理未配置"
        fi
        ;;
    
    test)
        echo "🧪 测试 GitHub 连接..."
        echo ""
        
        # 检查隧道是否运行
        if ! lsof -i :${SOCKS_PORT} > /dev/null 2>&1; then
            echo "❌ SSH 隧道未运行，请先启动隧道"
            echo "   运行: $0 start"
            exit 1
        fi
        
        # 测试 GitHub 连接
        echo "正在测试 GitHub 连接..."
        timeout 10 git ls-remote --heads origin > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ GitHub 连接成功"
            echo ""
            echo "📊 当前分支信息:"
            git branch -v
        else
            echo "❌ GitHub 连接失败"
            echo ""
            echo "可能的原因:"
            echo "  1. SSH 隧道不稳定"
            echo "  2. 网络连接问题"
            echo "  3. GitHub 服务异常"
            echo ""
            echo "建议:"
            echo "  - 重启隧道: $0 stop && $0 start"
            echo "  - 检查网络: ping github.com"
        fi
        ;;
    
    *)
        echo "🔧 SSH 隧道管理工具"
        echo ""
        echo "用法: $0 {start|stop|status|test}"
        echo ""
        echo "命令说明:"
        echo "  start  - 启动 SSH 隧道并配置 Git 代理"
        echo "  stop   - 停止 SSH 隧道并清除 Git 代理"
        echo "  status - 检查隧道和代理状态"
        echo "  test   - 测试 GitHub 连接"
        echo ""
        echo "环境变量:"
        echo "  SSH_PASS - SSH 密码（可选，不设置会提示输入）"
        echo ""
        echo "示例:"
        echo "  export SSH_PASS='your_password'"
        echo "  $0 start"
        echo "  git push origin main"
        echo "  $0 stop"
        echo ""
        exit 1
        ;;
esac
