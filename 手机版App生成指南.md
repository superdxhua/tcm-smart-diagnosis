# 智能中医辅助诊疗 - 手机版 App 生成指南

本指南介绍如何使用 H5 加壳工具将智能中医辅助诊疗系统打包成手机 App（Android 和 iOS）。

## 方案对比

| 工具 | 价格 | 难度 | 功能 | 推荐度 |
|------|------|------|------|--------|
| GoNative | 免费 / $19+/月 | ⭐ | 强大 | ⭐⭐⭐⭐⭐ |
| WebViewGold | $49 一次性 | ⭐ | 完整 | ⭐⭐⭐⭐⭐ |
| Apache Cordova Build | 免费 | ⭐⭐ | 开源 | ⭐⭐⭐⭐ |
| Adalo | 免费 / $25+/月 | ⭐ | 可视化 | ⭐⭐⭐ |

## 方案一：GoNative（推荐）

### 优点
- ✅ 操作简单，5 分钟完成
- ✅ 支持自定义功能
- ✅ 质量较高
- ✅ 有免费版本
- ✅ 支持推送通知
- ✅ 支持离线缓存

### 价格
- 免费版：带水印广告
- 专业版：$19/月，去除水印和广告
- 企业版：$99/月，高级功能

### 操作步骤

#### 步骤 1：准备 H5 网站

**方法 A：使用 Netlify（推荐）**

1. 访问：https://app.netlify.com/drop
2. 登录或注册账号
3. 将 H5 构建产物（`dist-web` 文件夹）拖拽上传
4. 等待部署完成（约 1-2 分钟）
5. 记录生成的网站地址，例如：`https://your-tcm-app.netlify.app`

**方法 B：使用 Vercel**

1. 访问：https://vercel.com
2. 使用 GitHub 账号登录
3. 点击"New Project"
4. 导入您的代码仓库
5. 选择 "H5" 作为构建输出目录
6. 点击"Deploy"
7. 等待部署完成，记录网站地址

**方法 C：使用 GitHub Pages**

1. 访问：https://github.com
2. 创建新仓库或使用现有仓库
3. 上传 H5 文件到仓库
4. 进入仓库设置，启用 Pages
5. 选择主分支和根目录
6. 等待部署完成，记录网站地址

#### 步骤 2：注册 GoNative 账号

1. 访问：https://gonative.io
2. 点击右上角的 "Start Free" 按钮
3. 填写注册信息（邮箱、密码）
4. 验证邮箱
5. 登录账号

#### 步骤 3：创建应用

1. 登录后，点击 "Create New App"
2. 填写应用信息：
   - **App Name**: 智能中医辅助诊疗
   - **App URL**: 输入步骤 1 中获得的 H5 网站地址
   - **Package Name**: com.tcm.assistant（Android）
   - **Bundle ID**: com.tcm.assistant（iOS）
3. 点击 "Next"

#### 步骤 4：上传图标

1. 准备图标文件：
   - **尺寸**: 1024x1024 像素
   - **格式**: PNG
   - **设计**: 使用我们之前设计的"草药+科技芯片"方案
2. 点击 "Upload Icon" 上传图标
3. 等待图标处理完成

#### 步骤 5：配置启动页

1. 准备启动页图片：
   - **尺寸**: 1242x2208 像素（iPhone X）
   - **格式**: PNG
   - **设计**: 包含应用 Logo 和品牌信息
2. 点击 "Upload Splash Screen" 上传启动页
3. 配置背景色：`#C8102E`（中国红）

#### 步骤 6：配置应用信息

1. 填写应用详情：
   - **App Name**: 智能中医辅助诊疗
   - **Short Description**: 基于AI的中医智能诊疗助手
   - **Description**:
     ```
     智能中医辅助诊疗系统是一款基于人工智能的中医诊断助手应用。

     主要功能：
     - AI 智能分析症状
     - 经方医案查询
     - 图片识别诊断
     - 处方自动生成
     - 联网搜索知识

     免责声明：本应用仅提供辅助诊疗建议，不代替专业医生诊断。请在专业医师指导下使用。
     ```
   - **Keywords**: 中医, 诊疗, AI, 健康, 医案
   - **Category**: Medical（医疗）或 Health（健康）
   - **Support Email**: support@tcm-assistant.com

2. 配置主题色：
   - **Primary Color**: #C8102E（中国红）
   - **Secondary Color**: #764ba2（科技紫）

