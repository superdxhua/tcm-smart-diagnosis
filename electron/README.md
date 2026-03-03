# 智能中医辅助诊疗 - 桌面版

这是智能中医辅助诊疗系统的桌面版应用，基于 Electron 构建，支持 Windows、macOS 和 Linux 平台。

## 功能特性

- ✅ 跨平台支持（Windows、macOS、Linux）
- ✅ 原生窗口管理
- ✅ 自定义菜单栏
- ✅ 自动更新支持（可选）
- ✅ 离线使用（部分功能）
- ✅ 系统托盘图标（可选）

## 系统要求

### Windows
- Windows 10 或更高版本
- 64 位系统
- 至少 4GB RAM
- 至少 500MB 可用磁盘空间

### macOS
- macOS 10.14 (Mojave) 或更高版本
- Intel 或 Apple Silicon 处理器
- 至少 4GB RAM
- 至少 500MB 可用磁盘空间

### Linux
- Ubuntu 18.04 或更高版本（或其他主流发行版）
- 64 位系统
- 至少 4GB RAM
- 至少 500MB 可用磁盘空间

## 安装方法

### 方法一：下载预构建版本（推荐）

1. 从发布页面下载对应平台的安装包：
   - Windows: `智能中医辅助诊疗-Setup-1.0.0.exe`
   - macOS: `智能中医辅助诊疗-1.0.0.dmg`
   - Linux: `智能中医辅助诊疗-1.0.0.AppImage`

2. 运行安装程序：
   - **Windows**: 双击 `.exe` 文件，按照提示完成安装
   - **macOS**: 双击 `.dmg` 文件，拖拽到应用程序文件夹
   - **Linux**: 赋予执行权限并运行：`chmod +x 智能中医辅助诊疗-1.0.0.AppImage`

3. 启动应用

### 方法二：从源代码构建

#### 1. 安装依赖

```bash
# 进入 electron 目录
cd electron

# 安装 Node.js 依赖
npm install
# 或使用 pnpm
pnpm install
```

#### 2. 准备图标

按照 `图标说明.md` 文件中的说明，准备三个图标文件：
- `icon.ico` (Windows)
- `icon.icns` (macOS)
- `icon.png` (Linux)

#### 3. 构建 Windows 版本

```bash
npm run build:win
```

构建完成后，安装包位于 `electron/dist/` 目录。

#### 4. 构建 macOS 版本

```bash
npm run build:mac
```

**注意**：
- macOS 构建需要在 Mac 电脑上进行
- 构建 DMG 需要额外的配置

#### 5. 构建 Linux 版本

```bash
npm run build:linux
```

构建完成后，安装包位于 `electron/dist/` 目录。

## 开发模式

### 启动开发模式

```bash
npm start
```

这会启动应用并打开开发者工具，方便调试。

### 热重载

如果需要热重载功能，可以安装 `electron-reload`：

```bash
npm install --save-dev electron-reload
```

然后在 `main.js` 中添加：

```javascript
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
  })
}
```

## 文件结构

```
electron/
├── main.js           # 主进程文件
├── preload.js        # 预加载脚本
├── package.json      # 依赖配置
├── src/              # 前端源码
│   └── index.html    # 入口页面
├── icon.ico          # Windows 图标
├── icon.icns         # macOS 图标
├── icon.png          # Linux 图标
└── dist/             # 构建输出目录
```

## 配置说明

### 修改应用名称

编辑 `package.json` 中的 `productName` 字段：

```json
{
  "build": {
    "productName": "您的应用名称"
  }
}
```

### 修改应用图标

按照 `图标说明.md` 中的说明准备图标文件。

### 修改窗口大小

编辑 `main.js` 中的窗口配置：

```javascript
mainWindow = new BrowserWindow({
  width: 1280,    // 修改宽度
  height: 800,    // 修改高度
  // ...
})
```

## 打包配置

### Windows 安装程序配置

编辑 `package.json` 中的 `nsis` 字段：

```json
{
  "build": {
    "nsis": {
      "oneClick": false,                    // 是否一键安装
      "allowToChangeInstallationDirectory": true,  // 允许更改安装目录
      "createDesktopShortcut": true,        // 创建桌面快捷方式
      "createStartMenuShortcut": true       // 创建开始菜单快捷方式
    }
  }
}
```

### macOS 配置

编辑 `package.json` 中的 `mac` 字段：

```json
{
  "build": {
    "mac": {
      "target": ["dmg", "zip"],             // 构建目标
      "category": "public.app-category.healthcare-and-fitness",  // 应用分类
      "hardenedRuntime": true,              // 启用硬运行时
      "gatekeeperAssess": false             // 跳过 Gatekeeper 检查
    }
  }
}
```

## 常见问题

### 1. Windows 应用无法启动

**原因**: Windows Defender 阻止

**解决**:
- 右键点击应用，选择"属性"
- 勾选"解除锁定"
- 点击"确定"

### 2. macOS 应用无法打开

**原因**: 未签名或来自未知开发者

**解决**:
- 右键点击应用，选择"打开"
- 点击"打开"确认

### 3. Linux 应用缺少依赖

**解决**:
```bash
# Ubuntu/Debian
sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libuuid1 libappindicator3-1 libsecret-1-0

# Fedora
sudo dnf install gtk3 libnotify nss libXScrnSaver libXtst xdg-utils at-spi2-core libuuid libappindicator-gtk3 libsecret

# Arch Linux
sudo pacman -S gtk3 libnotify nss libxss libxtst xdg-utils atspi2-core libappindicator-gtk3 libsecret
```

### 4. 构建失败

**原因**: 缺少图标文件

**解决**:
按照 `图标说明.md` 准备图标文件，或者暂时注释掉图标配置。

### 5. 窗口大小不合适

**解决**:
编辑 `main.js`，调整窗口大小：
```javascript
mainWindow = new BrowserWindow({
  width: 1920,    // 更大的宽度
  height: 1080,   // 更大的高度
  // ...
})
```

## 更新日志

### v1.0.0 (2024-02-15)
- ✨ 初始版本发布
- ✨ 支持跨平台（Windows、macOS、Linux）
- ✨ 基础 UI 界面
- ✨ 菜单栏功能
- ✨ 窗口管理

## 技术栈

- **框架**: Electron 28
- **构建工具**: electron-builder 24
- **语言**: JavaScript (Node.js)
- **前端**: HTML5 + CSS3 + JavaScript

## 许可证

MIT License

## 支持

如有问题，请联系：
- 邮箱: support@tcm-assistant.com
- 微信: TCM-Assistant

## 免责声明

本应用仅提供辅助诊疗建议，不代替专业医生诊断。请在专业医师指导下使用。
