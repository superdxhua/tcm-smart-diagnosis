import { Module } from '@nestjs/common';
import { FormulaManagementService } from './formula-management.service';
import { FormulaManagementController } from './formula-management.controller';

@Module({
  controllers: [FormulaManagementController],
  providers: [FormulaManagementService],
  exports: [FormulaManagementService],
})
export class FormulaManagementModule {}
