# 部署常见问题解答

本文档汇总了部署过程中可能遇到的问题及解决方案。

---

## 🚀 快速索引

- [Supabase 相关问题](#supabase-相关问题)
- [Render 后端部署问题](#render-后端部署问题)
- [Vercel 前端部署问题](#vercel-前端部署问题)
- [环境变量配置问题](#环境变量配置问题)
- [网络连接问题](#网络连接问题)
- [小程序部署问题](#小程序部署问题)

---

## Supabase 相关问题

### Q1: Supabase 项目创建失败

**问题**：点击 "Create new project" 后一直显示 "Creating..."

**可能原因**：
- Supabase 服务器负载过高
- 网络连接不稳定

**解决方案**：
1. 等待 5-10 分钟
2. 刷新页面查看项目是否创建成功
3. 如果仍然失败，联系 Supabase 客服

---

### Q2: Supabase API Key 获取不到

**问题**：在 Settings → API 中看不到 API Key

**可能原因**：
- 项目还未完全创建完成
- 权限不足

**解决方案**：
1. 等待项目创建完全完成（约 5 分钟）
2. 确认您是项目所有者
3. 重新登录 Supabase

---

### Q3: 数据库表创建失败

**问题**：执行 SQL 脚本时报错

**错误信息**：
```
ERROR: relation "users" already exists
```

**解决方案**：

```sql
-- 删除已存在的表（谨慎操作！）
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.medical_records CASCADE;
DROP TABLE IF EXISTS public.recharge_orders CASCADE;

-- 重新创建表
-- ...（执行创建表的 SQL）
```

---

### Q4: 存储桶无法设置为 Public

**问题**：点击 "Public" 桶选项后无法保存

**可能原因**：
- Supabase 免费版可能有限制
- 权限不足

**解决方案**：

```sql
-- 手动启用公共访问
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'screenshots');
```

---

## Render 后端部署问题

### Q5: Render 构建失败 - Cannot find module

**错误信息**：
```
Error: Cannot find module '@nestjs/core'
```

**可能原因**：
- Root Directory 配置错误
- 依赖未安装

**解决方案**：

1. **检查 Root Directory**：
   - 进入 Render Dashboard
   - 确认 Root Directory 为 `server`
   - 如果是 `.` 或空，修改为 `server`

2. **检查 Build Command**：
   - 确认 Build Command 包含 `npm install`
   - 示例：`npm install && npx @nestjs/cli build`

3. **本地测试**：
   ```bash
   cd server
   npm install
   npm run build
   ```

---

### Q6: Render 部署成功但无法访问

**问题**：部署显示 "Live"，但访问 URL 时报错

**错误信息**：
```
502 Bad Gateway
```

**可能原因**：
- 端口配置错误
- 服务未正常启动

**解决方案**：

1. **检查环境变量**：
   - 确认 `PORT=3000` 已配置
   - 确认 `NODE_ENV=production` 已配置

2. **检查 Start Command**：
   - 确认 Start Command 为 `node dist/main`
   - 不要使用 `npm start`

3. **查看日志**：
   - 进入 Render Dashboard
   - 查看 Logs 标签
   - 查找错误信息

---

### Q7: Render 部署超时

**问题**：部署一直卡在 "Building" 状态

**可能原因**：
- 依赖安装太慢
- 构建时间过长

**解决方案**：

1. **升级实例**（付费）：
   - Free 实例：15 分钟无流量会休眠
   - Standard 实例：永久在线

2. **优化构建**：
   - 减少 `node_modules` 大小
   - 使用 `.dockerignore` 排除不必要文件

3. **使用 Docker**：
   - 创建 Dockerfile
   - 使用 Docker 镜像加速

---

### Q8: Render 环境变量未生效

**问题**：配置了环境变量，但代码中读取不到

**可能原因**：
- 环境变量名称错误
- 部署后未重新启动

**解决方案**：

1. **检查变量名称**：
   - Render 中：`SUPABASE_URL`
   - 代码中：`process.env.SUPABASE_URL`
   - 确保名称完全一致

2. **重新部署**：
   - 修改任意文件（如 `README.md`）
   - 提交到 GitHub
   - 触发自动部署

3. **查看日志**：
   ```javascript
   console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
   ```

---

## Vercel 前端部署问题

### Q9: Vercel 构建失败 - Output Directory 错误

**错误信息**：
```
Error: No output directory found at "dist"
```

**可能原因**：
- Output Directory 配置错误
- 构建未生成输出文件

**解决方案**：

1. **检查 Output Directory**：
   - 进入 Vercel Dashboard
   - 确认 Output Directory 为 `dist/h5`
   - 不要设置为 `dist` 或 `.`

2. **检查 Build Command**：
   - 确认 Build Command 为 `npm run build:web`
   - 不要使用 `npm run build`

3. **本地测试**：
   ```bash
   npm run build:web
   ls -la dist/h5  # 确认文件存在
   ```

---

### Q10: Vercel 部署后样式丢失

**问题**：页面可以访问，但样式完全丢失

**可能原因**：
- Tailwind CSS 未正确编译
- 静态资源路径错误

**解决方案**：

1. **检查 Tailwind 配置**：
   - 确认 `tailwind.config.ts` 正确
   - 确认 `postcss.config.js` 正确

2. **检查构建输出**：
   ```bash
   npm run build:web
   # 检查 dist/h5/assets/ 目录下是否有 CSS 文件
   ```

3. **清除缓存**：
   ```bash
   rm -rf node_modules
   rm -rf dist
   npm install
   npm run build:web
   ```

---

### Q11: Vercel 环境变量未生效

**问题**：配置了环境变量，但前端仍然连接错误

**可能原因**：
- PROJECT_DOMAIN 配置错误
- 前端代码中未使用环境变量

**解决方案**：

1. **检查环境变量**：
   - 进入 Vercel Dashboard
   - 确认 `PROJECT_DOMAIN` 已配置
   - 确认格式为 `https://your-api.onrender.com`

2. **检查前端代码**：
   ```typescript
   // src/network/index.ts
   const PROJECT_DOMAIN = process.env.PROJECT_DOMAIN || 'http://localhost:3000'
   console.log('PROJECT_DOMAIN:', PROJECT_DOMAIN)
   ```

3. **重新部署**：
   - 在 Vercel 中点击 "Redeploy"

---

### Q12: Vercel 部署后 CORS 错误

**错误信息**：
```
Access to XMLHttpRequest at 'https://your-api.onrender.com/api/xxx'
from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**可能原因**：
- 后端 CORS 未配置
- 域名未加入白名单

**解决方案**：

1. **检查后端 CORS 配置**：
   ```typescript
   // server/src/main.ts
   app.enableCors({
     origin: '*',  // 允许所有域名（开发环境）
     // origin: ['https://your-app.vercel.app'],  // 生产环境限制
     credentials: true,
   })
   ```

2. **重新部署后端**：
   - 修改代码
   - 提交到 GitHub
   - Render 自动部署

3. **测试 CORS**：
   ```bash
   curl -H "Origin: https://your-app.vercel.app" \
     https://your-api.onrender.com/api/health
   ```

---

## 环境变量配置问题

### Q13: JWT_SECRET 未配置

**问题**：登录时报错 "Invalid token"

**可能原因**：
- JWT_SECRET 环境变量未配置
- JWT_SECRET 格式错误

**解决方案**：

1. **生成 JWT_SECRET**：
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **配置环境变量**：
   - 在 Render 中添加 `JWT_SECRET`
   - 在 Vercel 中添加 `JWT_SECRET`（如果需要）

3. **重新部署**：
   - 修改代码触发部署
   - 等待部署完成

---

### Q14: SUPABASE_SERVICE_ROLE_KEY 泄露

**问题**：不小心将 SUPABASE_SERVICE_ROLE_KEY 上传到 GitHub

**紧急处理**：

1. **立即删除密钥**：
   - 进入 Supabase Dashboard
   - 生成新的 service role key
   - 删除旧密钥

2. **更新环境变量**：
   - 在 Render 中更新 `SUPABASE_SERVICE_ROLE_KEY`
   - 在 Vercel 中更新 `SUPABASE_SERVICE_ROLE_KEY`

3. **删除历史提交**：
   ```bash
   # 使用 BFG Repo-Cleaner 清除敏感信息
   java -jar bfg.jar --replace-text secrets.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

4. **重新部署**：
   - 触发所有服务重新部署

---

## 网络连接问题

### Q15: 前端无法连接后端 API

**错误信息**：
```
Network Error
```

**可能原因**：
- PROJECT_DOMAIN 配置错误
- 后端服务未启动
- 网络防火墙阻止

**解决方案**：

1. **检查 PROJECT_DOMAIN**：
   - 确认格式正确：`https://your-api.onrender.com`
   - 不要加 `/api` 前缀

2. **检查后端状态**：
   ```bash
   curl https://your-api.onrender.com/api/health
   ```

3. **检查网络**：
   - 确认 Render 服务在线
   - 检查防火墙设置

---

### Q16: Supabase 连接失败

**错误信息**：
```
Supabase connection error
```

**可能原因**：
- SUPABASE_URL 配置错误
- Supabase 服务异常

**解决方案**：

1. **测试 Supabase 连接**：
   ```bash
   curl https://your-project.supabase.co
   ```

2. **检查环境变量**：
   - 确认 `SUPABASE_URL` 正确
   - 确认 `SUPABASE_ANON_KEY` 正确

3. **查看 Supabase 日志**：
   - 进入 Supabase Dashboard
   - 查看 Logs 标签

---

## 小程序部署问题

### Q17: 小程序无法上传图片

**错误信息**：
```
uploadFile:fail
```

**可能原因**：
- 服务器域名未配置
- 文件大小超限

**解决方案**：

1. **配置服务器域名**：
   - 登录微信公众平台
   - 进入 开发 → 开发管理 → 开发设置
   - 添加 uploadFile 合法域名：`https://your-api.onrender.com`

2. **检查文件大小**：
   - 小程序限制：10MB
   - 确认上传文件不超过限制

---

### Q18: 小程序网络请求失败

**错误信息**：
```
request:fail
```

**可能原因**：
- 服务器域名未配置
- 协议不支持（必须 HTTPS）

**解决方案**：

1. **配置服务器域名**：
   - 添加 request 合法域名：`https://your-api.onrender.com`

2. **确认使用 HTTPS**：
   - Render 自动提供 HTTPS
   - 不要使用 HTTP

3. **开发环境测试**：
   - 在微信开发者工具中
   - 点击 详情 → 本地设置
   - 勾选"不校验合法域名"

---

## 性能问题

### Q19: Render 服务响应慢

**问题**：API 请求耗时过长（> 3 秒）

**可能原因**：
- Free 实例性能限制
- 数据库查询慢
- 代码性能问题

**解决方案**：

1. **升级实例**：
   - 从 Free 升级到 Standard
   - 提升性能和稳定性

2. **优化数据库查询**：
   - 添加索引
   - 使用分页查询
   - 避免大事务

3. **启用缓存**：
   - 使用 Redis 缓存
   - 使用 CDN 加速

---

### Q20: Vercel 页面加载慢

**问题**：首次加载时间 > 5 秒

**可能原因**：
- JavaScript 文件太大
- 图片未优化
- 服务器响应慢

**解决方案**：

1. **优化构建产物**：
   ```bash
   # 检查构建产物大小
   ls -lh dist/h5/assets/
   ```

2. **启用压缩**：
   - 在 `vercel.json` 中配置压缩
   - 使用 Brotli 压缩

3. **优化图片**：
   - 使用 WebP 格式
   - 添加图片懒加载

---

## 其他问题

### Q21: 如何查看部署日志？

**Render 日志**：
1. 进入 Render Dashboard
2. 选择项目
3. 点击 Logs 标签

**Vercel 日志**：
1. 进入 Vercel Dashboard
2. 选择项目
3. 点击 Deployments
4. 选择部署 → Logs

**Supabase 日志**：
1. 进入 Supabase Dashboard
2. 选择项目
3. 点击 Logs 标签

---

### Q22: 如何回滚到之前的版本？

**Render 回滚**：
1. 进入 Render Dashboard
2. 选择项目
3. 点击 Events 标签
4. 找到之前的部署
5. 点击 "Rollback"

**Vercel 回滚**：
1. 进入 Vercel Dashboard
2. 选择项目
3. 点击 Deployments
4. 找到之前的部署
5. 点击 "..." → "Promote to Production"

---

### Q23: 如何配置自定义域名？

**Vercel 自定义域名**：
1. 进入 Vercel Dashboard
2. 选择项目 → Settings → Domains
3. 添加域名（如 `www.your-domain.com`）
4. 配置 DNS 记录

**Render 自定义域名**：
1. 进入 Render Dashboard
2. 选择项目 → Settings → Custom Domains
3. 添加域名（如 `api.your-domain.com`）
4. 配置 DNS 记录

---

## 📞 获取更多帮助

如果以上解决方案都无法解决您的问题，请：

1. **查看官方文档**：
   - [Render 文档](https://render.com/docs)
   - [Vercel 文档](https://vercel.com/docs)
   - [Supabase 文档](https://supabase.com/docs)

2. **搜索错误信息**：
   - 使用 Google 或 Stack Overflow
   - 搜索具体的错误信息

3. **联系技术支持**：
   - Render 支持：support@render.com
   - Vercel 支持：support@vercel.com
   - Supabase 支持：support@supabase.io

---

**常见问题解答版本**：v1.0.0
**最后更新**：2024-01-01
