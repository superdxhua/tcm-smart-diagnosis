import { Module } from '@nestjs/common';
import { AiTcmController } from './ai-tcm.controller';
import { AiTcmService } from './ai-tcm.service';
import { MedicalAiModule } from '../medical-ai/medical-ai.module'; // 引入已修复的 MedicalAiModule

@Module({
  imports: [MedicalAiModule], // 关键：导入 MedicalAiModule，这样就能用里面的 Service 了
  controllers: [AiTcmController],
  providers: [AiTcmService],
})
export class AiTcmModule {}