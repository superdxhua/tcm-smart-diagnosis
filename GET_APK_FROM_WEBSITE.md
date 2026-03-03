# 如何从官网获取 APK 文件

## 当前状态

项目已经添加了 APK 下载功能，但目前 **APK 文件还未生成**。

## 步骤 1：生成 APK 文件

你需要先在本地或 CI/CD 环境中生成 APK 文件：

### 前提条件
- 安装 JDK 8+
- 安装 Android SDK（API Level 33+）
- 安装 Node.js 18+
- 安装 Gradle

### 构建步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 构建 H5 版本
pnpm build:web

# 3. 同步到 Android 项目
pnpm app:sync

# 4. 打开 Android Studio
pnpm app:open

# 5. 在 Android Studio 中构建 APK
# Build → Build Bundle(s) / APK(s) → Build APK(s)

# 6. 复制 APK 文件到 downloads 目录
# 找到构建的 APK 文件（通常在 android/app/build/outputs/apk/debug/app-debug.apk）
# 复制到项目根目录的 downloads 文件夹中
cp android/app/build/outputs/apk/debug/app-debug.apk downloads/
```

## 步骤 2：启用下载功能

将 APK 文件放到 `downloads` 目录后，下载功能就自动可用了。

### 验证 APK 是否可用

访问：`http://localhost:3000/api/download/status`

响应示例：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "available": true,
    "message": "APK 文件可下载",
    "version": "1.0.0",
    "size": 15728640,
    "uploadTime": "2026-02-20T10:30:00.000Z"
  }
}
```

## 步骤 3：访问下载页面

启动开发服务器：
```bash
coze dev
```

然后访问：
- **前端页面**：http://localhost:5000/pages/download/index
- **下载接口**：http://localhost:3000/api/download/apk

## 步骤 4：用户下载

用户可以在下载页面：
1. 查看 APK 文件状态
2. 下载 APK 文件（如果可用）
3. 查看安装指南

## 快速命令

```bash
# 完整的构建和部署流程
pnpm install
pnpm build:web
pnpm app:sync
# 打开 Android Studio 构建 APK
# 复制 APK 到 downloads 目录
cp android/app/build/outputs/apk/debug/app-debug.apk downloads/
# 重启服务器
coze dev
```

## 注意事项

1. **APK 文件位置**：必须放在项目根目录的 `downloads` 文件夹中
2. **文件名**：必须是 `app-debug.apk` 或 `app-release.apk`
3. **热更新**：添加 APK 文件后，需要重启服务器才能生效
4. **文件大小**：APK 文件通常为 15-20MB

## 替代方案

如果无法生成 APK 文件，用户可以通过以下方式获取：
- 联系开发人员：support@example.com
- 联系客服：400-xxx-xxxx

## 生产环境部署

在生产环境中，建议：

1. **使用对象存储**：将 APK 上传到对象存储（如 AWS S3、阿里云 OSS）
2. **使用 CDN**：通过 CDN 分发 APK 文件，提高下载速度
3. **版本管理**：保留多个版本，用户可选择下载
4. **下载统计**：记录下载次数和下载用户信息

示例对象存储配置：
```typescript
// server/src/download/download.service.ts
import { Injectable } from '@nestjs/common';
import { Storage } from '@coze/sdk';

@Injectable()
export class DownloadService {
  constructor(private storage: Storage) {}

  async uploadApk(file: Buffer) {
    return await this.storage.upload({
      buffer: file,
      filename: 'app-debug.apk',
      mimetype: 'application/vnd.android.package-archive'
    });
  }

  async getApkUrl() {
    return await this.storage.getPublicUrl('app-debug.apk');
  }
}
```

## 常见问题

### Q1: 下载接口返回 404
**A**: APK 文件未放置到 `downloads` 目录，或者文件名不正确。

### Q2: 下载后文件损坏
**A**: 检查 APK 文件是否完整，重新生成并上传。

### Q3: 无法在 H5 环境下载
**A**: 确保 H5 环境的网络请求配置正确，检查跨域设置。

### Q4: 如何提供多个版本？
**A**: 修改下载控制器，支持版本号参数，返回对应版本的 APK 文件。

---

**文档更新日期**：2026年2月
**版本**：1.0.0
