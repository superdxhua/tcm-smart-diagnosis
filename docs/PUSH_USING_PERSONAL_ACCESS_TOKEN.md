# 🚀 使用 Personal Access Token 推送代码到 GitHub

## 步骤 1：生成 Personal Access Token

### 1.1 访问 GitHub Token 设置页面

在浏览器中访问：
```
https://github.com/settings/tokens
```

### 1.2 生成新的 Token

1. 点击 **"Generate new token"** 按钮
2. 选择 **"Generate new token (classic)"**

### 1.3 配置 Token

填写以下信息：

**Note**（名称）：
```
tcm-smart-diagnosis-deployment
```

**Expiration**（过期时间）：
- 选择 **"90 days"** 或 **"No expiration"**（如果不想频繁重新生成）

**Scopes**（权限）：
✅ 勾选 **`repo`**（完整的仓库权限）
- 这会自动勾选子选项：
  - repo:status
  - repo_deployment
  - public_repo
  - repo:invite
  - security_events

**注意**：只需要勾选 `repo` 权限即可，不需要勾选其他权限。

### 1.4 生成并复制 Token

1. 点击页面底部的 **"Generate token"** 按钮
2. ⚠️ **立即复制 Token**（只显示一次！）
3. 将 Token 保存到安全的地方

**Token 示例**（不是你的真实 Token）：
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 步骤 2：在本地电脑上推送代码

### 2.1 打开终端/命令行

**Windows**：
- 按 `Win + R`，输入 `cmd`，回车
- 或打开 Git Bash

**macOS**：
- 打开"终端"应用（Cmd + Space，输入"Terminal"）

**Linux**：
- 打开终端

### 2.2 进入项目目录

```bash
# 进入你的项目目录
cd /path/to/tcm-smart-diagnosis

# 如果不确定路径，可以使用以下命令查找
# Windows: dir /s /b tcm-smart-diagnosis
# macOS/Linux: find ~ -type d -name "tcm-smart-diagnosis" 2>/dev/null
```

### 2.3 检查远程仓库地址

```bash
# 查看当前远程仓库地址
git remote -v
```

**预期输出**：
```
origin  https://github.com/superdxhua/tcm-smart-diagnosis.git (fetch)
origin  https://github.com/superdxhua/tcm-smart-diagnosis.git (push)
```

### 2.4 使用 Token 推送代码

**方式 A：直接使用 Token 推送（推荐）**

```bash
# 使用 Token 推送（将 YOUR_TOKEN 替换为你的真实 Token）
git push https://YOUR_TOKEN@github.com/superdxhua/tcm-smart-diagnosis.git main
```

**示例**：
```bash
# 将 ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx 替换为你的真实 Token
git push https://ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/superdxhua/tcm-smart-diagnosis.git main
```

**方式 B：修改远程仓库地址（持久化）**

```bash
# 修改远程仓库地址为包含 Token 的形式
git remote set-url origin https://YOUR_TOKEN@github.com/superdxhua/tcm-smart-diagnosis.git

# 然后直接推送
git push origin main
```

**方式 C：配置 Git 凭证存储（推荐用于长期使用）**

```bash
# 配置 Git 使用凭证存储
git config --global credential.helper store

# 推送时输入用户名和 Token
git push origin main

# 用户名：你的 GitHub 用户名
# 密码：你的 Token（不是 GitHub 密码！）
```

---

## 步骤 3：验证推送结果

### 3.1 检查推送是否成功

```bash
# 查看本地和远程分支的差异（应该没有输出）
git log --oneline origin/main..HEAD
```

**如果没有输出**，说明推送成功！

### 3.2 在 GitHub 上查看

1. 访问：https://github.com/superdxhua/tcm-smart-diagnosis
2. 查看最新的提交是否显示
3. 最新提交应该是：`fix: 修复 React 导入缺失导致的白屏问题`

---

## 📊 推送的 50 个提交

以下是本次推送的所有提交：

```
da6867c fix: 修复 React 导入缺失导致的白屏问题
d815b4e docs: 生成生产部署完整指南，支持 GitHub 推送和 Vercel 部署
74753e3 docs: 更新部署指南，明确推送代码是必需步骤
281830e docs: 更新部署指南，确认 Render 环境变量已配置完成
0fc1b84 docs: 更新 Vercel 部署指南，支持已有项目情况
0b3191c docs: 创建剩余工作执行指南
988f6d0 docs: 添加完整的部署操作指南
7385487 docs: 添加 Render 环境变量配置指南
a4d0825 docs: 创建项目当前状态报告，明确剩余工作
a54b363 fix: 修复构建配置，准备部署到生产环境
17ce069 feat: 生成 PWA 所有的图标尺寸
f119600 feat: 完整实现 PWA 功能，支持安装到主屏幕
f1539d7 docs: 创建完整的生产环境部署文档体系
25b3436 feat: 实现管理员审核页面实时通知功能
f94b95a feat: 实现管理员审核订单功能，关联用户信息
dbd4a14 feat: 配置商户收款码，优化充值页面流程
9fa33d5 refactor: 调整充值流程，先选套餐再扫码支付
7c21550 feat: 实现套餐管理系统，支持4种套餐配置和初始化
6f0bf7c refactor: 充值页面移除自定义金额功能，仅保留套餐选择
9068a64 feat: 充值页面新增套餐选择功能，自动填充待付款金额
...（共 50 个新提交）
```

---

## 🔧 常见问题

### Q1: 提示 "Authentication failed"

**原因**：Token 错误或已过期

**解决方案**：
1. 确认 Token 已正确复制
2. 检查 Token 是否已过期
3. 如果 Token 过期，需要重新生成

### Q2: 提示 "Permission denied"

**原因**：Token 没有足够的权限

**解决方案**：
1. 确认生成 Token 时勾选了 `repo` 权限
2. 重新生成 Token，确保勾选 `repo` 权限

### Q3: 提示 "remote contains work that you do not have"

**原因**：远程仓库有新的提交，需要先拉取

**解决方案**：
```bash
# 拉取远程更新
git pull origin main --rebase

# 然后再推送
git push origin main
```

### Q4: Token 泄露了怎么办？

**解决方案**：
1. 立即撤销已泄露的 Token
2. 访问：https://github.com/settings/tokens
3. 找到泄露的 Token，点击 **"Delete"**
4. 重新生成新的 Token

---

## 📝 Token 安全建议

1. **不要分享 Token**：Token 相当于密码，不要分享给他人
2. **定期更换 Token**：建议每 90 天更换一次
3. **使用最小权限**：只授予必要的权限（本例只需要 `repo`）
4. **不要提交 Token 到代码仓库**：确保 `.gitignore` 包含敏感文件
5. **使用环境变量**：在生产环境中使用环境变量存储 Token

---

## 🎯 推送成功后

推送成功后，可以继续执行：

**下一步**：在 Vercel 部署或更新前端

**详细指南**：
- `docs/VERCEL_FINAL_DEPLOYMENT_GUIDE.md` - Vercel 部署详细指南

---

**按照以上步骤操作，即可成功推送代码到 GitHub！** 🚀
