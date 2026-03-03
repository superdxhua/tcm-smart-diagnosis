# Render 项目状态诊断报告

## 📊 当前状态

| 项目 | URL | 状态 |
|------|-----|------|
| tcm-smart-diagnosis-api | https://tcm-smart-diagnosis-api.onrender.com | ❌ 超时（> 30 秒） |

---

## 🔍 问题分析

### 测试结果

```bash
curl -I https://tcm-smart-diagnosis-api.onrender.com/api/members
```

**结果**：超时（30 秒无响应）

### 可能原因

| 原因 | 可能性 | 说明 |
|------|--------|------|
| **1. 服务正在休眠（冷启动）** | ⭐⭐⭐⭐⭐ | Free 计划的常见问题 |
| **2. 服务配置错误** | ⭐⭐⭐⭐ | 端口、启动命令等配置错误 |
| **3. 服务已停止** | ⭐⭐⭐ | 手动停止或崩溃 |
| **4. 环境变量缺失** | ⭐⭐⭐ | Supabase 等关键变量未配置 |

---

## 🛠️ 立即诊断步骤

### 第 1 步：检查项目状态（在 Render Dashboard）

1. 访问：https://dashboard.render.com
2. 找到项目：`tcm-smart-diagnosis-api`
3. 查看项目状态：

| 状态 | 颜色 | 含义 |
|------|------|------|
| **Live** | 🟢 绿色 | 服务正在运行 |
| **Stopped** | ⚪ 白色 | 服务已停止 |
| **Build Failed** | 🔴 红色 | 构建失败 |
| **Crashed** | 🔴 红色 | 服务崩溃 |

---

### 第 2 步：查看实时日志（关键！）

如果状态是 **Live（绿色）**，但 API 超时：

1. 点击项目名称进入详情页
2. 进入 **"Logs"** 标签
3. 查看最近的日志

**正常日志示例**：
```
[INFO] Starting application...
[INFO] Listening on port 3000
[INFO] Database connected
```

**错误日志示例**：
```
[ERROR] Port 3000 already in use
[ERROR] Supabase credentials not found
[ERROR] Cannot find module '@nestjs/core'
```

---

### 第 3 步：检查配置（如果日志有问题）

#### A. 检查端口配置

**问题**：如果日志显示 `Port already in use`

**解决方案**：
1. 检查 `server/src/main.ts`：
   ```typescript
   // ✅ 正确
   const port = process.env.PORT || 3000;
   await app.listen(port);
   console.log(`Listening on port ${port}`);

   // ❌ 错误
   await app.listen(3000);
   ```

2. 修改后，重新部署：
   - 在 Dashboard 中点击 "Manual Deploy"

---

#### B. 检查环境变量

**问题**：如果日志显示 `Supabase credentials not found`

**解决方案**：
1. 进入项目 Settings
2. 找到 "Environment Variables" 部分
3. 添加以下变量：

```
COZE_SUPABASE_URL=https://br-zippy-kea-87a692a5.supabase2.aidap-global.cn-beijing.volces.com
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTEzNjMzMzIsInJvbGUiOiJhbm9uIn0.RS0wQLKj-8lsYE-Qek3ut9y9adM072H6gHepZ4xwk60
JWT_SECRET=ad5298de0ecab1330ca2a1c00d564ccfb46767d4c174410d817d9ef3fc600e12
WECHAT_APP_ID=wxc9246b2c31d037f2
WECHAT_SECRET=ca48ca8fccf44ce3e1af8c4eae102a64
COZE_WORKLOAD_IDENTITY_API_KEY=cztei_qCNZrpasC9t4xrMAJa70H3fUOvYwB0VL0LYrEC2mWGPpbHAIHzMPDURIJntzh0EFe
NODE_ENV=production
```

---

#### C. 检查启动命令

**问题**：如果日志显示 `Command failed`

**解决方案**：
1. 进入项目 Settings
2. 找到 "Build & Deploy" 部分
3. 修改 "Start Command"：
   ```
   node dist/main.js
   ```

---

### 第 4 步：重新部署

