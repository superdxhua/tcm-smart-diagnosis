# 中医健康管理平台 - 设计指南

## 品牌定位
- **应用定位**：中医智能健康管理平台
- **设计风格**：专业、简洁、现代
- **目标用户**：中医从业者、患者、健康管理者
- **核心价值**：智能辨证、个性化调理方案

## 配色方案

### 主色系
```css
/* 中医主色 - 传统蓝绿色 */
bg-teal-600 / text-teal-600  /* 主色：#0d9488 */
bg-teal-700 / text-teal-700  /* 深色：#0f766e */
bg-teal-50  / text-teal-50   /* 浅色背景：#f0fdfa */
```

### 辅助色
```css
/* 功能色 */
bg-blue-500    /* 信息：#3b82f6 */
bg-green-500   /* 成功：#22c55e */
bg-orange-500  /* 警告：#f97316 */
bg-red-500     /* 危险：#ef4444 */
bg-purple-500  /* 特殊功能：#a855f7 */
bg-indigo-500  /* 高级功能：#6366f1 */
```

### 中性色
```css
/* 文本颜色 */
text-gray-900    /* 主文本：#111827 */
text-gray-700    /* 次要文本：#374151 */
text-gray-500    /* 辅助文本：#6b7280 */
text-gray-400    /* 禁用/占位符：#9ca3af */

/* 背景颜色 */
bg-white         /* 主背景：#ffffff */
bg-gray-50       /* 次要背景：#f9fafb */
bg-gray-100      /* 卡片背景：#f3f4f6 */
```

## 字体规范

### 层级
```css
text-xs     /* 12px - 辅助信息 */
text-sm     /* 14px - 正文 */
text-base   /* 16px - 默认文本 */
text-lg     /* 18px - 小标题 */
text-xl     /* 20px - 标题 */
text-2xl    /* 24px - 大标题 */
text-3xl    /* 30px - 主标题 */
```

### 权重
```css
font-normal  /* 400 - 正文 */
font-medium  /* 500 - 强调 */
font-semibold/* 600 - 小标题 */
font-bold    /* 700 - 大标题 */
```

## 间距系统

### 页面边距
```css
p-4   /* 16px - 移动端内边距 */
p-6   /* 24px - 平板端内边距 */
p-8   /* 32px - 桌面端内边距 */
```

### 组件间距
```css
gap-2  /* 8px - 小间距 */
gap-3  /* 12px - 标准间距 */
gap-4  /* 16px - 中间距 */
gap-6  /* 24px - 大间距 */
gap-8  /* 32px - 超大间距 */
```

### 外边距
```css
mb-2  /* 8px - 小外边距 */
mb-3  /* 12px - 标准外边距 */
mb-4  /* 16px - 中外边距 */
mb-6  /* 24px - 大外边距 */
```

## 响应式断点

### 断点定义
```css
/* Tailwind 默认断点 */
sm:  640px  /* 平板竖屏 */
md:  768px  /* 平板横屏 */
lg:  1024px /* 桌面端 */
xl:  1280px /* 大桌面 */
2xl: 1536px /* 超大桌面 */
```

### 响应式策略
```tsx
/* 移动端优先 */
<View className="w-full"> {/* 移动端全宽 */}

/* 平板端调整 */
<View className="sm:w-1/2"> {/* 平板半宽 */}

/* 桌面端布局 */
<View className="lg:grid lg:grid-cols-2"> {/* 桌面两列 */}

/* 大桌面优化 */
<View className="xl:max-w-7xl"> {/* 大桌面限制最大宽度 */}
```

## 组件规范

### 按钮样式
```tsx
/* 主按钮 */
<View className="bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors">
  <Text>确定</Text>
</View>

/* 次按钮 */
<View className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors">
  <Text>取消</Text>
</View>

/* 危险按钮 */
<View className="bg-red-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-colors">
  <Text>删除</Text>
</View>

/* 禁用状态 */
<View className="bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-medium cursor-not-allowed">
  <Text>禁用</Text>
</View>
```

### 卡片/容器
```tsx
/* 标准卡片 */
<View className="bg-white rounded-xl shadow-sm p-6">
  {/* 内容 */}
</View>

/* 浅色卡片 */
<View className="bg-gray-50 rounded-xl p-6">
  {/* 内容 */}
</View>

/* 强调卡片 */
<View className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
  {/* 内容 */}
</View>
```

