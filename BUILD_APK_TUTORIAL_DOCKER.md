# 🚀 超简单 APK 构建教程（Docker 方案）

## 📋 准备工作

**你只需要安装 Docker，其他都不用装！**

### 第一步：安装 Docker

#### Windows 用户

1. **下载 Docker Desktop**
   - 访问：https://www.docker.com/products/docker-desktop/
   - 点击 "Download for Windows"
   - 下载 `Docker Desktop Installer.exe`

2. **安装 Docker**
   - 双击安装包
   - 勾选 "Use WSL 2 instead of Hyper-V"
   - 点击 "OK" 开始安装
   - 安装完成后重启电脑

3. **启动 Docker**
   - 打开 "Docker Desktop"
   - 等待启动完成（右下角图标变绿）

4. **验证安装**
   - 打开命令提示符（CMD）或 PowerShell
   - 输入：`docker --version`
   - 如果显示版本号，说明安装成功！

#### Mac 用户

1. **下载 Docker Desktop**
   - 访问：https://www.docker.com/products/docker-desktop/
   - 点击 "Download for Mac"
   - 下载 `Docker.dmg`

2. **安装 Docker**
   - 双击 `Docker.dmg`
   - 将 Docker 拖到 Applications 文件夹
   - 打开 Docker 应用
   - 等待启动完成

3. **验证安装**
   - 打开终端（Terminal）
   - 输入：`docker --version`
   - 如果显示版本号，说明安装成功！

#### Linux 用户

1. **安装 Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **启动 Docker**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **验证安装**
   ```bash
   docker --version
   ```

---

## 🔨 开始构建 APK

### 第二步：运行构建脚本

**只需一条命令！**

```bash
# 在项目根目录执行
./build-apk-with-docker.sh
```

### 第三步：等待构建完成

构建过程大约需要 **5-15 分钟**，你会看到以下输出：

```
🚀 开始构建 Android APK...
✅ Docker 已安装
📦 构建 Docker 镜像...
🔨 开始构建 APK...
📦 安装 pnpm 依赖...
🌐 构建 H5 版本...
🔄 同步到 Android 项目...
🏗️  构建 APK...
✅ APK 构建完成！
-rw-r--r-- 1 user user 15M Feb 20 10:30 app-debug.apk

🎉 APK 构建成功！
📍 APK 文件位置：downloads/app-debug.apk
📏 文件大小：15M
```

### 第四步：完成！

APK 文件已经生成在 `downloads/app-debug.apk`！

---

## 🎯 构建完成后做什么？

### 方式 1：直接发给用户

将 `downloads/app-debug.apk` 文件发送给用户：
- 通过微信/QQ 发送
- 通过网盘分享
- 通过邮件发送

### 方式 2：从官网下载

1. **重启服务器**
   ```bash
   coze dev
   ```

2. **访问下载页面**
   - http://localhost:5000/pages/download/index

3. **用户下载**
   - 用户打开下载页面
   - 点击"下载 APK 文件"
   - 自动下载到手机

---

## ❓ 常见问题

### Q1: 提示 "Docker 未安装"

**解决方案**：
- 按照"第一步：安装 Docker"的指引安装 Docker
- 安装完成后重启电脑

### Q2: 构建很慢，超过 30 分钟

**原因**：第一次构建需要下载 Android SDK 和依赖

**解决方案**：
- 耐心等待，第一次构建比较慢
- 后续构建会快很多（因为有缓存）

### Q3: 提示 "权限不足"

**解决方案**：
```bash
chmod +x build-apk-with-docker.sh
```

### Q4: 提示 "内存不足"

**原因**：Docker 默认内存不够

**解决方案**：
- Windows/Mac：打开 Docker Desktop → Settings → Resources → Memory → 调整为 4GB 或更高
- Linux：调整 Docker 守护进程配置

### Q5: 构建失败，显示错误

**解决方案**：
1. 清理 Docker 缓存：
   ```bash
   docker system prune -a
   ```
2. 重新运行构建脚本：
   ```bash
   ./build-apk-with-docker.sh
   ```

---

## 📊 构建时间参考

| 环境 | 首次构建 | 后续构建 |
|------|---------|---------|
| 慢速网络 | 15-30 分钟 | 5-10 分钟 |
| 快速网络 | 5-10 分钟 | 2-5 分钟 |
| 本地缓存 | 2-5 分钟 | 1-2 分钟 |

---

## 💡 优化建议

### 1. 使用本地缓存

构建完成后，Docker 镜像会缓存，下次构建会更快。

### 2. 增加内存

给 Docker 分配更多内存（建议 4GB 以上），可以加快构建速度。

### 3. 使用 SSD

将项目放在 SSD 硬盘上，IO 速度更快。

### 4. 并行构建

如果有多台机器，可以同时构建多个版本。

---

## 🎉 成功标志

当你看到以下内容，说明构建成功：

```
🎉 APK 构建成功！
📍 APK 文件位置：downloads/app-debug.apk
📏 文件大小：15M
```

---

## 📞 需要帮助？

如果以上方法都不行，可以：

1. **查看详细日志**
   ```bash
   ./build-apk-with-docker.sh 2>&1 | tee build.log
   ```

2. **联系技术支持**
   - 邮箱：support@example.com
   - 电话：400-xxx-xxxx

---

## 📚 参考资料

- Docker 官方文档：https://docs.docker.com/
- Android 开发者文档：https://developer.android.com/
- Taro 官方文档：https://docs.taro.zone/

---

**最后更新**：2026年2月
**版本**：1.0.0
