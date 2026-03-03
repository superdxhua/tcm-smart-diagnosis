import { Module } from '@nestjs/common';
import { MedicalAiController } from './medical-ai.controller';
import { MedicalAiService } from './medical-ai.service';

@Module({
  controllers: [MedicalAiController],
  providers: [MedicalAiService],
  exports: [MedicalAiService],
})
export class MedicalAiModule {}
