# 修改 vercel.json 添加后端 API 路由配置

## 当前配置问题

当前的 `vercel.json` 配置中，所有请求都被重写到前端页面：

```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

这导致：
- ❌ `/api/health` → 返回前端 HTML
- ❌ `/api/version` → 返回前端 HTML
- ❌ 所有 API 请求都被前端重写规则拦截

---

## 解决方案

在 `rewrites` 数组的最前面添加后端 API 路由配置：

```json
{
  "source": "/api/(.*)",
  "destination": "/server/api/index.ts"
}
```

这样，所有以 `/api/` 开头的请求都会被路由到 NestJS 后端。

---

## 修改后的完整配置

```json
{
  "version": 2,
  "name": "tcm-smart-diagnosis-frontend",
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/api/index.ts"
    },
    {
      "source": "/",
      "destination": "/index.html"
    },
    {
      "source": "/pages/(.*)",
      "destination": "/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 路由匹配规则

| 路径 | 目标 | 说明 |
|------|------|------|
| `/api/*` | `/server/api/index.ts` | 后端 API 路由 |
| `/` | `/index.html` | 前端首页 |
| `/pages/*` | `/index.html` | 前端页面 |
| `/*` | `/index.html` | 其他前端路由 |

**注意：Vercel 按照数组的顺序匹配路由，所以后端 API 路由必须放在最前面！**

---

## 操作步骤

### 步骤 1：访问 GitHub 仓库

```
https://github.com/superdxhua/tcm-smart-diagnosis
```

### 步骤 2：修改 `vercel.json` 文件

1. 找到 `vercel.json` 文件
2. 点击编辑（✏️）
3. 找到 `rewrites` 数组
4. **在数组的最前面添加**以下内容：

```json
{
  "source": "/api/(.*)",
  "destination": "/server/api/index.ts"
},
```

**添加位置示例：**

```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/server/api/index.ts"
  },  // ← 添加这个逗号
  {
    "source": "/",
    "destination": "/index.html"
  },
  // ... 其他配置
]
```

### 步骤 3：提交修改

提交信息：
```
fix: 在 vercel.json 中添加后端 API 路由配置
```

### 步骤 4：等待 Vercel 自动部署

预计部署时间：1-2 分钟

### 步骤 5：测试

#### 测试 1：前端页面

```
https://tcm-smart-diagnosis-git-main-superdxhuas-projects.vercel.app/
```

**预期结果：**
- 返回前端 HTML 页面
- 显示小程序前端界面

#### 测试 2：后端 API - 健康检查

```
https://tcm-smart-diagnosis-git-main-superdxhuas-projects.vercel.app/api/health
```

**预期响应：**

```json
{
  "status": "ok",
  "message": "Service is healthy",
  "timestamp": "2024-02-22T10:30:00.000Z",
  "uptime": 123.456
}
```

#### 测试 3：后端 API - 版本

```
https://tcm-smart-diagnosis-git-main-superdxhuas-projects.vercel.app/api/version
```

**预期响应：**

```json
{
  "name": "tcm-smart-diagnosis",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 预期结果

| 项目 | 之前 | 现在 |
|------|------|------|
| 部署状态 | ✅ Ready | ✅ Ready |
| 前端页面 | ✅ 正常 | ✅ 正常 |
| 后端 API | ❌ 返回 HTML | ✅ 返回 JSON |
| `/api/health` | ❌ HTML 页面 | ✅ JSON 数据 |
| `/api/version` | ❌ HTML 页面 | ✅ JSON 数据 |

---

## 常见问题

### Q1: 为什么后端 API 路由要放在最前面？

A: Vercel 按照数组顺序匹配路由。如果后端路由不是第一个，可能会被前面的路由拦截。

### Q2: 我还需要创建 `server/api/index.ts` 文件吗？

A: 是的！如果还没有创建，请参考 `RECREATE_ENTRY_FILE.md` 创建这个文件。

### Q3: 如果测试还是失败怎么办？

A: 请检查：
1. `server/api/index.ts` 文件是否存在
2. Vercel 部署日志是否有错误
3. 浏览器控制台是否有错误信息

---

## 请告诉我

修改完成后，请告诉我：

1. ✅ `vercel.json` 修改成功了吗？
2. ✅ Vercel 重新部署成功了吗？
3. ✅ 前端页面能正常访问吗？
4. ✅ 后端 API 能正常访问吗？
5. ✅ API 返回的数据是什么？