**方法 1：在 Dashboard 中重新部署（推荐）**
1. 点击项目名称进入详情页
2. 点击右上角的 "Manual Deploy" 按钮
3. 选择分支（通常是 `main`）
4. 点击 "Deploy"
5. 等待部署完成（5-10 分钟）

**方法 2：通过 Git 触发**
```bash
git add .
git commit -m "fix: 修复部署配置"
git push origin main
```

---

## 🎯 冷启动问题诊断

### 如果日志显示服务正常，但首次访问超时

**原因**：Free 计划的休眠机制

**验证方法**：
1. 等待服务启动完成
2. 立即访问 API：
   ```bash
   curl https://tcm-smart-diagnosis-api.onrender.com/api/members
   ```
3. 记录响应时间

**预期结果**：
- ⏱️ 首次访问：30-60 秒（冷启动）
- ⏱️ 后续访问：< 1 秒（热启动）

**解决方案**：

#### 方案 1：升级到 Starter 计划（推荐）⭐⭐⭐⭐⭐

1. 进入项目 Settings
2. 找到 "Plan" 部分
3. 点击 "Upgrade to Starter"
4. 月费：$25
5. ✅ 无休眠，无冷启动

#### 方案 2：使用 Background Workers 预热（免费）

1. 创建新服务：Background Worker
2. 添加预热脚本：
   ```javascript
   const https = require('https');

   const url = 'https://tcm-smart-diagnosis-api.onrender.com/api/health';

   setInterval(() => {
     https.get(url, (res) => {
       console.log('Ping successful');
     });
   }, 10 * 60 * 1000); // 每 10 分钟
   ```
3. 配置 Cron Job：`*/10 * * * *`

---

## ✅ 验证修复

### 测试脚本

```bash
# 运行测试脚本
node scripts/test-render-api.js https://tcm-smart-diagnosis-api.onrender.com
```

**预期结果**：
- ✅ 状态码：200 或 401
- ✅ 响应时间：< 5 秒
- ✅ 响应数据为 JSON 格式

### 手动测试

```bash
# 测试 1：获取患者列表
curl https://tcm-smart-diagnosis-api.onrender.com/api/members

# 测试 2：登录 API
curl -X POST https://tcm-smart-diagnosis-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password123"}'

# 测试 3：获取当前用户
curl https://tcm-smart-diagnosis-api.onrender.com/api/auth/me
```

---

## 📊 问题排查清单

### 在 Render Dashboard 上检查以下内容：

- [ ] 项目状态：🟢 Live / ⚪ Stopped / 🔴 Error
- [ ] 最新部署状态：成功 / 失败
- [ ] 构建日志：有错误吗？
- [ ] 实时日志：有错误吗？
- [ ] 环境变量：全部配置了吗？
- [ ] 端口配置：使用 `process.env.PORT` 了吗？
- [ ] 启动命令：是 `node dist/main.js` 吗？

---

## 🚀 快速修复命令

如果配置正确，但服务仍无法访问：

```bash
# 1. 检查服务是否可访问
curl -I https://tcm-smart-diagnosis-api.onrender.com

# 2. 等待 1 分钟（冷启动可能需要时间）
sleep 60

# 3. 再次测试
curl https://tcm-smart-diagnosis-api.onrender.com/api/members

# 4. 如果仍然超时，检查日志
# 访问 Render Dashboard > Logs
```

---

## 📞 下一步行动

### 立即行动（现在）

1. **访问 Render Dashboard**
   - 检查项目状态
   - 查看实时日志

2. **记录以下信息**：
   - 项目状态（颜色）
   - 日志中的错误信息（如果有）
   - 构建日志（如果有错误）

3. **告诉我这些信息**，我会给您具体的修复方案

### 如果日志显示正常

1. **等待冷启动完成**（可能需要 30-60 秒）
2. **再次测试 API**
3. **如果仍然超时，重新部署**

### 如果日志显示错误

1. **根据错误信息**，参考上述解决方案
2. **修改配置**
3. **重新部署**
4. **再次测试**

---

**请访问 Render Dashboard，查看项目状态和日志，然后告诉我您看到了什么！** 🚀
