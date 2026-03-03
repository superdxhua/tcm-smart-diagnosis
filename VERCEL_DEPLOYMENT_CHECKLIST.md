# Vercel 部署检查清单

## 🚨 当前问题

- **错误信息**：`FUNCTION_INVOCATION_FAILED`
- **状态码**：500
- **影响范围**：所有 API 无法正常执行

---

## ✅ 部署检查步骤

### 步骤 1：检查前端项目（zhongyi-smart）

1. 访问 Vercel Dashboard
2. 选择项目：`zhongyi-smart`
3. 进入 `Settings` > `Environment Variables`
4. 确认以下环境变量已配置：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `PROJECT_DOMAIN` | `https://api.zhongyihskhealth.com` | Production |

5. 进入 `Deployments` 标签
6. 确认最新部署状态：
   - ✅ 绿色：部署成功
   - ❌ 红色：需要重新部署

---

### 步骤 2：检查后端项目（tcm-smart-diagnosis-backend）

1. 访问 Vercel Dashboard
2. 选择项目：`tcm-smart-diagnosis-backend`
3. 进入 `Settings` > `Environment Variables`
4. 确认以下环境变量已配置：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `COZE_SUPABASE_URL` | `https://br-zippy-kea-87a692a5.supabase2.aidap-global.cn-beijing.volces.com` | Production |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTEzNjMzMzIsInJvbGUiOiJhbm9uIn0.RS0wQLKj-8lsYE-Qek3ut9y9adM072H6gHepZ4xwk60` | Production |
| `JWT_SECRET` | `ad5298de0ecab1330ca2a1c00d564ccfb46767d4c174410d817d9ef3fc600e12` | Production |
| `WECHAT_APP_ID` | `wxc9246b2c31d037f2` | Production |
| `WECHAT_SECRET` | `ca48ca8fccf44ce3e1af8c4eae102a64` | Production |
| `COZE_WORKLOAD_IDENTITY_API_KEY` | `cztei_qCNZrpasC9t4xrMAJa70H3fUOvYwB0VL0LYrEC2mWGPpbHAIHzMPDURIJntzh0EFe` | Production |

5. 进入 `Deployments` 标签
6. 查看最新部署状态：
   - ✅ 绿色：部署成功
   - ❌ 红色：部署失败，需要查看日志
   - 🟡 黄色：部署中，请等待

---

### 步骤 3：查看部署日志

如果后端部署失败，查看详细日志：

1. 进入 `Deployments` 标签
2. 点击失败的部署
3. 进入 `Build Logs` 或 `Function Logs` 标签
4. 查找错误信息：

**常见错误及解决方案**：

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Module not found` | 缺少依赖 | 运行 `npm install` |
| `SyntaxError` | 代码语法错误 | 检查代码语法 |
| `Runtime Error` | 运行时错误 | 检查代码逻辑 |
| `Timeout` | 超时 | 优化代码或增加超时时间 |

---

### 步骤 4：重新部署后端

如果部署失败或需要更新：

**方法 1：使用 Vercel CLI**
```bash
# 进入后端目录
cd /workspace/projects/server

# 安装依赖
npm install

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

**方法 2：通过 Vercel Dashboard**
1. 进入 `Deployments` 标签
2. 选择最新的部署
3. 点击右上角的 `...` 菜单
4. 选择 `Redeploy`

---

### 步骤 5：验证修复

重新部署后，测试 API 是否正常：

```bash
# 测试登录 API
node scripts/test-login-api.js

# 测试所有 API
node scripts/test-api.js
```

**预期结果**：

| API | 状态码 | 响应时间 | 说明 |
|-----|--------|----------|------|
| `/api/auth/login` | 200 或 401 | < 2 秒 | 正常 |
| `/api/members` | 200 | < 2 秒 | 正常 |
| `/api/auth/me` | 401 | < 2 秒 | 正常（未认证） |

---

## 🛠️ 常见问题排查

### 问题 1：`FUNCTION_INVOCATION_FAILED`

**症状**：
- 所有 API 都返回 500 错误
- 错误信息：`FUNCTION_INVOCATION_FAILED`

**原因**：
- Serverless Function 执行失败
- 代码未正确部署

**解决方案**：
1. 查看部署日志，确认错误原因
2. 修复代码中的错误
3. 重新部署

---

### 问题 2：环境变量未加载

**症状**：
- API 报错：`Supabase credentials not found`
- 环境变量为 `undefined`

**原因**：
- Vercel 环境变量未配置
- 环境变量名称错误

**解决方案**：
1. 在 Vercel Dashboard 中添加环境变量
2. 确保变量名称与代码中使用的一致
3. 重新部署

---

### 问题 3：CORS 错误（H5 端）

**症状**：
- H5 端显示跨域错误
- 错误信息：`Access-Control-Allow-Origin`

**原因**：
- 后端未配置 CORS

**解决方案**：
1. 后端代码已添加 CORS 支持
2. 重新部署后端
3. 测试 H5 端是否正常

---

### 问题 4：冷启动时间过长

**症状**：
- API 首次访问响应时间 > 10 秒
- 后续访问响应时间正常

**原因**：
- Vercel 正在运行旧的 NestJS 应用
- 未完全迁移到独立 Serverless Functions

**解决方案**：
1. 确认 `server/api/` 目录下有所有 API 文件
2. 重新部署后端
3. 使用 Edge Functions 优化冷启动

---

## 📊 性能指标

### 正常情况

| 指标 | 值 | 说明 |
|-----|-----|------|
| 冷启动时间 | 150-200ms | 独立 Serverless Functions |
| 热启动时间 | 20-50ms | 函数已激活 |
| 响应状态码 | 200、401、404 | 正常响应 |

### 异常情况

| 指标 | 值 | 说明 |
|-----|-----|------|
| 冷启动时间 | > 10 秒 | 可能仍在运行 NestJS |
| 响应状态码 | 500 | 函数执行失败 |
| 错误信息 | `FUNCTION_INVOCATION_FAILED` | 部署或执行错误 |

---

## 📞 联系支持

如果以上步骤都无法解决问题，请联系技术支持，并提供以下信息：

1. 前端项目部署日志
2. 后端项目部署日志
3. API 测试脚本输出结果
4. 浏览器控制台错误日志
5. 调试页面环境信息截图

---

**最后更新时间**: 2025-01-13
**版本**: v1.0
