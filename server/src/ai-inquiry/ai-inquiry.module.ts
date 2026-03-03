import { Module } from '@nestjs/common';
import { AdvancedInquiryController } from './advanced/advanced-inquiry.controller';
import { BayesianInferenceService } from './advanced/bayesian-inference.service';
import { ComplexInferenceService } from './advanced/complex-inference.service';
import { ExpertFeedbackService } from './advanced/expert-feedback.service';
import { TCMNLUService } from './advanced/tcm-nlu.service';

@Module({
  controllers: [AdvancedInquiryController],
  providers: [
    BayesianInferenceService,
    ComplexInferenceService,
    ExpertFeedbackService,
    TCMNLUService,
  ],
  exports: [
    BayesianInferenceService,
    ComplexInferenceService,
    ExpertFeedbackService,
    TCMNLUService,
  ],
})
export class AiInquiryModule {}
