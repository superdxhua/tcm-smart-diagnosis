import { Module } from '@nestjs/common';
import { MedicalAiService } from './medical-ai.service';
import { TcmController } from './tcm.controller';

@Module({
  imports: [],
  controllers: [TcmController],
  providers: [MedicalAiService],
  exports: [MedicalAiService],
})
export class MedicalAiModule {}