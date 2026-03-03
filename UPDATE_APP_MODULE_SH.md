# 快速更新 server/src/app.module.ts

## 方法 1：使用 Git 命令行脚本（最快）

### 步骤 1：克隆仓库

如果你还没有克隆仓库：

```bash
git clone https://github.com/superdxhua/tcm-smart-diagnosis.git
cd tcm-smart-diagnosis
```

如果你已经克隆了，直接进入目录：

```bash
cd tcm-smart-diagnosis
```

### 步骤 2：拉取最新代码

```bash
git pull origin main
```

### 步骤 3：运行脚本

**Mac/Linux 用户：**

```bash
cat > server/src/app.module.ts << 'EOF'
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
EOF
```

**Windows 用户（PowerShell）：**

```powershell
$content = @"
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
"@

Set-Content -Path "server/src/app.module.ts" -Value $content -Encoding UTF8
```

### 步骤 4：提交修改

```bash
git add server/src/app.module.ts
git commit -m "fix: 移除生产环境中的 .env 文件加载"
git push origin main
```

---

## 方法 2：手动复制粘贴

### 步骤 1：克隆仓库（如果还没有）

```bash
git clone https://github.com/superdxhua/tcm-smart-diagnosis.git
cd tcm-smart-diagnosis
```

### 步骤 2：拉取最新代码

```bash
git pull origin main
```

### 步骤 3：打开编辑器

使用任何文本编辑器（VS Code、Notepad++ 等）打开文件：

```
server/src/app.module.ts
```

### 步骤 4：替换内容

**删除所有内容，然后粘贴以下内容：**

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

### 步骤 5：保存文件

### 步骤 6：提交修改

```bash
git add server/src/app.module.ts
git commit -m "fix: 移除生产环境中的 .env 文件加载"
git push origin main
```

---

## 提交后测试

等待 Vercel 自动部署（2-3 分钟），然后测试：

```
https://tcm-smart-diagnosis-git-main-superdxhuas-projects.vercel.app/api/health
```

**预期响应：**

```json
{
  "status": "ok",
  "message": "Service is healthy",
  "timestamp": "2024-02-22T...",
  "uptime": 123.456
}
```

---

## 请告诉我

1. ✅ 文件修改成功了吗？
2. ✅ Git 提交成功了吗？
3. ✅ Vercel 重新部署成功了吗？
4. ✅ API 能正常访问吗？
