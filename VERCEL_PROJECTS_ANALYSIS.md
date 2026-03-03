# Vercel 项目分析报告

## 项目概览

当前 Vercel 账户中共有 6 个项目，其中 3 个需要保留，3 个可以安全删除。

---

## ✅ 应该保留的 2 个项目

### 1. zhongyi-smart（前端项目）
- **项目 ID**: prj_6SNjA9HMONCFXeCO21sU6P0K23RX
- **创建时间**: 2025-10-19（最早）
- **项目类型**: 前端（Taro H5）
- **输出目录**: dist-web
- **环境变量**: 4 个
- **自定义域名**: 0 个
- **Git 仓库**: 已连接 GitHub
- **用途**: 中医健康管理平台前端

**保留理由**:
- 最早创建的前端项目
- 已配置环境变量
- 已有部署历史（多次成功部署）
- 是主域名 `www.zhongyihskhealth.com` 的目标项目

---

### 2. tcm-smart-diagnosis-backend（后端项目）
- **项目 ID**: prj_awa0Q9PXS9ZUIJBKJOs5vtVCOLRu
- **创建时间**: 2025-10-23
- **项目类型**: 后端（NestJS）
- **输出目录**: .
- **环境变量**: 14 个（包括 DATABASE_URL, JWT_SECRET 等）
- **自定义域名**: 0 个
- **Git 仓库**: 已连接 GitHub
- **用途**: 中医健康管理平台后端 API

**保留理由**:
- 后端专用项目
- 已配置数据库连接等关键环境变量（14 个）
- 包含所有后端服务逻辑
- 前端项目需要连接后端 API

---

### 3. bull-stock-dxhapp（股票应用）
- **项目 ID**: prj_hu00jyKrZwjFoPls1LsU46P6ck7N
- **创建时间**: 2025-10-17
- **项目类型**: Next.js
- **输出目录**: .next
- **环境变量**: 0 个
- **自定义域名**: 0 个
- **Git 仓库**: 已连接 GitHub
- **用途**: 股票应用

**保留理由**:
- 用户要求保留
- 独立的股票应用项目
- 与中医健康管理平台无关，但需要保留

---

## ❌ 可以安全删除的 4 个项目

### 1. tcm-smart-diagnosis-frontend（重复前端项目）
- **项目 ID**: prj_Ac4CN2GebUvHkjdB2HjOkToo7iga
- **创建时间**: 2025-10-27
- **环境变量**: 0 个
- **自定义域名**: 0 个

**删除理由**:
- 与 `zhongyi-smart` 重复
- 没有环境变量
- 没有部署记录
- 构建命令尝试同时构建前后端，但未配置环境变量

---

### 2. tcm-smart-diagnosis（测试项目）
- **项目 ID**: prj_fb1vk3l3cS1jIMklceZSRjPfbfGp
- **创建时间**: 2025-10-27
- **环境变量**: 0 个
- **自定义域名**: 0 个

**删除理由**:
- 测试项目
- 没有环境变量
- 没有部署记录
- 构建命令尝试同时构建前后端，但未配置环境变量

---

### 3. projects（测试项目）
- **项目 ID**: prj_ZfzQdT9gzJQG9FOHAS6j6Y4ECYDv
- **创建时间**: 2025-10-27
- **环境变量**: 0 个
- **自定义域名**: 0 个

**删除理由**:
- 测试项目
- 项目名称不规范（"projects"）
- 没有环境变量
- 没有部署记录

---

## 删除操作指南

### 通过 Vercel Dashboard 删除（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入要删除的项目
3. 点击 "Settings" 标签页
4. 滚动到页面底部
5. 点击 "Delete Project" 按钮
6. 确认删除

### 通过 Vercel CLI 删除

```bash
npx vercel login --token <YOUR_TOKEN>
npx vercel switch --scope superdxhuas-projects

# 删除项目
npx vercel rm tcm-smart-diagnosis-frontend --yes
npx vercel rm tcm-smart-diagnosis --yes
npx vercel rm projects --yes
```

---

## 删除顺序建议

1. **第一步**: 删除测试项目
   - `tcm-smart-diagnosis`
   - `projects`

2. **第二步**: 删除重复项目
   - `tcm-smart-diagnosis-frontend`

---

## 删除后的配置

### 前端项目配置

**项目**: zhongyi-smart
**需要配置**:
1. 环境变量 `PROJECT_DOMAIN` 指向后端域名
2. 自定义域名 `www.zhongyihskhealth.com`

**配置步骤**:
1. 在 Vercel Dashboard 中，进入 `zhongyi-smart` 项目
2. 进入 Settings → Environment Variables
3. 添加 `PROJECT_DOMAIN` 环境变量
4. 进入 Settings → Domains
5. 添加自定义域名 `www.zhongyihskhealth.com`
6. 配置 DNS 记录，指向 Vercel 提供的 CNAME

### 后端项目配置

**项目**: tcm-smart-diagnosis-backend
**已配置**:
- 14 个环境变量（包括 DATABASE_URL, JWT_SECRET 等）

**需要配置**:
1. 确认环境变量正确
2. 部署后端服务

---

## 注意事项

⚠️ **删除前确认**:
- 确保已从 `zhongyi-smart` 项目复制所需的环境变量
- 确保后端项目的环境变量已正确配置
- 确认自定义域名配置指向正确的项目

⚠️ **删除后**:
- Vercel 免费账户每天有 100 次部署限制
- 删除项目不会释放已使用的部署次数
- 删除项目后无法恢复

---

## 总结

**保留的 2 个项目**:
1. ✅ `zhongyi-smart` - 前端项目
2. ✅ `tcm-smart-diagnosis-backend` - 后端项目

**删除的 4 个项目**:
1. ❌ `tcm-smart-diagnosis-frontend` - 重复前端项目
2. ❌ `tcm-smart-diagnosis` - 测试项目
3. ❌ `projects` - 测试项目
4. ❌ `bull-stock-dxhapp` - 无关项目（股票应用）

删除这 4 个项目后：
- 减少 Vercel 账户中的项目数量
- 避免混淆，只保留必要的项目
- 确保前后端分离架构清晰
- 为后续部署和配置做准备
