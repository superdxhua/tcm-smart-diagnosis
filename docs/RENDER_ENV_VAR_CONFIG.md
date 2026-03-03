# 在 Render 配置 JWT_SECRET 环境变量

## 📝 环境变量信息

**JWT_SECRET**:
```
ad5298de0ecab1330ca2a1c00d564ccfb46767d4c174410d817d9ef3fc600e12
```

## 🚀 配置步骤

### 步骤 1：登录 Render

1. 访问：https://dashboard.render.com
2. 使用 GitHub 账号登录

### 步骤 2：找到你的服务

1. 在 Dashboard 中找到 `tcm-smart-diagnosis-api` 服务
2. 点击进入服务详情页面

### 步骤 3：配置环境变量

1. 在服务详情页面，找到左侧菜单
2. 点击 **"Environment"**
3. 点击 **"Add Environment Variable"** 按钮

### 步骤 4：添加 JWT_SECRET

**环境变量 1：JWT_SECRET**

- **Key**: `JWT_SECRET`
- **Value**: `ad5298de0ecab1330ca2a1c00d564ccfb46767d4c174410d817d9ef3fc600e12`
- **Environment**: 选择 `Production`
- 点击 **"Save"**

**环境变量 2：COZE_SUPABASE_URL**

- **Key**: `COZE_SUPABASE_URL`
- **Value**: `https://dwswtkfbtdohaftnklxx.supabase.co`
- **Environment**: 选择 `Production`
- 点击 **"Save"**

**环境变量 3：COZE_SUPABASE_ANON_KEY**

- **Key**: `COZE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c3d0a2ZidGRvaGFmdG5rbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5OTU4MTMsImV4cCI6MjAxODU3MTgxM30.DQWj0Yk3oX6sQJXJF1W7Z2qVJY5TQVxP0pR0nY9JWwM`
- **Environment**: 选择 `Production`
- 点击 **"Save"**

**环境变量 4：MERCHANT_QR_CODE**

- **Key**: `MERCHANT_QR_CODE`
- **Value**: `https://dwswtkfbtdohaftnklxx.supabase.co/storage/v1/object/public/qrcodes/0f4d33663fcd22d619c950ba281efc91.jpg`
- **Environment**: 选择 `Production`
- 点击 **"Save"**

**环境变量 5：MERCHANT_NAME**

- **Key**: `MERCHANT_NAME`
- **Value**: `中医智能诊疗`
- **Environment**: 选择 `Production`
- 点击 **"Save"**

**环境变量 6：NODE_ENV**

- **Key**: `NODE_ENV`
- **Value**: `production`
- **Environment**: 选择 `Production`
- 点击 **"Save"**

**环境变量 7：PORT**

- **Key**: `PORT`
- **Value**: `3000`
- **Environment**: 选择 `Production`
- 点击 **"Save"**

### 步骤 5：重新部署服务

1. 配置完所有环境变量后，回到服务详情页面
2. 点击 **"Manual Deploy"**
3. 点击 **"Clear build cache & deploy"**
4. 等待部署完成（约 2-3 分钟）

### 步骤 6：验证配置

部署完成后，测试 API 是否正常：

```bash
# 测试健康检查
curl https://tcm-smart-diagnosis-api.onrender.com

# 测试用户注册
curl -X POST https://tcm-smart-diagnosis-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","role":"individual"}'
```

## ✅ 完成标志

如果 API 返回正常响应，说明环境变量配置成功！

## ⚠️ 重要提示

1. **不要泄露 JWT_SECRET**：这个密钥用于生成和验证用户 token，泄露会导致安全问题
2. **定期更新**：建议定期更换 JWT_SECRET（例如每 3 个月）
3. **备份环境变量**：将所有环境变量保存到安全的地方

## 🔧 故障排除

### 问题 1：API 返回 500 错误

**可能原因**：环境变量未正确配置

**解决方案**：
1. 检查环境变量名称是否正确（大小写敏感）
2. 检查环境变量值是否完整
3. 查看部署日志，确认环境变量已加载

### 问题 2：用户登录失败

**可能原因**：JWT_SECRET 配置错误

**解决方案**：
1. 确认 JWT_SECRET 值与本文档中的一致
2. 清除浏览器缓存
3. 重新部署服务

### 问题 3：数据库连接失败

**可能原因**：Supabase URL 或 Key 配置错误

**解决方案**：
1. 确认 `COZE_SUPABASE_URL` 和 `COZE_SUPABASE_ANON_KEY` 是否正确
2. 在 Supabase Dashboard 中检查项目状态
3. 查看 Render 部署日志中的错误信息

---

**配置完成后，请继续执行下一步：推送代码到 GitHub**