#### 步骤 7：高级配置（可选）

1. **启用推送通知**（付费功能）
   - 勾选 "Enable Push Notifications"
   - 配置推送证书（需要额外步骤）

2. **启用离线缓存**
   - 勾选 "Enable Offline Caching"
   - 设置缓存大小（建议 50MB）

3. **配置导航栏**
   - **Title Color**: #FFFFFF（白色）
   - **Background Color**: #C8102E（中国红）
   - **Hide Navigation Bar**: 取消勾选

4. **配置状态栏**
   - **Status Bar Style**: Light（浅色）

#### 步骤 8：生成 App

1. 点击 "Generate App" 按钮
2. 等待构建完成（通常 5-10 分钟）
3. 构建完成后会收到邮件通知

#### 步骤 9：下载安装包

1. 登录 GoNative 账号
2. 进入应用详情页
3. 下载安装包：
   - **Android**: 点击 "Download Android APK"
   - **iOS**: 点击 "Download iOS IPA"

#### 步骤 10：测试安装

**Android 测试**：
1. 将 APK 文件传输到手机
2. 在手机上打开 APK 文件
3. 允许"安装未知来源应用"
4. 完成安装
5. 启动应用测试所有功能

**iOS 测试**：
1. 需要 Apple Developer 账号（$99/年）
2. 使用 TestFlight 进行内测
3. 或使用企业签名（$299/年）

---

## 方案二：WebViewGold

### 优点
- ✅ 一次性购买，终身使用
- ✅ 支持离线功能
- ✅ 功能强大
- ✅ 无广告
- ✅ 支持自定义插件

### 价格
- iOS 版本：$49（一次性）
- Android 版本：$49（一次性）
- 双平台套餐：$79（一次性）

### 操作步骤

#### 步骤 1：购买模板

1. 访问：https://www.webviewgold.com
2. 选择平台（iOS 或 Android）
3. 点击 "Buy Now"
4. 完成支付
5. 下载模板文件

#### 步骤 2：准备资源

1. 准备图标文件：
   - **尺寸**: 1024x1024 像素
   - **格式**: PNG
   - **名称**: icon.png

2. 准备启动页：
   - **尺寸**: 1242x2208 像素
   - **格式**: PNG
   - **名称**: splash.png

#### 步骤 3：在线配置

1. 访问 WebViewGold 在线配置页面
2. 登录账号
3. 填写配置信息：
   - **Website URL**: 您的 H5 网站地址
   - **App Name**: 智能中医辅助诊疗
   - **Package Name**: com.tcm.assistant
   - **Version**: 1.0.0
   - **Build Number**: 1

4. 上传资源：
   - 上传图标（icon.png）
   - 上传启动页（splash.png）

5. 配置主题色：
   - **Primary Color**: #C8102E
   - **Secondary Color**: #764ba2

6. 点击 "Generate" 按钮

#### 步骤 4：下载安装包

1. 等待构建完成（约 5 分钟）
2. 下载生成的安装包：
   - iOS: .ipa 文件
   - Android: .apk 文件

#### 步骤 5：测试安装

与 GoNative 相同的测试步骤。

---

## 方案三：Apache Cordova Build

### 优点
- ✅ 完全免费
- ✅ 开源
- ✅ Apache 官方支持
- ✅ 功能完整

### 价格
- 完全免费

### 操作步骤

#### 步骤 1：注册账号

1. 访问：https://build.cordova.io
2. 点击 "Sign Up"
3. 填写注册信息
4. 验证邮箱
5. 登录账号

#### 步骤 2：创建应用

1. 点击 "Create New App"
2. 填写应用信息：
   - **App Name**: 智能中医辅助诊疗
   - **ID**: com.tcm.assistant
3. 选择模板：Blank（空白模板）
4. 点击 "Create"

#### 步骤 3：配置应用

1. 进入应用详情页
2. 编辑 `config.xml` 文件：
   ```xml
   <?xml version='1.0' encoding='utf-8'?>
   <widget id="com.tcm.assistant" version="1.0.0"
           xmlns="http://www.w3.org/ns/widgets"
           xmlns:cdv="http://cordova.apache.org/ns/1.0">
     <name>智能中医辅助诊疗</name>
     <description>基于AI的中医智能诊疗助手</description>
     <author>TCM Assistant Team</author>
     <content src="index.html" />
     <access origin="*" />
     <allow-intent href="http://*/*" />
     <allow-intent href="https://*/*" />
     <preference name="Orientation" value="portrait" />
     <preference name="Fullscreen" value="false" />
     <preference name="BackgroundColor" value="#C8102E" />
   </xml>
   ```

