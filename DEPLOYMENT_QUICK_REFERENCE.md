# 🚀 部署快速参考卡片

## 📱 重要链接

### 部署平台

- **Vercel**: https://vercel.com
- **Render**: https://render.com
- **GitHub**: https://github.com

### 服务平台

- **Supabase**: https://supabase.com
- **Coze AI**: https://www.coze.cn

### 文档

- **完整部署指南**: `./DEPLOYMENT_VERCEL_RENDER.md`
- **部署检查清单**: `./DEPLOYMENT_CHECKLIST.md`
- **Vercel 文档**: https://vercel.com/docs
- **Render 文档**: https://render.com/docs

## 🔧 快速命令

### 准备部署

```bash
# 运行部署准备脚本
cd /workspace/projects
bash scripts/prepare-deployment.sh
```

### Git 操作

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "准备部署"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/tcm-smart-diagnosis.git

# 推送代码
git branch -M main
git push -u origin main
```

### 本地测试

```bash
# 安装依赖
pnpm install

# 启动开发服务器
coze dev

# 构建前端
pnpm build:web

# 构建后端
cd server && npm run build
```

## 🔑 环境变量清单

### Vercel 环境变量

```
PROJECT_DOMAIN=https://tcm-smart-diagnosis-api.onrender.com
```

### Render 环境变量

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
COZE_API_KEY=your_coze_api_key
COZE_API_SECRET=your_coze_api_secret
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=3000
```

### 生成 JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 部署步骤（5 步）

### 步骤 1：推送代码到 GitHub

```bash
git add .
git commit -m "准备部署"
git push origin main
```

### 步骤 2：部署到 Vercel

1. 访问 https://vercel.com
2. 点击 "Add New..." → "Project"
3. 导入 GitHub 仓库
4. 配置：
   - Build Command: `pnpm install && pnpm build:web`
   - Output Directory: `dist-web`
5. 配置环境变量：`PROJECT_DOMAIN`（暂时留空）
6. 点击 Deploy

### 步骤 3：部署到 Render

1. 访问 https://render.com
2. 点击 "New +" → "Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
5. 配置环境变量（见上方清单）
6. 点击 Create Web Service

### 步骤 4：连接前后端

1. 访问 Vercel 项目 Settings
2. 更新 `PROJECT_DOMAIN` 环境变量
3. 值：`https://tcm-smart-diagnosis-api.onrender.com`
4. 重新部署 Vercel

### 步骤 5：测试部署

```bash
# 测试后端
curl https://tcm-smart-diagnosis-api.onrender.com

# 测试前端
访问 https://tcm-smart-diagnosis.vercel.app
```

## 📊 部署配置

### Vercel 配置

**项目设置**：
- Framework Preset: Other
- Build Command: `pnpm install && pnpm build:web`
- Output Directory: `dist-web`
- Install Command: `pnpm install`

**环境变量**：
```
PROJECT_DOMAIN=https://tcm-smart-diagnosis-api.onrender.com
```

### Render 配置

**项目设置**：
- Name: `tcm-smart-diagnosis-api`
- Root Directory: `server`
- Runtime: Node
- Region: Singapore
- Instance Type: Free

**构建和运行**：
- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod`

## ✅ 测试清单

### 后端测试

```bash
# 测试健康检查
curl https://tcm-smart-diagnosis-api.onrender.com

# 测试用户注册
curl -X POST https://tcm-smart-diagnosis-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","role":"individual"}'

# 测试用户登录
curl -X POST https://tcm-smart-diagnosis-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

### 前端测试

- [ ] 访问 https://tcm-smart-diagnosis.vercel.app
- [ ] 页面正常加载
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 智能健康咨询功能正常
- [ ] AI 问询功能正常
- [ ] 病历管理功能正常

## 🔍 监控和日志

### Vercel 日志

1. 访问 Vercel Dashboard
2. 选择项目
3. 点击 "Deployments"
4. 选择部署记录
5. 点击 "Logs"

### Render 日志

1. 访问 Render Dashboard
2. 选择服务
3. 点击 "Logs"
4. 实时查看日志流

### 查看构建日志

```bash
# Vercel 构建日志
在 Vercel Dashboard 查看最新部署的日志

# Render 构建日志
在 Render Dashboard 查看最新部署的日志
```

## 🐛 故障排除

### Vercel 构建失败

```bash
# 本地测试构建
pnpm build:web

# 检查构建日志
在 Vercel Dashboard 查看详细日志

# 常见问题
- 依赖版本冲突
- 构建命令错误
- 环境变量缺失
```

### Render 构建失败

```bash
# 本地测试构建
cd server && npm run build

# 检查构建日志
在 Render Dashboard 查看详细日志

# 常见问题
- Root Directory 错误（应为 server）
- 构建命令错误
- 环境变量缺失
- Node 版本不兼容
```

### 前后端连接失败

```bash
# 测试后端 API
curl https://tcm-smart-diagnosis-api.onrender.com

# 检查环境变量
在 Vercel Dashboard 检查 PROJECT_DOMAIN

# 检查 CORS 配置
在 Render 日志中查看 CORS 错误
```

### AI 功能无响应

```bash
# 检查 API Key
在 Render Dashboard 检查 COZE_API_KEY 和 COZE_API_SECRET

# 查看 Render 日志
检查 AI 调用错误信息

# 测试网络连接
curl https://api.coze.cn
```

## 💰 成本信息

### 免费套餐限制

**Vercel 免费套餐**：
- 带宽：100GB/月
- 构建次数：100 次/月
- 函数执行：100 小时/月

**Render 免费套餐**：
- 计算时间：750 小时/月
- 内存：512MB
- 自动休眠：15 分钟无流量后

**Supabase 免费套餐**：
- 数据库：500MB
- 带宽：2GB/月
- 文件存储：100MB

### 升级建议

**何时升级 Render**：
- 冷启动影响用户体验
- 需要 24/7 快速响应
- 用户量超过 500 人/天

**Render Starter 套餐**：
- 费用：$7/月（约 ¥50/月）
- 冷启动：约 5 秒
- 内存：1GB

## 📞 获取帮助

### 官方文档

- [Vercel 文档](https://vercel.com/docs)
- [Render 文档](https://render.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Coze 文档](https://www.coze.cn/docs)

### 社区支持

- [Vercel GitHub](https://github.com/vercel/vercel)
- [Render GitHub](https://github.com/render)
- [Supabase GitHub](https://github.com/supabase)

### 项目文档

- [完整部署指南](./DEPLOYMENT_VERCEL_RENDER.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- [Vercel 快速开始](./VERCEL_QUICK_START.md)

## 🎉 成功标准

### 部署成功标志

- ✅ Vercel 构建成功（绿色勾）
- ✅ Render 构建成功（绿色勾）
- ✅ 前端页面可访问
- ✅ 后端 API 响应正常
- ✅ 用户注册/登录成功
- ✅ AI 功能正常工作

### 性能指标

- 首次加载时间：< 3 秒
- API 响应时间：< 2 秒
- 冷启动时间：< 30 秒（Render 免费套餐）

---

**快速参考，随查随用！** 📚
