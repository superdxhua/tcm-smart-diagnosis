# 🚀 技术小白快速参考卡

## 📌 最重要的 5 个链接

### 注册账号（5 分钟）

1. **GitHub**：https://github.com
2. **Supabase**：https://supabase.com
3. **Coze**：https://www.coze.cn
4. **Render**：https://render.com
5. **Vercel**：https://vercel.com

---

## 🔑 最重要的 5 个配置

### Render 环境变量（必须全部配置！）

1. **SUPABASE_URL**
   - 从 Supabase Dashboard 获取

2. **SUPABASE_SERVICE_ROLE_KEY**
   - 从 Supabase Dashboard 获取

3. **COZE_API_KEY**
   - 从 Coze API 管理获取

4. **COZE_API_SECRET**
   - 从 Coze API 管理获取

5. **JWT_SECRET**
   - 直接使用：`d9d090349fd94264e1a768711553413ee69927809b78382413ed23e2b674a985`

### Vercel 环境变量（必须配置！）

1. **PROJECT_DOMAIN**
   - Render 后端地址：`https://tcm-smart-diagnosis-api.onrender.com`

---

## ⚠️ 最重要的 3 个选择

### Render 配置

1. **Region（区域）**：必须选择 **Singapore（新加坡）**
   - 原因：访问速度更快

2. **Root Directory（根目录）**：必须填写 **`server`**
   - 原因：后端代码在 server 文件夹

3. **Instance Type（实例类型）**：选择 **Free（免费）**
   - 原因：完全免费使用

---

## 📋 最重要的 5 个命令

### 推送代码到 GitHub

```bash
# 进入项目文件夹
cd /workspace/projects

# 添加所有文件
git add .

# 提交代码
git commit -m "准备部署到 Vercel + Render"

# 添加远程仓库（替换您的用户名）
git remote add origin https://github.com/您的用户名/tcm-smart-diagnosis.git

# 推送代码
git branch -M main
git push -u origin main
```

---

## 🎯 最重要的 5 个测试

### 部署后必须测试

1. **测试后端**
   - 访问：`https://tcm-smart-diagnosis-api.onrender.com`
   - 预期结果：`{"status":"ok"}`

2. **测试前端**
   - 访问：`https://tcm-smart-diagnosis.vercel.app`
   - 预期结果：页面正常加载

3. **测试注册**
   - 用户名：`testuser`
   - 密码：`123456`
   - 预期结果：注册成功

4. **测试登录**
   - 使用刚注册的账号登录
   - 预期结果：登录成功

5. **测试智能健康咨询**
   - 创建患者
   - 填写症状
   - 生成健康方案
   - 预期结果：AI 问询正常，生成处方

---

## 💰 成本信息

| 项目 | 费用 |
|------|------|
| Vercel 前端 | **$0/月** |
| Render 后端 | **$0/月** |
| Supabase 数据库 | **$0/月** |
| **总计** | **$0/月** |

**完全免费！** 💰

---

## 📚 文档导航

### 遇到问题时查看

1. **超详细指南**（推荐）：
   - 文件：`DEPLOYMENT_FOR_BEGINNERS.md`
   - 内容：每一步都有详细说明

2. **检查清单**：
   - 文件：`DEPLOYMENT_CHECKLIST_BEGINNER.md`
   - 内容：58 个检查项

3. **快速参考**：
   - 文件：`DEPLOYMENT_QUICK_REFERENCE.md`
   - 内容：常用命令和配置

---

## ⏱️ 时间预估

| 阶段 | 预计时间 |
|------|---------|
| 注册账号 | 5 分钟 |
| 获取密钥 | 15 分钟 |
| 创建仓库 | 10 分钟 |
| 部署后端 | 20 分钟 |
| 部署前端 | 15 分钟 |
| 测试部署 | 10 分钟 |
| **总计** | **约 75 分钟** |

---

## 🎯 成功标准

### 部署成功的标志

- [ ] 后端显示 `{"status":"ok"}`
- [ ] 前端页面正常加载
- [ ] 用户注册成功
- [ ] 用户登录成功
- [ ] 智能健康咨询功能正常

---

## 🆘 常见错误

### 错误 1：Root Directory 错误

**错误**：后端构建失败

**原因**：Root Directory 没有填写或填写错误

**解决**：在 Render 配置中，Root Directory 必须填写 `server`

---

### 错误 2：区域选择错误

**错误**：访问速度慢

**原因**：Region 没有选择 Singapore

**解决**：重新创建服务，Region 选择 Singapore

---

### 错误 3：环境变量未配置

**错误**：后端无法连接数据库

**原因**：环境变量没有配置或配置错误

**解决**：
- Render：配置 7 个环境变量
- Vercel：配置 1 个环境变量（PROJECT_DOMAIN）

---

### 错误 4：PROJECT_DOMAIN 错误

**错误**：前端无法连接后端

**原因**：PROJECT_DOMAIN 环境变量错误

**解决**：
- 确保 PROJECT_DOMAIN = Render 后端地址
- 格式：`https://tcm-smart-diagnosis-api.onrender.com`

---

### 错误 5：推送代码失败

**错误**：Authentication failed

**原因**：GitHub 密码错误

**解决**：
- 确认 GitHub 用户名和密码正确
- 或使用 Personal Access Token

---

## 📞 获取帮助

### 遇到问题时

1. **查看详细指南**：
   - 文件：`DEPLOYMENT_FOR_BEGINNERS.md`
   - 查找相关章节

2. **查看检查清单**：
   - 文件：`DEPLOYMENT_CHECKLIST_BEGINNER.md`
   - 确认每一步都完成

3. **查看平台日志**：
   - Vercel：进入 Dashboard → Deployments → Logs
   - Render：进入 Dashboard → Logs

4. **搜索问题**：
   - 在浏览器搜索错误信息

---

## 🎉 完成后您将获得

### 访问地址

**前端**：
```
https://tcm-smart-diagnosis.vercel.app
```

**后端**：
```
https://tcm-smart-diagnosis-api.onrender.com
```

### 您可以做的事

- ✅ 分享网址给任何人
- ✅ 注册账号、创建患者、生成健康方案
- ✅ 完全免费使用
- ✅ 无需懂编程

---

## 💪 鼓励的话

**您一定能成功！**

**只要按照详细指南一步步来，每一步都很简单。**

**遇到问题不要慌，仔细检查配置，或者查看详细指南。**

**相信您一定能完成部署！** 🎉

---

**开始部署吧！** 🚀

**预计时间：75 分钟**

**总成本：$0**

**难度：⭐☆☆☆☆（适合技术小白）**
