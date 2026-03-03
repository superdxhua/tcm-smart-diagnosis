# 部署前准备检查清单

## 📋 账户准备

### 必需账户（免费）

- [ ] **GitHub 账户**
  - 访问：https://github.com
  - 状态：✅ 已注册
  - 用户名：________________________

- [ ] **Vercel 账户**
  - 访问：https://vercel.com
  - 状态：✅ 已获得批准
  - 邮箱：________________________

- [ ] **Render 账户**
  - 访问：https://render.com
  - 状态：⬜ 需要注册
  - 邮箱：________________________

- [ ] **Supabase 账户**
  - 访问：https://supabase.com
  - 状态：⬜ 需要注册
  - 邮箱：________________________

- [ ] **Coze 账户**
  - 访问：https://www.coze.cn
  - 状态：⬜ 需要注册
  - 邮箱：________________________

## 🔑 API Key 和配置

### Supabase 配置

- [ ] **创建 Supabase 项目**
  - 项目名称：________________________
  - 区域：Singapore（推荐）

- [ ] **获取 Supabase 配置**
  - Project URL：________________________
  - Service Role Key：________________________

### Coze AI 配置

- [ ] **创建 Coze API Key**
  - API Key：________________________
  - API Secret：________________________

### JWT Secret

- [ ] **生成 JWT Secret**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  - 生成的密钥：________________________

## 📁 项目配置

### 文件检查

- [x] **vercel.json** 已配置
- [x] **package.json** 构建脚本正确
- [x] **.env.example** 环境变量模板
- [x] **.env.vercel.example** Vercel 环境变量模板
- [x] **DEPLOYMENT_VERCEL_RENDER.md** 部署指南

### 代码检查

- [ ] **本地测试通过**
  ```bash
  # 启动开发服务器
  cd /workspace/projects
  coze dev

  # 测试功能
  # - 访问 http://localhost:5000
  # - 测试注册/登录
  # - 测试智能健康咨询
  # - 测试 AI 功能
  ```

- [ ] **代码已提交**
  ```bash
  git status  # 确认没有未提交的更改
  git log --oneline -5  # 查看最近的提交
  ```

## 🌐 GitHub 仓库

### 创建仓库

- [ ] **在 GitHub 创建新仓库**
  - 仓库名称：tcm-smart-diagnosis
  - 描述：中医智能健康小程序
  - 可见性：Private（私有）

- [ ] **初始化 Git 仓库**
  ```bash
  cd /workspace/projects
  git init
  ```

