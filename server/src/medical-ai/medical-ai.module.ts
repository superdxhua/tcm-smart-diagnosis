import { Module } from '@nestjs/common';
import { MedicalAiController } from './medical-ai.controller';
import { TcmController } from './tcm.controller';
import { MedicalAiService } from './medical-ai.service';

@Module({
  controllers: [MedicalAiController, TcmController],
  providers: [MedicalAiService],
  exports: [MedicalAiService],
})
export class MedicalAiModule {}
