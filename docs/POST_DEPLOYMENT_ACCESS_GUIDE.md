# 部署后访问指南

## 🎉 部署成功！

恭喜您的中医智能诊疗小程序已成功部署！

## 📱 访问方式

### 方式 1：Vercel 预览地址（默认）

**Production 环境**：
```
https://tcm-smart-diagnosis.vercel.app
```

**Preview 环境**（开发分支）：
```
https://tcm-smart-diagnosis-git-branch-name.vercel.app
```

### 方式 2：自定义域名（推荐）

如果您配置了自定义域名：
```
https://your-domain.com
```

### 方式 3：本地预览

如果您还在开发中：
```
http://localhost:5000
```

## 🔧 首次配置

### 1. 注册新用户

访问部署地址后，选择以下方式之一注册：

#### 扫码注册（推荐）

1. 点击"扫码注册"
2. 使用微信/支付宝/抖音扫描二维码
3. 设置密码完成注册
4. **获得 3 天免费使用期限** ✅

#### 手机号注册

1. 点击"手机号注册"
2. 输入手机号和密码
3. 完成注册
4. **获得 3 天免费使用期限** ✅

### 2. 管理员账户（可选）

如需创建管理员账户，请联系开发团队或使用数据库脚本。

### 3. 配置后端 API

确保环境变量 `PROJECT_DOMAIN` 已正确设置：

**Vercel Dashboard** → **Settings** → **Environment Variables**：
```
PROJECT_DOMAIN=https://your-backend-domain.com
```

## 📊 功能验证

### 测试清单

- [ ] **用户注册**：成功注册新用户
- [ ] **用户登录**：使用注册的账户登录
- [ ] **智能诊疗**：创建新患者并生成处方
- [ ] **AI 问询**：测试 AI 对话功能
- [ ] **处方风控**：测试有毒药材检测
- [ ] **病历管理**：创建、查看、编辑病历
- [ ] **患者管理**：添加、查看、编辑患者信息
- [ ] **充值服务**：测试充值流程（需配置支付）

### API 测试

使用 curl 测试后端接口：

```bash
# 测试健康检查
curl https://your-backend-domain.com/api/health

# 测试登录
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

## 🌐 分享应用

### 生成二维码

使用在线工具生成二维码：
- [QR Code Generator](https://www.qrcode-generator.com/)
- [草料二维码](https://cli.im/)

### 分享链接

直接分享 Vercel 预览地址：
```
https://tcm-smart-diagnosis.vercel.app
```

### 微信小程序（如果已配置）

1. 使用微信开发者工具打开项目
2. 上传代码
3. 提交审核
4. 发布上线

## 📱 手机访问

### iOS Safari

1. 复制部署地址
2. 在 Safari 中粘贴并访问
3. 点击 **分享** → **添加到主屏幕**
4. 像原生应用一样使用

### Android Chrome

1. 复制部署地址
2. 在 Chrome 中粘贴并访问
3. 点击 **菜单** → **添加到主屏幕**
4. 像原生应用一样使用

### 微信内置浏览器

1. 将链接发送到微信
2. 在微信中点击链接
3. 在微信内置浏览器中访问

## 🔍 监控和分析

### Vercel Analytics

1. 访问 Vercel Dashboard
2. 选择项目
3. 点击 **Analytics**
4. 查看：
   - 访问量
   - 用户分布
   - 性能指标
   - 错误率

### 自定义监控

集成第三方监控工具（可选）：
- [Sentry](https://sentry.io/)
- [LogRocket](https://logrocket.com/)

## 🛠️ 故障排除

### 问题 1：页面空白

**原因**：构建失败或路由配置错误

**解决方案**：
1. 检查 Vercel 构建日志
2. 确认 `vercel.json` 配置正确
3. 清除浏览器缓存

### 问题 2：API 404 错误

**原因**：后端未部署或域名配置错误

**解决方案**：
1. 确认后端已部署并可访问
2. 检查 `PROJECT_DOMAIN` 环境变量
3. 测试后端 API 是否正常

### 问题 3：登录失败

**原因**：数据库连接问题或认证逻辑错误

**解决方案**：
1. 检查数据库连接配置
2. 查看后端日志
3. 验证用户数据是否正确

### 问题 4：AI 功能无响应

**原因**：Coze LLM 服务未配置或 API Key 无效

**解决方案**：
1. 检查 Coze API 配置
2. 验证 API Key 是否有效
3. 查看 Vercel Functions 日志

## 📈 性能优化

### 启用缓存

Vercel 自动缓存静态资源，无需额外配置。

### 图片优化

Vercel 自动优化图片，建议使用 WebP 格式。

### CDN 加速

Vercel 自动使用全球 CDN，无需配置。

## 🔒 安全建议

### 1. 启用 HTTPS

Vercel 默认启用 HTTPS，无需配置。

### 2. 配置 CORS

确保后端 API 配置正确的 CORS 头：

```typescript
res.setHeader('Access-Control-Allow-Origin', 'https://your-domain.com');
```

### 3. 环境变量保护

不要将敏感信息提交到代码仓库，使用 Vercel 环境变量。

### 4. 定期更新依赖

```bash
pnpm update
```

## 📞 联系支持

如遇问题：

1. 查看 Vercel Dashboard 日志
2. 检查 [Vercel 状态页](https://www.vercel-status.com/)
3. 查看 [GitHub Issues](https://github.com/vercel/vercel/issues)
4. 联系开发团队

## 🎉 下一步

1. ✅ 配置自定义域名
2. ✅ 启用监控和分析
3. ✅ 优化性能
4. ✅ 推广应用
5. ✅ 收集用户反馈
6. ✅ 持续迭代优化

## 📚 相关文档

- [Vercel 部署指南](./docs/VERCEL_DEPLOYMENT.md)
- [Vercel 快速开始](./VERCEL_QUICK_START.md)
- [Serverless Functions 指南](./docs/VERCEL_FUNCTIONS_GUIDE.md)
- [H5 访问配置](./H5_MOBILE_ACCESS.md)

---

**祝您使用愉快！** 🎊
