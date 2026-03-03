# Vercel 部署修复说明

## 问题描述
Vercel 部署时出现错误：`weapp-tw: command not found`

## 根本原因
1. Vercel 使用了旧的构建缓存
2. vercel.json 中的项目名称不正确（之前是 `tcm-smart-diagnosis-frontend`）

## 正确的项目信息

### 前端项目
- **项目名称**: `zhongyi-smart` (prj_6SNjA9HMONCFXeCO21sU6P0K23RX)
- **Git 仓库**: `superdxhua/tcm-smart-diagnosis`
- **部署环境**: Vercel

### 后端项目
- **项目名称**: `tcm-smart-diagnosis-backend`
- **Git 仓库**: 同一个仓库的 `server` 目录

## 已完成的修复

### 1. 代码验证 ✅
- **本地 package.json**: 使用 `npx weapp-tailwindcss patch` ✅
- **远程 package.json**: 使用 `npx weapp-tailwindcss patch` ✅
- **Git 历史**: 所有敏感文件已移除 ✅

### 2. Vercel 配置优化 ✅
- 修正项目名称为 `zhongyi-smart` ✅
- 添加 `.nvmrc` 文件，指定 Node 20 版本 ✅
- 简化 `vercel.json` 配置，使用 `@vercel/static-build` ✅
- 添加自定义构建脚本 `.vercel-nix-build.sh`（备用方案）✅

### 3. Git 推送记录 ✅
```
32fe5ef - fix: correct Vercel project name to zhongyi-smart
ea040ee - docs: add Vercel deployment fix status document
b99054c - fix: simplify Vercel config and add .nvmrc for Node 20
251c7d2 - fix: add custom Vercel build script with cache disabled
3187e8b - chore: trigger Vercel redeploy
dffb277 - fix: 修复构建错误并验证项目运行
```

### 4. package.json 构建命令
```json
"build:web": "npx weapp-tailwindcss patch && taro build --type h5 && cp -r public/* dist-web/ || true"
```

### 5. vercel.json 配置
```json
{
  "version": 2,
  "name": "zhongyi-smart",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist-web"
      }
    }
  ]
}
```

## 如何验证部署

### 方法 1: 在 Vercel Dashboard 查看
1. 打开 https://vercel.com/dashboard
2. 进入项目 `zhongyi-smart` (不是 tcm-smart-diagnosis-frontend)
3. 查看最新部署状态

### 方法 2: 检查构建日志
在 Vercel Dashboard 的构建日志中查找：
```bash
> npx weapp-tailwindcss patch && taro build --type h5 && cp -r public/* dist-web/ || true
```

### 方法 3: 使用 Vercel CLI (需登录)
```bash
npx vercel login
npx vercel list
# 找到 zhongyi-smart 项目
npx vercel inspect zhongyi-smart
```

## 预期结果

部署应该会成功，因为：
1. ✅ vercel.json 使用正确的项目名称 `zhongyi-smart`
2. ✅ package.json 使用正确的命令 `npx weapp-tailwindcss patch`
3. ✅ .nvmrc 确保 Node 版本一致
4. ✅ 代码已推送到最新 commit (32fe5ef)

## 如果仍然失败

### 选项 A: 清除缓存
在 Vercel Dashboard 中：
1. 进入项目 `zhongyi-smart`
2. Settings → Git → Deploy Hooks
3. 取消勾选 "Use cached dependency builds"

### 选项 B: 使用环境变量
在 Vercel Dashboard 中添加：
```
NODE_OPTIONS = --max-old-space-size=4096
npm_config_cache = /tmp/npm-cache
```

### 选项 C: 强制重新部署
```bash
git commit --allow-empty -m "chore: force redeploy"
git push origin main
```

## 本地构建验证

本地构建已成功测试：
```bash
bash .vercel-nix-build.sh
```

输出显示使用正确的 `npx weapp-tailwindcss patch` 命令。

## 文件清单

| 文件 | 用途 | 状态 |
|------|------|------|
| package.json | 构建脚本定义 | ✅ 正确 |
| vercel.json | Vercel 部署配置 | ✅ 已修正项目名称 |
| .nvmrc | Node 版本指定 | ✅ 已添加 |
| .vercel-nix-build.sh | 自定义构建脚本 | ✅ 已创建 |

## 重要提示

⚠️ **Vercel 项目名称**: `zhongyi-smart`（不是 tcm-smart-diagnosis-frontend）

在 Vercel Dashboard 中操作时，请确保选择正确的项目！