### 输入框
```tsx
{/* 标准输入框 */}
<View className="w-full bg-gray-50 rounded-xl px-4 py-3">
  <Input
    className="w-full bg-transparent text-base"
    placeholder="请输入内容"
  />
</View>

{/* 必填输入框 */}
<View className="w-full bg-white rounded-xl border-2 border-teal-500 px-4 py-3">
  <Input
    className="w-full bg-transparent text-base"
    placeholder="请输入内容（必填）"
  />
</View>

{/* 文本域 */}
<View className="w-full bg-gray-50 rounded-xl px-4 py-3">
  <Textarea
    className="w-full bg-transparent text-base min-h-[120px]"
    placeholder="请输入详细描述"
    maxlength={500}
  />
</View>
```

### 列表项
```tsx
{/* 标准列表项 */}
<View className="flex items-center justify-between p-4 bg-white rounded-xl mb-2 shadow-sm">
  <View className="flex-1">
    <Text className="block text-base font-medium text-gray-900">标题</Text>
    <Text className="block text-sm text-gray-500">描述信息</Text>
  </View>
  <View className="flex-shrink-0 ml-4">
    {/* 操作按钮 */}
  </View>
</View>
```

### 空状态
```tsx
<View className="flex flex-col items-center justify-center py-12">
  <Text className="block text-6xl mb-4">📭</Text>
  <Text className="block text-xl font-medium text-gray-700 mb-2">暂无数据</Text>
  <Text className="block text-sm text-gray-500">请稍后再试</Text>
</View>
```

### 加载状态
```tsx
<View className="flex items-center justify-center py-12">
  <View className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></View>
  <Text className="block ml-4 text-gray-600">加载中...</Text>
</View>
```

## 导航结构

### 顶部导航栏
```tsx
<View className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
  <View className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <View className="flex items-center justify-between h-16">
      {/* Logo 和标题 */}
      <View className="flex items-center">
        <Text className="block text-2xl font-bold text-teal-600">🏥</Text>
        <Text className="block ml-2 text-xl font-bold text-gray-900">
          中医智能健康
        </Text>
      </View>

      {/* 桌面端导航链接 */}
      <View className="hidden lg:flex items-center gap-6">
        <Text className="block text-gray-700 hover:text-teal-600 cursor-pointer">首页</Text>
        <Text className="block text-gray-700 hover:text-teal-600 cursor-pointer">问诊</Text>
        <Text className="block text-gray-700 hover:text-teal-600 cursor-pointer">档案</Text>
        <Text className="block text-gray-700 hover:text-teal-600 cursor-pointer">学习</Text>
      </View>

      {/* 用户菜单 */}
      <View className="flex items-center gap-2">
        {/* 用户头像/按钮 */}
      </View>
    </View>
  </View>
</View>
```

### 移动端导航栏
```tsx
<View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
  <View className="flex items-center justify-around h-16">
    <View className="flex flex-col items-center">
      <Text className="block text-2xl">🏠</Text>
      <Text className="block text-xs mt-1">首页</Text>
    </View>
    <View className="flex flex-col items-center">
      <Text className="block text-2xl">💬</Text>
      <Text className="block text-xs mt-1">问诊</Text>
    </View>
    <View className="flex flex-col items-center">
      <Text className="block text-2xl">📋</Text>
      <Text className="block text-xs mt-1">档案</Text>
    </View>
    <View className="flex flex-col items-center">
      <Text className="block text-2xl">👤</Text>
      <Text className="block text-xs mt-1">我的</Text>
    </View>
  </View>
</View>
```

## 特殊组件

### 徽章/标签
```tsx
{/* 信息标签 */}
<View className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
  <Text>信息</Text>
</View>

{/* 成功标签 */}
<View className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
  <Text>成功</Text>
</View>

{/* 警告标签 */}
<View className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
  <Text>警告</Text>
</View>

{/* 危险标签 */}
<View className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
  <Text>危险</Text>
</View>
```

### 提示框
```tsx
{/* 信息提示 */}
<View className="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-500">
  <Text className="block text-sm text-blue-700">提示信息</Text>
</View>

{/* 成功提示 */}
<View className="p-4 rounded-xl bg-green-50 border-l-4 border-green-500">
  <Text className="block text-sm text-green-700">操作成功</Text>
</View>

{/* 警告提示 */}
<View className="p-4 rounded-xl bg-orange-50 border-l-4 border-orange-500">
  <Text className="block text-sm text-orange-700">请注意</Text>
</View>

{/* 错误提示 */}
<View className="p-4 rounded-xl bg-red-50 border-l-4 border-red-500">
  <Text className="block text-sm text-red-700">操作失败</Text>
</View>
```

