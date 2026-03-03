import { Controller, Post, Body, Get } from '@nestjs/common'
import { IntelligentFormulaRecommendationService, FormulaRecommendationRequest } from './intelligent-formula-recommendation.service'

/**
 * 智能方证推荐接口请求体
 */
interface RecommendFormulasRequest {
  userInput: string
  constitution?: string
  symptomSeverity?: 'mild' | 'moderate' | 'severe'
  topK?: number
}

/**
 * 智能方证推荐 Controller
 *
 * 提供 AI 问询阶段的智能化方证推荐接口
 */
@Controller('formula-intelligence')
export class FormulaIntelligenceController {
  constructor(
    private intelligentFormulaRecommendationService: IntelligentFormulaRecommendationService
  ) {}

  /**
   * 智能推荐方证
   *
   * POST /api/formula-intelligence/recommend
   *
   * @param request 推荐请求
   * @returns 推荐结果
   */
  @Post('recommend')
  async recommendFormulas(@Body() request: RecommendFormulasRequest) {
    try {
      console.log('[FormulaIntelligence] 收到推荐请求:', request)

      const result = await this.intelligentFormulaRecommendationService.recommendFormulas({
        userInput: request.userInput,
        constitution: request.constitution,
        symptomSeverity: request.symptomSeverity || 'moderate',
        topK: request.topK || 3
      })

      console.log('[FormulaIntelligence] 推荐完成')

      return {
        code: 200,
        msg: 'success',
        data: result
      }
    } catch (error) {
      console.error('[FormulaIntelligence] 推荐失败:', error)
      return {
        code: 500,
        msg: `推荐失败: ${error}`,
        data: null
      }
    }
  }

  /**
   * 生成完整的推荐报告（Markdown 格式）
   *
   * POST /api/formula-intelligence/report
   *
   * @param request 推荐请求
   * @returns 完整的推荐报告
   */
  @Post('report')
  async generateFullReport(@Body() request: RecommendFormulasRequest) {
    try {
      console.log('[FormulaIntelligence] 收到报告请求:', request)

      const report = await this.intelligentFormulaRecommendationService.generateFullReport({
        userInput: request.userInput,
        constitution: request.constitution,
        symptomSeverity: request.symptomSeverity || 'moderate',
        topK: request.topK || 3
      })

      console.log('[FormulaIntelligence] 报告生成完成')

      return {
        code: 200,
        msg: 'success',
        data: {
          report,
          generatedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('[FormulaIntelligence] 报告生成失败:', error)
      return {
        code: 500,
        msg: `报告生成失败: ${error}`,
        data: null
      }
    }
  }

  /**
   * 健康检查
   *
   * GET /api/formula-intelligence/health
   */
  @Get('health')
  healthCheck() {
    return {
      code: 200,
      msg: 'Formula Intelligence Service is running',
      data: {
        service: 'formula-intelligence',
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    }
  }
}
