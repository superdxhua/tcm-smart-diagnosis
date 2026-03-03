import { Injectable, ForbiddenException } from '@nestjs/common';
import { LLMClient, Config, SearchClient, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { AnalyzeRequest, TreatmentPlan, ReferenceCase } from './tcm.interfaces';
import { isHighRiskPrescription, hasHighRiskIngredients, getHighRiskInfo } from '../config/high-risk-prescriptions';
import { AbuseDetectionService } from './abuse-detection.service';
import { createLLMClient, createConfig } from '../utils/llm-helper';
import { getAllFormulasWithSupplementary, FormulaEvidence } from '../ai-inquiry/extended-formula-evidence';

@Injectable()
export class TcmService {
  private llmClient: LLMClient;
  private searchClient: SearchClient;
  private supabase = getSupabaseClient();
  private customHeaders: Record<string, string> = {};

  constructor(private abuseDetectionService: AbuseDetectionService) {
    console.log('=== TcmService 初始化 ===');

    // 使用统一的 helper 函数创建客户端
    const config = createConfig();
    this.llmClient = createLLMClient();
    this.searchClient = new SearchClient(config);
    console.log('TcmService LLM 初始化成功');
  }

  /**
   * 设置自定义请求头（从 Controller 调用）
   */
  setCustomHeaders(headers: Record<string, string>) {
    this.customHeaders = headers;
    console.log('TcmService CustomHeaders 已设置');
    console.log('CustomHeaders keys:', Object.keys(headers).join(', '));
    console.log('CustomHeaders sample:', JSON.stringify(headers, null, 2).substring(0, 500));
  }

  /**
   * 创建带 customHeaders 的 LLM 客户端
   * 使用统一的 helper 函数，确保 API Key 格式一致
   */
  private createLLMClient(): LLMClient {
    console.log('=== 创建 LLM 客户端 ===');
    console.log('CustomHeaders keys:', Object.keys(this.customHeaders).join(', '));

    // 🚨 使用统一的 helper 函数，确保 API Key 格式一致
    const config = createConfig();
    return createLLMClient(this.customHeaders);
  }

  async analyzeSymptoms(request: AnalyzeRequest): Promise<TreatmentPlan> {
    const { chiefComplaint, history, pastHistory, aiInquiry, additionalInfo, userId, patientId, userRole } = request;

    console.log('=== LLM 调用开始 ===');
    console.log('请求参数:', { chiefComplaint, history, pastHistory, hasAiInquiry: !!aiInquiry, aiInquiryLength: aiInquiry?.length, hasAdditionalInfo: !!additionalInfo });

    // 个人用户异常检测
    if (userRole === 'individual' && userId && patientId) {
      console.log('开始个人用户异常检测');
      const abuseDetection = await this.abuseDetectionService.detectAbuse(
        userId,
        patientId,
        chiefComplaint || '',
        (chiefComplaint + ' ' + (history || '') + ' ' + (pastHistory || '') + ' ' + (aiInquiry || '')).trim(),
        '' // 处方名称在生成后才能获取
      );

      if (abuseDetection.isAbuse && abuseDetection.riskLevel === 'high') {
        console.error('检测到高风险滥用行为:', abuseDetection.reasons);
        throw new ForbiddenException({
          code: 'ABUSE_DETECTED',
          message: abuseDetection.recommendation,
          riskLevel: abuseDetection.riskLevel,
          reasons: abuseDetection.reasons
        });
      }

      if (abuseDetection.isAbuse && abuseDetection.riskLevel === 'medium') {
        console.warn('检测到中等风险滥用行为:', abuseDetection.reasons);
        // 中等风险暂时允许继续，但在返回结果中添加警告
      }

      // 检查用户的处罚状态
      await this.checkPunishmentStatus(userId);
    }

    // 打印 LLM 配置信息
    const llmConfig = (this.llmClient as any)?.['_llm'];
    if (llmConfig) {
      console.log('LLM Model Name:', llmConfig.modelName || llmConfig.model || '未知模型');
      console.log('LLM Temperature:', llmConfig.temperature);
    }

    const systemPrompt = `你是中医专家，首先判断用户是否为高危病重人群。

【高危病重判定标准】（符合以下任何一项即为高危病重）：
1. 急性心血管：急性心肌梗死、不稳定心绞痛、严重心律失常、急性心衰
2. 急性脑血管：脑卒中、中风（突发肢体无力、口眼歪斜、言语不清）、脑出血
3. 急性腹症：急性胰腺炎（剧烈腹痛、发热）、急性阑尾炎穿孔、肠梗阻
4. 严重外伤：开放性伤口、严重骨折、内脏破裂、大量出血
5. 危急状态：昏迷、休克、呼吸困难、窒息、抽搐不止
6. 严重感染：败血症、高热不退、严重脱水
7. 急性中毒：药物中毒、食物中毒、农药中毒
8. 其他：胸痛剧烈持续、呼吸困难严重、意识模糊、大小便失禁

【响应格式】：

如果是高危病重用户，严格按以下格式输出（无其他文字）：
{
  "isHighRisk": true,
  "riskType": "高危类型（如：急性心血管、急性脑血管、急性腹症等）",
  "riskReason": "具体原因说明",
  "recommendation": "建议立即就医，前往具有急诊救治能力的三级医院进行紧急处理。具体建议：[1. 详细说明建议内容]"
}

如果不是高危病重用户，按以下格式输出诊疗信息（不生成处方，只生成诊断、辨证、治则）：
{
  "isHighRisk": false,
  "diagnosis": "诊断",
  "differentiation": "辨证",
  "treatmentPrinciple": "治则",
  "symptomAnalysis": "症状分析（简要说明病因病机）"
}

判断时要谨慎，宁可误判（保守）也不要漏判高危用户。`;

    // 构建用户信息，整合主诉和 AI 问询历史
    let patientInfo = '';

    // 主诉信息
    if (chiefComplaint) {
      patientInfo += `主诉：${chiefComplaint}`;
    }

    // 如果有 AI 问询历史，将其作为补充症状信息整合进来
    if (aiInquiry && aiInquiry.trim().length > 0) {
      // 提取用户回答的内容（过滤掉 AI 的问题）
      const patientAnswers = aiInquiry
        .split('\n\n')
        .filter(line => line.trim().startsWith('用户:'))
        .map(line => line.trim().replace(/^用户:\s*/, ''))
        .join('；');

      if (patientAnswers) {
        patientInfo += `\n补充症状（问询获得）：${patientAnswers}`;
        console.log('已将 AI 问询中用户的回答作为补充症状整合');
      }
    }

    // 现病史（如果有）
    if (history) {
      patientInfo += `\n现病史：${history}`;
    }

    // 既往史
    if (pastHistory) {
      patientInfo += `\n既往史：${pastHistory}`;
    }

    // 补充信息（来自上传的文档）
    if (additionalInfo && additionalInfo.trim().length > 0) {
      patientInfo += `\n补充信息（来自上传的文档）：${additionalInfo}`;
      console.log('已将文档分析信息作为补充信息整合');
    }

    const userMessage = `请为以下用户提供中医诊疗方案：

${patientInfo}`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    try {
      // 创建带 customHeaders 的 LLM 客户端
      const llmClient = this.createLLMClient();
      console.log('CustomHeaders:', Object.keys(this.customHeaders).join(', '));

      const response = await llmClient.invoke(messages, {
        temperature: 0.3, // 降低 temperature 以提升生成速度
      });

      console.log('LLM 原始响应:', response.content);
      console.log('LLM 响应长度:', response.content.length);

      // 尝试解析 JSON 响应
      // 改进的 JSON 提取方法
      let jsonString = '';

      // 方法 1: 尝试找到第一个 { 和对应的最后一个 }
      const firstBrace = response.content.indexOf('{');
      if (firstBrace !== -1) {
        // 从第一个 { 开始，向后查找
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;

        for (let i = firstBrace; i < response.content.length; i++) {
          const char = response.content[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }

          if (!inString) {
            if (char === '{') {
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                jsonString = response.content.substring(firstBrace, i + 1);
                break;
              }
            }
          }
        }
      }

      // 如果方法 1 失败，尝试方法 2: 使用正则表达式
      if (!jsonString) {
        console.log('方法 1 失败，尝试正则表达式匹配');
        const jsonMatch = response.content.match(/\{[\s\S]*?\n\s*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        } else {
          // 最后尝试：贪婪匹配
          const greedyMatch = response.content.match(/\{[\s\S]*\}/);
          if (greedyMatch) {
            jsonString = greedyMatch[0];
          }
        }
      }

      if (!jsonString) {
        console.error('无法找到 JSON 对象');
        console.error('LLM 响应内容:', response.content);
        throw new Error('无法解析 AI 响应');
      }

      console.log('提取的 JSON 长度:', jsonString.length);
      console.log('JSON 前 300 字符:', jsonString.substring(0, 300));
      console.log('JSON 后 300 字符:', jsonString.substring(jsonString.length - 300));

      // 验证 JSON 是否合法
      let result;
      try {
        result = JSON.parse(jsonString);
        console.log('JSON 解析成功');
      } catch (parseError) {
        console.error('JSON 解析失败:', parseError);
        console.error('JSON 字符串:', jsonString);
        console.error('解析位置附近的字符:', jsonString.substring(Math.max(0, parseError.message.match(/position (\d+)/)?.[1] ? parseInt(parseError.message.match(/position (\d+)/)[1]) - 50 : 0), Math.min(jsonString.length, (parseError.message.match(/position (\d+)/)?.[1] ? parseInt(parseError.message.match(/position (\d+)/)[1]) : 0) + 100)));
        throw new Error(`JSON 解析失败: ${parseError.message}`);
      }

      // 检查是否为高危病重用户
      if (result.isHighRisk === true) {
        console.warn('检测到高危病重用户:', result.riskType, result.riskReason);
        throw new Error(`HIGH_RISK:${result.riskType}|${result.riskReason}|${result.recommendation}`);
      }

      // 验证必需字段
      if (!result.diagnosis || !result.differentiation) {
        console.error('AI 响应缺少必需字段:', result);
        throw new Error('AI 响应缺少必需字段');
      }

      console.log('=== 第一阶段完成，生成诊断信息 ===');
      console.log('诊断:', result.diagnosis);
      console.log('辨证:', result.differentiation);
      console.log('治则:', result.treatmentPrinciple);

      // 第二阶段：查询经典医案
      console.log('=== 第二阶段开始，查询经典医案 ===');
      const referenceCases = await this.matchReferenceCases({
        symptoms: chiefComplaint,
        diagnosis: result.diagnosis,
        differentiation: result.differentiation,
        aiInquiry
      });

      console.log('=== 查询到医案数量:', referenceCases.length);

      // 第三阶段：生成处方（结合千问建议和医案参考）
      console.log('=== 第三阶段开始，生成处方 ===');
      const prescription = await this.generatePrescription({
        diagnosis: result.diagnosis,
        differentiation: result.differentiation,
        treatmentPrinciple: result.treatmentPrinciple,
        symptomAnalysis: result.symptomAnalysis,
        symptoms: chiefComplaint,
        history,
        pastHistory,
        referenceCases
      });

      // 生成处方决策信息
      const topMatchScore = referenceCases.length > 0 ? Math.max(...referenceCases.map(c => c.matchScore)) : 0;
      let decisionReason = '';
      let primarySource = prescription.source || '融合生成';
      let hasConflict = false;
      let conflictDetails = '';

      if (referenceCases.length > 0) {
        const topCase = referenceCases[0];
        
        if (topMatchScore >= 0.7) {
          decisionReason = `存在高匹配度医案（匹配度 ${(topMatchScore * 100).toFixed(0)}%，${topCase.doctorName}的${topCase.prescriptionName}），强制优先使用医案处方`;
          primarySource = '医案参考（优先）';
        } else if (topMatchScore >= 0.5) {
          decisionReason = `存在中匹配度医案（匹配度 ${(topMatchScore * 100).toFixed(0)}%，${topCase.doctorName}的${topCase.prescriptionName}），重点参考医案处方作为基础，结合用户情况调整`;
          primarySource = '融合生成（以医案为基础）';
        } else {
          decisionReason = `医案匹配度较低（最高 ${(topMatchScore * 100).toFixed(0)}%），以千问大模型的专业判断为主`;
          primarySource = '千问建议（结合最新研究）';
        }

        // 检测冲突（如果处方来源不是医案优先，但有高匹配度医案）
        if (topMatchScore >= 0.7 && !prescription.source?.includes('医案')) {
          hasConflict = true;
          conflictDetails = `注意：存在高匹配度医案（${topCase.doctorName}的${topCase.prescriptionName}，匹配度 ${(topMatchScore * 100).toFixed(0)}%），但当前处方未完全参考医案。建议优先使用医案处方。`;
        }
      } else {
        decisionReason = '无匹配医案，以千问大模型的专业判断为主，参考最新研究成果';
        primarySource = '千问建议（结合最新研究）';
      }

      const prescriptionDecision = {
        primarySource,
        decisionReason,
        topMatchScore,
        hasConflict,
        conflictDetails: hasConflict ? conflictDetails : undefined
      };

      // 检测高风险处方
      let highRiskInfo: { isHighRisk: boolean; reason: string; ingredients: string[] } | undefined = undefined;
      const isHighRisk = isHighRiskPrescription(prescription.formulaName);
      if (isHighRisk) {
        const riskInfo = getHighRiskInfo(prescription.formulaName);
        if (riskInfo) {
          highRiskInfo = {
            isHighRisk: true,
            reason: riskInfo.reason,
            ingredients: riskInfo.ingredients,
          };
          console.warn('高风险处方检测:', prescription.formulaName, riskInfo.reason);
        }
      } else {
        // 检测成分中是否含有高风险药材
        const ingredients = prescription.ingredients.map(i => i.name);
        if (hasHighRiskIngredients(ingredients)) {
          // 获取具体哪些药材是高风险的
          const highRiskIngredients = this.getHighRiskIngredientNames(ingredients);
          highRiskInfo = {
            isHighRisk: true,
            reason: `处方中含有高风险药材：${highRiskIngredients.join('、')}`,
            ingredients: highRiskIngredients,
          };
          console.warn('高风险成分检测:', highRiskIngredients.join('、'));
        }
      }

      // 如果用户是个人用户且检测到高风险处方，隐藏处方详情
      if (highRiskInfo?.isHighRisk && request.userRole === 'individual') {
        console.log('个人用户，隐藏高风险处方:', prescription.formulaName);
        prescription.ingredients = [];
        prescription.decoctionMethod = '（该处方含有高风险药材，个人账户无法查看详情）';
        prescription.dosageMethod = '（该处方含有高风险药材，个人账户无法查看详情）';
        prescription.precautions = `⚠️ 高风险处方：${highRiskInfo.reason}\n\n个人账户仅限科研教学使用，严禁为他人开具处方。\n\n如需使用此处方，请联系专业机构或医生。`;
      }

      // 准备警告信息
      const warnings: string[] = [];

      // 如果账户是未审核通过的机构账户，添加警告
      if (request.auditStatus === 'pending') {
        warnings.push('⚠️ 【审核提醒】您的机构资质正在审核中，当前权限仅限个人账户级别。审核通过后，将恢复机构账户完整权限。');
      } else if (request.auditStatus === 'rejected') {
        warnings.push('⚠️ 【审核提醒】您的机构资质审核未通过，当前权限仅限个人账户级别。如需恢复机构权限，请联系管理员重新提交审核材料。');
      }

      // 返回完整的诊疗方案
      return {
        diagnosis: result.diagnosis,
        differentiation: result.differentiation,
        treatmentPrinciple: result.treatmentPrinciple || '暂无',
        prescription: {
          ...prescription,
          highRiskInfo, // 添加高风险信息
        },
        explanation: prescription.explanation || '暂无',
        advice: prescription.advice || '暂无',
        warnings: warnings.length > 0 ? warnings : undefined,
        referenceCases: referenceCases,
        prescriptionSource: prescription.source || '融合生成',
        prescriptionDecision
      };
    } catch (error) {
      console.error('LLM 调用失败:', error);
      throw new Error('诊疗分析失败，请重试');
    }
  }

  /**
   * 匹配参考医案
   */
  private async matchReferenceCases(params: {
    symptoms: string;
    diagnosis: string;
    differentiation: string;
    aiInquiry?: string;
  }): Promise<ReferenceCase[]> {
    try {
      // 构建匹配关键词
      const keywords = [
        ...params.symptoms.split(/[，；；,;、]/).map(s => s.trim()).filter(s => s),
        params.diagnosis,
        params.differentiation
      ];

      console.log('匹配关键词:', keywords);

      // 查询相似医案（关键词匹配）
      const { data: cases, error } = await this.supabase
        .from('medical_cases')
        .select('*')
        .or(`diagnosis.ilike.%${params.diagnosis}%,differentiation.ilike.%${params.differentiation}%`)
        .limit(10);

      if (error) {
        console.error('查询医案失败:', error);
        return [];
      }

      if (!cases || cases.length === 0) {
        console.log('未找到匹配医案');
        return [];
      }

      // 计算每个医案的匹配度
      const scoredCases = cases.map((caseItem: any) => {
        let matchScore = 0;

        // 诊断匹配
        if (caseItem.diagnosis === params.diagnosis) {
          matchScore += 0.4;
        } else if (caseItem.diagnosis.includes(params.diagnosis) || params.diagnosis.includes(caseItem.diagnosis)) {
          matchScore += 0.2;
        }

        // 辨证匹配
        if (caseItem.differentiation === params.differentiation) {
          matchScore += 0.4;
        } else if (caseItem.differentiation && (caseItem.differentiation.includes(params.differentiation) || params.differentiation.includes(caseItem.differentiation))) {
          matchScore += 0.2;
        }

        // 症状匹配
        if (caseItem.symptom_keywords && Array.isArray(caseItem.symptom_keywords)) {
          const matchedKeywords = caseItem.symptom_keywords.filter((keyword: string) =>
            keywords.some(k => k.includes(keyword) || keyword.includes(k))
          );
          matchScore += (matchedKeywords.length / Math.max(caseItem.symptom_keywords.length, 1)) * 0.2;
        }

        // 有效率加权
        const effectivenessScore = caseItem.effectiveness_score || 0.85;
        matchScore *= effectivenessScore;

        return {
          id: caseItem.id,
          doctorName: caseItem.doctor_name,
          doctorEra: caseItem.doctor_era,
          prescriptionName: caseItem.prescription_name,
          diagnosis: caseItem.diagnosis,
          mainSymptoms: caseItem.main_symptoms,
          effectivenessScore: effectivenessScore,
          matchScore: matchScore,
          source: caseItem.source || '未知'
        };
      });

      // 按匹配度排序，取前5个
      const sortedCases = scoredCases
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      console.log('匹配医案（按匹配度排序）:', sortedCases);

      return sortedCases;
    } catch (error) {
      console.error('匹配医案失败:', error);
      return [];
    }
  }

  /**
   * 生成处方（结合千问建议和医案参考）
   */
  private async generatePrescription(params: {
    diagnosis: string;
    differentiation: string;
    treatmentPrinciple: string;
    symptomAnalysis?: string;
    symptoms: string;
    history?: string;
    pastHistory?: string;
    referenceCases: ReferenceCase[];
  }): Promise<{
    formulaName: string;
    ingredients: Array<{ name: string; dosage: string; special: string }>;
    decoctionMethod: string;
    dosageMethod: string;
    precautions: string;
    explanation?: string;
    advice?: string;
    source?: string;
  }> {
    console.log('=== 生成处方 ===');
    console.log('参考医案数量:', params.referenceCases.length);

    // 联网搜索，获取最新的中医诊疗信息
    let webSearchInfo = '';
    try {
      const searchQuery = `${params.diagnosis} ${params.differentiation} 中医治疗 方剂`;
      console.log('开始联网搜索:', searchQuery);
      
      const searchResponse = await this.searchClient.webSearch(searchQuery, 5, true);
      
      if (searchResponse.web_items && searchResponse.web_items.length > 0) {
        webSearchInfo = '\n\n【最新研究参考】（联网搜索）:\n';
        searchResponse.web_items.forEach((item, index) => {
          webSearchInfo += `${index + 1}. ${item.title}\n`;
          webSearchInfo += `   来源：${item.site_name || '未知'}\n`;
          webSearchInfo += `   摘要：${item.snippet?.substring(0, 100)}...\n\n`;
        });
        
        if (searchResponse.summary) {
          webSearchInfo += `【AI 总结】：\n${searchResponse.summary}\n`;
        }
        
        console.log('联网搜索成功，找到', searchResponse.web_items.length, '条结果');
      }
    } catch (error) {
      console.error('联网搜索失败，使用医案库参考', error);
      // 联网搜索失败不影响处方生成
    }

    // 构建医案参考信息
    let referenceInfo = '';
    if (params.referenceCases.length > 0) {
      referenceInfo = '\n\n【经典医案参考】（按匹配度排序）:\n';
      params.referenceCases.forEach((refCase, index) => {
        referenceInfo += `${index + 1}. ${refCase.doctorName}（${refCase.doctorEra || '未知'}）-${refCase.prescriptionName}\n`;
        referenceInfo += `   诊断：${refCase.diagnosis}\n`;
        referenceInfo += `   主诉：${refCase.mainSymptoms.substring(0, 50)}...\n`;
        referenceInfo += `   匹配度：${(refCase.matchScore * 100).toFixed(0)}%，有效率：${(refCase.effectivenessScore * 100).toFixed(0)}%\n`;
        referenceInfo += `   处方组成：${refCase.prescriptionName}\n\n`;
      });
    }

    // 构建用户信息
    let patientInfo = '';
    if (params.symptoms) {
      patientInfo += `主诉：${params.symptoms}`;
    }
    if (params.history) {
      patientInfo += `\n现病史：${params.history}`;
    }
    if (params.pastHistory) {
      patientInfo += `\n既往史：${params.pastHistory}`;
    }

    // 调用千问大模型生成处方
    const systemPrompt = `你是中医专家，根据以下诊断信息生成处方。

【用户信息】：
${patientInfo}

【诊断信息】：
- 诊断：${params.diagnosis}
- 辨证：${params.differentiation}
- 治则：${params.treatmentPrinciple}
${params.symptomAnalysis ? `- 症状分析：${params.symptomAnalysis}` : ''}
${referenceInfo}
${webSearchInfo}

【处方生成优先级规则】（必须严格遵守）：

**情况1：有高匹配度经典医案（匹配度≥70%）**
- 必须**强制优先使用**医案中的处方
- 只允许根据用户具体情况做**微小调整**（如剂量微调）
- 禁止大范围更改方剂组成
- source字段必须填写："医案参考（优先）"

**情况2：有中匹配度经典医案（匹配度50%-70%）**
- 必须**重点参考**医案中的处方作为基础
- 可以根据用户具体情况进行**适度调整**
- 调整时需要说明理由
- source字段必须填写："融合生成（以医案为基础）"

**情况3：低匹配度或无医案（匹配度<50%）**
- 参考最新研究的诊疗思路
- 结合传统经方和现代研究成果
- 以千问大模型的专业判断为主
- source字段必须填写："千问建议（结合最新研究）"

【处方生成要求】：
1. 处方中的药物用量必须明确写出具体克数（如：桂枝9g，白芍9g，炙甘草6g）
2. 对于毒性药物（附子、半夏、细辛等），必须严格控制剂量并标注注意事项
3. 剂量标准：汉代一两折合现代9克
4. 必须在source字段中明确说明处方来源和决策依据

【输出格式】：
请按以下 JSON 格式输出处方信息：
{
  "formulaName": "方名",
  "ingredients": [{"name":"药名","dosage":"剂量","special":"特殊说明"}],
  "decoctionMethod": "煎煮方法(用|分隔)",
  "dosageMethod": "服用方法(用|分隔)",
  "precautions": "注意事项(用|分隔)",
  "explanation": "方解(用|分隔)",
  "advice": "调护建议(用|分隔)",
  "source": "处方来源（医案参考（优先）/融合生成（以医案为基础）/千问建议（结合最新研究））"
}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: '请生成处方：' }
    ];

    try {
      // 创建带 customHeaders 的 LLM 客户端
      const llmClient = this.createLLMClient();
      const response = await llmClient.invoke(messages, {
        temperature: 0.3,
      });

      console.log('处方生成响应:', response.content);

      // 解析 JSON 响应
      const jsonString = this.extractJSON(response.content);
      const result = JSON.parse(jsonString);

      return {
        formulaName: result.formulaName || '暂无',
        ingredients: result.ingredients || [],
        decoctionMethod: result.decoctionMethod ? result.decoctionMethod.replace(/\|/g, '\n') : '暂无',
        dosageMethod: result.dosageMethod ? result.dosageMethod.replace(/\|/g, '\n') : '暂无',
        precautions: result.precautions ? result.precautions.replace(/\|/g, '\n') : '暂无',
        explanation: result.explanation ? result.explanation.replace(/\|/g, '\n') : '暂无',
        advice: result.advice ? result.advice.replace(/\|/g, '\n') : '暂无',
        source: result.source || '融合生成'
      };
    } catch (error) {
      console.error('处方生成失败:', error);
      // 如果处方生成失败，使用第一个参考医案的处方
      if (params.referenceCases.length > 0) {
        console.log('使用参考医案处方作为后备方案');
        const topCase = params.referenceCases[0];
        return {
          formulaName: topCase.prescriptionName,
          ingredients: [],
          decoctionMethod: '参考医案煎服法',
          dosageMethod: '参考医案服用法',
          precautions: '参考医案注意事项',
          explanation: '参考医案方解',
          advice: '参考医案调护建议',
          source: '医案参考'
        };
      }
      throw new Error('处方生成失败，请重试');
    }
  }

  /**
   * 从文本中提取 JSON
   */
  private extractJSON(text: string): string {
    let jsonString = '';

    const firstBrace = text.indexOf('{');
    if (firstBrace !== -1) {
      let braceCount = 0;
      let inString = false;
      let escapeNext = false;

      for (let i = firstBrace; i < text.length; i++) {
        const char = text[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') {
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonString = text.substring(firstBrace, i + 1);
              break;
            }
          }
        }
      }
    }

    if (!jsonString) {
      const jsonMatch = text.match(/\{[\s\S]*\n\s*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      } else {
        const greedyMatch = text.match(/\{[\s\S]*\}/);
        if (greedyMatch) {
          jsonString = greedyMatch[0];
        }
      }
    }

    if (!jsonString) {
      console.error('无法提取 JSON');
      throw new Error('无法解析响应');
    }

    return jsonString;
  }

  /**
   * 获取药材列表中的高风险药材名称
   */
  private getHighRiskIngredientNames(ingredients: string[]): string[] {
    const highRiskIngredients = new Set<string>();
    const allHighRiskPrescriptions = require('../config/high-risk-prescriptions').HIGH_RISK_PRESCRIPTIONS;

    allHighRiskPrescriptions.forEach((p: any) => {
      p.ingredients.forEach((i: string) => highRiskIngredients.add(i));
    });

    return ingredients.filter(i => highRiskIngredients.has(i));
  }

  /**
   * 检查用户的处罚状态
   */
  private async checkPunishmentStatus(userId: string): Promise<void> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('prescription_banned, prescription_banned_until, ban_reason')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('查询用户处罚状态失败:', error);
        return;
      }

      if (!user) {
        console.error('用户不存在');
        return;
      }

      // 如果未被封禁，直接返回
      if (!user.prescription_banned) {
        return;
      }

      // 检查封禁是否已过期
      if (user.prescription_banned_until) {
        const bannedUntil = new Date(user.prescription_banned_until);
        const now = new Date();

        if (now >= bannedUntil) {
          console.log('用户封禁已过期，自动恢复权限');
          // 自动恢复权限
          await this.supabase
            .from('users')
            .update({
              prescription_banned: false,
              prescription_banned_until: null,
              ban_reason: null
            })
            .eq('id', userId);
          return;
        }

        // 计算剩余天数
        const remainingDays = Math.ceil((bannedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        throw new ForbiddenException({
          code: 'PRESCRIPTION_BANNED',
          message: `您的处方生成权已被暂停，剩余 ${remainingDays} 天。如有疑问，请联系管理员。`,
          reason: user.ban_reason,
          bannedUntil: user.prescription_banned_until,
          remainingDays
        });
      } else {
        // 永久封禁
        throw new ForbiddenException({
          code: 'PRESCRIPTION_BANNED_PERMANENTLY',
          message: `您的处方生成权已被永久封禁。如有疑问，请联系管理员。`,
          reason: user.ban_reason,
          isPermanent: true
        });
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('检查处罚状态异常:', error);
    }
  }

  // ============================================
  // 方证知识库相关方法
  // ============================================

  /**
   * 获取所有方剂数据
   */
  getAllFormulas(): FormulaEvidence[] {
    return getAllFormulasWithSupplementary();
  }

  /**
   * 根据六经分类获取方剂
   */
  getFormulasByMeridian(meridian: string): FormulaEvidence[] {
    const allFormulas = getAllFormulasWithSupplementary();
    return allFormulas.filter(formula => {
      // 根据方剂来源判断六经
      const source = formula.source;
      if (meridian === '太阳') {
        return formula.formula.includes('桂枝') || 
               formula.formula.includes('麻黄') || 
               formula.formula.includes('葛根') ||
               formula.formula.includes('五苓') ||
               formula.formula.includes('桃核');
      } else if (meridian === '阳明') {
        return formula.formula.includes('白虎') || 
               formula.formula.includes('承气') || 
               formula.formula.includes('茵陈') ||
               formula.formula.includes('泻心');
      } else if (meridian === '少阳') {
        return formula.formula.includes('柴胡') || 
               formula.formula.includes('大柴胡') || 
               formula.formula.includes('小柴胡') ||
               formula.formula.includes('四逆');
      } else if (meridian === '太阴') {
        return formula.formula.includes('理中') || 
               formula.formula.includes('建中') || 
               formula.formula.includes('附子理中');
      } else if (meridian === '少阴') {
        return formula.formula.includes('四逆') || 
               formula.formula.includes('真武') || 
               formula.formula.includes('附子') ||
               formula.formula.includes('黄连阿胶') ||
               formula.formula.includes('地黄');
      } else if (meridian === '厥阴') {
        return formula.formula.includes('乌梅') || 
               formula.formula.includes('白头翁') || 
               formula.formula.includes('当归四逆');
      }
      return false;
    });
  }

  /**
   * 根据症状匹配方剂（关键词匹配）
   */
  matchFormulasBySymptoms(symptoms: string[]): { formula: FormulaEvidence, matchScore: number }[] {
    const allFormulas = getAllFormulasWithSupplementary();
    const results: { formula: FormulaEvidence, matchScore: number }[] = [];

    for (const formula of allFormulas) {
      let matchScore = 0;
      
      // 检查主症匹配
      for (const symptom of symptoms) {
        // 在主症中查找
        for (const keySymptom of formula.keySymptoms) {
          if (keySymptom.includes(symptom) || symptom.includes(keySymptom)) {
            matchScore += 3; // 主症匹配得 3 分
          }
        }
        
        // 在适应症中查找
        for (const indication of formula.indications) {
          if (indication.includes(symptom) || symptom.includes(indication)) {
            matchScore += 2; // 适应症匹配得 2 分
          }
        }
        
        // 在病机中查找
        if (formula.mechanism.includes(symptom) || symptom.includes(formula.mechanism)) {
          matchScore += 1; // 病机匹配得 1 分
        }
      }

      if (matchScore > 0) {
        results.push({ formula, matchScore });
      }
    }

    // 按匹配分数降序排序
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 根据治法分类获取方剂
   */
  getFormulasByTreatmentMethod(treatmentMethod: string): FormulaEvidence[] {
    const allFormulas = getAllFormulasWithSupplementary();
    return allFormulas.filter(formula => formula.treatmentMethod === treatmentMethod);
  }

  /**
   * 根据方剂名称获取详细信息
   */
  getFormulaByName(formulaName: string): FormulaEvidence | undefined {
    const allFormulas = getAllFormulasWithSupplementary();
    return allFormulas.find(formula => formula.formula === formulaName);
  }

  /**
   * 获取方剂统计信息
   */
  getFormulaStatistics() {
    const allFormulas = getAllFormulasWithSupplementary();
    
    // 按六经统计
    const meridianStats = {
      太阳: this.getFormulasByMeridian('太阳').length,
      阳明: this.getFormulasByMeridian('阳明').length,
      少阳: this.getFormulasByMeridian('少阳').length,
      太阴: this.getFormulasByMeridian('太阴').length,
      少阴: this.getFormulasByMeridian('少阴').length,
      厥阴: this.getFormulasByMeridian('厥阴').length,
    };

    // 按治法统计
    const treatmentMethodStats: Record<string, number> = {};
    for (const formula of allFormulas) {
      const method = formula.treatmentMethod;
      treatmentMethodStats[method] = (treatmentMethodStats[method] || 0) + 1;
    }

    return {
      total: allFormulas.length,
      byMeridian: meridianStats,
      byTreatmentMethod: treatmentMethodStats,
    };
  }
}
