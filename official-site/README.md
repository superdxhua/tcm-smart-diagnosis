# 天源堂海王星药店官网部署方案

## 📋 方案概述

本方案解决了ICP备案域名解析与实际部署架构的矛盾问题：

- **主域名** `zhongyihskhealth.com`：部署静态官网到阿里云服务器，符合ICP备案要求
- **子域名** `www.zhongyihskhealth.com`：保持Vercel + Render架构，继续提供完整应用功能

---

## 🎯 架构说明

```
主域名：zhongyihskhealth.com
    ↓
DNS解析：A记录 → 120.26.175.70
    ↓
阿里云服务器（Nginx + 静态HTML）
    ↓
显示ICP备案官网页面
    ↓
用户点击"进入应用"
    ↓
子域名：www.zhongyihskhealth.com
    ↓
DNS解析：CNAME → *.vercel.app
    ↓
Vercel（前端） + Render（后端）
    ↓
完整应用功能
```

---

## ✅ 优点

1. **符合ICP备案要求**：主域名解析到国内服务器
2. **代码零改动**：应用代码完全不需要修改
3. **用户体验好**：子域名继续提供完整功能
4. **成本低**：使用已有阿里云服务器，无需额外费用
5. **快速实施**：1-2小时即可完成

---

## 📦 文件列表

| 文件名 | 说明 | 用途 |
|--------|------|------|
| `index.html` | 静态官网页面 | 部署到阿里云服务器 |
| `nginx.conf` | Nginx配置文件 | 配置Web服务器 |
| `DNS_CONFIG.md` | DNS配置指南 | 修改域名解析 |
| `DEPLOY_GUIDE.md` | 部署指南 | 在阿里云服务器上部署 |
| `README.md` | 本文件 | 方案总览 |

---

## 🚀 快速开始

### Step 1：修改DNS解析

参考 `DNS_CONFIG.md`：

1. 登录阿里云DNS控制台
2. 修改主域名A记录：`zhongyihskhealth.com → 120.26.175.70`
3. 确认子域名CNAME记录保持不变：`www.zhongyihskhealth.com → *.vercel.app`

### Step 2：部署到阿里云服务器

参考 `DEPLOY_GUIDE.md`：

1. 登录服务器：`ssh root@120.26.175.70`
2. 安装Nginx
3. 上传 `index.html` 到 `/var/www/zhongyihskhealth.com/`
4. 配置Nginx（使用 `nginx.conf`）
5. 测试访问：`http://120.26.175.70`

### Step 3：测试验证

1. 等待DNS生效（10-30分钟）
2. 访问主域名：`http://zhongyihskhealth.com`（应该显示官网）
3. 访问子域名：`http://www.zhongyihskhealth.com`（应该显示应用）
4. 点击"进入应用"按钮，跳转到子域名

### Step 4：重新申报ICP备案

备案审核时，审核人员访问主域名将看到符合ICP备案要求的官网内容。

---

## ⚙️ 配置详情

### DNS配置

| 域名 | 记录类型 | 记录值 | 用途 |
|------|---------|--------|------|
| zhongyihskhealth.com | A | 120.26.175.70 | 主域名（官网） |
| www.zhongyihskhealth.com | CNAME | *.vercel.app | 子域名（应用） |
| *.zhongyihskhealth.com | CNAME | *.vercel.app | 通配符（可选） |

### 网站跳转

官网页面的跳转按钮：

- **进入应用**：`https://www.zhongyihskhealth.com`
- **用户登录**：`https://www.zhongyihskhealth.com/pages/login/index`

### 应用配置

前端和后端配置保持不变：

- **前端域名**：`www.zhongyihskhealth.com`（Vercel）
- **后端API**：`api.zhongyihskhealth.com`（Render）
- **数据库**：Supabase（云数据库）

---

## 🔍 验证清单

部署完成后，请逐项验证：

- [ ] 主域名解析到120.26.175.70
- [ ] 子域名解析到*.vercel.app
- [ ] 访问主域名显示官网页面
- [ ] 访问子域名显示应用页面
- [ ] 官网页面"进入应用"按钮可正常跳转
- [ ] 应用所有功能正常使用
- [ ] 备案审核可访问主域名

---

## 📞 技术支持

### 常见问题

1. **DNS解析不生效？**
   - 等待10-30分钟
   - 清除本地DNS缓存：`ipconfig /flushdns`（Windows）或 `sudo systemctl restart nscd`（Linux）

2. **网站无法访问？**
   - 检查Nginx状态：`sudo systemctl status nginx`
   - 检查防火墙配置
   - 检查阿里云安全组规则

3. **子域名无法访问？**
   - 确认DNS CNAME记录未修改
   - 确认Vercel部署正常

4. **需要更新官网内容？**
   - 修改 `index.html`
   - 上传到服务器：`scp index.html root@120.26.175.70:/var/www/zhongyihskhealth.com/`

---

## 📝 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-03-02 | 初始版本，支持主域名官网和子域名应用分离 |

---

## 📄 许可证

本方案仅供天源堂海王星药店ICP备案使用。

---

## 🔐 安全提示

1. 定期更新系统和软件包
2. 启用SSL证书（HTTPS）
3. 配置防火墙规则
4. 定期备份重要数据
5. 监控访问日志

---

**准备就绪，开始部署吧！** 🚀
