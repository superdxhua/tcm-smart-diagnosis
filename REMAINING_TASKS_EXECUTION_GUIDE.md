# 🎯 剩余工作执行指南

## 📋 需要手动执行的操作

我已经完成了所有代码层面的准备工作，但由于环境限制，以下操作需要你手动执行：

---

## 🚀 操作步骤（共 2 步）

### 第 1 步：推送代码到 GitHub（2 分钟）⚠️ **必需步骤，不能跳过**

**情况说明**：
- ✅ GitHub 仓库已存在：`https://github.com/superdxhua/tcm-smart-diagnosis.git`
- ✅ 代码之前已推送过
- ⚠️ **但有 50 个新提交需要推送**

在你的本地电脑上执行：

```bash
# 进入项目目录
cd /workspace/projects

# 推送代码到 GitHub
git push origin main
```

**如果推送失败（需要认证）**：

```bash
# 方法 1：使用 SSH（推荐）
git remote set-url origin git@github.com:superdxhua/tcm-smart-diagnosis.git
git push origin main

# 方法 2：使用 Personal Access Token
# 1. 在 GitHub 生成 Personal Access Token
# 2. 使用 token 推送
git push https://YOUR_TOKEN@github.com/superdxhua/tcm-smart-diagnosis.git main
```

**预期结果**：
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
...
To https://github.com/superdxhua/tcm-smart-diagnosis.git
   abc1234..def5678  main -> main
```

---

### 第 2 步：在 Render 配置环境变量（5 分钟）✅ **已完成，可跳过**

**操作指南**：请查看 `docs/RENDER_ENV_VAR_CONFIG.md` 文件

**快速操作**：

1. 登录：https://dashboard.render.com
2. 找到 `tcm-smart-diagnosis-api` 服务
3. 点击 **"Environment"**
4. 添加以下环境变量：

| 名称 | 值 |
|------|-----|
| `JWT_SECRET` | `ad5298de0ecab1330ca2a1c00d564ccfb46767d4c174410d817d9ef3fc600e12` |
| `COZE_SUPABASE_URL` | `https://dwswtkfbtdohaftnklxx.supabase.co` |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c3d0a2ZidGRvaGFmdG5rbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5OTU4MTMsImV4cCI6MjAxODU3MTgxM30.DQWj0Yk3oX6sQJXJF1W7Z2qVJY5TQVxP0pR0nY9JWwM` |
| `MERCHANT_QR_CODE` | `https://dwswtkfbtdohaftnklxx.supabase.co/storage/v1/object/public/qrcodes/0f4d33663fcd22d619c950ba281efc91.jpg` |
| `MERCHANT_NAME` | `中医智能诊疗` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

5. 点击 **"Manual Deploy"** → **"Clear build cache & deploy"**
6. 等待部署完成

**验证**：

```bash
# 测试 API
curl https://tcm-smart-diagnosis-api.onrender.com

# 测试用户注册
curl -X POST https://tcm-smart-diagnosis-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test123","password":"123456","role":"individual"}'
```

---

### 第 3 步：在 Vercel 部署或更新前端（10 分钟）⚠️ **这是最后一步**

**⚠️ 重要**：如果 Vercel 上已经有 `tcm-smart-diagnosis` 或 `zhongyi-smart` 项目，直接使用现有项目即可，无需重新创建！

**操作指南**：
- 如果有已有项目：查看 `docs/VERCEL_EXISTING_PROJECT_GUIDE.md` ⭐ **推荐**
- 如果没有项目：查看 `docs/VERCEL_DEPLOYMENT_STEP_BY_STEP.md`

**情况 A：已有项目（最常见）**

1. 访问：https://vercel.com/dashboard
2. 找到现有项目（`tcm-smart-diagnosis` 或 `zhongyi-smart`）
3. 点击项目名称进入项目详情
4. 点击 **"Settings"**
5. 配置环境变量：
   - `NODE_ENV`: `production`
   - `PROJECT_DOMAIN`: `https://tcm-smart-diagnosis-api.onrender.com`
6. 检查构建设置：
   - **Build Command**: `npm install --legacy-peer-deps && npm run build:web`
   - **Install Command**: `npm install --legacy-peer-deps`
   - **Output Directory**: `dist-web`
7. 点击 **"Deployments"**
8. 点击最新部署的 **"Redeploy"**
9. 等待部署完成（1-3 分钟）

**情况 B：没有项目**

