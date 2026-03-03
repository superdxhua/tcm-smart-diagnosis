# 生产环境部署检查清单

使用此清单确保所有部署步骤已完成。

---

## 📦 部署前准备

### 代码准备

- [ ] 代码已推送到 GitHub 仓库
- [ ] `.gitignore` 已配置（包含 `.env`、`node_modules` 等）
- [ ] `package.json` 中的依赖版本正确
- [ ] `package.json` 中的脚本正确（`build:web`、`build:weapp` 等）

### 账号准备

- [ ] GitHub 账号已注册并登录
- [ ] Vercel 账号已注册并登录
- [ ] Render 账号已注册并登录
- [ ] Supabase 账号已注册并登录

### 工具准备

- [ ] Node.js 18+ 已安装
- [ ] Git 已安装
- [ ] npm 或 pnpm 已安装

---

## 🗄️ Supabase 部署

### 项目创建

- [ ] Supabase 项目已创建
- [ ] 数据库密码已保存（务必保存！）
- [ ] 区域已选择（推荐：Southeast Asia (Singapore)）

### 配置信息获取

- [ ] Project URL 已记录
- [ ] anon public key 已记录
- [ ] service role key 已记录（保密！）

### 数据库表创建

- [ ] `users` 表已创建
- [ ] `user_permissions` 表已创建
- [ ] `medical_records` 表已创建
- [ ] `recharge_orders` 表已创建

### 索引创建

- [ ] `idx_users_username` 已创建
- [ ] `idx_user_permissions_user_id` 已创建
- [ ] `idx_medical_records_user_id` 已创建
- [ ] `idx_recharge_orders_user_id` 已创建
- [ ] `idx_recharge_orders_order_no` 已创建
- [ ] `idx_recharge_orders_audit_status` 已创建

### 存储桶配置

- [ ] `screenshots` 存储桶已创建
- [ ] `screenshots` 已设置为 Public
- [ ] `avatars` 存储桶已创建（可选）
- [ ] `prescriptions` 存储桶已创建（可选）

### 管理员账号创建

- [ ] 管理员账号已创建
- [ ] 管理员密码已使用 bcrypt 哈希
- [ ] 管理员账号可以正常登录

---

## 🚀 后端部署（Render）

### Web Service 创建

- [ ] Render Web Service 已创建
- [ ] GitHub 仓库已关联
- [ ] 分支已选择（main）

### 构建配置

- [ ] Root Directory 设置为 `server`
- [ ] Build Command 设置为 `npm install && npx @nestjs/cli build`
- [ ] Start Command 设置为 `node dist/main`
- [ ] 实例类型设置为 Free (nano)

### 环境变量配置

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `SUPABASE_URL` 已填入
- [ ] `SUPABASE_ANON_KEY` 已填入
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 已填入
- [ ] `JWT_SECRET` 已填入（随机生成）
- [ ] `PROJECT_DOMAIN` 已填入（Render 域名）

### 部署状态

- [ ] Web Service 已成功部署
- [ ] 部署日志无错误
- [ ] 后端服务正常运行

### 功能验证

- [ ] `/api/health` 接口可以正常访问
- [ ] `/api/user/login` 接口可以正常访问
- [ ] 管理员登录成功
- [ ] 返回 token 正常

---

## 🌐 前端部署（Vercel）

### 项目创建

- [ ] Vercel 项目已创建
- [ ] GitHub 仓库已关联
- [ ] Framework 选择为 Other

### 构建配置

- [ ] Root Directory 设置为 `./`
- [ ] Build Command 设置为 `npm run build:web`
- [ ] Output Directory 设置为 `dist/h5`
- [ ] Install Command 设置为 `npm install --legacy-peer-deps`

### 环境变量配置

- [ ] `PROJECT_DOMAIN` 已填入（后端 API 域名）
- [ ] `SUPABASE_URL` 已填入
- [ ] `SUPABASE_ANON_KEY` 已填入

### 部署状态

- [ ] 项目已成功部署
- [ ] 构建日志无错误
- [ ] 前端页面正常加载

