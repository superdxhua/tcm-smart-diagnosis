# 正确的 vercel.json 配置

## ⚠️ 重要说明

后端 API 路由配置必须放在 `rewrites` 数组里面，而且是第一个！

---

## ❌ 错误的配置

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
  {
    "source": "/api/(.*)",
    "destination": "/server/api/index.ts"
  },  // ❌ 放错位置了！
  "rewrites": [
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

## ✅ 正确的配置

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

## 🎯 修改步骤

### 步骤 1：在 GitHub 上编辑 `vercel.json`

1. 访问：https://github.com/superdxhua/tcm-smart-diagnosis
2. 找到 `vercel.json` 文件
3. 点击编辑（✏️）

### 步骤 2：修改配置

**删除错误的配置：**
```json
{
  "source": "/api/(.*)",
  "destination": "/server/api/index.ts"
},  // ← 删除这一段
```

**在 `rewrites` 数组的最前面添加：**

```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/server/api/index.ts"
  },  // ← 在这里添加，记得加逗号
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
```

### 步骤 3：提交修改

提交信息：
```
fix: 在 vercel.json 中添加后端 API 路由配置
```

---

## 📋 测试步骤

### 步骤 1：等待 Vercel 部署完成

预计时间：1-2 分钟

### 步骤 2：测试前端页面

```
https://tcm-smart-diagnosis-git-main-superdxhuas-projects.vercel.app/
```

**预期结果：**
- 显示前端页面
- 加载正常

### 步骤 3：测试后端 API

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

**预期结果：**
- 返回 JSON 数据
- 不是 HTML 页面
- 状态码 200

---

## 🎯 关键要点

1. ✅ 后端路由配置必须在 `rewrites` 数组里面
2. ✅ 必须是 `rewrites` 数组的第一个元素
3. ✅ 后面需要加逗号（如果后面还有其他元素）
4. ❌ 不能放在 `rewrites` 数组外面
5. ❌ 不能放在 `headers` 数组里面

---

## 📋 请告诉我

修改完成后，请告诉我：

1. ✅ `vercel.json` 修改成功了吗？
2. ✅ Vercel 重新部署成功了吗？
3. ✅ 前端页面能正常访问吗？
4. ✅ 后端 API 能正常访问吗？
5. ✅ API 返回的数据是什么？
