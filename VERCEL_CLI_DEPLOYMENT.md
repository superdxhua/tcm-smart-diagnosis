# Vercel CLI 部署指南

## 问题

Vercel CLI 需要登录凭证才能部署项目，但当前环境中没有配置 VERCEL_TOKEN。

## 解决方案

### 方案 1：使用 Vercel CLI 登录（需要用户交互）

```bash
vercel login
```

然后选择：
1. Vercel 账户（如果有账户）
2. 或者创建新账户

### 方案 2：配置环境变量

```bash
export VERCEL_TOKEN="your-vercel-token"
```

获取 Token 的步骤：
1. 访问 https://vercel.com/account/tokens
2. 创建新的 Token
3. 复制 Token 并设置到环境变量

### 方案 3：使用 Git 集成部署（推荐）

由于项目已经配置了 Git 集成，可以直接通过 Git 推送触发部署：

```bash
git push
```

Vercel 会自动检测到新的提交并开始部署。

## 当前项目状态

- **项目名称**：zhongyi-smart
- **项目 ID**：prj_6SNjA9HMONCFXeCO21sU6P0K23RX
- **组织 ID**：team_MiU261xYOpmvgngjQaE1mKvU
- **Git 集成**：已配置
- **Vercel 配置文件**：.vercel/project.json

## 推荐操作

由于 Vercel CLI 需要登录凭证，建议：

1. **如果用户有 Vercel 账户**：执行 `vercel login` 登录
2. **如果用户没有 Vercel 账户**：访问 https://vercel.com/signup 创建账户
3. **快速部署**：直接使用 Git 推送触发部署

## 部署检查清单

部署完成后，检查以下内容：

- [ ] 构建成功（前端和后端）
- [ ] 环境变量已配置
- [ ] 前端页面正常加载
- [ ] 后端 API 正常响应
