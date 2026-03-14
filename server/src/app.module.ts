import { AiTcmModule } from './ai-tcm/ai-tcm.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; // 1. 引入 ConfigModule
import * as dotenv from 'dotenv';

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
    // 2. 配置 ConfigModule 为全局模块，确保 process.env 可用
    ConfigModule.forRoot({
      isGlobal: true, 
      ignoreEnvFile: process.env.NODE_ENV === 'production', // 生产环境忽略 .env 文件，直接读取系统环境变量
    }),
    
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
    AiTcmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}