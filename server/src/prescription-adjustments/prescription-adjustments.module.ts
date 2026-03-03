import { Module } from '@nestjs/common'
import { PrescriptionAdjustmentsController } from './prescription-adjustments.controller'
import { PrescriptionAdjustmentsService } from './prescription-adjustments.service'

@Module({
  controllers: [PrescriptionAdjustmentsController],
  providers: [PrescriptionAdjustmentsService],
  exports: [PrescriptionAdjustmentsService]
})
export class PrescriptionAdjustmentsModule {}
