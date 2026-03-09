import { Injectable } from '@nestjs/common';
import { LLMClient, Config, SearchClient, S3Storage, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { createLLMClient, createConfig, getAuthHeaders } from '../utils/llm-helper';

@Injectable()
export class MedicalAiService {
  private client: LLMClient;
  private searchClient: SearchClient;
  private storage: S3Storage;
  private supabase = getSupabaseClient();
  private customHeaders: Record<string, string> = {};

  constructor() {
    console.log('=== MedicalAiService 初始化 ===');

    // 使用统一的 helper 函数创建客户端
    const config = createConfig();
    const authHeaders = getAuthHeaders();

    // 创建 LLM 客户端（内部已处理 Headers）
    this.client = createLLMClient();

    // 创建 SearchClient 并传入认证 Headers
    this.searchClient = new SearchClient(config, authHeaders);
    console.log('LLMClient 和 SearchClient 初始化成功（已注入 Authorization Header）');

    // 初始化对象存储
    try {
      this.storage = new S3Storage({
        endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
        accessKey: "",
        secretKey: "",
        bucketName: process.env.COZE_BUCKET_NAME,
        region: "cn-beijing",
      });
      console.log('S3Storage 初始化成功');
    } catch (error) {
      console.error('S3Storage 初始化失败:', error);
    }
  }

  /**
   * 设置自定义请求头（从 Controller 调用）
   */
  setCustomHeaders(headers: Record<string, string>) {
    this.customHeaders = headers;
    console.log('CustomHeaders 已设置:', Object.keys(headers).join(', '));
  }

  /**
   * AI 医案推荐 - 根据用户症状和历史，查询历代名医医案并推荐处方
   */
  async recommendPrescription(params: {
    userId?: string; // 用户ID
    userRole?: 'individual' | 'institution' | 'admin'; // 用户角色
    patientName?: string;
    age?: number;
    gender?: string;
    chiefComplaint: string; // 主诉
    history?: string; // 现病史
    pastHistory?: string; // 既往史
    diagnosis?: string; // 诊断
    differentiation?: string; // 辨证分型
    aiChatHistory?: string; // AI 问询历史
  }): Promise<{
    recommendedPrescription: string; // 推荐处方
    classicCases: Array<{
      dynasty: string; // 朝代
      doctor: string; // 医生
      caseName: string; // 医案名称
      prescription: string; // 处方
      efficacy: string; // 功效
      explanation: string; // 解释
    }>;
    reasoning: string; // 推理过程
    warnings: string[]; // 注意事项
  }> {
    // 检查用户权限是否过期（管理员除外）
    if (params.userId && params.userRole !== 'admin') {
      const isExpired = await this.checkUserPermissionExpired(params.userId);
      if (isExpired) {
        throw new Error('您的使用期限已到期，请先充值续费后使用智能诊疗功能。');
      }
    }

    // 检查用户权限
    const warnings: string[] = [];

    // 检查用户是否属于特殊人群
    const isPregnant = this.checkIfPregnant(params);
    const isChild = this.checkIfChild(params.age);
    const isCritical = this.checkIfCriticalIllness(params.chiefComplaint, params.history, params.pastHistory);

    if (params.userRole === 'individual') {
      // 个体用户：孕妇、儿童、高危重病用户都不可开方
      if (isPregnant || isChild || isCritical) {
        const restrictions: string[] = [];
        if (isPregnant) restrictions.push('孕妇');
        if (isChild) restrictions.push('儿童');
        if (isCritical) restrictions.push('高危重病用户');

        throw new Error(`个人账户无权为${restrictions.join('、')}开具处方。请申请机构资质认证，审核通过后可开具此类处方。`);
      }
    } else if (params.userRole === 'institution') {
      // 机构账户：孕妇、儿童不可开方，高危重病用户可以开方但需要警示
      if (isPregnant || isChild) {
        const restrictions: string[] = [];
        if (isPregnant) restrictions.push('孕妇');
        if (isChild) restrictions.push('儿童');

        throw new Error(`机构账户无权为${restrictions.join('、')}开具处方。请转诊至上级医院或有相应资质的专业机构。`);
      }

      // 高危重病用户可以开方，但需要警示
      if (isCritical) {
        warnings.push('⚠️ 【高危重病警示】用户为高危重病用户，请谨慎开具处方，建议结合西医检查结果，必要时转诊至具有急诊救治能力的专业机构。');
      }
    }

    // 为孕妇、儿童、高危重病用户添加用药警示（如果允许开方）
    if (isPregnant) {
      warnings.push('⚠️ 【孕妇用药警示】用户为孕妇，使用中药需特别谨慎，避免使用活血化瘀、峻下逐水等类药物，建议咨询妇产科医生。');
    }
    if (isChild) {
      warnings.push('⚠️ 【儿童用药警示】用户为儿童，脏腑娇嫩，需严格控制剂量，避免使用毒性药物，建议咨询儿科医生。');
    }
    const systemPrompt = `你是一位精通中医经典理论和历代名医医案的中医专家。你的任务是：

1. 根据用户的症状、病史和诊断，从历代名医医案中查找类似病例
2. 参考张仲景《伤寒论》《金匮要略》、孙思邈《千金方》、李东垣《脾胃论》、朱丹溪《丹溪心法》、叶天士《临证指南医案》等经典著作
3. 分析不同朝代名医对该类病症的治则治法和方药应用
4. 结合现代临床经验，给出综合性的处方建议
5. 提供详细的推理过程和注意事项

**重要剂量标准（必须遵守）**：
- 汉代一两折合现代9克（现代临床常用折中标准）
- 张仲景经方剂量必须按照此标准换算，平衡疗效与安全性
- 推荐处方中的药物用量必须明确写出具体克数（如：桂枝9g，白芍9g，炙甘草6g）
- 对于毒性药物（附子、半夏、细辛等），必须严格控制剂量并标注注意事项
- 剂量调整应根据用户年龄、体质、病情灵活运用

输出格式要求为 JSON，包含以下字段：
- recommendedPrescription: 推荐的处方（方名、组成、用量（必须注明克数）、煎服法）
- classicCases: 相关经典医案数组（朝代、医生、医案名称、处方、功效、解释）
- reasoning: 详细的推理过程（病因病机分析、治则治法、用药思路）
- warnings: 注意事项（禁忌、配伍注意、生活调护）`;

    const userPrompt = this.buildPrompt(params);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    try {
      const response = await this.client.invoke(messages, {
        // 千问大模型（通过 SDK 配置）
        temperature: 0.7,
      });

      // 解析 AI 返回的 JSON
      const result = this.parseAIResponse(response.content);

      // 将风险警示合并到返回的 warnings 中
      return {
        ...result,
        warnings: [...(result.warnings || []), ...warnings],
      };
    } catch (error) {
      console.error('AI 医案推荐失败:', error);
      throw new Error('AI 医案推荐失败，请稍后重试');
    }
  }

  /**
   * AI 辨证分析 - 根据症状进行辨证分型
   */
  async differentiateSyndrome(params: {
    chiefComplaint: string;
    symptoms: string[];
    tongue?: string; // 舌象
    pulse?: string; // 脉象
  }): Promise<{
    syndrome: string; // 证型
    pathogenesis: string; // 病因病机
    treatmentPrinciple: string; // 治则
    recommendedFormulas: string[]; // 推荐方剂
  }> {
    const systemPrompt = `你是一位中医辨证专家。根据用户的症状、舌象、脉象进行准确的辨证分型。

输出格式要求为 JSON，包含以下字段：
- syndrome: 辨证结果（如：肝阳上亢证、脾胃虚弱证等）
- pathogenesis: 病因病机分析
- treatmentPrinciple: 治则治法
- recommendedFormulas: 推荐的方剂（3-5个）`;

    const userPrompt = `请根据以下症状进行辨证分型：

主诉：${params.chiefComplaint}

症状：${params.symptoms.join('、')}

${params.tongue ? `舌象：${params.tongue}` : ''}
${params.pulse ? `脉象：${params.pulse}` : ''}

请提供详细的辨证分析。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    try {
      const response = await this.client.invoke(messages, {
        // 千问大模型（通过 SDK 配置）
        temperature: 0.7,
      });

      const result = this.parseAIResponse(response.content);
      return result;
    } catch (error) {
      console.error('AI 辨证分析失败:', error);
      throw new Error('AI 辨证分析失败，请稍后重试');
    }
  }

  /**
   * AI 用药指导 - 处方配伍和用药指导
   */
  async getMedicationGuidance(params: {
    prescription: string; // 处方
    diagnosis: string; // 诊断
    patientAge?: number;
    gender?: string;
  }): Promise<{
    composition: Array<{
      herb: string; // 药名
      dosage: string; // 用量
      effect: string; // 功效
      compatibility: string; // 配伍说明
    }>;
    decoctionMethod: string; // 煎服法
    contraindications: string[]; // 禁忌
    modifications: string[]; // 加减变化建议
  }> {
    const systemPrompt = `你是一位中药学专家。分析处方的组成、功效、配伍、煎服法、禁忌和加减变化。

**重要剂量标准（必须遵守）**：
- 汉代一两折合现代9克（现代临床常用折中标准）
- 如果处方中提及一两、一钱等传统剂量单位，必须按照此标准换算为克数
- 换算公式：1两=9克，1钱=0.9克（古制1两=10钱）
- 药物组成中的用量必须明确写出具体克数
- 对于毒性药物需严格控制剂量并标注注意事项

输出格式要求为 JSON，包含以下字段：
- composition: 药物组成数组（药名、用量（必须注明克数）、功效、配伍说明）
- decoctionMethod: 煎服法
- contraindications: 禁忌事项
- modifications: 加减变化建议`;

    const userPrompt = `请分析以下处方：

处方：${params.prescription}
诊断：${params.diagnosis}
${params.patientAge ? `年龄：${params.patientAge}岁` : ''}
${params.gender ? `性别：${params.gender}` : ''}

请提供详细的用药指导。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    try {
      const response = await this.client.invoke(messages, {
        // 千问大模型（通过 SDK 配置）
        temperature: 0.7,
      });

      const result = this.parseAIResponse(response.content);
      return result;
    } catch (error) {
      console.error('AI 用药指导失败:', error);
      throw new Error('AI 用药指导失败，请稍后重试');
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(params: {
    patientName?: string;
    age?: number;
    gender?: string;
    chiefComplaint: string;
    history?: string;
    pastHistory?: string;
    diagnosis?: string;
    differentiation?: string;
    aiChatHistory?: string;
  }): string {
    let prompt = '';

    if (params.patientName) {
      prompt += `用户姓名：${params.patientName}\n`;
    }

    if (params.age) {
      prompt += `年龄：${params.age}岁\n`;
    }

    if (params.gender) {
      prompt += `性别：${params.gender}\n`;
    }

    prompt += `主诉：${params.chiefComplaint}\n`;

    if (params.history) {
      prompt += `现病史：${params.history}\n`;
    }

    if (params.pastHistory) {
      prompt += `既往史：${params.pastHistory}\n`;
    }

    if (params.diagnosis) {
      prompt += `诊断：${params.diagnosis}\n`;
    }

    if (params.differentiation) {
      prompt += `辨证分型：${params.differentiation}\n`;
    }

    if (params.aiChatHistory) {
      prompt += `\n=== AI 智能问询记录 ===\n${params.aiChatHistory}\n`;
    }

    prompt += `\n请根据以上信息，从历代名医医案中查找类似病例，并给出处方建议。`;

    return prompt;
  }

  /**
   * 解析 AI 返回的 JSON
   */
  private parseAIResponse(content: string): any {
    try {
      // 尝试直接解析 JSON
      return JSON.parse(content);
    } catch (error) {
      // 如果直接解析失败，尝试提取 JSON 代码块
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // 如果还是失败，尝试提取大括号内容
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        return JSON.parse(braceMatch[0]);
      }

      // 最后返回原始内容
      return {
        recommendedPrescription: content,
        classicCases: [],
        reasoning: '解析失败，原始内容见上方',
        warnings: [],
      };
    }
  }

  /**
   * 联网搜索中医相关信息（使用千问大模型进行智能总结）
   */
  async searchTCMInfo(params: {
    query: string; // 搜索关键词
    count?: number; // 搜索结果数量，默认 10
    searchType?: 'web' | 'web_summary' | 'image'; // 搜索类型
    summary?: boolean; // 是否需要 AI 总结，默认 true
  }): Promise<{
    query: string;
    searchResults: Array<{
      title: string;
      url: string;
      snippet: string;
      siteName: string;
      content?: string;
      publishTime?: string;
    }>;
    aiSummary?: string; // AI 智能总结
    sourceCount: number; // 结果数量
  }> {
    const count = params.count || 10;
    const searchType = params.searchType || 'web_summary';
    const needSummary = params.summary !== false;

    console.log('=== 联网搜索开始 ===');
    console.log('搜索关键词:', params.query);
    console.log('搜索类型:', searchType);
    console.log('结果数量:', count);

    try {
      // 使用联网搜索功能
      const searchResponse = await this.searchClient.webSearchWithSummary(
        params.query,
        count
      );

      console.log('搜索结果数量:', searchResponse.web_items?.length || 0);

      // 整理搜索结果
      const searchResults = searchResponse.web_items?.map(item => ({
        title: item.title || '无标题',
        url: item.url || '',
        snippet: item.snippet || item.summary || '',
        siteName: item.site_name || '未知网站',
        content: item.content,
        publishTime: item.publish_time,
      })) || [];

      let aiSummary: string | undefined;

      // 如果需要 AI 总结，使用千问大模型进行智能总结
      if (needSummary && searchResults.length > 0) {
        console.log('开始使用千问大模型进行智能总结...');

        const summaryPrompt = `你是一位中医专家。请根据以下搜索结果，对"${params.query}"这个主题进行智能总结，提取关键信息，并结合中医理论进行分析。

搜索结果（共 ${searchResults.length} 条）：
${searchResults.map((item, index) => `
${index + 1}. 标题：${item.title}
   网址：${item.url}
   来源：${item.siteName}
   摘要：${item.snippet}
${item.content ? `   内容：${item.content.substring(0, 500)}` : ''}
`).join('\n')}

请提供以下总结：
1. 核心观点概述（3-5句话）
2. 关键信息要点（3-5条）
3. 中医理论分析
4. 临床应用建议
5. 注意事项`;

        const messages = [
          { role: 'system' as const, content: '你是一位精通中医理论和临床实践的专家，擅长从海量信息中提取关键要点并进行专业分析。' },
          { role: 'user' as const, content: summaryPrompt },
        ];

        // 使用千问大模型进行总结（通过 model 参数指定）
        const llmResponse = await this.client.invoke(messages, {
          // 千问大模型（通过 SDK 配置）
          temperature: 0.3, // 降低随机性，提高总结准确性
        });

        aiSummary = llmResponse.content;
        console.log('AI 总结完成，长度:', aiSummary.length);
      }

      return {
        query: params.query,
        searchResults,
        aiSummary,
        sourceCount: searchResults.length,
      };
    } catch (error) {
      console.error('联网搜索失败:', error);
      throw new Error(`联网搜索失败：${error.message}`);
    }
  }

  /**
   * AI 智能问询 - 多轮对话
   */
  async chat(messages: Array<{ role: string; content: string }>): Promise<{
    content: string;
    role: string;
  }> {
    try {
      console.log('=== AI 智能问询 ===');
      console.log('对话轮数:', messages.length);
      console.log('最新消息:', messages[messages.length - 1]);

      console.log('Step 1: 检查环境变量');
      // 检查环境变量是否配置（支持多种环境变量名称）
      // 优先级：Render 上配置的变量名优先
      const apiKey = process.env.COZE_API_KEY || process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
      // 优先读取 Render 上配置的 COZE_API_BASE_URL，默认兜底用 api.coze.cn
      const baseUrl = process.env.COZE_API_BASE_URL
                   || process.env.COZE_INTEGRATION_BASE_URL
                   || process.env.COZE_MODEL_BASE_URL
                   || 'https://api.coze.cn';
      const modelBaseUrl = process.env.COZE_API_BASE_URL
                        || process.env.COZE_INTEGRATION_MODEL_BASE_URL
                        || process.env.COZE_MODEL_BASE_URL
                        || 'https://api.coze.cn';

      console.log('=== 环境变量检查 ===');
      console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : '未配置');
      console.log('Base URL:', baseUrl);
      console.log('Model Base URL:', modelBaseUrl);
      console.log('Config apiKey:', (this as any).client?.config?.apiKey ? '已配置' : '未配置');

      console.log('Step 2: 检查 API 密钥是否有效');
      if (!apiKey || apiKey === 'your-coze-api-key-here') {
        console.warn('⚠️ Coze API 密钥未配置，使用降级方案');
        console.warn('API Key:', apiKey ? '已配置' : '未配置');
        console.warn('Base URL:', baseUrl);
        return this.getFallbackResponse(messages);
      }

      // 🚨 Step 3: 提取已问过的问题和已收集的信息
      const askedQuestions = messages
        .filter(m => m.role === 'assistant')
        .map(m => m.content.trim());

      const userAnswers = messages
        .filter(m => m.role === 'user')
        .map(m => m.content.trim());

      // 提取原始system消息中的用户基本信息
      const originalSystemMessage = messages.find(m => m.role === 'system')?.content || '';

      console.log('=== 已问问题分析 ===');
      console.log('已问问题数量:', askedQuestions.length);
      console.log('已问问题:', askedQuestions.map((q, i) => `${i + 1}. ${q.substring(0, 50)}...`).join('\n'));
      console.log('原始系统消息长度:', originalSystemMessage.length);

      // 🚨 Step 4: 分析用户已提供的信息和缺失的关键信息
      console.log('=== 分析用户已提供的信息 ===');

      // 提取用户基本信息
      let userInfo = '';
      let hasTongueInfo = false;  // 是否有舌苔信息
      let hasPulseInfo = false;   // 是否有脉象信息
      let hasSymptomDetails = false;  // 是否有症状详细信息
      let hasTriggerInfo = false;    // 是否有诱因信息
      let hasAccompanyingSymptoms = false;  // 是否有伴随症状

      if (originalSystemMessage.includes('【用户基本信息】')) {
        const userInfoMatch = originalSystemMessage.match(/【用户基本信息】([^\n]*\n(?:[^\n]+\n)*)/);
        if (userInfoMatch) {
          userInfo = userInfoMatch[0];
        }
      }
      if (originalSystemMessage.includes('【主诉】')) {
        const chiefComplaintMatch = originalSystemMessage.match(/【主诉】([^\n]*\n)/);
        if (chiefComplaintMatch) {
          userInfo += chiefComplaintMatch[0];
          // 检查主诉中是否包含舌苔、脉象等信息
          hasTongueInfo = chiefComplaintMatch[0].includes('舌');
          hasPulseInfo = chiefComplaintMatch[0].includes('脉');
          hasSymptomDetails = chiefComplaintMatch[0].length > 20;
        }
      }
      if (originalSystemMessage.includes('【既往史】')) {
        const pastHistoryMatch = originalSystemMessage.match(/【既往史】([^\n]*\n)/);
        if (pastHistoryMatch) {
          userInfo += pastHistoryMatch[0];
        }
      }

      // 分析用户的回答中是否包含关键信息
      const allText = userAnswers.join(' ');
      hasTongueInfo = hasTongueInfo || allText.includes('舌');
      hasPulseInfo = hasPulseInfo || allText.includes('脉');
      hasTriggerInfo = allText.includes('因为') || allText.includes('导致') || allText.includes('诱因');
      hasAccompanyingSymptoms = allText.includes('发热') || allText.includes('汗出') || allText.includes('口渴') || allText.includes('口苦') || allText.includes('二便') || allText.includes('睡眠') || allText.includes('食欲');

      // 构建缺失信息列表
      const missingInfo: string[] = [];
      if (!hasTongueInfo) missingInfo.push('舌苔（舌质颜色、舌苔情况）');
      if (!hasPulseInfo) missingInfo.push('脉象（脉象特征）');
      if (!hasTriggerInfo) missingInfo.push('诱因（起因、加重/缓解因素）');
      if (!hasAccompanyingSymptoms) missingInfo.push('伴随症状（发热、汗出、口渴、口苦、二便、睡眠、食欲等）');

      console.log('缺失信息:', missingInfo);

      // 🚨 Step 5: 构建增强的系统提示，包含针对性问询建议
      const enhancedSystemMessage = `你是一位经验丰富的中医专家，负责通过问询收集患者的症状信息。

${userInfo}

⚠️⚠️⚠️ 【最高优先级规则 - 绝对禁止重复问询】 ⚠️⚠️⚠️

你已经问过以下问题（绝对禁止重复）：
${askedQuestions.map((q, i) => `🚫 ${i + 1}. ${q}`).join('\n')}

用户已经回答了以下内容（绝对不要再问）：
${userAnswers.map((a, i) => `✅ ${i + 1}. ${a}`).join('\n')}

⚠️⚠️⚠️ 【重要提醒】 ⚠️⚠️⚠️
- 先查看上面"已经问过的问题列表"，绝对不要重复
- 先查看上面"用户已经回答的内容"，绝对不要重复问这些内容
- 每次提问前，先确认这个问题没有问过
- 如果所有关键信息都已收集，请直接说："信息已收集完毕，可以进入下一步"

✅ 【问询要求】
- 每次只问一个关键问题
- 用口语化的方式提问
- 根据用户的回答调整下一个问题

【⚠️ 缺失的关键信息 ⚠️】（请优先询问）：
${missingInfo.length > 0 ? missingInfo.map((info, i) => `${i + 1}. ${info}`).join('\n') : '暂无明显缺失信息'}

【🎯 智能问询策略】：
- ${!hasTongueInfo ? '第1优先：询问舌苔和脉象（对辨证非常重要）' : '✅ 已有舌苔脉象信息'}
- ${!hasTriggerInfo ? '第2优先：询问发病诱因（受凉、劳累、情志、饮食等）' : '✅ 已有诱因信息'}
- ${!hasAccompanyingSymptoms ? '第3优先：询问伴随症状（发热、汗出、二便、睡眠、食欲等）' : '✅ 已有伴随症状信息'}

【问询目标】：
收集以下关键信息中的至少3类：
1. 症状特点（性质、程度、部位、时间等）
2. 病史诱因（起因、加重/缓解因素等）
3. 伴随症状（发热、出汗、食欲、睡眠、二便等）
4. 舌象脉象（如果方便的话）
5. 既往病史（类似症状、检查治疗等）
6. 生活习惯（饮食、作息、工作等）

【结束条件】（满足任一条件即可结束）：
1. 已问了至少 3 个问题，且收集了症状特点、诱因、伴随症状中的至少两类信息
2. 用户明确表示没有更多信息或无法提供更多信息
3. 已问了 10 个问题（达到上限）

【结束方式】：
当满足结束条件时，请明确说明："信息已收集完毕，可以进入下一步"

【🚨 再次提醒】：
- 先查看【已问过的问题列表】，绝对不要重复
- 先查看【用户已回答的信息】，绝对不要重复问这些内容
- 先查看【缺失的关键信息】，优先询问缺失的信息
- 如果用户已经提供了足够的信息，即使没有问满 3 个问题，也可以结束`;

      console.log('Step 5: 构建增强的消息列表');
      // 构建增强的消息列表，使用增强的系统提示
      const enhancedMessages = [
        { role: 'system' as const, content: enhancedSystemMessage },
        ...messages.slice(1) // 保留原始消息，但移除第一个系统消息（会被增强系统提示替换）
      ];

      console.log('Step 6: 转换消息格式');
      // 转换为 LLM Message 格式（role 类型断言）
      const llmMessages = enhancedMessages.map(msg => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content
      }))

      console.log('=== 开始调用 LLM ===');
      console.log('Message count:', llmMessages.length);
      console.log('CustomHeaders:', Object.keys(this.customHeaders).join(', '));

      console.log('Step 7: 创建带有 customHeaders 的 LLM 客户端');

      // 使用 createConfig 创建配置（API Key 已清空，通过 Header 传递）
      const config = createConfig();

      // 获取认证 Headers 并合并 customHeaders
      const authHeaders = getAuthHeaders();
      const mergedHeaders = { ...authHeaders, ...this.customHeaders };

      console.log('【关键修复】Authorization Header 已合并:', authHeaders['Authorization'] ? `${authHeaders['Authorization'].substring(0, 20)}...` : '空');

      // 创建带有 mergedHeaders 的客户端
      const clientWithHeaders = new LLMClient(config, mergedHeaders);
      console.log('LLM 客户端创建成功（带 mergedHeaders）');

      console.log('Step 8: 调用 LLM API');
      // 调用 LLM 进行对话（指定模型）
      const response = await clientWithHeaders.invoke(llmMessages, {
        model: 'doubao-seed-2-0-lite-260215',
        temperature: 0.7,
      });

      console.log('AI 回复长度:', response.content.length);
      console.log('AI 回复内容:', response.content);

      // 🚨🚨 Step 9: 智能重复检测（增强版）
      // 检测方式：
      // 1. 完全相同
      // 2. 包含关系（问题包含在已问问题中）
      // 3. 语义相似度（使用关键词和意图分析）
      // 4. 问询类型重复（不要重复问同一类型的问题）
      const newQuestion = response.content.trim();

      console.log('=== 智能重复检测开始 ===');
      console.log('新问题:', newQuestion);
      console.log('新问题长度:', newQuestion.length);
      console.log('已问问题数量:', askedQuestions.length);
      console.log('已问问题:', askedQuestions.map((q, i) => `${i + 1}. "${q}" (${q.length}字符)`).join('\n'));

      // 提取用户已回答的信息（用于语义分析）
      const answeredInfo = userAnswers.join(' ');
      console.log('用户已回答信息长度:', answeredInfo.length);
      console.log('用户已回答信息预览:', answeredInfo.substring(0, 100));

      // 定义问询类型和检测规则
      const questionPatterns = [
        { pattern: /哪里|部位|位置|疼痛点/, type: '部位', keywords: ['哪里', '部位', '位置', '痛', '疼'] },
        { pattern: /什么感觉|怎么|感觉如何|程度/, type: '感觉', keywords: ['感觉', '怎么样', '如何', '程度'] },
        { pattern: /什么时候|多久|时间|频率|持续/, type: '时间', keywords: ['什么时候', '多久', '时间', '频率', '持续'] },
        { pattern: /为什么|原因|诱发|导致|引起/, type: '原因', keywords: ['为什么', '原因', '诱发', '导致', '引起'] },
        { pattern: /有没有|是否|伴随|其他|还/, type: '伴随', keywords: ['有没有', '是否', '伴随', '其他', '还'] },
        { pattern: /舌|舌苔|舌质|舌象/, type: '舌苔', keywords: ['舌', '舌苔', '舌质'] },
        { pattern: /脉|脉象|脉搏/, type: '脉象', keywords: ['脉', '脉象', '脉搏'] },
        { pattern: /既往|以前|曾经|历史/, type: '既往史', keywords: ['既往', '以前', '曾经', '历史'] },
        { pattern: /饮食|吃饭|胃口|食欲/, type: '饮食', keywords: ['饮食', '吃饭', '胃口', '食欲'] },
        { pattern: /睡眠|睡觉|休息|失眠/, type: '睡眠', keywords: ['睡眠', '睡觉', '休息', '失眠'] },
        { pattern: /二便|大小便|排便/, type: '二便', keywords: ['二便', '大小便', '排便'] },
      ];

      // 分析新问题的类型
      const newQuestionTypes = questionPatterns.filter(p => p.pattern.test(newQuestion)).map(p => p.type);
      console.log('新问题类型:', newQuestionTypes);

      // 分析已问问题的类型
      const askedQuestionTypes: { question: string; types: string[] }[] = askedQuestions.map(q => {
        const types = questionPatterns.filter(p => p.pattern.test(q)).map(p => p.type);
        return { question: q, types };
      });
      console.log('已问问题类型分析:', askedQuestionTypes);

      // 方法1：完全匹配
      const isExactDuplicate = askedQuestions.some(q => q === newQuestion);

      // 方法2：包含关系（新问题包含在已问问题中，或已问问题包含在新问题中）
      const isContainedDuplicate = askedQuestions.some(q => {
        // 如果两个问题都较短且高度相似
        if (q.length < 30 && newQuestion.length < 30) {
          return q === newQuestion || q.includes(newQuestion) || newQuestion.includes(q);
        }
        return false;
      });

      // 方法3：问询类型重复（核心优化）
      let isTypeDuplicate = false;
      let duplicateType = '';

      for (const newType of newQuestionTypes) {
        // 检查是否已经问过相同类型的问题
        const hasAskedSameType = askedQuestionTypes.some(asked => asked.types.includes(newType));

        // 检查用户是否已经回答了该类型的信息
        let hasAnsweredThisType = false;
        if (newType === '舌苔') hasAnsweredThisType = answeredInfo.includes('舌');
        if (newType === '脉象') hasAnsweredThisType = answeredInfo.includes('脉');
        if (newType === '原因') hasAnsweredThisType = answeredInfo.includes('因为') || answeredInfo.includes('由于') || answeredInfo.includes('导致');
        if (newType === '伴随') hasAnsweredThisType = answeredInfo.includes('发热') || answeredInfo.includes('汗出') || answeredInfo.includes('口渴');
        if (newType === '饮食') hasAnsweredThisType = answeredInfo.includes('饮食') || answeredInfo.includes('胃口');
        if (newType === '睡眠') hasAnsweredThisType = answeredInfo.includes('睡眠') || answeredInfo.includes('睡觉');
        if (newType === '二便') hasAnsweredThisType = answeredInfo.includes('便') || answeredInfo.includes('尿');

        // 如果已经问过且用户已回答，则为重复
        if (hasAskedSameType && hasAnsweredThisType) {
          isTypeDuplicate = true;
          duplicateType = newType;
          console.log(`✅ 检测到类型重复: ${newType}`);
          console.log(`  已问过相同类型的问题: ${askedQuestionTypes.filter(a => a.types.includes(newType)).map(a => a.question).join(', ')}`);
          console.log(`  用户已回答: ${hasAnsweredThisType ? '是' : '否'}`);
          break;
        }
      }

      // 方法4：语义相似度检测（使用关键问题词）
      const getQuestionKeywords = (question: string): string[] => {
        const patterns = [
          /哪里|部位|位置/, // 部位
          /什么感觉|怎么|感觉/, // 感觉
          /什么时候|多久|时间/, // 时间
          /为什么|原因/, // 原因
          /有没有|是否|伴随/, // 伴随
          /舌|舌苔/, // 舌苔
          /脉|脉象/, // 脉象
          /饮食|吃饭/, // 饮食
          /睡眠|睡觉/, // 睡眠
          /二便|大小便/, // 二便
        ];
        const keywords: string[] = [];
        patterns.forEach(p => {
          if (p.test(question)) {
            const matches = question.match(p);
            if (matches) keywords.push(...matches);
          }
        });
        return keywords;
      };

      const newKeywords = getQuestionKeywords(newQuestion);
      const isSimilarDuplicate = askedQuestions.some(q => {
        const existingKeywords = getQuestionKeywords(q);
        const commonKeywords = newKeywords.filter(kw => existingKeywords.includes(kw));
        // 如果有 2 个以上相同的关键词，认为是相似问题
        return commonKeywords.length >= 2;
      });

      const isDuplicate = isExactDuplicate || isContainedDuplicate || isTypeDuplicate || isSimilarDuplicate;

      if (isDuplicate) {
        console.warn('⚠️⚠️⚠️ 检测到重复问询');
        console.warn('新问题:', newQuestion);
        console.warn('重复类型:', {
          exact: isExactDuplicate,
          contained: isContainedDuplicate,
          type: isTypeDuplicate,
          typeDetail: duplicateType,
          similar: isSimilarDuplicate,
        });

        // 返回更有针对性的降级响应
        console.warn('返回智能降级响应');
        return this.getSmartFallbackResponse(messages, askedQuestionTypes, answeredInfo);
      }

      console.log('✅ 通过重复检测');
      return {
        content: response.content,
        role: 'assistant',
      };
    } catch (error) {
      console.error('=== AI 智能问询失败 ===');
      console.error('错误详情:', error);
      console.warn('⚠️ 使用降级方案返回默认问题');

      // 返回降级响应
      return this.getFallbackResponse(messages);
    }
  }

  /**
   * 降级响应 - 当 AI 服务不可用时返回预设的默认问题
   */
  private getFallbackResponse(messages: Array<{ role: string; content: string }>): {
    content: string;
    role: string;
  } {
    // 获取最新一条用户消息
    const lastMessage = messages[messages.length - 1];

    // 根据对话轮数返回不同的预设问题
    const questionCount = messages.filter(m => m.role === 'user').length;

    const fallbackQuestions = [
      '请问您的主要不适症状是什么？这种症状持续多长时间了？',
      '请问您的症状是持续性还是间歇性的？有没有诱因或加重缓解因素？',
      '请问您还有其他伴随症状吗？如发热、出汗、食欲、睡眠、大小便等情况如何？',
      '请问您的舌苔和脉象是怎样的？（如果方便的话可以拍照或描述）',
      '请问您以前有过类似的症状吗？有没有做过相关检查或治疗？',
      '请问您平时的饮食、作息、工作情况如何？有没有特别的饮食习惯或生活习惯？',
    ];

    // 根据轮数返回对应的问题
    const questionIndex = Math.min(questionCount - 1, fallbackQuestions.length - 1);

    return {
      content: fallbackQuestions[questionIndex] || '请问还有什么需要补充的信息吗？',
      role: 'assistant',
    };
  }

  /**
   * 智能降级响应 - 根据已问问题和已回答信息，生成更有针对性的问题
   */
  private getSmartFallbackResponse(
    messages: Array<{ role: string; content: string }>,
    askedQuestionTypes: { question: string; types: string[] }[],
    answeredInfo: string
  ): {
    content: string;
    role: string;
  } {
    const askedTypes = askedQuestionTypes.flatMap(a => a.types);
    console.log('已问问题类型:', askedTypes);

    // 定义问询优先级
    const questionPriority = [
      { type: '部位', question: '请问您的症状具体在哪个部位？' },
      { type: '感觉', question: '请问您是什么感觉？比如疼痛、胀满、麻木等？' },
      { type: '时间', question: '请问这个症状持续多长时间了？是持续的还是间歇性的？' },
      { type: '原因', question: '请问有没有什么诱因？比如受凉、劳累、情绪波动等？' },
      { type: '伴随', question: '请问您还有其他不适吗？比如发热、出汗、口渴等？' },
      { type: '舌苔', question: '请问您的舌苔是什么样的？（比如：舌质红、舌苔黄腻等）' },
      { type: '脉象', question: '请问您的脉象是怎样的？（比如：脉数、脉细等）' },
      { type: '饮食', question: '请问您最近饮食如何？胃口怎么样？' },
      { type: '睡眠', question: '请问您最近睡眠如何？有没有失眠或多梦？' },
      { type: '二便', question: '请问您最近大小便情况如何？' },
      { type: '既往史', question: '请问您以前有过类似的症状吗？' },
    ];

    // 找出还没有问过的问题类型
    const missingTypes = questionPriority.filter(qp => !askedTypes.includes(qp.type));

    console.log('缺失的问题类型:', missingTypes.map(qp => qp.type));

    if (missingTypes.length > 0) {
      // 返回第一个缺失的问题
      return {
        content: missingTypes[0].question,
        role: 'assistant',
      };
    } else {
      // 所有类型都问过了，检查是否所有关键信息都已收集
      const hasCriticalInfo = answeredInfo.includes('因为') || answeredInfo.includes('由于');
      const hasSymptoms = answeredInfo.length > 50;

      if (hasCriticalInfo && hasSymptoms) {
        return {
          content: '信息已收集完毕，可以进入下一步。',
          role: 'assistant',
        };
      } else {
        return {
          content: '请问还有什么需要补充的信息吗？',
          role: 'assistant',
        };
      }
    }
  }

  /**
   * 检查用户是否为孕妇
   */
  private checkIfPregnant(params: any): boolean {
    const text = `${params.chiefComplaint} ${params.history || ''} ${params.pastHistory || ''} ${params.diagnosis || ''}`;
    const pregnantKeywords = ['孕', '怀孕', '妊娠', '孕期', '胎儿', '保胎', '胎动'];
    return pregnantKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 检查用户是否为儿童
   */
  private checkIfChild(age?: number): boolean {
    if (!age) return false;
    return age <= 14; // 14岁以下为儿童
  }

  /**
   * 检查用户是否为高危重病
   */
  private checkIfCriticalIllness(chiefComplaint: string, history?: string, pastHistory?: string): boolean {
    const text = `${chiefComplaint} ${history || ''} ${pastHistory || ''}`;

    // 高危重病关键词
    const criticalKeywords = [
      // 心血管
      '心肌梗死', '心梗', '心力衰竭', '心衰', '心源性休克', '心律失常', '室颤', '房颤',
      '高血压危象', '主动脉夹层',
      // 脑血管
      '脑梗死', '脑梗', '脑出血', '脑溢血', '蛛网膜下腔出血', '脑疝', '中风', '卒中',
      // 呼吸系统
      '呼吸衰竭', '呼衰', '肺栓塞', '急性呼吸窘迫综合征', 'ARDS',
      // 肝肾
      '肝衰竭', '肾衰竭', '尿毒症', '肝肾综合征',
      // 消化
      '消化道出血', '上消化道出血', '急性胰腺炎', '重症胰腺炎',
      // 肿瘤
      '恶性肿瘤', '癌症', '肿瘤转移',
      // 代谢
      '糖尿病酮症酸中毒', '糖尿病高渗昏迷', '低血糖昏迷',
      // 感染
      '脓毒症', '败血症', '感染性休克', '重症肺炎',
      // 其他
      '多器官功能衰竭', 'MODS', '休克', '昏迷', '重症', '危重'
    ];

    return criticalKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 检查用户权限是否过期
   * @param userId 用户ID
   * @returns 是否过期
   */
  private async checkUserPermissionExpired(userId: string): Promise<boolean> {
    try {
      const { data: permissions } = await this.supabase
        .from('user_permissions')
        .select('expires_at, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!permissions) {
        // 没有权限记录，视为过期
        return true;
      }

      if (!permissions.expires_at) {
        // 没有过期时间，视为永不过期（管理员账户）
        return false;
      }

      // 检查是否过期
      const now = new Date();
      const expiresAt = new Date(permissions.expires_at);
      return expiresAt < now;
    } catch (error) {
      console.error('检查用户权限失败:', error);
      // 查询失败时，为了安全起见，视为过期
      return true;
    }
  }

  /**
   * 上传附件到对象存储
   * @param file 上传的文件
   * @returns 文件 URL 和 Key
   */
  async uploadAttachment(file: Express.Multer.File): Promise<{
    url: string;
    key: string;
    fileName: string;
  }> {
    try {
      console.log('=== 开始上传附件到对象存储 ===');

      // 上传文件到对象存储
      const fileKey = await this.storage.uploadFile({
        fileContent: file.buffer,
        fileName: `medical-attachments/${Date.now()}_${file.originalname}`,
        contentType: file.mimetype,
      });

      console.log('文件上传成功, Key:', fileKey);

      // 生成签名 URL
      const fileUrl = await this.storage.generatePresignedUrl({
        key: fileKey,
        expireTime: 86400, // 24 小时有效期
      });

      console.log('文件 URL 生成成功:', fileUrl);

      return {
        url: fileUrl,
        key: fileKey,
        fileName: file.originalname,
      };
    } catch (error) {
      console.error('上传附件失败:', error);
      throw new Error(`上传附件失败：${error.message}`);
    }
  }

  /**
   * 分析附件内容（调用大模型识图）
   * @param imageUrl 图片 URL
   * @returns 提取的信息
   */
  async analyzeAttachment(imageUrl: string): Promise<{
    extractedInfo: string;
    summary: string;
  }> {
    try {
      console.log('=== 开始分析附件内容 ===');
      console.log('图片 URL:', imageUrl);

      const systemPrompt = `你是一位专业的医疗文档分析师，擅长识别和分析医疗相关文档，包括：

1. 化验单（血常规、肝肾功能、血糖、血脂等）
2. CT/MRI 报告
3. 处方笺（中医处方、西药处方）
4. 病历记录
5. 检查报告

你的任务是：
1. 准确识别文档类型
2. 提取关键医疗信息（如诊断结果、异常指标、用药信息等）
3. 提取有价值的历史数据（如既往病史、过敏史、手术史等）
4. 标注异常数值和重要发现
5. 提供简洁的总结

**输出格式要求为 JSON，包含以下字段**：
- extractedInfo: 详细提取的医疗信息，包括：
  - 文档类型（如：血常规化验单、CT报告、处方笺等）
  - 关键数据（如：白细胞计数、血红蛋白、诊断结果等）
  - 异常指标及数值（如有）
  - 用药信息（如处方笺）
  - 其他重要发现
- summary: 简洁总结（3-5句话），概括文档的核心内容和发现

**注意事项**：
- 如果图片不清晰或无法识别，请明确说明
- 对于数值类数据，尽量提取具体数值和单位
- 重点关注异常指标和诊断结论
- 对于处方，提取方名、组成、用量、用法等关键信息`;

      const userPrompt = `请分析以下医疗文档图片，提取关键信息：

图片 URL: ${imageUrl}

请提取所有有价值的医疗信息，包括诊断结果、异常指标、用药信息等。`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt },
      ];

      console.log('调用大模型进行图片分析...');

      // 调用大模型进行识图（支持图片 URL）
      const response = await this.client.invoke(messages, {
        temperature: 0.3, // 降低随机性，提高准确性
      });

      console.log('图片分析完成，响应长度:', response.content.length);

      // 解析 AI 返回的 JSON
      const result = this.parseAIResponse(response.content);

      return {
        extractedInfo: result.extractedInfo || '未提取到有效信息',
        summary: result.summary || '',
      };
    } catch (error) {
      console.error('分析附件失败:', error);
      throw new Error(`分析附件失败：${error.message}`);
    }
  }
}
