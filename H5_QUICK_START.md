# 🚀 H5 版本快速启动指南

## 🎯 5 分钟快速启动

### 第一步：启动开发服务器

```bash
# 进入项目目录
cd /workspace/projects

# 启动开发服务器
coze dev
```

等待启动完成，你会看到：
```
Server running on http://localhost:3000
H5 server running on http://localhost:5000
```

### 第二步：访问 H5 版本

**在电脑浏览器打开**：
- http://localhost:5000

**在手机浏览器打开**：
1. 确保手机和电脑在同一 WiFi
2. 查找电脑 IP 地址（见下方）
3. 在手机浏览器输入：`http://你的电脑IP:5000`

---

## 📱 如何让手机访问

### 查找电脑 IP 地址

#### Windows
```bash
# 打开命令提示符（CMD）
ipconfig

# 找到 "IPv4 地址"
# 例如：192.168.1.100
```

#### Mac
```bash
# 打开终端
ifconfig

# 找到 "inet" 开头的地址
# 例如：192.168.1.100
```

#### Linux
```bash
ifconfig

# 或
ip addr show
```

### 手机访问步骤

1. **连接 WiFi**
   - 确保手机和电脑连接同一个 WiFi

2. **打开手机浏览器**
   - iPhone：Safari
   - Android：Chrome 或其他浏览器

3. **输入地址**
   - 例如：`http://192.168.1.100:5000`

4. **开始使用**
   - 就像使用 APP 一样使用

---

## 🔧 常见问题

### Q1: 手机无法访问，显示"连接超时"

**原因**：防火墙阻止访问

**解决方案**：

**Windows**：
```bash
# 允许端口 5000 通过防火墙
netsh advfirewall firewall add rule name="Taro H5" dir=in action=allow protocol=TCP localport=5000
```

**Mac**：
```bash
# 系统偏好设置 → 安全性与隐私 → 防火墙 → 防火墙选项
# 添加允许 Node.js 的入站连接
```

**Linux**：
```bash
# 允许端口 5000
sudo ufw allow 5000
```

### Q2: 手机访问很慢

**原因**：网络速度慢或电脑性能不足

**解决方案**：
1. 确保 WiFi 信号强
2. 关闭电脑上其他占用网络的程序
3. 重启开发服务器：`Ctrl+C` 然后 `coze dev`

### Q3: 页面显示不正常

**原因**：浏览器兼容性问题

**解决方案**：
1. 清除浏览器缓存
2. 使用最新版浏览器（Chrome、Safari）
3. 或在电脑上测试，确认是否正常

### Q4: 后端接口失败

**原因**：手机无法访问 `localhost:3000`

**解决方案**：
1. 修改 `.env.local` 文件，设置真实的后端地址
2. 或使用云端部署方案（见下方）

---

## ☁️ 云端部署方案

### 方案 1：部署到 Vercel（推荐，免费）

#### 优点
- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 自动部署

#### 部署步骤

**第一步：注册 Vercel**
1. 访问：https://vercel.com/
2. 点击 "Sign Up"
3. 使用 GitHub 账号注册

**第二步：导入项目**
1. 登录 Vercel 后，点击 "Add New" → "Project"
2. 点击 "Import" 导入你的 GitHub 仓库

**第三步：配置项目**

**Framework Preset**：选择 "Other"

**Build Command**：
```bash
pnpm install && pnpm build:web
```

**Output Directory**：
```
dist/h5
```

**Environment Variables**：
```
PROJECT_DOMAIN=你的后端服务器地址
# 例如：PROJECT_DOMAIN=https://your-api.com
```

**第四步：部署**
1. 点击 "Deploy"
2. 等待 1-2 分钟
3. 部署成功后，会得到一个 URL：
   ```
   https://your-project.vercel.app
   ```

**第五步：访问**
- 电脑访问：https://your-project.vercel.app
- 手机访问：直接输入该地址

---

### 方案 2：部署到自己的服务器

#### 优点
- ✅ 完全控制
- ✅ 自定义域名
- ✅ 数据安全

#### 部署步骤

**第一步：构建 H5**
```bash
# 构建生产版本
pnpm build:web

# 文件会在 dist/h5 目录
```

**第二步：上传到服务器**

**使用 SCP 上传**：
```bash
scp -r dist/h5/* user@your-server.com:/var/www/html/
```

