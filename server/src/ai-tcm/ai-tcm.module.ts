import { Module } from '@nestjs/common';
import { AiTcmController } from './ai-tcm.controller';
import { AiTcmService } from './ai-tcm.service';

@Module({
  controllers: [AiTcmController],
  providers: [AiTcmService],
})
export class AiTcmModule {}
