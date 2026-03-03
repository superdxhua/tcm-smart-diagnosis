import { Module } from '@nestjs/common'
import { FormulaIntelligenceController } from './formula-intelligence.controller'
import { SymptomEmbeddingService } from './symptom-embedding.service'
import { IntelligentMatchingService } from './intelligent-matching.service'
import { RecommendationEngineService } from './recommendation-engine.service'
import { EvidenceTraceService } from './evidence-trace.service'
import { IntelligentFormulaRecommendationService } from './intelligent-formula-recommendation.service'

/**
 * 智能方证推荐 Module
 *
 * 包含以下服务：
 * - SymptomEmbeddingService: 症状向量化服务
 * - IntelligentMatchingService: 智能匹配服务
 * - RecommendationEngineService: 推荐引擎
 * - EvidenceTraceService: 证据溯源服务
 * - IntelligentFormulaRecommendationService: 综合推荐服务
 *
 * 包含以下控制器：
 * - FormulaIntelligenceController: 智能方证推荐接口
 */
@Module({
  imports: [],
  controllers: [FormulaIntelligenceController],
  providers: [
    SymptomEmbeddingService,
    IntelligentMatchingService,
    RecommendationEngineService,
    EvidenceTraceService,
    IntelligentFormulaRecommendationService
  ],
  exports: [
    SymptomEmbeddingService,
    IntelligentMatchingService,
    RecommendationEngineService,
    EvidenceTraceService,
    IntelligentFormulaRecommendationService
  ]
})
export class FormulaIntelligenceModule {}
