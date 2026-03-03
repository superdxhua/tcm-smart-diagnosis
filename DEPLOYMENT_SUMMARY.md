# 🎉 Vercel + Render 免费部署方案 - 准备完成！

## 📦 已为您准备的资源

### 📚 部署文档（4 份）

1. **DEPLOYMENT_VERCEL_RENDER.md** - 完整部署指南
   - 详细的分步部署说明
   - 环境变量配置指南
   - 故障排除方案
   - 监控和维护建议

2. **DEPLOYMENT_CHECKLIST.md** - 部署检查清单
   - 账户准备清单
   - 配置验证清单
   - 测试验证清单
   - 逐项检查，确保不遗漏

3. **DEPLOYMENT_QUICK_REFERENCE.md** - 快速参考卡片
   - 重要链接
   - 快速命令
   - 环境变量清单
   - 故障排除速查

4. **prepare-deployment.sh** - 自动化准备脚本
   - 自动生成 JWT Secret
   - 创建必要的配置文件
   - 初始化 Git 仓库
   - 生成 GitHub Actions 工作流

### 📋 部署方案总结

**方案 A：Vercel + Render（完全免费）**

| 项目 | 平台 | 月费用 | 限制 |
|------|------|--------|------|
| 前端 | Vercel | $0 | 100GB 带宽/月，100 次构建/月 |
| 后端 | Render | $0 | 750 小时/月，15 分钟无流量后休眠 |
| 数据库 | Supabase | $0 | 500MB 数据库，2GB 带宽/月 |
| **总计** | - | **$0/月** | - |

## 🚀 立即开始部署（3 个步骤）

### 步骤 1：运行准备脚本（2 分钟）

```bash
cd /workspace/projects
bash prepare-deployment.sh
```

**脚本会自动完成：**
- ✅ 生成 JWT Secret
- ✅ 创建环境变量模板
- ✅ 初始化 Git 仓库
- ✅ 创建 GitHub Actions 工作流（定时 Ping 后端）

### 步骤 2：推送代码到 GitHub（3 分钟）

```bash
# 如果还没有 GitHub 仓库
git init
git add .
git commit -m "准备部署到 Vercel + Render"

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/tcm-smart-diagnosis.git

# 推送代码
git branch -M main
git push -u origin main
```

### 步骤 3：在 Vercel 和 Render 部署（15 分钟）

#### 3.1 部署前端到 Vercel（5 分钟）

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 **"Add New..."** → **"Project"**
4. 选择 `tcm-smart-diagnosis` 仓库
5. 点击 **"Import"**
6. 配置：
   - **Build Command**: `pnpm install && pnpm build:web`
   - **Output Directory**: `dist-web`
   - **Install Command**: `pnpm install`
7. 配置环境变量：
   - 名称：`PROJECT_DOMAIN`
   - 值：暂时留空（部署后端后再配置）
8. 点击 **"Deploy"**
9. 等待构建完成（约 2-3 分钟）
10. 记录 Vercel 域名：`https://tcm-smart-diagnosis.vercel.app`

#### 3.2 部署后端到 Render（10 分钟）

1. 访问 https://render.com
2. 使用 GitHub 账号登录
3. 点击 **"New +"** → **"Web Service"**
4. 选择 `tcm-smart-diagnosis` 仓库
5. 配置：
   - **Name**: `tcm-smart-diagnosis-api`
   - **Region**: Singapore（推荐）
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: Free
6. 配置环境变量（重要！）：
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   COZE_API_KEY=your_coze_api_key
   COZE_API_SECRET=your_coze_api_secret
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   PORT=3000
   ```
7. 点击 **"Create Web Service"**
8. 等待构建完成（约 3-5 分钟）
9. 记录 Render 域名：`https://tcm-smart-diagnosis-api.onrender.com`

#### 3.3 连接前后端（2 分钟）

1. 访问 Vercel Dashboard
2. 进入项目 **Settings** → **Environment Variables**
3. 找到 `PROJECT_DOMAIN` 变量
4. 更新值为：`https://tcm-smart-diagnosis-api.onrender.com`
5. 点击 **"Save"**
6. 回到 Vercel 项目 Dashboard
7. 点击 **"Deployments"**
8. 点击最新部署记录的 **"Redeploy"**
9. 等待重新部署完成

## ✅ 验证部署

### 测试后端

```bash
# 测试健康检查
curl https://tcm-smart-diagnosis-api.onrender.com

# 测试用户注册
curl -X POST https://tcm-smart-diagnosis-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","role":"individual"}'
```

**预期结果**：
- 健康检查：返回 `{"status":"ok"}`
- 注册：返回用户信息和 token

### 测试前端

1. 访问：https://tcm-smart-diagnosis.vercel.app
2. 测试功能：
   - ✅ 页面正常加载
   - ✅ 用户注册功能正常
   - ✅ 用户登录功能正常
   - ✅ 智能健康咨询功能正常
   - ✅ AI 问询功能正常

## 📊 部署后的 URL

完成部署后，您将获得以下访问地址：

**前端**：
```
https://tcm-smart-diagnosis.vercel.app
```

**后端 API**：
```
https://tcm-smart-diagnosis-api.onrender.com
```

