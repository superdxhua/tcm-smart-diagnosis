import { Module } from '@nestjs/common';
import { MedicalCasesController } from './medical-cases.controller';
import { MedicalCasesService } from './medical-cases.service';
import { LLMModule } from '../llm/llm.module';

@Module({
  imports: [LLMModule],
  controllers: [MedicalCasesController],
  providers: [MedicalCasesService],
  exports: [MedicalCasesService],
})
export class MedicalCasesModule {}