- [ ] **添加远程仓库**
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/tcm-smart-diagnosis.git
  ```
  - 替换 YOUR_USERNAME 为您的 GitHub 用户名

- [ ] **推送代码**
  ```bash
  git add .
  git commit -m "准备部署到 Vercel + Render"
  git branch -M main
  git push -u origin main
  ```

## 🚀 部署准备

### 前端部署（Vercel）

- [ ] **登录 Vercel**
  - 使用 GitHub 账号登录
  - 地址：https://vercel.com

- [ ] **导入 GitHub 仓库**
  - 选择 tcm-smart-diagnosis 仓库
  - 点击 Import

- [ ] **配置项目**
  - Framework Preset: Other
  - Build Command: pnpm install && pnpm build:web
  - Output Directory: dist-web
  - Install Command: pnpm install

- [ ] **配置环境变量**
  - PROJECT_DOMAIN: https://your-api.onrender.com（暂时）
  - 选择所有环境：Production, Preview, Development

- [ ] **开始部署**
  - 点击 Deploy
  - 等待构建完成

- [ ] **记录 Vercel 域名**
  - Production URL：________________________

### 后端部署（Render）

- [ ] **登录 Render**
  - 使用 GitHub 账号登录
  - 地址：https://render.com

- [ ] **创建 Web Service**
  - Name: tcm-smart-diagnosis-api
  - Region: Singapore
  - Runtime: Node

- [ ] **配置构建和运行**
  - Root Directory: server
  - Build Command: npm install && npm run build
  - Start Command: npm run start:prod
  - Instance Type: Free

- [ ] **配置环境变量**
  - SUPABASE_URL: ________________________
  - SUPABASE_SERVICE_ROLE_KEY: ________________________
  - COZE_API_KEY: ________________________
  - COZE_API_SECRET: ________________________
  - JWT_SECRET: ________________________
  - NODE_ENV: production
  - PORT: 3000

- [ ] **开始部署**
  - 点击 Create Web Service
  - 等待构建完成

- [ ] **记录 Render 域名**
  - API URL：________________________

### 连接前后端

- [ ] **更新 Vercel 环境变量**
  - PROJECT_DOMAIN: https://tcm-smart-diagnosis-api.onrender.com

- [ ] **重新部署 Vercel**
  - 点击 Redeploy
  - 等待重新部署完成

## ✅ 部署后验证

### 测试后端

- [ ] **测试健康检查**
  ```bash
  curl https://tcm-smart-diagnosis-api.onrender.com
  ```
  - 预期结果：{"status":"ok"}

- [ ] **测试用户注册**
  ```bash
  curl -X POST https://tcm-smart-diagnosis-api.onrender.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"123456","role":"individual"}'
  ```
  - 预期结果：返回用户信息和 token

### 测试前端

- [ ] **访问 Vercel 部署地址**
  - URL：https://tcm-smart-diagnosis.vercel.app

- [ ] **测试页面加载**
  - ✅ 首页正常显示
  - ✅ 页面样式正常
  - ✅ 无控制台错误

- [ ] **测试用户注册**
  - 填写注册信息
  - 提交注册
  - 验证注册成功

- [ ] **测试用户登录**
  - 使用注册账号登录
  - 验证登录成功

- [ ] **测试智能健康咨询**
  - 创建患者
  - 填写症状
  - 生成健康方案
  - 验证 AI 功能正常

- [ ] **测试病历管理**
  - 查看病历列表
  - 查看病历详情
  - 验证数据正确保存

## 📊 监控设置

### Vercel 监控

- [ ] **查看 Vercel Dashboard**
  - 访问：https://vercel.com/dashboard
  - 查看应用状态

- [ ] **配置通知**
  - 部署失败通知
  - 域名过期提醒
  - 资源使用提醒

### Render 监控

- [ ] **查看 Render Dashboard**
  - 访问：https://dashboard.render.com
  - 查看服务状态

- [ ] **查看日志**
  - 实时日志
  - 构建日志
  - 错误日志

### 定时维护

- [ ] **创建 GitHub Actions**
  - 文件：`.github/workflows/keep-alive.yml`
  - 定时 Ping 后端（每 10 分钟）
  - 避免冷启动

## 🎉 完成部署

### 记录重要信息

**前端地址**：
```
https://tcm-smart-diagnosis.vercel.app
```

**后端地址**：
```
https://tcm-smart-diagnosis-api.onrender.com
```

**Supabase URL**：
```
________________________
```

**环境变量清单**：
- PROJECT_DOMAIN: ________________________
- SUPABASE_URL: ________________________
- SUPABASE_SERVICE_ROLE_KEY: ________________________
- COZE_API_KEY: ________________________
- COZE_API_SECRET: ________________________
- JWT_SECRET: ________________________

### 成本确认

| 项目 | 月费用 | 年费用 |
|------|--------|--------|
| Vercel 前端 | $0 | $0 |
| Render 后端 | $0 | $0 |
| Supabase 数据库 | $0 | $0 |
| **总计** | **$0** | **$0** |

**状态：✅ 完全免费**

## 📝 下一步行动

1. ✅ 分享应用给用户测试
2. ✅ 收集用户反馈
3. ✅ 监控应用性能
4. ✅ 持续优化功能
5. ✅ 推广应用

## 🆘 遇到问题？

### 常见问题

1. **Vercel 构建失败**
   - 检查构建日志
   - 验证 package.json 配置
   - 本地运行 pnpm build:web 测试

2. **Render 构建失败**
   - 检查构建日志
   - 验证 Root Directory 设置为 server
   - 检查环境变量配置

3. **前后端连接失败**
   - 确认 PROJECT_DOMAIN 正确
   - 测试后端 API 是否可访问
   - 检查 CORS 配置

4. **AI 功能无响应**
   - 验证 Coze API Key
   - 检查 Render 日志
   - 确认网络连接正常

### 获取帮助

- 查看 [DEPLOYMENT_VERCEL_RENDER.md](./DEPLOYMENT_VERCEL_RENDER.md)
- 查看 Vercel 官方文档
- 查看 Render 官方文档
- 查看项目 Issues

---

**祝部署顺利！** 🚀

## 📌 快速提醒

**部署完成后，记得：**

1. ✅ 将部署地址分享给测试用户
2. ✅ 监控应用性能和日志
3. ✅ 收集用户反馈并持续优化
4. ✅ 定期检查 API 额度使用情况
5. ✅ 备份重要数据

**注意事项：**

- ⚠️ Render 免费套餐有 750 小时/月限制
- ⚠️ 15 分钟无流量后会自动休眠
- ⚠️ 首次访问需等待约 30 秒（冷启动）
- ⚠️ 定时 Ping 可以避免冷启动

**如果需要升级：**

- Render Starter: $7/月（避免冷启动）
- Vercel Pro: $20/月（更多带宽和构建次数）
- Supabase Pro: $25/月（更多数据库资源）

**目前免费套餐完全够用！** 🎉
