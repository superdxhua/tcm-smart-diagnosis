# 修复 Vercel 静态资源 401 错误

## 🔍 问题分析

**从 Vercel 日志中看到：**

```
GET /icons/icon-512x512.png - 401 Unauthorized
```

**问题原因：**
1. `/icons/icon-512x512.png` 是前端静态资源
2. 被 `vercel.json` 中的路由配置错误地路由到了后端
3. 后端返回 401 未授权错误

---

## 🎯 问题根源

**当前的 `vercel.json` 配置：**

```json
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
    "destination": "/index.html"  // ⚠️ 太宽泛了，把所有请求都重写了
  }
]
```

**问题：**
- 最后一个规则 `"source": "/(.*)"` 会匹配所有请求
- 包括静态资源 `/icons/*`、`/assets/*` 等
- 导致静态资源被重写到 `/index.html` 或后端

---

## ✅ 解决方案

**添加静态资源规则，让静态资源直接访问，不重写。**

---

## 📋 完整配置

```json
{
  "version": 2,
  "name": "tcm-smart-diagnosis-frontend",
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "npm install --legacy-peer-deps && cd server && npm install --legacy-peer-deps && npm run build",
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
    }
  ]
}
```

---

## 🎯 关键修改

**删除了这一行：**

```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```

**原因：**
- 这个规则太宽泛，会匹配所有请求
- 包括静态资源 `/icons/*`、`/assets/*` 等
- 删除后，静态资源会直接访问，不会重写

---

## 📝 操作步骤

### 步骤 1：修改 `vercel.json`

1. 访问：https://github.com/superdxhua/tcm-smart-diagnosis
2. 找到 `vercel.json` 文件
3. 点击编辑（✏️）
4. **删除所有内容**
5. **粘贴下面的配置：**

```json
{
  "version": 2,
  "name": "tcm-smart-diagnosis-frontend",
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "npm install --legacy-peer-deps && cd server && npm install --legacy-peer-deps && npm run build",
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
    }
  ]
}
```

6. **提交修改：**
   ```
   fix: 移除过于宽泛的路由重写规则，修复静态资源 401 错误
   ```

---

## ⏳ 等待 Vercel 重新部署

预计部署时间：2-3 分钟

---

## 📋 测试步骤

### 测试 1：静态资源

```
https://zhongyi-smart-45sh17y8g-superdxhuas-projects.vercel.app/icons/icon-512x512.png
```

**预期结果：**
- ✅ 返回图片文件
- ✅ 状态码 200
- ❌ 不应该是 401

### 测试 2：前端页面

```
https://zhongyi-smart-45sh17y8g-superdxhuas-projects.vercel.app/
```

**预期结果：**
- ✅ 显示前端页面
- ✅ 所有静态资源正常加载
- ✅ 浏览器控制台没有错误

### 测试 3：后端 API

```
https://zhongyi-smart-45sh17y8g-superdxhuas-projects.vercel.app/api/health
```

**预期响应：**

```json
{
  "status": "ok",
  "message": "Service is healthy",
  "timestamp": "2024-02-22T...",
  "uptime": 123.456
}
```

---

## 📋 请告诉我

1. ✅ `vercel.json` 修改成功了吗？
2. ✅ Vercel 重新部署成功了吗？
3. ✅ 静态资源能正常访问了吗？
4. ✅ 前端页面能正常访问了吗？
5. ✅ 后端 API 能正常访问了吗？
