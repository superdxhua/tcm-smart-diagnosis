# GitHub 网页编辑器错误解决方案

## ❌ 错误原因

**"File could not be edited" 错误可能是因为：**
1. GitHub 网页编辑器对某些文件类型（如 TypeScript）有限制
2. 文件过大或包含特殊字符
3. 仓库权限问题

---

## ✅ 解决方案 1：使用 Git 命令行（推荐）

### 步骤 1：克隆仓库

在本地打开终端（Terminal 或 PowerShell）：

```bash
git clone https://github.com/superdxhua/tcm-smart-diagnosis.git
cd tcm-smart-diagnosis
```

### 步骤 2：创建修改脚本

创建一个 `update-vercel.sh` 文件（Mac/Linux）或 `update-vercel.bat` 文件（Windows）：

**Mac/Linux 用户：**

```bash
cat > update-vercel.sh << 'EOF'
#!/bin/bash

# 更新 vercel.json
cat > vercel.json << 'JSONEOF'
{
  "version": 2,
  "name": "tcm-smart-diagnosis-frontend",
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "npm install --legacy-peer-deps && cd server && npm install --legacy-peer-deps && npm run build",
  "framework": null,
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
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/api/index.ts"
    },
    {
      "source": "/",
      "destination": "/index.html"
    },
    {
      "source": "/pages/(.*)",
      "destination": "/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
JSONEOF

# 更新 server/src/app.module.ts
cat > server/src/app.module.ts << 'TSEOF'
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';

// 只在本地开发时加载 .env 文件，生产环境使用 Vercel 环境变量
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import { TcmModule } from './tcm/tcm.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { LLMModule } from './llm/llm.module';
import { PaymentModule } from './payment/payment.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { PatientsModule } from './patients/patients.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { MedicationFeedbackModule } from './medication-feedback/medication-feedback.module';
import { PrescriptionAdjustmentsModule } from './prescription-adjustments/prescription-adjustments.module';
import { AccountModule } from './account/account.module';
import { VersionModule } from './version/version.module';
import { FeedbackModule } from './feedback/feedback.module';
import { MedicalAiModule } from './medical-ai/medical-ai.module';
import { AdminModule } from './admin/admin.module';
import { PackagesModule } from './packages/packages.module';
import { MedicalCasesModule } from './medical-cases/medical-cases.module';

@Module({
  imports: [
    TcmModule,
    AuthModule,
    UploadModule,
    LLMModule,
    PaymentModule,
    QrcodeModule,
    PatientsModule,
    MedicalRecordsModule,
    MedicationFeedbackModule,
    PrescriptionAdjustmentsModule,
    AccountModule,
    VersionModule,
    FeedbackModule,
    MedicalAiModule,
    AdminModule,
    PackagesModule,
    MedicalCasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
TSEOF

echo "文件已更新"

# 提交修改
git add vercel.json server/src/app.module.ts
git commit -m "fix: 添加后端构建命令并移除生产环境 .env 文件加载"
git push origin main

echo "已成功推送到 GitHub"
EOF

chmod +x update-vercel.sh
./update-vercel.sh
```

**Windows 用户：**

创建 `update-vercel.bat` 文件：

```batch
@echo off
echo 正在更新 vercel.json...

(
echo {
echo   "version": 2,
echo   "name": "tcm-smart-diagnosis-frontend",
echo   "buildCommand": "npm run build:web",
echo   "outputDirectory": "dist-web",
echo   "installCommand": "npm install --legacy-peer-deps ^&^& cd server ^&^& npm install --legacy-peer-deps ^&^& npm run build",
echo   "framework": null,
echo   "headers": [
echo     {
echo       "source": "/(.^*)",
echo       "headers": [
echo         {
echo           "key": "X-Content-Type-Options",
echo           "value": "nosniff"
echo         },
echo         {
echo           "key": "X-Frame-Options",
echo           "value": "DENY"
echo         },
echo         {
echo           "key": "X-XSS-Protection",
echo           "value": "1; mode=block"
echo         },
echo         {
echo           "key": "Referrer-Policy",
echo           "value": "strict-origin-when-cross-origin"
echo         },
echo         {
echo           "key": "Access-Control-Allow-Origin",
echo           "value": "*"
echo         }
echo       ]
echo     }
echo   ],
echo   "rewrites": [
echo     {
echo       "source": "/api/(.^*)",
echo       "destination": "/server/api/index.ts"
echo     },
echo     {
echo       "source": "/",
echo       "destination": "/index.html"
echo     },
echo     {
echo       "source": "/pages/(.^*)",
echo       "destination": "/index.html"
echo     },
echo     {
echo       "source": "/(.^*)",
echo       "destination": "/index.html"
echo     }
echo   ]
echo }
) > vercel.json

echo 正在更新 server/src/app.module.ts...

(
echo import { Module } from '@nestjs/common';
echo import { AppController } from './app.controller';
echo import { AppService } from './app.service';
echo import * as dotenv from 'dotenv';
echo.
echo // 只在本地开发时加载 .env 文件，生产环境使用 Vercel 环境变量
echo if (process.env.NODE_ENV !== 'production') {
echo   dotenv.config();
echo }
echo.
echo import { TcmModule } from './tcm/tcm.module';
echo import { AuthModule } from './auth/auth.module';
echo import { UploadModule } from './upload/upload.module';
echo import { LLMModule } from './llm/llm.module';
echo import { PaymentModule } from './payment/payment.module';
echo import { QrcodeModule } from './qrcode/qrcode.module';
echo import { PatientsModule } from './patients/patients.module';
echo import { MedicalRecordsModule } from './medical-records/medical-records.module';
echo import { MedicationFeedbackModule } from './medication-feedback/medication-feedback.module';
echo import { PrescriptionAdjustmentsModule } from './prescription-adjustments/prescription-adjustments.module';
echo import { AccountModule } from './account/account.module';
echo import { VersionModule } from './version/version.module';
echo import { FeedbackModule } from './feedback/feedback.module';
echo import { MedicalAiModule } from './medical-ai/medical-ai.module';
echo import { AdminModule } from './admin/admin.module';
echo import { PackagesModule } from './packages/packages.module';
echo import { MedicalCasesModule } from './medical-cases/medical-cases.module';
echo.
echo @Module({
echo   imports: [
echo     TcmModule,
echo     AuthModule,
echo     UploadModule,
echo     LLMModule,
echo     PaymentModule,
echo     QrcodeModule,
echo     PatientsModule,
echo     MedicalRecordsModule,
echo     MedicationFeedbackModule,
echo     PrescriptionAdjustmentsModule,
echo     AccountModule,
echo     VersionModule,
echo     FeedbackModule,
echo     MedicalAiModule,
echo     AdminModule,
echo     PackagesModule,
echo     MedicalCasesModule,
echo   ],
echo   controllers: [AppController],
echo   providers: [AppService],
echo })
echo export class AppModule {}
) > server\src\app.module.ts

echo 文件已更新

git add vercel.json server/src/app.module.ts
git commit -m "fix: 添加后端构建命令并移除生产环境 .env 文件加载"
git push origin main

echo 已成功推送到 GitHub
pause
```

