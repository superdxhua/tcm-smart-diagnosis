# Vercel 构建错误修复方案

## 问题描述
```
Error: The Output Directory "dist-web" is empty.
```

## 原因分析

### 可能原因 1：构建命令顺序问题
当前 `package.json` 中的构建命令：
```json
"build": "npm run lint:build && npm run tsc && npm run build:web",
```

虽然 `vercel.json` 指定了 `buildCommand: "npm run build:web"`，但如果 Vercel 执行的是 `npm run build`，那么 ESLint 或 TypeScript 检查失败会导致后续构建不执行。

### 可能原因 2：环境变量未生效
在 `config/index.ts` 中，构建过程依赖环境变量：
```typescript
const envFile = process.env.NODE_ENV === 'production'
  ? path.resolve(__dirname, '../.env.production')
  : path.resolve(__dirname, '../.env.local');
```

如果 Vercel 构建时 `NODE_ENV` 未正确设置为 `production`，可能导致配置错误。

### 可能原因 3：依赖安装问题
`vercel.json` 中的安装命令：
```json
"installCommand": "npm install --legacy-peer-deps"
```

但项目使用 `pnpm` 作为包管理器，应该使用 `pnpm install`。

## 解决方案

### 方案 1：修改 vercel.json（推荐）

```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "pnpm install",
  "framework": null,
  "env": {
    "NODE_ENV": "production"
  }
}
```

**关键修改**：
- ✅ 修改 `installCommand` 为 `pnpm install`
- ✅ 添加 `NODE_ENV` 环境变量

### 方案 2：修改构建脚本（备用）

如果方案 1 不行，修改 `package.json` 中的 `build:web` 命令：

```json
"build:web": "npx weapp-tailwindcss patch && taro build --type h5 && ls -la dist-web/ && echo 'Build completed!'"
```

**关键修改**：
- ✅ 添加 `ls -la dist-web/` 验证输出目录
- ✅ 添加 `echo 'Build completed!'` 确认构建完成

### 方案 3：添加构建钩子（调试用）

创建 `vercel.json` 中的钩子：

```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "pnpm install",
  "framework": null,
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

## 立即操作步骤

### 步骤 1：修改 vercel.json

在本地或 Vercel Dashboard 中修改 `vercel.json`：

```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "pnpm install",
  "framework": null,
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 步骤 2：触发重新部署

在 Vercel Dashboard 中：
1. 找到项目 `zhongyi-smart`
2. 进入 `Settings` → `General`
3. 点击 `Redeploy` 按钮
4. 等待部署完成

### 步骤 3：检查部署日志

在 Vercel Dashboard 中：
1. 进入 `Deployments` 标签
2. 点击最新的部署记录
3. 查看完整的构建日志
4. 查找关键信息：
   - ✅ `pnpm install` 是否成功
   - ✅ `taro build --type h5` 是否执行
   - ✅ `dist-web` 目录是否生成
   - ✅ 是否有错误信息

### 步骤 4：验证部署

如果部署成功，访问：
```
https://www.zhongyihskhealth.com
```

检查：
- [ ] 页面是否正常加载
- [ ] 是否有 JavaScript 错误
- [ ] API 请求是否正常

## 调试方法

### 方法 1：本地测试构建

在本地执行相同的构建命令：

```bash
# 设置环境变量
export NODE_ENV=production

# 执行构建
pnpm install
npm run build:web

# 检查输出目录
ls -la dist-web/

# 检查是否有文件
ls -la dist-web/*.html
```

### 方法 2：检查 Taro 配置

确认 `config/index.ts` 中的输出目录配置：

```typescript
const outputRoot = isWeChatApp ? 'dist' : 'dist-web';
```

确认 H5 构建时 `outputRoot` 为 `dist-web`。

### 方法 3：查看详细错误日志

在 Vercel Dashboard 中：
1. 点击最新的部署记录
2. 滚动到日志底部
3. 查找以下错误：
   - `Error: ...`
   - `Failed to ...`
   - `Cannot find ...`

## 常见错误及解决方案

### 错误 1：pnpm not found

```
Error: pnpm: command not found
```

**解决方案**：
修改 `vercel.json`：
```json
{
  "installCommand": "npm install -g pnpm && pnpm install"
}
```

### 错误 2：weapp-tailwindcss 失败

```
Error: Command failed: npx weapp-tailwindcss patch
```

**解决方案**：
修改 `build:web` 命令，添加错误处理：
```json
"build:web": "npx weapp-tailwindcss patch || true && taro build --type h5"
```

### 错误 3：环境变量未定义

```
Error: PROJECT_DOMAIN is not defined
```

**解决方案**：
在 Vercel Dashboard 设置环境变量：
- Key: `PROJECT_DOMAIN`
- Value: `https://api.zhongyihskhealth.com`
- Environment: Production

## 验证清单

部署成功后，检查以下内容：

- [ ] ✅ 部署状态显示 "Ready"
- [ ] ✅ 输出目录 `dist-web` 不为空
- [ ] ✅ 访问网站无 404 错误
- [ ] ✅ 页面正常加载
- [ ] ✅ API 请求正常（指向 `api.zhongyihskhealth.com`）
- [ ] ✅ 浏览器控制台无错误

## 总结

**核心问题**：
- Vercel 使用 `npm install` 而不是 `pnpm install`
- 导致依赖安装可能不完整
- 构建失败，输出目录为空

**解决方案**：
- 修改 `vercel.json`，使用 `pnpm install`
- 添加 `NODE_ENV` 环境变量
- 触发重新部署

**下一步**：
1. 修改 `vercel.json`
2. 触发重新部署
3. 检查部署日志
4. 验证网站是否正常