### 功能验证

- [ ] 前端域名可以正常访问
- [ ] 页面样式正常
- [ ] 登录功能正常
- [ ] API 请求成功
- [ ] 无 CORS 错误

---

## 📱 小程序部署（可选）

### 小程序配置

- [ ] 小程序 AppID 已配置
- [ ] 小程序名称已设置
- [ ] 小程序描述已设置

### 服务器域名配置

- [ ] request 合法域名已配置
- [ ] uploadFile 合法域名已配置
- [ ] downloadFile 合法域名已配置

### 代码构建

- [ ] `npm run build:weapp` 已执行
- [ ] `dist/weapp` 目录已生成

### 小程序上传

- [ ] 代码已上传到微信开发者工具
- [ ] 小程序已提交审核
- [ ] 小程序已发布

---

## 🔄 环境变量配置

### 本地开发

- [ ] `.env` 文件已创建
- [ ] 环境变量已正确配置
- [ ] `.env` 文件已加入 `.gitignore`

### 生产环境

- [ ] Vercel 环境变量已配置
- [ ] Render 环境变量已配置
- [ ] 所有必需的变量都已填入
- [ ] 敏感信息已保密

---

## ✅ 功能验证

### 用户功能

- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 智能诊疗功能正常
- [ ] 病历保存功能正常
- [ ] 充值功能正常

### 管理员功能

- [ ] 管理员登录功能正常
- [ ] 订单审核功能正常
- [ ] 用户管理功能正常
- [ ] 数据统计功能正常

### 通知功能

- [ ] 提示音功能正常
- [ ] 页面标题闪烁正常
- [ ] 定时轮询正常

---

## 📊 性能与监控

### 后端监控

- [ ] Render 监控已启用
- [ ] CPU 使用率正常
- [ ] 内存使用率正常
- [ ] 网络流量正常

### 前端监控

- [ ] Vercel Analytics 已启用（可选）
- [ ] 页面加载速度正常
- [ ] 无 JavaScript 错误

### 数据库监控

- [ ] Supabase 监控已启用
- [ ] 数据库连接数正常
- [ ] 查询性能正常

---

## 🔒 安全检查

### 敏感信息保护

- [ ] `SUPABASE_SERVICE_ROLE_KEY` 已保密
- [ ] `JWT_SECRET` 已保密
- [ ] 数据库密码已保存
- [ ] `.env` 文件未上传到 GitHub

### CORS 配置

- [ ] 后端 CORS 已配置
- [ ] 前端域名已加入白名单
- [ ] 无 CORS 错误

### 权限控制

- [ ] 管理员接口有权限检查
- [ ] 普通用户权限受限
- [ ] API 接口有认证保护

---

## 📚 文档与备份

### 文档完善

- [ ] 部署文档已更新
- [ ] API 文档已更新
- [ ] 用户手册已更新
- [ ] 故障排查文档已更新

### 数据备份

- [ ] Supabase 自动备份已启用
- [ ] 重要数据已导出备份
- [ ] 备份策略已制定

---

## 🎉 部署完成

### 最终检查

- [ ] 所有检查项已完成
- [ ] 所有功能已验证
- [ ] 所有安全措施已实施
- [ ] 所有监控已启用

### 访问地址确认

- [ ] 前端 H5 域名：`https://your-app.vercel.app`
- [ ] 后端 API 域名：`https://your-api.onrender.com`
- [ ] 小程序 AppID：`wxXXXXXXXXXXXXXXXX`

### 团队通知

- [ ] 开发团队已通知
- [ ] 测试团队已通知
- [ ] 运维团队已通知
- [ ] 用户已通知

---

## 📞 后续支持

### 监控计划

- [ ] 每日监控服务状态
- [ ] 每周查看性能报告
- [ ] 每月审查安全日志

### 更新计划

- [ ] Bug 修复计划已制定
- [ ] 功能优化计划已制定
- [ ] 安全更新计划已制定

---

**检查清单版本**：v1.0.0
**最后更新**：2024-01-01
