# Render 环境变量配置指南

## 📋 需要配置的环境变量

### 数据库配置（必须更新）

```bash
COZE_SUPABASE_URL=https://dwswtkfbtdohaftnklxx.supabase.co
COZE_SUPABASE_ANON_KEY=sb_publishable_7DetJ-vZ99o_7_aprg_w-Q_NMc_nlgv
```

### 其他必要配置

```bash
# JWT 配置
JWT_SECRET=ad5298de0ecab1330ca2a1c00d564ccfb46767d4c174410d817d9ef3fc600e12
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APP_ID=wxc9246b2c31d037f2
WECHAT_SECRET=ca48ca8fccf44ce3e1af8c4eae102a64

# Coze SDK 配置
COZE_WORKLOAD_IDENTITY_API_KEY=cztei_qCNZrpasC9t4xrMAJa70H3fUOvYwB0VL0LYrEC2mWGPpbHAIHzMPDURIJntzh0EFe
COZE_INTEGRATION_BASE_URL=https://integration.coze.cn
COZE_INTEGRATION_MODEL_BASE_URL=https://integration.coze.cn/api/v3

# 服务配置
PORT=3000
NODE_ENV=production

# 前端环境变量
VITE_SUPABASE_URL=https://dwswtkfbtdohaftnklxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_7DetJ-vZ99o_7_aprg_w-Q_NMc_nlgv
```

## 🔧 配置步骤

### 1. 访问 Render Dashboard

打开：https://dashboard.render.com

### 2. 找到你的后端服务

通常服务名称类似：`zhongyi-api` 或 `backend`

### 3. 进入环境变量设置

1. 点击服务名称
2. 点击左侧菜单的 "Environment"
3. 点击 "Add Environment Variable"

### 4. 添加环境变量

逐一添加上面的环境变量，确保：
- ✅ **COZE_SUPABASE_URL** 和 **COZE_SUPABASE_ANON_KEY** 已经更新为新的值
- ✅ 其他配置保持不变（如果已存在）

### 5. 保存并重新部署

1. 点击 "Save Changes"
2. 等待保存完成
3. 点击 "Manual Deploy" → "Deploy latest commit"
4. 等待部署完成

## ✅ 验证配置

部署完成后，检查服务日志确认：
- 数据库连接成功
- 服务正常启动
- 无错误信息

## 🚀 部署前端（Vercel）

如果前端也需要更新环境变量：

### 1. 访问 Vercel Dashboard

打开：https://vercel.com/dashboard

### 2. 找到前端项目

### 3. 配置环境变量

进入 Settings → Environment Variables，添加：

```bash
VITE_SUPABASE_URL=https://dwswtkfbtdohaftnklxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_7DetJ-vZ99o_7_aprg_w-Q_NMc_nlgv
```

### 4. 重新部署

点击 "Redeploy"

## 📝 配置清单

- [ ] Render 后端环境变量已更新
- [ ] Render 后端服务已重新部署
- [ ] Vercel 前端环境变量已更新（如果需要）
- [ ] Vercel 前端服务已重新部署（如果需要）
- [ ] 服务日志无错误
- [ ] 数据库连接正常

## 🎯 部署完成后

访问生产环境测试登录功能：
- URL: https://zhongyihskhealth.com
- 用户名: `admin`
- 密码: `123456`

## ⚠️ 注意事项

1. **密钥安全**：环境变量包含敏感信息，不要公开分享
2. **配置验证**：部署后务必检查服务日志
3. **备份配置**：建议保存一份环境变量配置的备份
4. **逐步部署**：先部署后端，验证后再部署前端

## 📞 遇到问题？

如果部署遇到问题：
1. 查看 Render 服务日志
2. 检查环境变量是否正确
3. 确认数据库连接正常
4. 联系技术支持

---

**配置完成后，告诉我"配置完成"，我会帮你验证功能！**