## 响应式设计最佳实践

### 1. 移动端优先
```tsx
/* ✅ 正确：移动端默认样式 */
<View className="w-full p-4 sm:w-1/2 lg:w-1/3">
  {/* 内容 */}
</View>

/* ❌ 错误：桌面端优先 */
<View className="lg:w-1/3 sm:w-1/2 w-full p-4">
  {/* 内容 */}
</View>
```

### 2. 使用容器限制宽度
```tsx
/* ✅ 正确：使用 max-width 限制最大宽度 */
<View className="w-full max-w-7xl mx-auto px-4">
  {/* 内容 */}
</View>

/* ❌ 错误：没有限制宽度 */
<View className="w-full px-4">
  {/* 内容 */}
</View>
```

### 3. 合理使用断点
```tsx
/* ✅ 正确：按屏幕尺寸渐进增强 */
<View className="flex flex-col md:flex-row lg:gap-8">
  {/* 移动端纵向，平板横向，桌面大间距 */}
</View>

/* ❌ 错误：跳跃式断点 */
<View className="flex flex-col xl:flex-row">
  {/* 跳过了 md/lg 断点 */}
</View>
```

### 4. 文本大小响应式
```tsx
/* ✅ 正确：文本大小响应式 */
<Text className="text-sm sm:text-base lg:text-lg">
  响应式文本
</Text>

/* ❌ 错误：固定文本大小 */
<Text className="text-base">
  固定文本
</Text>
```

### 5. 间距响应式
```tsx
/* ✅ 正确：间距响应式 */
<View className="p-4 sm:p-6 lg:p-8">
  响应式内边距
</View>

/* ❌ 错误：固定间距 */
<View className="p-4">
  固定内边距
</View>
```

## 小程序约束

### 包体积限制
- 总包体积：不超过 2MB
- 主包体积：不超过 1.5MB
- 单个分包：不超过 2MB

### 图片策略
- 使用 WebP 格式（如果支持）
- 图片压缩：使用 TinyPNG 或类似工具
- 懒加载：使用 lazy loading
- CDN 加速：使用对象存储 CDN

### 性能优化
- 减少 DOM 节点数量
- 避免深层嵌套（不超过 5 层）
- 使用虚拟列表（长列表）
- 优化图片加载
- 减少网络请求

## 设计一致性检查清单

### 配色检查
- [ ] 使用指定主色系（teal-600/700/50）
- [ ] 功能色使用正确（蓝/绿/橙/红）
- [ ] 中性色使用合理（灰度层级清晰）
- [ ] 禁用状态使用灰色

### 字体检查
- [ ] 标题层级清晰（h1-h6）
- [ ] 正文字体大小适中（text-sm/base）
- [ ] 辅助文字颜色正确（gray-500）
- [ ] 字重使用合理（normal/medium/semibold/bold）

### 间距检查
- [ ] 页面边距符合规范（p-4/6/8）
- [ ] 组件间距统一（gap-2/3/4/6）
- [ ] 外边距合理（mb-2/3/4/6）
- [ ] 对齐一致（左对齐/居中）

### 布局检查
- [ ] 响应式断点合理（sm/md/lg/xl/2xl）
- [ ] 移动端优先原则
- [ ] 容器宽度限制（max-w-7xl）
- [ ] 对齐方式一致

### 交互检查
- [ ] 按钮状态完整（正常/hover/disabled）
- [ ] 卡片阴影适中（shadow-sm/md）
- [ ] 圆角统一（rounded-xl）
- [ ] 过渡动画流畅（transition-all/transition-colors）

## 设计资源

### 图标库
- 主图标库：`lucide-react-taro`
- 官方文档：https://lucide.dev/icons/

### 色彩参考
- 主色参考：中国传统色彩 - 蓝绿色系
- 辅助色参考：Tailwind CSS 默认色板
- 工具：https://tailwindui.com/colors

### 字体参考
- 默认字体：系统字体栈
- 优先使用：苹方-简体 / SF Pro Text / Roboto

## 设计原则

1. **简洁至上**：避免过度装饰，保持界面清晰
2. **一致性**：配色、字体、间距保持统一
3. **可访问性**：确保文本对比度足够（至少 4.5:1）
4. **性能优先**：优化加载速度，避免卡顿
5. **响应式设计**：确保在不同设备上都有良好体验