**API 端点示例**：
- 健康检查：`https://tcm-smart-diagnosis-api.onrender.com`
- 用户注册：`https://tcm-smart-diagnosis-api.onrender.com/api/auth/register`
- 用户登录：`https://tcm-smart-diagnosis-api.onrender.com/api/auth/login`

## 🎯 关键配置提醒

### 🔑 必须配置的环境变量

#### Render 环境变量

**必需**：
- `SUPABASE_URL` - 从 Supabase Dashboard 获取
- `SUPABASE_SERVICE_ROLE_KEY` - 从 Supabase Dashboard 获取
- `COZE_API_KEY` - 从 Coze Dashboard 获取
- `COZE_API_SECRET` - 从 Coze Dashboard 获取
- `JWT_SECRET` - 运行脚本自动生成（或手动生成）

**可选**：
- `NODE_ENV=production`
- `PORT=3000`

#### Vercel 环境变量

**必需**：
- `PROJECT_DOMAIN=https://tcm-smart-diagnosis-api.onrender.com`

### 📝 如何获取 API Keys

#### Supabase

1. 访问 https://supabase.com
2. 创建新项目（或使用现有项目）
3. 进入 **Settings** → **API**
4. 复制以下值：
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

#### Coze AI

1. 访问 https://www.coze.cn
2. 进入 **开发** → **API 管理**
3. 创建或复制 API Key 和 Secret
4. 复制以下值：
   - **Personal Access Token** → `COZE_API_KEY`
   - **Secret Key** → `COZE_API_SECRET`

#### JWT Secret

**方法 1：运行脚本自动生成**
```bash
bash prepare-deployment.sh
```

**方法 2：手动生成**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 💡 优化建议

### 避免冷启动

Render 免费套餐有 15 分钟无流量后自动休眠的限制，首次访问需要等待约 30 秒。

**解决方案：使用 GitHub Actions 定时 Ping**

项目已自动创建 `.github/workflows/keep-alive.yml` 文件，每 10 分钟自动访问后端，保持热度。

### 监控应用性能

**Vercel Dashboard**：
- 查看访问统计
- 监控构建状态
- 查看错误日志

**Render Dashboard**：
- 查看服务状态
- 实时日志流
- 资源使用情况

**Supabase Dashboard**：
- 数据库查询
- 用户管理
- 存储管理

## 🆘 常见问题

### Q1: Vercel 构建失败怎么办？

**A**:
1. 查看 Vercel 构建日志
2. 确认 `package.json` 中的脚本正确
3. 在本地运行 `pnpm build:web` 测试
4. 检查依赖是否完整

### Q2: Render 构建失败怎么办？

**A**:
1. 查看 Render 构建日志
2. 确认 `Root Directory` 设置为 `server`
3. 验证构建命令：`npm install && npm run build`
4. 检查环境变量是否正确

### Q3: 前端无法连接后端怎么办？

**A**:
1. 确认 `PROJECT_DOMAIN` 环境变量正确
2. 测试后端 API 是否可访问
3. 检查 Render 日志是否有错误
4. 确认 CORS 配置正确

### Q4: AI 功能无响应怎么办？

**A**:
1. 检查 Coze API Key 是否正确
2. 验证 API Key 是否有足够权限
3. 查看 Render 日志中的错误
4. 确认网络连接正常

### Q5: 数据库连接失败怎么办？

**A**:
1. 确认 Supabase URL 和 Key 正确
2. 验证 Supabase 项目是否正常
3. 检查 Supabase 日志
4. 确认数据库表结构正确

## 📈 升级建议

### 何时升级 Render？

**升级条件**：
- 冷启动影响用户体验
- 需要 24/7 快速响应
- 用户量超过 500 人/天

**Render Starter 套餐**：
- 费用：$7/月（约 ¥50/月）
- 冷启动：约 5 秒
- 内存：1GB
- 不自动休眠

### 何时升级 Vercel？

**升级条件**：
- 带宽使用超过 100GB/月
- 构建次数超过 100 次/月
- 需要更多功能（如边缘函数）

**Vercel Pro 套餐**：
- 费用：$20/月（约 ¥145/月）
- 带宽：1TB/月
- 构建：无限次
- 更多高级功能

## 🎉 部署成功！

### 验证清单

- [x] Vercel 前端部署成功
- [x] Render 后端部署成功
- [x] 前后端连接正常
- [x] 用户注册功能正常
- [x] 用户登录功能正常
- [x] 智能健康咨询功能正常
- [x] AI 功能正常工作

### 分享应用

部署成功后，您可以：

1. **分享给测试用户**
   - 发送前端地址：`https://tcm-smart-diagnosis.vercel.app`
   - 收集用户反馈

2. **推广应用**
   - 在社交媒体分享
   - 发布到应用商店
   - 建立用户社区

3. **监控和维护**
   - 定期查看日志
   - 监控性能指标
   - 持续优化功能

## 📚 相关文档

- [完整部署指南](./DEPLOYMENT_VERCEL_RENDER.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- [快速参考卡片](./DEPLOYMENT_QUICK_REFERENCE.md)

## 🆘 需要帮助？

如果遇到问题，请：

1. 查看相关文档
2. 检查平台日志
3. 参考 FAQ 部分
4. 联系技术支持

---

**祝部署顺利！** 🚀

**总成本：$0/月（永久免费）** 💰
