/**
 * 数字张仲景 - Qwen 集成模块
 */

import { Module } from '@nestjs/common';
import { QwenController } from './qwen.controller';
import { QwenIntegrationService } from './qwen.service';

@Module({
  controllers: [QwenController],
  providers: [QwenIntegrationService],
  exports: [QwenIntegrationService],
})
export class QwenIntegrationModule {}
