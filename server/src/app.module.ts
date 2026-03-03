import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';

// 仅在非生产环境加载本地 .env 文件
// 生产环境（Vercel）的环境变量从 Vercel Dashboard 中读取
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '/workspace/projects/.env', override: true });
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
import { FormulaManagementModule } from './formula-management/formula-management.module';
import { FormulaIntelligenceModule } from './formula-intelligence/formula-intelligence.module';
import { AiInquiryModule } from './ai-inquiry/ai-inquiry.module';
import { InquiryIntegrationModule } from './inquiry-integration/inquiry-integration.module';
import { DiseaseManagementModule } from './disease-management/disease-management.module';
import { DebugModule } from './debug/debug.module';

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
    FormulaManagementModule,
    FormulaIntelligenceModule,
    AiInquiryModule,
    InquiryIntegrationModule,
    DiseaseManagementModule,
    DebugModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
