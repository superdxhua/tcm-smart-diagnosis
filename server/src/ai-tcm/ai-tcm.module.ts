import { Module } from '@nestjs/common';
import { AiTcmController } from './ai-tcm.controller';
import { AiTcmService } from './ai-tcm.service';
import { MedicalAiModule } from '../medical-ai/medical-ai.module'; // 引入 MedicalAiModule

@Module({
  imports: [MedicalAiModule], // 导入 MedicalAiModule
  controllers: [AiTcmController],
  providers: [AiTcmService],
})
export class AiTcmModule {}
