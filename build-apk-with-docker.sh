#!/bin/bash

# Android APK 自动构建脚本
# 使用 Docker 构建，无需安装 Android Studio

set -e

echo "🚀 开始构建 Android APK..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    echo "安装指南：https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker 已安装"

# 构建 Docker 镜像
echo "📦 构建 Docker 镜像..."
docker build -f Dockerfile.android -t tcm-android-builder .

# 运行构建容器
echo "🔨 开始构建 APK..."
docker run --rm -v "$(pwd):/workspace" -w /workspace tcm-android-builder bash -c '
    # 安装依赖
    echo "📦 安装 pnpm 依赖..."
    pnpm install

    # 构建 H5
    echo "🌐 构建 H5 版本..."
    pnpm build:web

    # 同步到 Android 项目
    echo "🔄 同步到 Android 项目..."
    pnpm app:sync

    # 构建 APK
    echo "🏗️  构建 APK..."
    cd android
    ./gradlew assembleDebug

    # 复制 APK 到 downloads 目录
    echo "📋 复制 APK 到 downloads 目录..."
    mkdir -p ../downloads
    cp app/build/outputs/apk/debug/app-debug.apk ../downloads/

    # 输出 APK 信息
    echo "✅ APK 构建完成！"
    ls -lh ../downloads/app-debug.apk
'

# 检查 APK 是否生成
if [ -f "downloads/app-debug.apk" ]; then
    echo ""
    echo "🎉 APK 构建成功！"
    echo "📍 APK 文件位置：downloads/app-debug.apk"
    echo "📏 文件大小：$(ls -lh downloads/app-debug.apk | awk '{print $5}')"
    echo ""
    echo "💡 提示："
    echo "1. 将 downloads/app-debug.apk 文件发给用户"
    echo "2. 或重启服务器，用户可从官网下载"
    echo "   命令：coze dev"
    echo "   访问：http://localhost:5000/pages/download/index"
else
    echo ""
    echo "❌ APK 构建失败，请检查错误信息"
    exit 1
fi
