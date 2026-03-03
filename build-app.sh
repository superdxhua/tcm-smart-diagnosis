#!/bin/bash

echo "==================================="
echo "  中医智能诊疗 APP 打包脚本"
echo "==================================="

# 步骤 1: 构建 H5 版本
echo ""
echo "[步骤 1/4] 构建 H5 版本..."
pnpm build:web
if [ $? -ne 0 ]; then
  echo "❌ H5 构建失败"
  exit 1
fi
echo "✅ H5 构建成功"

# 步骤 2: 同步到原生项目
echo ""
echo "[步骤 2/4] 同步文件到原生项目..."
npx cap sync android
if [ $? -ne 0 ]; then
  echo "❌ 同步失败"
  exit 1
fi
echo "✅ 同步成功"

# 步骤 3: 打开 Android Studio
echo ""
echo "[步骤 3/4] 打开 Android Studio..."
npx cap open android
if [ $? -ne 0 ]; then
  echo "❌ 打开 Android Studio 失败"
  exit 1
fi
echo "✅ Android Studio 已打开"

# 步骤 4: 提示打包
echo ""
echo "[步骤 4/4] 打包说明"
echo "==================================="
echo "请在 Android Studio 中执行以下步骤："
echo ""
echo "1. 等待 Gradle 同步完成"
echo "2. 点击 Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo "3. 构建完成后，点击 'locate' 定位 APK 文件"
echo ""
echo "APK 文件位置示例："
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "或者使用命令行打包："
echo "cd android"
echo "./gradlew assembleDebug"
echo ""
echo "==================================="
echo "✅ 准备工作完成"
