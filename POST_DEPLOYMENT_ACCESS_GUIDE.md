# 🌐 部署后访问指南

## 📱 快速访问

### 部署成功后，你会得到一个 Vercel 地址：

```
https://your-project-name.vercel.app
```

### 主要访问地址

#### 1. 首页（智能诊疗入口）

```
https://your-project-name.vercel.app
```

**访问方式**：
- 电脑浏览器：直接输入地址
- 手机浏览器：直接输入地址

---

#### 2. 下载页面（APP 下载）

```
https://your-project-name.vercel.app/pages/download/index
```

**访问方式**：
- 电脑浏览器：直接输入地址
- 手机浏览器：直接输入地址
- 二维码扫描：生成二维码后扫描

---

## 📲 手机访问详细步骤

### 方案 A：直接访问（推荐）

#### 步骤 1：复制链接

复制你的部署地址：
```
https://your-project-name.vercel.app/pages/download/index
```

#### 步骤 2：发送到手机

**方法 1：微信发送**
- 在电脑上打开微信
- 发送链接到"文件传输助手"
- 在手机上打开微信，点击链接

**方法 2：二维码**
- 使用在线二维码生成器（如：https://cli.im/）
- 粘贴链接，生成二维码
- 手机扫描二维码

**方法 3：直接输入**
- 打开手机浏览器
- 手动输入链接

#### 步骤 3：添加到主屏幕（获得 APP 体验）

**iPhone（Safari）**：
1. 打开链接
2. 点击底部的"分享"按钮（向上箭头）
3. 向下滚动，点击"添加到主屏幕"
4. 点击右上角"添加"
5. 回到主屏幕，你会看到新的 APP 图标

**Android（Chrome）**：
1. 打开链接
2. 点击右上角菜单（三个点）
3. 点击"添加到主屏幕"
4. 点击"添加"
5. 回到主屏幕，你会看到新的 APP 图标

---

### 方案 B：扫码访问（最便捷）

#### 步骤 1：生成二维码

访问：https://cli.im/url

输入你的部署地址，生成二维码。

#### 步骤 2：打印二维码

- 打印二维码（A4 纸）
- 粘贴在诊所、药店、宣传材料上
- 患者扫码即可访问

---

### 方案 C：嵌入微信小程序（如果有）

如果项目已编译为微信小程序，可以在小程序中嵌入 H5 页面：

```javascript
// 在小程序中使用 web-view 组件
<web-view src="https://your-project-name.vercel.app/pages/download/index"></web-view>
```

---

## 🖥️ 电脑访问

### 直接访问

在浏览器中输入地址：
```
https://your-project-name.vercel.app
```

### 添加书签

1. 打开链接
2. 按 Ctrl + D（Windows）或 Cmd + D（Mac）
3. 选择书签文件夹
4. 点击"添加"

### 固定到任务栏

**Windows**：
1. 在浏览器中打开链接
2. 点击地址栏右侧的"固定到任务栏"图标

**Mac**：
1. 在浏览器中打开链接
2. 点击"文件" → "为特定网站创建应用程序"
3. 应用会出现在 Launchpad 中

---

## 🔗 分享链接

### 给患者的链接

```
https://your-project-name.vercel.app/pages/download/index
```

**说明**：
- 可以直接发送给患者
- 可以嵌入到宣传材料中
- 可以生成二维码

---

## 📊 自定义域名（可选）

### 为什么使用自定义域名？

1. **更专业**：`tcm.yourclinic.com` 比 `your-project-name.vercel.app` 更专业
2. **更容易记忆**：短域名更容易记住
3. **品牌识别**：使用自己的品牌名

### 如何配置自定义域名？

#### 步骤 1：购买域名

推荐平台：
- 阿里云：https://wanwang.aliyun.com/
- 腾讯云：https://dnspod.cloud.tencent.com/
- Namecheap：https://www.namecheap.com/
- GoDaddy：https://godaddy.com

#### 步骤 2：在 Vercel 添加域名

1. 访问 Vercel 控制台：https://vercel.com/dashboard
2. 找到你的项目
3. 点击"Settings"
4. 点击"Domains"
5. 输入你的域名，如：`tcm.yourclinic.com`
6. 点击"Add"

#### 步骤 3：配置 DNS

Vercel 会显示需要添加的 DNS 记录：

```
Type: CNAME
Name: tcm
Value: cname.vercel-dns.com
```

在域名注册商处添加此记录。

#### 步骤 4：等待 DNS 生效

DNS 生效通常需要：
- 最快：10 分钟
- 通常：1-2 小时
- 最慢：24 小时

#### 步骤 5：配置 HTTPS

