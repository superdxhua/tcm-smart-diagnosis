# Vercel 构建问题自检清单

## 当前状态

- ✅ 本地文件已正确修改（删除了 `export const config`）
- ✅ GitHub 仓库已正确提交
- ❌ Vercel 部署仍然报错：`api/index.ts: unsupported "runtime" value in config: "nodejs18.x"`

## 错误分析

错误信息显示：
- 文件：`api/index.ts`
- 错误：`unsupported "runtime" value in config: "nodejs18.x"`
- 期望：`edge`, `experimental-edge`, `nodejs`

但本地代码已经删除了 `export const config`，说明 Vercel 没有使用最新的代码。

---

## 可能存在问题的环节

### 1. ⚠️ 可能存在其他 Serverless Function 文件

**问题：** 可能有其他 Serverless Function 文件包含了 `nodejs18.x` 配置。

**需要检查：**
- 根目录是否有 `api/index.ts`？
- `server/api/` 目录下的所有 `.ts` 文件

**排查方法：**
```bash
# 查找所有 Serverless Function 文件
find /workspace/projects -path "*/api/*.ts" -o -path "*/api/**/*.ts"
```

---

### 2. ⚠️ Vercel 构建顺序问题

**问题：** Vercel 可能在构建前就检查 Serverless Function 文件，而不是在构建后。

**Vercel 构建流程：**
1. 克隆 Git 仓库
2. 安装依赖
3. 检查 Serverless Function 文件（此时可能已经检查 `api/index.ts`）
4. 执行构建命令
5. 部署

**如果 Vercel 在步骤 3 就检查 `api/index.ts`，那么即使代码正确，也会报错。**

---

### 3. ⚠️ 根目录可能有残留的 `api/` 目录

**问题：** 根目录可能有 `api/index.ts` 文件，这个文件没有被正确删除。

**需要检查：**
```bash
ls -la /workspace/projects/api/
```

---

### 4. ⚠️ `.vercelignore` 可能没有正确排除文件

**问题：** `.vercelignore` 可能没有正确排除旧文件。

**当前 `.vercelignore` 内容：**
```
# 排除不需要的文件和目录
node_modules
.taro
*.log
.DS_Store
.cache

# 排除 Serverless Function 文件（避免 TypeScript 编译错误）
**/_health.ts
**/api/_health.ts
```

**问题：** 没有排除 `api/index.ts`！

---

### 5. ⚠️ `server/api/[[...path]].ts` 可能有问题

**问题：** 这个文件是 NestJS API 的动态路由入口，可能包含了错误的配置。

**需要检查：**
```bash
cat /workspace/projects/server/api/[[...path]].ts
```

---

## 排查步骤

### 步骤 1：检查所有 `api/` 目录

```bash
# 查找所有 api 目录
find /workspace/projects -type d -name "api"

# 查找所有 api/index.ts 文件
find /workspace/projects -path "*/api/index.ts"
```

### 步骤 2：检查所有 Serverless Function 文件

```bash
# 查找所有 api 目录下的 .ts 文件
find /workspace/projects -path "*/api/*.ts"

# 检查每个文件的内容
cat /workspace/projects/server/api/index.ts
cat /workspace/projects/server/api/[[...path]].ts
```

### 步骤 3：检查是否有旧的 `.ts` 文件

```bash
# 查找所有包含 "nodejs18.x" 的文件
grep -r "nodejs18.x" /workspace/projects --include="*.ts" --include="*.js"
```

### 步骤 4：检查 Git 状态

```bash
# 查看当前分支
git branch

# 查看最新的提交
git log --oneline -5

# 查看远程分支
git branch -r
```

---

## 最可能的问题

根据错误信息和排查结果，最可能的问题是：

### 问题 1：根目录有 `api/index.ts` 文件

如果根目录有 `api/index.ts` 文件，且这个文件包含 `nodejs18.x` 配置，那么 Vercel 会在构建前检查这个文件并报错。

### 问题 2：`server/api/[[...path]].ts` 包含错误的配置

这个文件是 NestJS API 的动态路由入口，可能包含了 `nodejs18.x` 配置。

---

## 解决方案

### 方案 1：删除根目录的 `api/` 目录

```bash
rm -rf /workspace/projects/api
```

### 方案 2：检查 `server/api/[[...path]].ts`

```bash
cat /workspace/projects/server/api/[[...path]].ts
```

如果这个文件包含 `nodejs18.x` 配置，需要修改或删除。

### 方案 3：删除所有 Serverless Function 文件

如果不需要 Serverless Function，可以删除：
- `server/index.ts`
- `server/api/index.ts`
- `server/api/[[...path]].ts`

只保留 NestJS 应用，让 NestJS 自己处理所有请求。

---

## 下一步

请执行以下命令，并提供输出：

```bash
# 1. 查找所有 api 目录
find /workspace/projects -type d -name "api"

# 2. 查找所有 api/index.ts 文件
find /workspace/projects -path "*/api/index.ts"

# 3. 查找所有包含 "nodejs18.x" 的文件
grep -r "nodejs18.x" /workspace/projects --include="*.ts" --include="*.js"

# 4. 查看 server/api/ 目录下的所有文件
ls -la /workspace/projects/server/api/

# 5. 查看 server/api/[[...path]].ts 的内容
cat /workspace/projects/server/api/[[...path]].ts
```

根据输出结果，我们可以确定问题的根源并采取相应的解决方案。
