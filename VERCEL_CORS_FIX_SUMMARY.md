# Vercel 部署 CORS 问题修复总结

## 问题背景

### 症状
- Vercel 部署后，浏览器端登录失败，提示 "failed to fetch"
- Postman/curl 可以正常访问 API，说明后端功能正常
- 这是典型的 CORS（跨域资源共享）配置错误

### 根本原因
后端 CORS 配置存在**非法组合**：
```typescript
app.enableCors({
  origin: '*',  // ❌ 允许所有来源（通配符）
  credentials: true  // ❌ 允许携带凭证
})
```

根据浏览器的 CORS 安全策略：
- 如果 `Access-Control-Allow-Credentials: true`，则 `Access-Control-Allow-Origin` **不能是通配符 `*`**
- 必须返回具体的 Origin（如 `https://example.com`）

## 修复方案

### 1. 修复 CORS 配置（api/index.ts）

#### 修改前
```typescript
app.enableCors({
  origin: '*', // 允许所有来源
  credentials: true,
  // ...
});
```

#### 修改后
```typescript
app.enableCors({
  origin: (origin) => {
    const allowedOrigins = [
      'https://tcmsmarthealth.com',
      'http://localhost:3000',
      'http://localhost:5000',
    ];

    // 允许白名单内的来源
    if (origin && allowedOrigins.includes(origin)) {
      return origin;
    }

    // 允许无 origin 的请求（如移动应用、Server-to-Server）
    if (!origin) {
      return '*';
    }

    // 其他来源拒绝
    return false;
  },
  credentials: true,
  // ...
});
```

### 2. 优化 Vercel 路由配置（vercel.json）

#### 问题
静态资源请求（如 `/icons/icon-512x512.png`）被错误路由到 SPA，导致返回 401 或 HTML

#### 修复
添加静态文件扩展名匹配规则，优先处理静态资源：
```json
{
  "routes": [
    {
      "src": "/(.*\\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|otf|css|js|json))",
      "dest": "/$1",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    }
  ]
}
```

### 3. 手动复制静态资源

#### 问题
Taro H5 构建未正确复制 `public/*` 到 `dist-web/`，导致 Vercel 文件系统检查失败

#### 修复
```bash
# 手动复制静态资源到构建目录
cp -r public/* dist-web/
```

#### 说明
- Taro H5 构建工具的 `dist-web` 目录通常不包含 `public` 目录下的文件
- Vercel 部署需要这些静态文件（如 PWA 图标、manifest.json）
- 需要在 `package.json` 的 `build` 脚本中添加复制命令

### 4. 更新构建脚本

#### package.json
```json
{
  "scripts": {
    "build": "pnpm build:web && cp -r public/* dist-web/"
  }
}
```

## 验证步骤

### 1. 测试 CORS 配置
```bash
cd /workspace/projects
bash server/scripts/test-cors.sh
```

### 2. 测试静态资源
```bash
bash server/scripts/test-static-resources.sh
```

### 3. 本地测试
```bash
# 启动开发服务器
coze dev

# 浏览器访问
open http://localhost:5000

# 测试登录功能
# 应该不再出现 "failed to fetch" 错误
```

### 4. 部署验证
```bash
# 提交代码
git add .
git commit -m "fix: 修复 Vercel 部署 CORS 配置问题"
git push

# 等待 Vercel 部署完成

# 浏览器访问生产环境
open https://tcmsmarthealth.com

# 测试功能
# - 登录功能正常
# - 静态资源加载正常
# - API 调用正常
```

## 预期结果

### CORS 头检查
在浏览器开发者工具的 Network 面板中，检查 API 响应头：
```
Access-Control-Allow-Origin: https://tcmsmarthealth.com  # 具体域名，不是 *
Access-Control-Allow-Credentials: true                   # 允许凭证
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS,PATCH
Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With,Accept,Origin
```

### 功能验证
- ✅ 登录功能正常（不再 "failed to fetch"）
- ✅ API 调用正常返回数据
- ✅ 静态资源正常加载（图标、manifest.json）
- ✅ PWA 功能正常（如果配置了）

## 技术说明

### CORS 原理
1. **简单请求**（GET、POST 等）
   - 浏览器直接发送请求
   - 响应中包含 `Access-Control-Allow-Origin`

2. **预检请求**（OPTIONS）
   - 浏览器先发送 OPTIONS 请求
   - 检查服务器是否允许实际请求
   - 响应中包含 CORS 相关头

3. **凭证请求**（credentials: true）
   - 需要携带 cookies 或 Authorization 头
   - `Access-Control-Allow-Origin` 必须是具体域名
   - `Access-Control-Allow-Credentials: true`

### Vercel 部署特性
1. **Serverless 函数**
   - 每个 API 请求都是独立的函数执行
   - 需要正确配置 CORS 处理 OPTIONS 请求

2. **路由优先级**
   - 静态文件路由优先级最高
   - API 路由次之
   - SPA 路由最后（fallback）

3. **文件系统**
   - 静态资源必须存在于构建目录
   - 否则会被路由到 SPA 或返回 404

## 参考资源

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN: HTTP access control (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vercel: Routes](https://vercel.com/docs/configuration#project/routes)
- [Vercel: Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

## 后续优化建议

1. **环境变量管理**
   - 使用 `process.env.ALLOWED_ORIGINS` 管理白名单
   - 不同环境使用不同的白名单

2. **安全增强**
   - 添加 Rate Limiting
   - 添加 CSRF 保护
   - 使用 HTTPS 强制跳转

3. **监控与日志**
   - 添加 CORS 错误日志
   - 监控跨域请求成功率
   - 告警异常请求

4. **自动化测试**
   - 添加 CORS 配置的单元测试
   - 集成测试验证跨域请求
   - CI/CD 中包含 CORS 验证步骤

## 故障排查

### 问题：仍然 "failed to fetch"
- 检查浏览器控制台是否有其他错误
- 检查 Network 面板的请求详情
- 确认 CORS 头是否正确返回
- 检查是否有其他安全策略（CSP、X-Frame-Options）干扰

### 问题：静态资源 404
- 确认 `dist-web/` 目录中包含静态文件
- 检查 `vercel.json` 路由配置
- 确认文件路径大小写正确（Linux 区分大小写）

### 问题：登录后 token 丢失
- 检查 `credentials: 'include'` 是否正确设置
- 确认浏览器允许第三方 cookies
- 检查 SameSite cookie 属性

---

## 修改文件清单

1. ✅ `api/index.ts` - 修复 CORS 配置
2. ✅ `vercel.json` - 优化路由配置
3. ✅ `server/scripts/test-cors.sh` - CORS 测试脚本（新建）
4. ✅ `server/scripts/test-static-resources.sh` - 静态资源测试脚本（新建）
5. ✅ `STATIC_RESOURCES_401_ANALYSIS.md` - 静态资源分析文档（新建）
6. ✅ `VERCEL_CORS_FIX_SUMMARY.md` - 本文档（新建）

## 下一步行动

1. 提交代码到 Git
2. 推送到远程仓库触发 Vercel 部署
3. 验证生产环境功能
4. 根据测试结果进一步优化
