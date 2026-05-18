#!/bin/bash

echo "======================================"
echo "  运动计步器 - 快速启动脚本"
echo "======================================"
echo ""

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3"
    echo "请先安装Python: https://www.python.org/downloads/"
    exit 1
fi

echo "✅ Python版本: $(python3 --version)"
echo ""

# 检查依赖是否安装
if ! python3 -c "import flask" 2>/dev/null; then
    echo "📦 正在安装依赖包..."
    pip3 install -r requirements.txt
    echo ""
fi

# 创建数据目录
mkdir -p data

# 获取本机IP
echo "🌐 网络信息:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    # Windows (Git Bash)
    IP=$(ipconfig | grep "IPv4" | awk '{print $NF}' | head -1)
fi

echo "  本地访问: http://localhost:5000"
if [ -n "$IP" ]; then
    echo "  手机访问: http://$IP:5000"
fi
echo ""

echo "🚀 启动应用..."
echo "按 Ctrl+C 停止服务器"
echo "======================================"
echo ""

# 启动Flask应用
python3 app.py
