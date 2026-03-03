import { Module } from '@nestjs/common';
import { InquiryIntegrationController } from './inquiry-integration.controller';
import { InquiryIntegrationService } from './inquiry-integration.service';
import { AiInquiryModule } from '../ai-inquiry/ai-inquiry.module';
import { QwenServicesModule } from '../qwen-services/qwen-services.module';

@Module({
  imports: [AiInquiryModule, QwenServicesModule],
  controllers: [InquiryIntegrationController],
  providers: [InquiryIntegrationService],
  exports: [InquiryIntegrationService],
})
export class InquiryIntegrationModule {}
