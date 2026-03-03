# PWA 图标准备指南

## 📋 图标清单

您的 PWA 应用需要以下图标文件：

### 必需图标（应用图标）

| 文件名 | 尺寸 | 用途 | 优先级 |
|-------|------|------|--------|
| `icon-16x16.png` | 16x16 | Favicon | ⭐⭐ |
| `icon-32x32.png` | 32x32 | Favicon | ⭐⭐ |
| `icon-72x72.png` | 72x72 | 安卓低分辨率 | ⭐ |
| `icon-96x96.png` | 96x96 | 安卓中分辨率 | ⭐ |
| `icon-128x128.png` | 128x128 | 安卓高分辨率 | ⭐ |
| `icon-144x144.png` | 144x144 | 安卓超高分辨率 | ⭐ |
| `icon-152x152.png` | 152x152 | iOS | ⭐⭐⭐ |
| `icon-192x192.png` | 192x192 | 安卓启动图标 | ⭐⭐⭐ |
| `icon-384x384.png` | 384x384 | 安卓启动画面 | ⭐ |
| `icon-512x512.png` | 512x512 | Chrome Store | ⭐⭐⭐ |

### 可选图标（快捷方式）

| 文件名 | 尺寸 | 用途 |
|-------|------|------|
| `shortcut-96.png` | 96x96 | 快捷方式图标 |

### 截图（可选）

| 文件名 | 尺寸 | 用途 |
|-------|------|------|
| `home-iphone.png` | 390x844 | iPhone 截图 |
| `home-iphone.png` | 828x1792 | iPhone 截图（高清） |

---

## 🎨 图标设计要求

### 设计原则

1. **简洁明了**
   - 避免复杂细节
   - 小尺寸下仍清晰可辨

2. **品牌一致**
   - 使用应用主题色
   - 保持品牌识别度

3. **透明背景**（推荐）
   - PNG 格式支持透明
   - 适应各种主题

4. **中心对齐**
   - 主要内容居中
   - 预留边缘空间

### 推荐颜色

```css
主色：#1890ff（蓝色）
辅色：#52c41a（绿色）
背景：#ffffff（白色）
```

### 图标内容建议

**方案 1：传统中医风格**
- 中药材图标（如人参、当归）
- 阴阳太极图
- 中医脉诊图

**方案 2：现代科技风格**
- AI 机器人 + 医疗十字
- 心率波形 + 中医元素
- 药瓶 + 科技感

**方案 3：简约风格**
- 纯文字"中医"
- 简化的十字图标
- 抽象的脉诊符号

---

## 🛠️ 图标生成方法

### 方法 1：使用在线工具（推荐）

**RealFaviconGenerator**
1. 访问 https://realfavicongenerator.net/
2. 上传一张 512x512 的主图标
3. 配置选项：
   - Background color: #1890ff
   - iOS: Revert to glossy
   - Windows Metro: Don't generate
   - Android Chrome: Don't generate
   - Safari Pinned Tab: Don't generate
4. 点击 "Generate your Favicons and HTML code"
5. 下载生成的文件包

**Favicon.io**
1. 访问 https://favicon.io/
2. 上传图片或使用文字生成
3. 下载生成的文件包

### 方法 2：使用命令行工具

**使用 sharp-cli（推荐）**

```bash
# 安装 sharp-cli
npm install -g sharp-cli

# 生成所有尺寸
sharp-cli your-icon.png public/icons/icon-16x16.png --width 16 --height 16
sharp-cli your-icon.png public/icons/icon-32x32.png --width 32 --height 32
sharp-cli your-icon.png public/icons/icon-72x72.png --width 72 --height 72
sharp-cli your-icon.png public/icons/icon-96x96.png --width 96 --height 96
sharp-cli your-icon.png public/icons/icon-128x128.png --width 128 --height 128
sharp-cli your-icon.png public/icons/icon-144x144.png --width 144 --height 144
sharp-cli your-icon.png public/icons/icon-152x152.png --width 152 --height 152
sharp-cli your-icon.png public/icons/icon-192x192.png --width 192 --height 192
sharp-cli your-icon.png public/icons/icon-384x384.png --width 384 --height 384
sharp-cli your-icon.png public/icons/icon-512x512.png --width 512 --height 512

# 生成快捷方式图标
sharp-cli your-icon.png public/icons/shortcut-96.png --width 96 --height 96
```