**使用 FTP 上传**：
- 使用 FileZilla 或其他 FTP 工具
- 上传 `dist/h5` 目录的所有文件到服务器的 `/var/www/html/`

**第三步：配置 Nginx**

创建 Nginx 配置文件 `/etc/nginx/sites-available/tcm-h5`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /var/www/html;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**启用配置**：
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/tcm-h5 /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

**第四步：配置 HTTPS（推荐）**

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 自动配置 HTTPS
sudo certbot --nginx -d your-domain.com

# 根据提示操作
```

**第五步：访问**
- HTTP：http://your-domain.com
- HTTPS：https://your-domain.com（自动跳转）

---

### 方案 3：部署到 Netlify（免费）

#### 优点
- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 拖拽部署
- ✅ 表单处理

#### 部署步骤

**第一步：构建 H5**
```bash
pnpm build:web
```

**第二步：注册 Netlify**
1. 访问：https://www.netlify.com/
2. 注册账号

**第三步：拖拽部署**
1. 登录 Netlify
2. 将 `dist/h5` 目录拖拽到 Netlify 网页
3. 等待上传和部署完成
4. 获得一个随机 URL，如 `https://random-name.netlify.app`

**第四步：配置域名（可选）**
1. 点击 "Site settings"
2. 点击 "Change site name"
3. 输入你想要的域名

**第五步：配置环境变量（可选）**
1. 点击 "Site settings"
2. 点击 "Environment variables"
3. 添加环境变量

---

## 📊 部署方案对比

| 方案 | 难度 | 费用 | 时间 | 推荐度 |
|------|------|------|------|--------|
| 本地开发 | ⭐ | 免费 | 0 分钟 | ⭐⭐⭐⭐ |
| Vercel | ⭐⭐ | 免费 | 5-10 分钟 | ⭐⭐⭐⭐⭐ |
| 自己的服务器 | ⭐⭐⭐⭐ | 需要服务器费用 | 20-30 分钟 | ⭐⭐⭐ |
| Netlify | ⭐⭐ | 免费 | 5 分钟 | ⭐⭐⭐⭐⭐ |

---

## 🎨 优化建议

### 1. 性能优化

**启用缓存**：
- 在 Nginx 配置中添加静态资源缓存
- 使用 CDN 加速

**压缩资源**：
- 启用 gzip 压缩
- 使用 WebP 格式图片

**懒加载**：
- 图片懒加载
- 路由懒加载

### 2. SEO 优化

**添加 Meta 标签**：
```html
<meta name="description" content="中医智能诊疗 - AI 问诊系统">
<meta name="keywords" content="中医,问诊,AI,诊疗">
```

**添加 Open Graph 标签**：
```html
<meta property="og:title" content="中医智能诊疗">
<meta property="og:description" content="AI 驱动的中医智能问诊系统">
<meta property="og:image" content="https://your-domain.com/og-image.png">
```

### 3. 用户体验优化

**添加 Loading 动画**：
- 首屏加载时显示 Loading
- 页面切换时显示过渡动画

**添加错误提示**：
- 网络错误提示
- 操作失败提示

**离线支持（PWA）**：
- 添加 Service Worker
- 支持离线访问

---

## 📱 手机端优化

### 1. 适配不同屏幕

项目已使用 Taro 框架，自动适配不同屏幕。

### 2. 触摸优化

- 按钮尺寸至少 44x44 像素
- 增大点击区域
- 避免误触

### 3. 输入优化

- 使用合适的 input 类型
- 自动弹出对应键盘
- 禁止缩放

```css
input {
  font-size: 16px; /* 防止 iOS 自动缩放 */
}
```

### 4. 添加到主屏幕

提供"添加到主屏幕"提示，让用户获得类似原生 APP 的体验。

---

## 📞 下一步

1. **测试功能**：在手机上测试所有功能
2. **收集反馈**：让用户体验并收集建议
3. **优化性能**：根据反馈优化加载速度
4. **考虑 APP**：如果用户强烈需要 APP，再考虑构建

---

## 🎉 总结

**H5 版本的优点**：
- ✅ 立即可用
- ✅ 跨平台
- ✅ 易于更新
- ✅ 无需审核
- ✅ 成本低

**推荐流程**：
1. 立即使用本地开发服务器测试
2. 部署到 Vercel 或 Netlify
3. 收集用户反馈
4. 根据需求决定是否需要 APP

---

**最后更新**：2026年2月
**版本**：1.0.0
