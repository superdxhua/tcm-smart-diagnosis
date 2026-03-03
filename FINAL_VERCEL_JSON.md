# vercel.json 完整配置 - 可直接复制粘贴

## 📋 使用说明

1. 访问：https://github.com/superdxhua/tcm-smart-diagnosis
2. 找到 `vercel.json` 文件
3. 点击编辑（✏️）
4. 删除所有内容
5. 复制下面的完整配置
6. 粘贴到编辑器中
7. 提交信息：`fix: 在 vercel.json 中添加后端 API 路由配置`

---

## ✅ 完整配置

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

## 🎯 配置说明

### 后端 API 路由

```json
{
  "source": "/api/(.*)",
  "destination": "/server/api/index.ts"
}
```

**作用：**
- 所有以 `/api/` 开头的请求都会路由到 NestJS 后端
- 例如：`/api/health` → `/server/api/index.ts`

### 前端页面路由

```json
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
```

**作用：**
- 其他所有请求都返回前端页面
- 支持前端路由（如 `/pages/xxx`）

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

### 步骤 4：测试版本端点

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

## 📋 请告诉我

复制粘贴完成后，请告诉我：

1. ✅ `vercel.json` 更新成功了吗？
2. ✅ Vercel 重新部署成功了吗？
3. ✅ 前端页面能正常访问吗？
4. ✅ 后端 API 能正常访问吗？
5. ✅ API 返回的数据是什么？
