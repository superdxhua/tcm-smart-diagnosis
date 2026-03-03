import { Module } from '@nestjs/common';
import { SymptomExtractionService } from './symptom-extraction.service';
import { NaturalLanguageGenerationService } from './natural-language-generation.service';
import { WebSearchEnhancementService } from './web-search-enhancement.service';

@Module({
  providers: [
    SymptomExtractionService,
    NaturalLanguageGenerationService,
    WebSearchEnhancementService,
  ],
  exports: [
    SymptomExtractionService,
    NaturalLanguageGenerationService,
    WebSearchEnhancementService,
  ],
})
export class QwenServicesModule {}
