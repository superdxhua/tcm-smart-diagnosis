# Vercel 连接超时问题排查

## 错误信息

```
tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app 的响应时间过长。

错误码：ERR_CONNECTION_TIMED_OUT
```

## 可能的原因

### 1. NestJS 应用启动超时 ⚠️

NestJS 应用可能在启动时超时，导致 Vercel 无法正常响应。

**常见原因：**
- 数据库连接超时
- 环境变量配置错误
- 应用启动时间过长（超过 Vercel 的限制）

### 2. 部署失败 ❌

部署过程中可能出错，导致服务器没有正常启动。

**常见原因：**
- 构建失败
- 启动命令错误
- 依赖安装失败

### 3. Vercel 缓存问题 🔄

Vercel 仍然使用旧的缓存，导致无法正常访问。

---

## 排查步骤

### 步骤 1：检查 Vercel 部署状态

访问：
```
https://vercel.com/superdxhuas-projects/tcm-smart-diagnosis-backend/deployments
```

**查看最新部署记录，确认：**
- [ ] 部署状态：Ready / Error / Building？
- [ ] 部署时间是什么时候？
- [ ] 是否有错误信息？

### 步骤 2：查看 Build Logs

1. 在部署页面，点击最新的部署记录

2. 点击 **"Build Logs"** 标签

3. 查看完整的构建日志

4. **重点关注：**
   - 构建错误
   - 启动错误
   - 数据库连接错误
   - 环境变量错误

### 步骤 3：检查环境变量

1. 访问环境变量设置：
   ```
   https://vercel.com/superdxhuas-projects/tcm-smart-diagnosis-backend/settings/environment-variables
   ```

2. **确认以下环境变量是否正确配置：**
   - `DATABASE_URL` ✅
   - `JWT_SECRET` ✅
   - `NODE_ENV` ✅
   - 其他必需的环境变量

---

## 常见错误和解决方案

### 错误 1：数据库连接超时

**错误信息：**
```
Error: Connection timeout
```

**解决方案：**
1. 检查 `DATABASE_URL` 是否正确
2. 确认 Supabase 数据库是否正常运行
3. 检查数据库连接池配置

### 错误 2：环境变量未配置

**错误信息：**
```
Error: DATABASE_URL is not defined
```

**解决方案：**
1. 确认所有必需的环境变量都已配置
2. 重新部署项目

### 错误 3：构建失败

**错误信息：**
```
Error: Build failed
```

**解决方案：**
1. 查看 Build Logs 中的详细错误
2. 修复错误后重新部署

---

## 解决方案

### 方案 A：查看部署日志并修复

1. 访问 Vercel 部署页面
2. 查看 Build Logs
3. 根据错误信息修复问题
4. 重新部署

### 方案 B：重新创建 Vercel 项目（推荐）

由于删除 Serverless Function 后仍然无法访问，建议重新创建 Vercel 项目。

**详细步骤：** 参考 `RECREATE_VERCEL_PROJECT.md`

---

## 请告诉我

请访问 Vercel 部署页面，告诉我：

1. ✅ **部署状态是什么？** Ready / Error / Building？
2. ✅ **如果有错误，错误信息是什么？**
3. ✅ **部署时间是什么时候？**
4. ✅ **Build Logs 中有什么错误信息？**

根据你的反馈，我会提供相应的解决方案。
