import { Module } from '@nestjs/common'
import { MedicationFeedbackController } from './medication-feedback.controller'
import { MedicationFeedbackService } from './medication-feedback.service'

@Module({
  controllers: [MedicationFeedbackController],
  providers: [MedicationFeedbackService],
  exports: [MedicationFeedbackService]
})
export class MedicationFeedbackModule {}
