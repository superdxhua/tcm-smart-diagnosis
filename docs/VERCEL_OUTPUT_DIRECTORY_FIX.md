# Vercel 部署配置修复指南

## 问题诊断

**错误信息**：
```
Error: No Output Directory named "h5" found after the Build completed.
Configure the Output Directory in your Project Settings.
Alternatively, configure vercel.json#outputDirectory.
```

**问题原因**：
- Vercel 项目设置中的 Output Directory 配置为 `h5`（旧配置）
- 但实际构建输出目录是 `dist-web`
- 导致 Vercel 找不到正确的输出目录

## 解决方案（2 种方法，任选其一）

### 方法一：在 Vercel 项目设置中修改（推荐）

#### 步骤 1：登录 Vercel
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目 `tcm-smart-diagnosis-app`
3. 点击进入项目页面

#### 步骤 2：修改 Output Directory
1. 点击项目页面顶部的 **Settings**（设置）标签
2. 在左侧菜单中找到 **General**（通用）选项
3. 向下滚动找到 **Build & Development Settings**（构建与开发设置）
4. 找到 **Output Directory**（输出目录）字段
5. 将值从 `h5` 修改为 `dist-web`
6. 点击 **Save**（保存）

#### 步骤 3：重新部署
1. 点击项目页面顶部的 **Deployments**（部署）标签
2. 找到最新的部署记录（失败的）
3. 点击右侧的 **...**（更多）按钮
4. 选择 **Redeploy**（重新部署）
5. 确认重新部署

**预期结果**：
- 构建成功
- Output Directory 正确识别为 `dist-web`
- 部署成功，可以通过 Vercel 域名访问

---

### 方法二：删除 vercel.json 中的 outputDirectory 字段

如果方法一不生效，可以尝试删除 `vercel.json` 中的 `outputDirectory` 字段，让 Vercel 自动检测。

#### 步骤 1：修改 vercel.json
将 `vercel.json` 中的 `outputDirectory` 字段删除：

```json
{
  "version": 2,
  "name": "tcm-smart-diagnosis",
  "buildCommand": "npm install --legacy-peer-deps && npm run build:web",
  "installCommand": "npm install --legacy-peer-deps",
  // 删除这一行： "outputDirectory": "dist-web",
  "framework": null,
  "regions": ["sin1"],
  // ... 其他配置保持不变
}
```

#### 步骤 2：提交代码并重新部署
1. 提交修改后的 `vercel.json` 到 GitHub
2. Vercel 会自动检测到更新并重新部署

---

## 验证修复

### 检查构建日志
1. 在 Vercel 项目页面，点击最新的部署记录
2. 查看 **Build Logs**（构建日志）
3. 确认日志中显示 `✓ built in xx.xx s`（构建成功）
4. 确认没有 "No Output Directory found" 错误

### 检查文件结构
构建成功后，应该能看到以下输出：

```
../dist-web/index.html
../dist-web/js/app.xxx-legacy.js
../dist-web/js/index-legacy.xxx.js
../dist-web/js/vendors-legacy.da275a8b.js
...
```

### 测试访问
部署成功后，访问 Vercel 提供的域名：
- 示例：`https://tcm-smart-diagnosis-app.vercel.app`

---

## 常见问题

### Q1: 为什么之前配置了 outputDirectory 还会报错？
**A**: Vercel 的项目设置优先级高于 `vercel.json`。如果项目设置中的 Output Directory 与 `vercel.json` 不一致，会使用项目设置中的值。

### Q2: 修改 Output Directory 后需要做什么？
**A**: 修改后必须重新部署，否则不会生效。

### Q3: 如何确认当前使用的 Output Directory？
**A**:
1. 进入 Vercel 项目设置
2. 查看 **Build & Development Settings** 中的 **Output Directory** 字段
3. 这就是实际使用的配置

### Q4: 可以使用其他目录名吗？
**A**: 可以，但需要确保：
- `package.json` 中的 `build:web` 脚本输出到该目录
- `vercel.json` 中的 `outputDirectory` 与实际输出目录一致
- Vercel 项目设置中的 Output Directory 也一致

---

## 推荐配置

### 当前正确的配置（已在 vercel.json 中）：
```json
{
  "buildCommand": "npm install --legacy-peer-deps && npm run build:web",
  "installCommand": "npm install --legacy-peer-deps",
  "outputDirectory": "dist-web"
}
```

### 为什么使用 `dist-web`？
- 这是 Taro 框架构建 H5 版本的默认输出目录
- 与小程序输出目录 `dist` 分离，避免混淆
- 符合前端构建的最佳实践

---

## 下一步操作

### 立即执行：
1. **修改 Vercel 项目设置中的 Output Directory**（推荐方法一）
2. **重新部署**
3. **验证部署成功**

### 后续优化：
1. 配置自定义域名（如果需要）
2. 设置环境变量（`PROJECT_DOMAIN`）
3. 启用 Analytics（分析工具）
4. 配置 GitHub 自动部署

---

## 需要帮助？

如果按照以上步骤操作后仍然失败，请检查：
1. `package.json` 中的 `build:web` 脚本是否正确
2. 构建完成后 `dist-web` 目录是否存在
3. Vercel 项目设置中的其他配置是否正确

提供以下信息以便排查：
- Vercel 部署日志（完整输出）
- `vercel.json` 内容
- `package.json` 中的构建脚本