3. 配置网站地址：
   - 在 `<content>` 标签中设置您的 H5 网站地址
   - 或者使用 `config.xml` 中的 `<content src="https://your-app.com">`

#### 步骤 4：上传资源

1. 上传图标：
   - Android: res/icon/android/icon-48-48.png
   - iOS: res/icon/ios/icon-60-60@3x.png

2. 上传启动页：
   - Android: res/screen/android/screen-mdpi-portrait.png
   - iOS: res/screen/ios/screen-iphone-portrait.png

#### 步骤 5：构建应用

1. 选择目标平台：
   - Android: 点击 "Build Android"
   - iOS: 点击 "Build iOS"

2. 等待构建完成（约 5-10 分钟）

#### 步骤 6：下载安装包

1. 构建完成后，点击 "Download"
2. 下载安装包

---

## 图标和启动页设计指南

### 图标设计

**尺寸要求**：
- **Android**: 192x192 像素（自适应图标）
- **iOS**: 1024x1024 像素（App Store）
- **通用**: 1024x1024 像素（建议）

**设计要素**：
1. **主色**: #C8102E（中国红）
2. **辅色**: #764ba2（科技紫）
3. **元素**: 草药 + 科技芯片
4. **风格**: 扁平化、现代、简洁

**示例设计**：
```
┌─────────────────────────────┐
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    [草药图案]         │  │
│  │                       │  │
│  │      [芯片]           │  │
│  │                       │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### 启动页设计

**尺寸要求**：
- **Android**: 1080x1920 像素（竖屏）
- **iOS**: 1242x2208 像素（iPhone X）

**设计要素**：
1. **背景色**: #C8102E（中国红）
2. **Logo**: 居中显示
3. **文字**: "智能中医辅助诊疗"
4. **副标题**: "传承千年智慧，赋能现代医疗"

**示例设计**：
```
┌─────────────────────────────┐
│                             │
│                             │
│          [LOGO]             │
│                             │
│      智能中医辅助诊疗        │
│    传承千年智慧，赋能现代医疗│
│                             │
│                             │
└─────────────────────────────┘
```

---

## 应用商店发布

### Android 发布

#### 1. 准备材料

- **APK 文件**: 已签名的安装包
- **应用图标**: 512x512 像素 PNG
- **截图**: 至少 2 张手机截图（5.5 英寸或更大）
- **宣传图**: 1024x500 像素（可选）
- **隐私政策**: 必须提供
- **应用描述**: 详细的功能说明

#### 2. 注册开发者账号

- **Google Play**: $25 一次性（https://play.google.com/console）
- **华为应用市场**: 免费（https://developer.huawei.com/consumer/cn/）
- **小米应用商店**: 免费（https://dev.mi.com/console/）
- **OPPO 软件商店**: 免费（https://open.oppomobile.com/）
- **vivo 应用商店**: 免费（https://dev.vivo.com.cn/）
- **腾讯应用宝**: 免费（https://open.qq.com/）

#### 3. 提交应用

1. 登录开发者后台
2. 创建新应用
3. 填写应用信息
4. 上传 APK 文件
5. 上传截图和图标
6. 填写应用描述
7. 选择类目：医疗或健康
8. 提交审核

#### 4. 审核周期

- Google Play: 1-7 天
- 华为应用市场: 1-3 天
- 小米应用商店: 1-3 天
- OPPO 软件商店: 1-3 天
- vivo 应用商店: 1-3 天
- 腾讯应用宝: 1-5 天

### iOS 发布

#### 1. 准备材料

- **IPA 文件**: 已签名的安装包
- **应用图标**: 1024x1024 像素 PNG
- **截图**:
  - 6.7 英寸：1290x2796 像素
  - 6.5 英寸：1242x2688 像素
  - 5.5 英寸：1242x2208 像素
- **宣传图**: 1024x500 像素
- **隐私政策**: 必须提供
- **应用描述**: 详细的功能说明

#### 2. 注册开发者账号

- **个人**: $99/年
- **企业**: $299/年
- 注册地址：https://developer.apple.com/programs/

#### 3. 创建应用

1. 登录 App Store Connect
2. 点击 "My Apps"
3. 点击 "+，新建 App"
4. 填写应用信息：
   - **Platform**: iOS
   - **Name**: 智能中医辅助诊疗
   - **Primary Language**: Simplified Chinese
   - **Bundle ID**: com.tcm.assistant
   - **SKU**: TCM-ASSISTANT-001

#### 4. 上传应用

1. 使用 Xcode 或 Application Loader 上传 IPA
2. 等待处理完成

#### 5. 配置应用信息

1. 填写应用描述
2. 上传截图
3. 选择类目：Medical（医疗）
4. 填写隐私政策 URL
5. 配置定价和销售范围

#### 6. 提交审核

1. 点击 "提交以供审核"
2. 回答审核问题
3. 提交审核

#### 7. 审核周期

- 通常 1-3 天
- 医疗类可能需要 3-5 天

---

## 免责声明模板

### 应用内免责声明

```
重要提示：

