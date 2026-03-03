import { Module } from '@nestjs/common';
import { DiseaseCategoryController } from './disease-category.controller';
import { DiseaseCategoryService } from './disease-category.service';

@Module({
  controllers: [DiseaseCategoryController],
  providers: [DiseaseCategoryService],
  exports: [DiseaseCategoryService],
})
export class DiseaseManagementModule {}
