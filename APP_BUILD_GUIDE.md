# 中医智能诊疗 APP 打包指南

本指南帮助你将 Taro 小程序打包为 Android APK 和 iOS APP。

## 前置要求

### Android 开发

1. **安装 Android Studio**
   - 下载地址：https://developer.android.com/studio
   - 安装后打开，安装 Android SDK（推荐 API 33 或更高版本）

2. **配置环境变量**
   ```bash
   # 添加到 ~/.bashrc 或 ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### iOS 开发（可选）

1. **安装 Xcode**
   - 从 Mac App Store 安装 Xcode
   - 需要 macOS 系统

2. **安装 CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

## 快速打包 Android APK

### 方法 1: 使用打包脚本（推荐）

```bash
# 1. 构建并同步到 Android 项目
./build-app.sh

# 2. 在 Android Studio 中打包
# - 等待 Gradle 同步完成
# - Build > Build Bundle(s) / APK(s) > Build APK(s)
# - 构建完成后点击 'locate' 定位 APK 文件
```

### 方法 2: 手动打包

```bash
# 1. 构建 H5 版本
pnpm build:web

# 2. 同步文件到 Android 项目
npx cap sync android

# 3. 打开 Android Studio
npx cap open android

# 4. 在 Android Studio 中：
#    - 等待 Gradle 同步完成
#    - Build > Build Bundle(s) / APK(s) > Build APK(s)
#    - 点击 'locate' 查看 APK 文件位置

# 5. 或者使用命令行打包
cd android
./gradlew assembleDebug

# APK 文件位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 打包 iOS APP（需要 Mac）

```bash
# 1. 添加 iOS 平台
npx cap add ios

# 2. 同步文件
npx cap sync ios

# 3. 打开 Xcode
npx cap open ios

# 4. 在 Xcode 中：
#    - 配置开发者账号（需要 Apple Developer Program）
#    - 选择模拟器或真机
#    - Product > Archive
#    - 导出 IPA 文件
```

## 常见问题

### 1. Gradle 同步失败

```bash
# 删除 .gradle 缓存
rm -rf ~/.gradle/caches

# 在 Android Studio 中：
# File > Invalidate Caches / Restart
```

### 2. 无法连接到后端 API

修改 `capacitor.config.ts` 中的配置：

```typescript
server: {
  androidScheme: 'https',
  cleartext: true,  // 允许 HTTP 请求
  allowNavigation: ['*'],
}
```

### 3. 修改应用图标和名称

1. 准备应用图标（建议 1024x1024 PNG）
2. 放置到 `android/app/src/main/res/` 目录
3. 或者使用在线工具生成：
   - https://icon.kitchen/

### 4. 修改应用名称

修改以下文件：

- `android/app/src/main/res/values/strings.xml`
  ```xml
  <string name="app_name">中医智能诊疗</string>
  ```

- `capacitor.config.ts`
  ```typescript
  appName: '中医智能诊疗',
  ```

## 签名和发布

### Android 签名

1. **生成签名文件**
   ```bash
   keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **配置签名**
   - `android/app/build.gradle`
   ```gradle
   signingConfigs {
     release {
       storeFile file("release.keystore")
       storePassword "your-password"
       keyAlias "release"
       keyPassword "your-password"
     }
   }

   buildTypes {
     release {
       signingConfig signingConfigs.release
       minifyEnabled true
       proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
     }
   }
   ```

3. **打包 Release 版本**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **上传到应用商店**
   - Google Play Store: https://play.google.com/console
   - 国内应用商店：小米应用商店、华为应用市场、应用宝等

### iOS 发布

1. **配置证书**
   - 在 Apple Developer 网站创建 App ID
   - 生成开发证书和发布证书
   - 在 Xcode 中配置证书

2. **打包上传**
   ```bash
   npx cap sync ios
   npx cap open ios
   ```
   - Product > Archive
   - 导出 App Store Connect

3. **提交审核**
   - 登录 App Store Connect
   - 上传应用截图和说明
   - 提交审核

## 开发调试

### 在 Android 设备上调试

```bash
# 1. 启用 USB 调试
# 手机 > 设置 > 开发者选项 > USB 调试

# 2. 连接手机
# 确保电脑已识别手机

# 3. 运行应用
npx cap run android

# 或者在 Android Studio 中点击运行按钮
```

### 在 iOS 模拟器上调试

```bash
# 1. 打开 Xcode
npx cap open ios

# 2. 选择模拟器
# 3. 点击运行按钮
```

## 版本管理

### 更新版本号

修改 `android/app/build.gradle`：

```gradle
android {
  defaultConfig {
    versionCode 1
    versionName "1.0.0"
  }
}
```

修改 `capacitor.config.ts`：

```typescript
{
  version: '1.0.0',
  build: '1'
}
```

## 性能优化

### 1. 启用代码压缩

修改 `android/app/build.gradle`：

```gradle
buildTypes {
  release {
    minifyEnabled true
    shrinkResources true
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
  }
}
```

### 2. 优化图片资源

- 使用 WebP 格式
- 压缩图片大小
- 使用矢量图标

### 3. 减少 APK 大小

```bash
# 启用 R8 完整模式
android/app/build.gradle
android {
  buildTypes {
    release {
      minifyEnabled true
      shrinkResources true
    }
  }
}
```

## 技术支持

- Capacitor 官方文档：https://capacitorjs.com/docs
- Taro 官方文档：https://docs.taro.zone
- Android Studio 问题：https://developer.android.com/studio

## 联系方式

如有问题，请联系开发团队。
