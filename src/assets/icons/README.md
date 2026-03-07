# 小程序头像使用说明

## 已创建的图标

我们为您创建了 4 个符合微信小程序要求的 SVG 图标，所有图标都遵循以下规范：

- **尺寸**：512 × 512 像素
- **格式**：SVG（矢量格式，可无损缩放）
- **配色**：符合医疗辅助类应用的配色规范
- **风格**：简约、专业、易识别

---

## 图标设计方案

### 方案一：太极 + 科技线条（logo-yin-yang.svg）
- **设计理念**：传统中医太极图案 + 现代科技线条
- **主色**：中国红 (#C8102E)
- **辅色**：科技蓝 (#1890FF)
- **特点**：传统与现代的完美融合
- **推荐指数**：⭐⭐⭐⭐⭐

### 方案二：草药 + 科技芯片（logo-herb-tech.svg）
- **设计理念**：中医药材 + AI 芯片元素
- **主色**：绿色 (#22C55E)
- **辅色**：科技蓝 (#1890FF)
- **特点**：突出中医药特色和 AI 技术
- **推荐指数**：⭐⭐⭐⭐

### 方案三：葫芦 + 光环（logo-gourd.svg）
- **设计理念**：传统中医葫芦 + 金色光环
- **主色**：中国红 (#C8102E)
- **辅色**：金色 (#FFD700)
- **特点**：最具传统中医特色
- **推荐指数**：⭐⭐⭐⭐⭐

### 方案四：医疗十字 + 科技线条（logo-medical-cross.svg）
- **设计理念**：医疗十字符号 + 科技装饰
- **主色**：中国红 (#C8102E)
- **辅色**：科技蓝 (#1890FF)
- **特点**：通用医疗符号，辨识度高
- **推荐指数**：⭐⭐⭐

---

## 使用方法

### 方式一：直接使用 SVG（推荐开发阶段）

在小程序开发阶段，可以直接使用 SVG 格式：

```tsx
import logoYinYang from '@/assets/icons/logo-yin-yang.svg'

// 在组件中使用
<Image src={logoYinYang} className="w-16 h-16" />
```

### 方式二：转换为 PNG 格式（微信小程序提交必需）

微信小程序提交审核时需要 PNG 格式的图标。您需要将 SVG 转换为 PNG。

#### 在线转换工具（免费）

1. **CloudConvert**
   - 网址：https://cloudconvert.com/svg-to-png
   - 操作：上传 SVG → 设置尺寸为 512×512 → 转换 → 下载 PNG

2. **SVG-to-PNG.com**
   - 网址：https://svg-to-png.com/
   - 操作：上传 SVG → 设置尺寸 → 转换 → 下载 PNG

3. **Convertio**
   - 网址：https://convertio.co/zh/svg-png/
   - 操作：上传 SVG → 转换 → 下载 PNG

#### 命令行转换（适合开发者）

如果您有技术背景，可以使用命令行工具：

**方式一：使用自动转换脚本（最简单）**

我们已经为您提供了一个 Python 脚本，可以自动检测系统中的转换工具并批量转换：

```bash
# 进入图标目录
cd src/assets/icons

# 运行转换脚本
python3 convert_svg_to_png.py
```

脚本会自动：
- 检测系统中可用的转换工具（ImageMagick、Inkscape、librsvg）
- 批量转换所有 logo-*.svg 文件为 PNG
- 显示转换进度和结果

**方式二：使用 ImageMagick**（需先安装）：
```bash
# 安装 ImageMagick
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Ubuntu

# 转换 SVG 为 PNG
convert src/assets/icons/logo-yin-yang.svg -resize 512x512 src/assets/icons/logo-yin-yang.png
```

**方式三：使用 Inkscape**（需先安装）：
```bash
# 安装 Inkscape
brew install --cask inkscape  # macOS
sudo apt-get install inkscape  # Ubuntu

# 转换 SVG 为 PNG
inkscape src/assets/icons/logo-yin-yang.svg --export-filename=src/assets/icons/logo-yin-yang.png --export-width=512 --export-height=512
```

**方式四：使用 rsvg-convert**（需先安装）：
```bash
# 安装 librsvg
brew install librsvg  # macOS
sudo apt-get install librsvg2-bin  # Ubuntu

# 转换 SVG 为 PNG
rsvg-convert -w 512 -h 512 src/assets/icons/logo-yin-yang.svg -o src/assets/icons/logo-yin-yang.png
```

---

## 微信小程序配置

### 1. 配置小程序基本信息

登录微信公众平台 → 开发 → 开发设置 → 基本信息配置：

- **小程序名称**：智能中医辅助诊疗
- **小程序简介**：基于张仲景经方和历代名医医案的中医诊疗辅助工具
- **服务类目**：医疗 → 医疗信息服务
- **头像**：上传转换后的 PNG 文件（512×512 像素）

### 2. 配置项目文件

在 `project.config.json` 中配置（如果需要）：

```json
{
  "projectname": "智能中医辅助诊疗",
  "description": "基于张仲景经方和历代名医医案的中医诊疗辅助工具",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "postcss": true,
    "minified": true
  }
}
```

### 3. 在小程序中使用头像

在 `src/app.config.ts` 或页面配置中使用：

```typescript
// 方式一：使用网络图片（已上传到服务器）
export default defineAppConfig({
  window: {
    navigationBarBackgroundColor: '#C8102E',
    navigationBarTitleText: '智能中医辅助诊疗',
    navigationBarTextStyle: 'white'
  }
})
```

---

## 推荐选择

### 最佳推荐：方案三（葫芦 + 光环）

**推荐理由**：
- ✅ 最具中医传统特色
- ✅ 葫芦是中医的经典象征
- ✅ 金色光环增加科技感
- ✅ 红色配色符合中医主题
- ✅ 简洁明了，易于识别

**使用场景**：
- 微信小程序头像
- App 图标
- 品牌标识
- 推广宣传

### 备选方案：方案一（太极 + 科技线条）

**推荐理由**：
- ✅ 太极是中医理论的核心符号
- ✅ 科技线条体现 AI 辅助
- ✅ 传统与现代融合
- ✅ 设计简洁大方

**使用场景**：
- 微信小程序头像
- App 图标
- 技术文档
- 开发者社区

---

## 注意事项

### 1. 文件大小
- PNG 文件大小应控制在 2MB 以内
- 当前 SVG 转换为 PNG 后约 50-100KB，完全符合要求

### 2. 图标展示
- 微信小程序的头像会以圆形展示
- 核心元素应位于中心区域
- 四个角的内容可能会被裁切

### 3. 颜色校准
- 不同设备的屏幕可能显示颜色略有差异
- 建议在多种设备上测试显示效果

### 4. 版权问题
- 这些图标为原创设计，可免费使用
- 无需担心版权问题

---

## 快速开始

### 步骤 1：选择图标
推荐选择 `logo-gourd.svg`（葫芦 + 光环）

### 步骤 2：转换为 PNG
使用在线工具：https://cloudconvert.com/svg-to-png
- 上传 `logo-gourd.svg`
- 设置尺寸为 512 × 512
- 点击转换
- 下载 PNG 文件

### 步骤 3：上传到微信
登录微信公众平台 → 开发 → 开发设置 → 基本信息配置
- 点击"头像"上传区域
- 选择转换后的 PNG 文件
- 确认上传

### 步骤 4：提交审核
- 完成其他基本信息配置
- 提交审核
- 等待微信审核通过

---

## 技术支持

如果您在使用过程中遇到任何问题，欢迎联系我们：

- 📧 邮箱：support@example.com
- 📱 微信：[客服微信号]
- 💬 QQ群：[QQ群号]

---

## 更新记录

- **2025-01-15**：创建 4 个 SVG 图标
- **2025-01-15**：编写使用说明文档

---

**祝您的小程序审核顺利通过！**
