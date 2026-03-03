# 后端 Vercel 部署修复说明

## 问题描述
后端在 Vercel 部署时出现错误：`weapp-tw: command not found`

## 根本原因
`server/package.json` 中错误地包含了 `bin` 配置，定义了 `weapp-tw` 命令。这个命令只用于前端的 Tailwind CSS 补丁，不应该在后端项目中。

## 后端部署架构

### Vercel 项目结构
```
zhongyi-smart (Vercel 项目)
├── 前端 (Taro H5)
│   └── 构建输出: dist-web/
└── 后端 (NestJS as Vercel Functions)
    └── 构建输出: server/dist/
    └── 入口文件: api/index.ts
```

### API 路由
- `/api/*` → Vercel Functions (NestJS)
- `/*` → 静态文件 (前端)

## 已完成的修复

### 1. 删除 server/package.json 中的 bin 配置 ✅
```json
// 删除前
{
  "bin": {
    "weapp-tw": "./bin/weapp-tw"
  }
}

// 删除后
// (无 bin 配置)
```

### 2. 删除 server/bin/weapp-tw 文件 ✅
这是一个虚拟脚本，用于临时绕过错误，现已彻底移除。

### 3. 修复 server/package-lock.json ✅
删除了 `bin` 字段中的 `weapp-tw` 引用。

### 4. 更新根目录 vercel.json ✅
```json
{
  "buildCommand": "npm install && npm run build:web && cd server && npm install && npm run build",
  "outputDirectory": "dist-web"
}
```

这个配置会：
1. 安装前端依赖
2. 构建前端 (dist-web)
3. 安装后端依赖
4. 构建后端 (server/dist)

### 5. Git 提交记录 ✅
```
59975cd - fix: update vercel.json to build both frontend and backend
492f244 - fix: remove weapp-tw config from backend (server) - backend doesn't need it
```

## 验证修复

### 检查点 1: server/package.json
```bash
cat server/package.json | grep -E '"bin"|"weapp-tw"'
# 应该输出: (空)
```

### 检查点 2: server/bin 目录
```bash
ls server/bin/
# 应该输出: No such file or directory
```

### 检查点 3: 构建命令
```bash
cat server/package.json | grep '"build"'
# 应该输出: "build": "npx @nestjs/cli build"
```

### 检查点 4: vercel.json
```bash
cat vercel.json | grep "buildCommand"
# 应该输出: 包含前后端构建命令
```

## Vercel 部署流程

### 1. 安装依赖
```bash
npm install --legacy-peer-deps
```

### 2. 构建前端
```bash
npm run build:web
# 等价于: npx weapp-tailwindcss patch && taro build --type h5
```

### 3. 构建后端
```bash
cd server
npm install --legacy-peer-deps
npm run build
# 等价于: npx @nestjs/cli build
```

### 4. 部署
- 前端静态文件 → `dist-web/`
- 后端 Functions → `api/index.ts` (导入 server/dist)
- 后端路由 → `/api/*`

## 预期结果

部署应该会成功，因为：
1. ✅ server/package.json 不再包含 weapp-tw 配置
2. ✅ server/bin/weapp-tw 已删除
3. ✅ vercel.json 正确配置了前后端构建
4. ✅ api/index.ts 正确导入编译后的 NestJS 应用

## API 端点验证

部署成功后，测试以下端点：

```bash
# 健康检查
curl https://zhongyi-smart-xxxxx.vercel.app/api/health

# 方剂智能分析
curl https://zhongyi-smart-xxxxx.vercel.app/api/formula-intelligence/health

# 疾病分类
curl https://zhongyi-smart-xxxxx.vercel.app/api/disease-categories/tree
```

## 如果仍然失败

### 选项 A: 检查 Vercel 构建日志
1. 打开 Vercel Dashboard
2. 进入项目 `zhongyi-smart`
3. 查看最新部署的构建日志
4. 查找是否还有 `weapp-tw` 相关错误

### 选项 B: 本地验证构建
```bash
# 清理缓存
rm -rf node_modules server/node_modules server/dist dist-web

# 完整构建
npm install --legacy-peer-deps
npm run build:web
cd server
npm install --legacy-peer-deps
npm run build
```

### 选项 C: 环境变量检查
在 Vercel Dashboard 中确认以下环境变量：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `COZE_INTEGRATION_BASE_URL`
- `COZE_INTEGRATION_MODEL_BASE_URL`
- `COZE_WORKLOAD_IDENTITY_API_KEY`

## 文件清单

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| server/package.json | 删除 bin 配置 | ✅ 已修复 |
| server/package-lock.json | 删除 weapp-tw 引用 | ✅ 已修复 |
| server/bin/weapp-tw | 删除虚拟脚本 | ✅ 已删除 |
| vercel.json | 添加后端构建命令 | ✅ 已更新 |

## 总结

**根本原因**: server/package.json 错误地包含了 `weapp-tw` 配置

**修复方案**:
1. 删除 server/package.json 中的 `bin` 配置
2. 删除 server/bin/weapp-tw 文件
3. 更新 vercel.json 以正确构建前后端

**预期结果**: Vercel 部署成功，前后端正常运行
