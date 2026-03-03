# 📱 中医智能诊疗 APP 打包

本目录包含将 Taro 小程序打包为 Android APK 和 iOS APP 的配置和脚本。

## 快速开始

### 一键打包（Android）

```bash
# 方式 1: 使用打包脚本（推荐）
pnpm app:build

# 方式 2: 分步执行
pnpm app:sync    # 构建 H5 并同步到 Android 项目
pnpm app:open    # 打开 Android Studio
```

### iOS 打包（需要 Mac）

```bash
# 1. 添加 iOS 平台
pnpm app:ios

# 2. 同步文件
pnpm app:sync

# 3. 打开 Xcode
npx cap open ios

# 4. 在 Xcode 中打包
```

## 文件说明

- `capacitor.config.ts` - Capacitor 配置文件
- `build-app.sh` - Android 打包脚本
- `APP_BUILD_GUIDE.md` - 详细打包指南
- `android/` - Android 原生项目目录
- `ios/` - iOS 原生项目目录（需要 Mac 添加）

## APP 信息

- **应用名称**: 中医智能诊疗
- **包名**: com.tcm.smart.diagnosis
- **版本**: 1.0.0

## 常用命令

```bash
# 构建并同步到 Android 项目
pnpm app:sync

# 打开 Android Studio
pnpm app:open

# 在 Android 设备上运行
pnpm app:run

# 添加 Android 平台
pnpm app:android

# 添加 iOS 平台
pnpm app:ios
```

## 下载安装

### Android APK

打包完成后，APK 文件位置：

```
android/app/build/outputs/apk/debug/app-debug.apk
```

将 APK 文件发送到手机，点击安装即可。

### iOS APP

需要通过以下方式安装：

1. **TestFlight** (推荐)
   - 上传到 TestFlight，邀请测试
   - 无需越狱，支持正式签名

2. **Ad Hoc 分发**
   - 使用开发者证书打包
   - 需要 100 台设备 UDID 注册

3. **企业证书** (需要企业账号)
   - 可以直接安装，无需审核
   - 适合企业内部分发

## 详细文档

查看 `APP_BUILD_GUIDE.md` 获取完整的打包指南，包括：

- 环境配置
- 签名和发布
- 性能优化
- 常见问题解决

## 技术栈

- **框架**: Taro 4.x
- **运行时**: Capacitor 8.x
- **目标平台**: Android, iOS
- **构建工具**: Android Studio, Xcode

## 注意事项

1. **Android**
   - 需要 Android Studio
   - 需要 Android SDK (API 33+)
   - 支持 Android 5.0+

2. **iOS**
   - 需要 macOS 和 Xcode
   - 需要 Apple Developer 账号（$99/年）
   - 支持 iOS 12+

3. **网络配置**
   - APP 默认允许 HTTP 请求
   - 如需 HTTPS，请修改 `capacitor.config.ts`

## 支持

如有问题，请查看 `APP_BUILD_GUIDE.md` 或联系开发团队。