1. 访问：https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 **"Add New"** → **"Project"**
4. 导入 `tcm-smart-diagnosis` 仓库
5. 配置详细信息（查看 `docs/VERCEL_DEPLOYMENT_STEP_BY_STEP.md`）
6. 点击 **"Deploy"**
7. 等待部署完成（1-3 分钟）

**访问 URL**：
```
https://tcm-smart-diagnosis.vercel.app
```

---

## ✅ 验证部署

完成以上 3 步后，进行验证：

### 验证 1：访问首页

在浏览器中打开：
```
https://tcm-smart-diagnosis.vercel.app
```

**预期结果**：
- ✅ 页面正常加载
- ✅ 显示首页内容
- ✅ 没有 404 或 500 错误

### 验证 2：测试用户注册

1. 访问注册页面
2. 填写注册信息
3. 点击注册

**预期结果**：
- ✅ 注册成功
- ✅ 自动跳转到首页
- ✅ 显示用户信息

### 验证 3：测试智能诊疗

1. 登录后，点击"智能诊疗"
2. 输入症状描述
3. 开始 AI 问询

**预期结果**：
- ✅ AI 开始问询
- ✅ 能够回答问题
- ✅ 能够生成诊断和处方

### 验证 4：测试充值功能

1. 登录后，点击"充值服务"
2. 选择套餐
3. 查看收款二维码

**预期结果**：
- ✅ 显示套餐列表
- ✅ 选择套餐后显示收款二维码
- ✅ 收款码可以正常显示

---

## 📚 详细文档

如果需要更详细的操作说明，请查看：

1. **剩余工作执行指南**: `REMAINING_TASKS_EXECUTION_GUIDE.md` ⭐ **推荐从这里开始**
2. **Render 环境变量配置**: `docs/RENDER_ENV_VAR_CONFIG.md`
3. **Vercel 已有项目指南**: `docs/VERCEL_EXISTING_PROJECT_GUIDE.md` ⭐ **推荐（如果已有项目）**
4. **Vercel 新建项目指南**: `docs/VERCEL_DEPLOYMENT_STEP_BY_STEP.md`
5. **部署后访问指南**: `POST_DEPLOYMENT_ACCESS_GUIDE.md`
6. **项目状态报告**: `PROJECT_STATUS_REPORT.md`

---

## 🎯 完成标志

完成以上 3 步并验证通过后，项目部署即完成！

**访问地址**：
- **前端**: `https://tcm-smart-diagnosis.vercel.app`
- **后端**: `https://tcm-smart-diagnosis-api.onrender.com`

**预期体验**：
- ✅ 用户可以通过 H5 链接访问应用
- ✅ 可以添加到手机主屏幕，像原生 APP 一样使用
- ✅ 所有功能正常工作

---

## ⚠️ 重要提示

1. **推送代码前**：确保已配置 Git 远程仓库
2. ~~**Render 部署后**：必须配置环境变量，否则 API 无法正常工作~~ ✅ Render 环境变量已配置完成
3. **Vercel 部署后**：必须配置 `PROJECT_DOMAIN` 环境变量，否则前端无法连接后端
4. **验证步骤**：不要跳过验证，确保所有功能正常工作

---

## 🔧 故障排除

### 问题 1：git push 失败

**解决方案**：参考上方的推送方法，使用 SSH 或 Personal Access Token

### 问题 2：Render 部署失败

**解决方案**：
1. 检查环境变量是否正确配置
2. 查看 Render 部署日志
3. 参考 `docs/RENDER_ENV_VAR_CONFIG.md` 中的故障排除部分

### 问题 3：Vercel 部署失败

**解决方案**：
1. 确认 Output Directory 为 `dist-web`
2. 检查 Build Command 是否正确
3. 参考 `docs/VERCEL_DEPLOYMENT_STEP_BY_STEP.md` 中的故障排除部分

### 问题 4：前端无法连接后端

**解决方案**：
1. 检查 `PROJECT_DOMAIN` 环境变量
2. 确认后端 API 正常运行
3. 检查浏览器控制台的 Network 请求

---

## 📞 获取帮助

如果遇到问题：

1. **查看详细文档**：`docs/` 目录下有完整的部署文档
2. **查看故障排除**：每个文档都有故障排除部分
3. **检查日志**：Render 和 Vercel 都有详细的部署日志

---

**预计完成时间**：12 分钟（2 分钟 + 10 分钟）

**⚠️ 第 2 步（Render 环境变量配置）已完成，只需执行第 1 步和第 3 步！**

**⚠️ 第 1 步（推送代码）是必需的，有 50 个新提交需要推送！**

**祝你部署顺利！🚀**
