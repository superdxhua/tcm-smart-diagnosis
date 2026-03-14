import { Module } from '@nestjs/common';
import { AiTcmController } from './ai-tcm.controller';
import { AiTcmService } from './ai-tcm.service';
import { MedicalAiModule } from '../medical-ai/medical-ai.module'; // 确保引入 MedicalAiModule

@Module({
  imports: [MedicalAiModule], // 依赖 MedicalAiModule
  controllers: [AiTcmController],
  providers: [AiTcmService],
})
export class AiTcmModule {}