Vercel 会自动配置 HTTPS 证书：
- 通常几分钟内完成
- 无需手动操作
- 自动续期

#### 步骤 6：测试访问

访问你的自定义域名：
```
https://tcm.yourclinic.com
```

---

## 🚀 性能优化建议

### 1. 使用 CDN（Vercel 已自动配置）

Vercel 默认使用全球 CDN，无需额外配置。

### 2. 启用图片优化

Vercel 自动优化图片：
- 自动转换为 WebP 格式
- 自动调整尺寸
- 自动压缩

### 3. 配置缓存策略

已在 `vercel.json` 中配置：
- 静态资源自动缓存
- API 请求合理缓存

### 4. 启用压缩

Vercel 自动启用：
- Gzip 压缩
- Brotli 压缩

---

## 📈 监控访问数据

### 使用 Vercel Analytics

#### 启用 Analytics

1. 访问 Vercel 控制台
2. 找到你的项目
3. 点击"Analytics"
4. 点击"Enable Analytics"

#### 查看数据

可以查看：
- 页面访问量（PV）
- 独立访客数（UV）
- 访问来源
- 用户设备
- 地理位置
- 性能指标

### 使用 Google Analytics（可选）

#### 步骤 1：创建 Google Analytics 账号

访问：https://analytics.google.com/

#### 步骤 2：创建媒体资源

1. 点击"管理"
2. 点击"创建媒体资源"
3. 输入网站信息
4. 获取跟踪 ID（UA-XXXXXXXXX-X）

#### 步骤 3：添加到项目

在 `src/app.tsx` 中添加：

```typescript
// 在应用启动时加载 Google Analytics
useEffect(() => {
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXXXX-X`
  script.async = true
  document.body.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', 'UA-XXXXXXXXX-X')
}, [])
```

---

## 🔐 安全配置

### 1. 启用 HTTPS（Vercel 已自动配置）

Vercel 自动为所有网站配置 HTTPS：
- 免费 SSL 证书
- 自动续期
- 强制 HTTPS 跳转

### 2. 配置安全头

已在 `vercel.json` 中配置：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. 环境变量管理

敏感信息使用环境变量：

1. 在 Vercel 控制台添加环境变量
2. 不要在代码中直接写入敏感信息
3. 使用 `.env.local` 进行本地开发

---

## 🎯 常见问题

### Q1: 为什么访问地址不对？

**A**: 检查以下几点：

1. **确认部署成功**
   - 访问 Vercel 控制台
   - 检查部署状态是否为 "Ready"

2. **确认输出目录**
   - 应该是 `dist/h5`
   - 检查 `vercel.json` 配置

3. **确认路由配置**
   - 检查 `vercel.json` 中的 `rewrites` 配置

---

### Q2: 手机访问时样式错乱？

**A**: 检查以下几点：

1. **检查 viewport 设置**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. **检查响应式布局**
   - 使用 Tailwind 的响应式类
   - 测试不同屏幕尺寸

3. **检查跨端兼容性**
   - 参考 `H5_MOBILE_ACCESS.md`
   - 检查 Input、Flex、Fixed 等组件

---

### Q3: 如何测试本地修改？

**A**: 使用 Vercel 预览部署：

1. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "test: 添加新功能"
   git push origin main
   ```

2. **自动生成预览部署**
   - Vercel 会自动为每次提交生成预览部署
   - 访问预览地址测试

3. **确认无误后合并到生产环境**
   - 点击"Promote to Production"
   - 部署到生产环境

---

### Q4: 如何回滚到上一个版本？

**A**: 使用 Vercel 控制台：

1. 访问 Vercel 控制台
2. 找到你的项目
3. 点击"Deployments"
4. 找到要回滚的版本
5. 点击右上角菜单（三个点）
6. 点击"Promote to Production"

---

### Q5: 如何配置自定义域名？

**A**: 参考"自定义域名"章节：
1. 购买域名
2. 在 Vercel 添加域名
3. 配置 DNS 记录
4. 等待 DNS 生效

---

## 🎉 完成部署

### 部署成功检查清单

- [x] Vercel 部署成功（状态为 "Ready"）
- [x] 可以访问公网地址
- [x] 页面正常显示
- [x] 手机可以访问
- [x] 可以添加到主屏幕（获得 APP 体验）
- [x] HTTPS 已启用
- [x] 安全头已配置

---

## 📞 需要帮助？

### Vercel 文档
- 官方文档：https://vercel.com/docs
- 部署指南：https://vercel.com/docs/deployments/overview

### 联系 Vercel 支持
- 帮助中心：https://vercel.com/help
- 社区论坛：https://vercel.com/forum

---

**恭喜！你的网站已成功部署！🎉**

**立即访问：https://your-project-name.vercel.app**
