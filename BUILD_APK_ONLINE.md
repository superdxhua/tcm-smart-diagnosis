# 🌐 使用在线构建服务（最简单，无需任何工具）

## 🎯 推荐的在线构建服务

### 方案 1：GitHub Actions（推荐，免费）

**优点**：
- ✅ 完全免费
- ✅ 自动化构建
- ✅ 支持版本管理
- ✅ 可以下载历史版本

**步骤**：

#### 第一步：创建 GitHub 仓库

1. 注册 GitHub 账号（如果还没有）：https://github.com/
2. 创建新仓库：
   - 点击右上角 "+" → "New repository"
   - 仓库名：`tcm-smart-diagnosis`
   - 设为公开（Public）或私有（Private）
   - 点击 "Create repository"

#### 第二步：上传代码到 GitHub

**如果你在本地电脑上**：

```bash
# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/tcm-smart-diagnosis.git

# 推送到 GitHub
git push -u origin main
```

#### 第三步：创建 GitHub Actions 工作流

1. 在 GitHub 仓库中，点击 "Actions"
2. 点击 "New workflow"
3. 选择 "Simple workflow"
4. 复制以下内容：

```yaml
name: Build Android APK

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build H5
        run: pnpm build:web

      - name: Install Android SDK
        run: |
          wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
          unzip -q commandlinetools-linux-9477386_latest.zip
          sudo mkdir -p /opt/android-sdk/cmdline-tools/latest
          sudo mv cmdline-tools/* /opt/android-sdk/cmdline-tools/latest/
          export ANDROID_HOME=/opt/android-sdk
          export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
          yes | sdkmanager --licenses || true
          sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

      - name: Sync Android
        run: |
          export ANDROID_HOME=/opt/android-sdk
          export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
          pnpm app:sync

      - name: Build APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk

      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: android/app/build/outputs/apk/debug/app-debug.apk
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

5. 点击 "Save" → "Commit changes"

#### 第四步：触发构建

**方式 1：通过标签触发（推荐）**

```bash
# 在本地创建标签
git tag v1.0.0

# 推送标签到 GitHub
git push origin v1.0.0
```

GitHub 会自动开始构建 APK！

**方式 2：手动触发**

1. 在 GitHub 仓库中，点击 "Actions"
2. 选择 "Build Android APK"
3. 点击 "Run workflow" → "Run workflow"

#### 第五步：下载 APK

1. 构建完成后，进入 "Actions" 页面
2. 点击最近的构建任务
3. 在页面底部找到 "Artifacts"
4. 下载 "app-debug-apk"
5. 解压后得到 `app-debug.apk` 文件

---

### 方案 2：GitLab CI（免费）

**优点**：
- ✅ 免费版也够用
- ✅ 集成 GitLab 仓库
- ✅ 支持 CI/CD 流程

**步骤**：

#### 第一步：创建 GitLab 仓库

1. 注册 GitLab 账号：https://gitlab.com/
2. 创建新项目：`tcm-smart-diagnosis`

#### 第二步：创建 `.gitlab-ci.yml`

在项目根目录创建 `.gitlab-ci.yml` 文件：

```yaml
stages:
  - build

build_apk:
  stage: build
  image: openjdk:17-jdk-slim
  before_script:
    - apt-get update && apt-get install -y wget unzip git nodejs npm
    - npm install -g pnpm
  script:
    - pnpm install
    - pnpm build:web
    - wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
    - unzip -q commandlinetools-linux-9477386_latest.zip
    - mkdir -p /opt/android-sdk/cmdline-tools/latest
    - mv cmdline-tools/* /opt/android-sdk/cmdline-tools/latest/
    - export ANDROID_HOME=/opt/android-sdk
    - export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
    - yes | sdkmanager --licenses || true
    - sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
    - pnpm app:sync
    - cd android
    - chmod +x gradlew
    - ./gradlew assembleDebug
  artifacts:
    paths:
      - android/app/build/outputs/apk/debug/app-debug.apk
    expire_in: 1 week
  only:
    - tags
```

#### 第三步：提交代码并触发构建

```bash
git add .
git commit -m "Add GitLab CI"
git push

# 创建标签并推送
git tag v1.0.0
git push origin v1.0.0
```

#### 第四步：下载 APK

1. 进入 GitLab 项目
2. 点击 "CI/CD" → "Pipelines"
3. 点击成功的构建任务
4. 下载 Artifacts 中的 APK 文件

---

### 方案 3：使用云构建平台（收费，但最简单）

#### 1. AppCenter（Microsoft）

- 网址：https://appcenter.ms/
- 优点：微软官方，集成 GitHub/GitLab
- 缺点：免费额度有限

#### 2. Bitrise

- 网址：https://www.bitrise.io/
- 优点：专门用于移动应用构建
- 缺点：免费额度有限

#### 3. Codemagic

- 网址：https://codemagic.io/
- 优点：界面友好，配置简单
- 缺点：免费额度有限

---

## 📊 方案对比

| 方案 | 难度 | 费用 | 构建时间 | 推荐度 |
|------|------|------|---------|--------|
| GitHub Actions | ⭐⭐ | 免费 | 5-10 分钟 | ⭐⭐⭐⭐⭐ |
| GitLab CI | ⭐⭐⭐ | 免费 | 5-10 分钟 | ⭐⭐⭐⭐ |
| Docker 本地构建 | ⭐⭐⭐⭐ | 免费 | 5-15 分钟 | ⭐⭐⭐ |
| 云构建平台 | ⭐ | 收费 | 3-5 分钟 | ⭐⭐⭐⭐ |

---

## 🎯 推荐选择

### 如果你是开发者
- **推荐**：GitHub Actions
- **理由**：免费、自动化、版本管理

### 如果你是小白用户
- **推荐**：GitHub Actions + 找人帮忙配置
- **理由**：配置一次后永久使用

### 如果你有预算
- **推荐**：Codemagic
- **理由**：最简单，可视化配置

---

## 💡 快速开始（5 分钟）

**最快的方式**：

1. 注册 GitHub 账号（1 分钟）
2. 创建仓库并上传代码（2 分钟）
3. 复制 GitHub Actions 配置文件（1 分钟）
4. 推送标签触发构建（1 分钟）
5. 等待 5-10 分钟，下载 APK

---

## 📞 需要帮助？

如果配置遇到问题：

1. **查看 GitHub Actions 文档**：
   https://docs.github.com/en/actions

2. **联系技术支持**：
   - 邮箱：support@example.com
   - 电话：400-xxx-xxxx

---

**最后更新**：2026年2月
**版本**：1.0.0