**使用 ImageMagick**

```bash
# 安装 ImageMagick
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Ubuntu

# 生成所有尺寸
for size in 16 32 72 96 128 144 152 192 384 512; do
  convert your-icon.png -resize ${size}x${size} public/icons/icon-${size}x${size}.png
done

# 生成快捷方式图标
convert your-icon.png -resize 96x96 public/icons/shortcut-96.png
```

### 方法 3：使用 Photoshop/Illustrator

**步骤**：
1. 打开设计软件
2. 创建 512x512 画布
3. 设计图标
4. 导出不同尺寸：
   - File → Export → Export As
   - 选择 PNG 格式
   - 设置不同尺寸
5. 保存到 `public/icons/` 目录

### 方法 4：使用 Figma

**步骤**：
1. 创建 512x512 画板
2. 设计图标
3. 使用插件 "Iconify" 或 "Figma to Icons"
4. 导出不同尺寸

---

## 📁 文件结构

准备完成后，文件结构应该是：

```
public/
├── manifest.json
├── icons/
│   ├── icon-16x16.png
│   ├── icon-32x32.png
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── shortcut-96.png
└── screenshots/
    └── home-iphone.png
```

---

## 🧪 测试图标

### 本地测试

```bash
# 启动开发服务器
npm run dev:h5

# 访问 http://localhost:5000
# 打开 Chrome DevTools → Application → Manifest
# 检查图标是否正确显示
```

### 测试清单

- [ ] 图标在浏览器标签页中显示
- [ ] 图标在收藏夹中显示
- [ ] iOS 上可以添加到主屏幕
- [ ] Android 上可以添加到主屏幕
- [ ] 安卓启动画面正确显示
- [ ] iOS 启动画面正确显示

---

## 💡 快速开始

### 如果您有现成的图标

```bash
# 1. 准备一张 512x512 的图标（your-icon.png）
# 2. 运行以下命令生成所有尺寸
npm install -g sharp-cli

# 3. 生成图标
for size in 16 32 72 96 128 144 152 192 384 512; do
  sharp-cli your-icon.png public/icons/icon-${size}x${size}.png --width $size --height $size
done

# 4. 完成！
```

### 如果您没有图标

**选项 A：使用在线生成器**
- 访问 https://realfavicongenerator.net/
- 上传一张简单的图片或使用文字生成

**选项 B：使用图标库**
- Flaticon: https://www.flaticon.com/
- Iconfont: https://www.iconfont.cn/
- 搜索 "medical", "health", "AI" 等关键词

**选项 C：找设计师**
- 可以在 Fiverr、猪八戒网找设计师
- 价格约 50-200 元

---

## ⚠️ 常见问题

### Q1: 图标显示模糊

**原因**：尺寸不够大

**解决方案**：
- 使用 512x512 或更大的原图
- 确保是矢量图或高分辨率位图

### Q2: 图标背景不是透明的

**原因**：原图没有透明背景

**解决方案**：
- 使用 PNG 格式
- 在设计软件中删除背景
- 或使用在线工具移除背景

### Q3: iOS 上图标有黑框

**原因**：图标尺寸不对

**解决方案**：
- 确保 `icon-152x152.png` 存在
- 重新生成图标

### Q4: 安卓上图标不显示

**原因**：Android Chrome 需要特定尺寸

**解决方案**：
- 确保所有必需尺寸都存在
- 检查 `manifest.json` 配置

---

## 📞 获取帮助

如果您遇到问题：
1. 查看 [PWA 文档](https://web.dev/add-manifest/)
2. 使用在线工具生成图标
3. 联系技术支持

---

**最后更新**：2024-01-01
