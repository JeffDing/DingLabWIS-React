#!/bin/bash

# DingLab气象研究中心综合信息服务平台 - 启动脚本
# 使用方法：bash run.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "=========================================="
echo " DingLab气象研究中心综合信息服务平台"
echo "=========================================="
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误：未检测到 Node.js，请先安装 Node.js (推荐 v18 或更高版本)"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "错误：未检测到 npm，请先安装 npm"
    exit 1
fi

echo "Node.js 版本：$(node -v)"
echo "npm 版本：$(npm -v)"
echo ""

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "检测到首次运行，正在安装依赖..."
    echo "这可能需要几分钟时间，请耐心等待..."
    echo ""
    npm install
    echo ""
    echo "依赖安装完成！"
else
    echo "依赖已存在，跳过安装步骤。"
fi

echo ""
echo "正在启动开发服务器..."
echo "项目地址：http://localhost:5173"
echo "按 Ctrl+C 可停止服务器"
echo ""
echo "=========================================="

# 启动开发服务器
npm run dev