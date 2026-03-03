# 🚀 推送代码到 GitHub - 详细操作指南

## 📋 当前状态

- ✅ GitHub 仓库已存在：`https://github.com/superdxhua/tcm-smart-diagnosis.git`
- ✅ 代码已提交到本地 Git（最新提交：`74753e3`）
- ⚠️ **有 50 个新提交需要推送**
- ⚠️ **需要认证才能推送**

---

## 🔑 推送方法

### 方法 1：使用 SSH（推荐）⭐

#### 步骤 1：检查是否已配置 SSH 密钥

在你的本地电脑上执行：

```bash
# 检查 SSH 密钥是否存在
ls -la ~/.ssh/id_*.pub
```

**如果看到 SSH 密钥**：
```bash
# 复制公钥内容
cat ~/.ssh/id_rsa.pub
```

**如果没有 SSH 密钥**：
```bash
# 生成新的 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 按照提示操作，可以使用默认选项
# 生成后，复制公钥内容
cat ~/.ssh/id_rsa.pub
```

#### 步骤 2：添加 SSH 密钥到 GitHub

1. 访问：https://github.com/settings/keys
2. 点击 **"New SSH key"**
3. 粘贴公钥内容
4. 点击 **"Add SSH key"**

#### 步骤 3：修改远程仓库为 SSH

在你的本地电脑上执行：

```bash
cd /workspace/projects
git remote set-url origin git@github.com:superdxhua/tcm-smart-diagnosis.git
```

#### 步骤 4：推送代码

```bash
cd /workspace/projects
git push origin main
```

**预期结果**：
```
Enumerating objects: 189, done.
Counting objects: 100% (189/189), done.
Delta compression using up to 8 threads
Compressing objects: 100% (180/180), done.
Writing objects: 100% (189/189), 3.45 MiB | 2.45 MiB/s, done.
Total 189 (delta 50), reused 0 (delta 0), pack-reused 0
To github.com:superdxhua/tcm-smart-diagnosis.git
   30f2d7b..74753e3  main -> main
```

---

### 方法 2：使用 Personal Access Token

#### 步骤 1：生成 Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 配置 Token：
   - **Note**: `tcm-smart-diagnosis deployment`
   - **Expiration**: 选择一个过期时间（推荐 90 天）
   - **Scopes**: 勾选 `repo`（所有仓库权限）
4. 点击 **"Generate token"**
5. ⚠️ **复制 Token**（只显示一次！）

#### 步骤 2：使用 Token 推送

**方式 A：直接使用 Token（临时）**

```bash
cd /workspace/projects
git push https://YOUR_TOKEN@github.com/superdxhua/tcm-smart-diagnosis.git main
```

**方式 B：配置 Git 使用 Token**

```bash
cd /workspace/projects

# 配置 Git 使用 Token
git config --global credential.helper store
git push https://YOUR_TOKEN@github.com/superdxhua/tcm-smart-diagnosis.git main

# 按照提示输入 GitHub 用户名和 Token（密码）
```

---

### 方法 3：使用 GitHub CLI（gh）

#### 步骤 1：安装 GitHub CLI

**macOS**:
```bash
brew install gh
```

**Windows**:
```bash
winget install --id GitHub.cli
```

**Linux**:
```bash
sudo apt install gh
# 或
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

#### 步骤 2：登录 GitHub

```bash
gh auth login
```

按照提示操作：
1. 选择 **"GitHub.com"**
2. 选择 **"HTTPS"**
3. 选择 **"Login with a web browser"**
4. 复制授权码
5. 在浏览器中粘贴授权码并完成授权

#### 步骤 3：推送代码

```bash
cd /workspace/projects
git push origin main
```

---

## ✅ 推送成功验证

推送成功后，执行以下命令验证：

```bash
cd /workspace/projects

# 检查远程分支状态
git branch -vv

# 应该显示类似：
# * main 74753e3 docs: 更新部署指南，明确推送代码是必需步骤 [origin/main]

# 检查远程和本地是否一致
git log --oneline origin/main..HEAD

# 应该没有输出，表示远程和本地一致
```

---

## 🔧 故障排除

### 问题 1：Permission denied (publickey)

**症状**：
```
Permission denied (publickey)
fatal: Could not read from remote repository
```

**解决方案**：
1. 检查 SSH 密钥是否正确添加到 GitHub
2. 确认远程仓库 URL 是 SSH 格式：`git@github.com:...`
3. 重新生成 SSH 密钥并添加

### 问题 2：Authentication failed

**症状**：
```
fatal: Authentication failed for 'https://github.com/...'
```

**解决方案**：
1. 检查 Personal Access Token 是否正确
2. 确认 Token 有 `repo` 权限
3. 检查 Token 是否已过期

### 问题 3：SSL certificate problem

**症状**：
```
fatal: unable to access 'https://github.com/...': SSL certificate problem
```

**解决方案**：
```bash
# 临时禁用 SSL 验证（不推荐）
git config --global http.sslVerify false

# 或正确配置 SSL
git config --global http.sslBackend schannel
```

### 问题 4：Push rejected

**症状**：
```
! [rejected] main -> main (fetch first)
error: failed to push some refs to 'https://github.com/...'
```

**解决方案**：
```bash
# 方案 1：拉取远程更改后合并推送
git pull origin main --rebase
git push origin main

# 方案 2：强制推送（谨慎使用！）
git push origin main --force
```

---

## 📊 推送后状态

推送成功后，GitHub 仓库应该包含以下提交：

```
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
...（共 50 个新提交）
```

---

## 🎯 下一步

推送成功后，继续执行：

**下一步**：在 Vercel 部署或更新前端

**详细指南**：
- 如果有已有项目：`docs/VERCEL_EXISTING_PROJECT_GUIDE.md`
- 如果没有项目：`docs/VERCEL_DEPLOYMENT_STEP_BY_STEP.md`

---

**推送完成后，请继续执行 Vercel 部署！🚀**