本应用仅提供辅助诊疗建议，不代替专业医生诊断。请在专业医师指导下使用。

1. 本应用的人工智能分析结果仅供参考，不应作为诊断依据。
2. 如有任何健康问题，请及时就医，遵医嘱治疗。
3. 本应用不对使用本应用造成的任何后果承担责任。
4. 本应用不保证诊断结果的准确性和完整性。

用户使用本应用即表示同意以上条款。
```

### 应用商店免责声明

```
【医疗免责声明】

本应用是一款基于人工智能的中医辅助诊疗工具，旨在为用户提供参考信息。

重要提示：
- 本应用不提供医疗诊断或治疗建议
- 本应用的所有内容仅供参考，不作为诊断依据
- 如有健康问题，请及时就医，遵医嘱治疗
- 本应用不对使用本应用造成的任何后果承担责任

使用条款：
用户使用本应用即表示理解并同意：
1. 本应用的内容仅供参考，不构成医疗建议
2. 任何医疗决定都应在专业医师指导下进行
3. 本应用不保证内容的准确性和完整性
4. 本应用不对使用本应用造成的任何损害承担责任

联系方式：
如有任何问题，请联系：support@tcm-assistant.com
```

---

## 常见问题

### 1. Android APK 无法安装

**原因**: 允许"安装未知来源应用"未开启

**解决**:
- 进入手机设置
- 安全 > 允许"安装未知来源应用"
- 选择浏览器或文件管理器
- 允许安装

### 2. iOS IPA 无法安装

**原因**: 未签名或来自未知开发者

**解决**:
- 使用企业签名
- 或使用 TestFlight 进行测试
- 或越狱后安装

### 3. 应用无法联网

**原因**: 缺少网络权限

**解决**:
在 `config.xml` 或配置文件中添加：
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### 4. 图标显示不正确

**原因**: 图标尺寸或格式不对

**解决**:
- 确保图标为 PNG 格式
- 确保图标尺寸正确（1024x1024）
- 确保图标背景透明或符合设计规范

### 5. 应用被拒绝

**原因**: 违反应用商店规则

**解决**:
- 检查应用描述和功能
- 确保不包含违规内容
- 提供必要的资质证明
- 修改后重新提交

---

## 推荐流程

### 最简单流程（推荐）

1. **使用 GoNative 免费版**
   - 上传 H5 网站
   - 上传图标
   - 生成 APK
   - 测试安装

2. **测试通过后升级付费版**
   - 去除水印和广告
   - 启用高级功能

3. **提交应用商店**
   - 填写应用信息
   - 上传截图
   - 提交审核

### 最省钱流程

1. **使用 Apache Cordova Build**
   - 完全免费
   - 功能完整

2. **自行签名**
   - 使用自己的签名证书
   - 节省签名费用

3. **发布到国内商店**
   - 华为、小米、OPPO、vivo 等
   - 免费发布

---

## 总结

推荐使用 **GoNative**，原因：
- ✅ 操作简单
- ✅ 功能强大
- ✅ 质量有保障
- ✅ 有免费版本可以测试

如果您有预算，推荐购买 **WebViewGold**，原因：
- ✅ 一次性购买，终身使用
- ✅ 支持更多自定义功能
- ✅ 长期来看更省钱

如果您想完全免费，推荐使用 **Apache Cordova Build**，原因：
- ✅ 完全免费
- ✅ 开源
- ✅ 功能完整

有任何问题，请参考各自的官方文档或联系客服。
