import { Module } from '@nestjs/common';
import { AiTcmController } from './ai-tcm.controller';
import { AiTcmService } from './ai-tcm.service';
import { LLMModule } from '../llm/llm.module'; // 引入 LLMModule

@Module({
  imports: [LLMModule], // 导入 LLMModule
  controllers: [AiTcmController],
  providers: [AiTcmService],
})
export class AiTcmModule {}
