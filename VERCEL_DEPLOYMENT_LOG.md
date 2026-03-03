# Vercel 部署日志

## 2024-02-22 - 删除 export const config 配置，让 Vercel 使用默认配置

**问题描述：**
- TypeScript 编译错误已解决
- Runtime 配置错误仍然存在：`api/index.ts: unsupported "runtime" value in config: "nodejs18.x"`
- 多次修改 runtime 配置后仍然报错
- 清理构建缓存后仍然报错

**根本原因：**
- Vercel 可能在使用旧的构建缓存
- 或者 Vercel 项目的配置有问题

**解决方案：**
- 删除 `server/index.ts` 中的 `export const config` 配置
- 删除 `server/api/index.ts` 中的 `export const config` 配置
- 让 Vercel 使用默认的 Node.js 运行时配置

**修改的文件：**
- ✅ `server/index.ts` - 删除 `export const config`
- ✅ `server/api/index.ts` - 删除 `export const config`

**Git 提交：**
```
commit 78724c5
fix: 删除 export const config 配置，让 Vercel 使用默认配置
```

**Vercel 部署：**
- 状态：自动部署中
- 预计时间：1-2 分钟

**待测试端点：**
1. 根路径：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/`
2. API 入口：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/api/`
3. NestJS 健康检查：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/api/health`

**预期结果：**
- ✅ 构建成功，无 TypeScript 错误
- ✅ 无 runtime 配置错误
- ✅ 根路径和 API 入口能正常访问
- ✅ 响应时间在 1-2 秒内

**备用方案：**
如果删除 `export const config` 后仍然报错，可能需要重新创建 Vercel 项目

---

## 2024-02-22 - 修复 Vercel Serverless Function 的 runtime 配置

**问题描述：**
- TypeScript 编译错误已解决
- 新错误：`api/index.ts: unsupported "runtime" value in config: "nodejs18.x"`

**根本原因：**
- Vercel Serverless Function 不支持 `nodejs18.x` 作为 runtime 值
- 只支持：`edge`, `experimental-edge`, `nodejs`

**解决方案：**
- 修改 `server/index.ts`，将 `runtime: 'nodejs18.x'` 改为 `runtime: 'nodejs'`
- 修改 `server/api/index.ts`，将 `runtime: 'nodejs18.x'` 改为 `runtime: 'nodejs'`

**修改的文件：**
- ✅ `server/index.ts` - 修改 runtime 配置
- ✅ `server/api/index.ts` - 修改 runtime 配置

**Git 提交：**
```
commit 814112b
fix: 修复 Vercel Serverless Function 的 runtime 配置，使用 nodejs 而不是 nodejs18.x
```

**结果：**
- ✅ TypeScript 编译错误已解决
- ❌ Runtime 配置错误仍然存在
- 💡 Vercel 可能在使用旧的构建缓存

---

## 2024-02-22 - 修复 nest-cli.json 的 exclude 配置

**问题描述：**
- Vercel 构建失败，错误信息：`Cannot find module 'next/server' or its corresponding type declarations.`
- 错误文件：`_health.ts` 和 `api/_health.ts`
- 删除文件后仍然报错

**根本原因：**
- `nest build` 命令使用的是 `nest-cli.json` 的配置，而不是 `tsconfig.json` 的配置
- `nest-cli.json` 中的 `exclude` 配置不完整

**解决方案：**
1. 修改 `server/nest-cli.json`，更新 `exclude` 配置：
   ```json
   "exclude": ["node_modules", "dist", ".git", "api", "_health.ts", "index.ts"]
   ```

**修改的文件：**
- ✅ `server/nest-cli.json` - 更新 `exclude` 配置

**Git 提交：**
```
commit 2340ea2
fix: 修复 nest-cli.json 的 exclude 配置，排除根目录的 _health.ts 和 api 目录
```

**结果：**
- ✅ TypeScript 编译错误已解决
- ❌ 新错误：runtime 配置错误