运行脚本：
```bash
update-vercel.bat
```

---

## ✅ 解决方案 2：手动复制粘贴

### 步骤 1：克隆仓库

```bash
git clone https://github.com/superdxhua/tcm-smart-diagnosis.git
cd tcm-smart-diagnosis
```

### 步骤 2：打开编辑器

使用任何文本编辑器（如 VS Code、Notepad++ 等）打开以下文件：

1. `vercel.json`
2. `server/src/app.module.ts`

### 步骤 3：复制粘贴

**更新 `vercel.json`：**

```json
{
  "version": 2,
  "name": "tcm-smart-diagnosis-frontend",
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "npm install --legacy-peer-deps && cd server && npm install --legacy-peer-deps && npm run build",
  "framework": null,
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
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/api/index.ts"
    },
    {
      "source": "/",
      "destination": "/index.html"
    },
    {
      "source": "/pages/(.*)",
      "destination": "/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**更新 `server/src/app.module.ts`：**

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';

// 只在本地开发时加载 .env 文件，生产环境使用 Vercel 环境变量
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import { TcmModule } from './tcm/tcm.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { LLMModule } from './llm/llm.module';
import { PaymentModule } from './payment/payment.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { PatientsModule } from './patients/patients.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { MedicationFeedbackModule } from './medication-feedback/medication-feedback.module';
import { PrescriptionAdjustmentsModule } from './prescription-adjustments/prescription-adjustments.module';
import { AccountModule } from './account/account.module';
import { VersionModule } from './version/version.module';
import { FeedbackModule } from './feedback/feedback.module';
import { MedicalAiModule } from './medical-ai/medical-ai.module';
import { AdminModule } from './admin/admin.module';
import { PackagesModule } from './packages/packages.module';
import { MedicalCasesModule } from './medical-cases/medical-cases.module';

@Module({
  imports: [
    TcmModule,
    AuthModule,
    UploadModule,
    LLMModule,
    PaymentModule,
    QrcodeModule,
    PatientsModule,
    MedicalRecordsModule,
    MedicationFeedbackModule,
    PrescriptionAdjustmentsModule,
    AccountModule,
    VersionModule,
    FeedbackModule,
    MedicalAiModule,
    AdminModule,
    PackagesModule,
    MedicalCasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 步骤 4：提交修改

```bash
git add vercel.json server/src/app.module.ts
git commit -m "fix: 添加后端构建命令并移除生产环境 .env 文件加载"
git push origin main
```

---

## ✅ 解决方案 3：使用 GitHub Desktop（最简单）

1. 下载并安装 GitHub Desktop：https://desktop.github.com/
2. 登录你的 GitHub 账号
3. 克隆仓库
4. 使用文本编辑器修改文件
5. 在 GitHub Desktop 中查看修改
6. 点击 "Commit to main"
7. 点击 "Push origin"

---

## 📋 提交后测试

提交成功后，等待 Vercel 自动部署（2-3 分钟），然后测试：

```
https://tcm-smart-diagnosis-git-main-superdxhuas-projects.vercel.app/api/health
```

---

## 📋 请告诉我

1. ✅ 你选择哪种解决方案？
2. ✅ 提交成功了吗？
3. ✅ Vercel 重新部署成功了吗？
4. ✅ API 能正常访问吗？
