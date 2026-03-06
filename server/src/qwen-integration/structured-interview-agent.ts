/**
 * 数字张仲景 - 结构化问询代理
 * Qwen 作为六经辨证决策树的自然语言前端
 */

// 临时类型定义，避免编译错误
// import { SYMPTOM_NODES } from '../tcm-knowledge/syndrome-pattern-db';
const SYMPTOM_NODES: any[] = [];

// ============================================
// 类型定义
// ============================================
export interface StructuredQuestion {
  id: string;
  category: '主证' | '兼证' | '舌象' | '脉象' | '病史' | '结束';
  symptomId: string;
  symptomName: string;
  options: string[]; // 结构化选项
  naturalLanguage: string; // Qwen 生成的自然语言
  priority: number; // 优先级（1-10）
  dependencies?: string[]; // 依赖的问题ID
  reasoning: string; // 提问理由
}

export interface InterviewContext {
  userId: string;
  sessionId: string;
  currentStep: number;
  collectedSymptoms: string[];
  questionsAsked: string[];
  answers: Map<string, string>;
  diagnosisPath: {
    currentSyndromes: string[]; // 当前可能的证候
    confirmedSyndromes: string[]; // 已确认的证候
    ruledOutSyndromes: string[]; // 已排除的证候
  };
  userDemographics: {
    age?: number;
    gender?: '男' | '女';
    occupation?: string;
    isPregnant?: boolean;
  };
}

export interface InterviewResponse {
  question: StructuredQuestion;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  possibleDiagnosis: string[]; // 当前可能的诊断
  nextSteps: string[]; // 后续可能的问题
  shouldTerminate: boolean; // 是否应该终止问诊
  earlyDiagnosis?: { // 提前诊断（如果症状足够典型）
    syndrome: string;
    formula: string;
    confidence: number;
  };
}

// ============================================
// 六经辨证决策树
// ============================================
export class SixMeridianDecisionTree {
  /**
   * 获取下一个需要确认的症状
   */
  static getNextSymptom(context: InterviewContext): StructuredQuestion | null {
    const { currentSyndromes, confirmedSyndromes, ruledOutSyndromes } = context.diagnosisPath;

    // 如果已经确认了证候，询问兼证
    if (confirmedSyndromes.length > 0) {
      return this.getSecondarySymptomQuestion(confirmedSyndromes[0], context);
    }

    // 如果可能证候只剩1个，确认关键症状
    if (currentSyndromes.length === 1) {
      return this.getConfirmatoryQuestion(currentSyndromes[0], context);
    }

    // 如果可能证候还很多，使用鉴别症状进行区分
    if (currentSyndromes.length > 1) {
      return this.getDifferentialSymptomQuestion(currentSyndromes, context);
    }

    // 初始阶段，询问第一主证
    return this.getInitialQuestion(context);
  }

  /**
   * 获取初始问题
   */
  private static getInitialQuestion(context: InterviewContext): StructuredQuestion {
    // 优先询问发热
    return {
      id: 'q_fever',
      category: '主证',
      symptomId: 'fever',
      symptomName: '发热',
      options: ['发热（体温 > 37.3℃）', '不发热', '不清楚'],
      naturalLanguage: '请先告诉我，您现在感觉身体发热吗？体温大概是多少度？',
      priority: 10,
      reasoning: '发热是六经辨证的第一步，用于判断表里寒热',
    };
  }

  /**
   * 获取鉴别症状问题
   */
  private static getDifferentialSymptomQuestion(
    possibleSyndromes: string[],
    context: InterviewContext
  ): StructuredQuestion | null {
    // 查找能够区分这些证候的症状
    const symptomWeights = new Map<string, number>();

    for (const syndrome of possibleSyndromes) {
      const syndromeData = this.getSyndromeData(syndrome);
      if (!syndromeData) continue;

      for (const symptomWeight of syndromeData.keySymptoms) {
        const currentWeight = symptomWeights.get(symptomWeight.symptomId) || 0;
        symptomWeights.set(symptomWeight.symptomId, currentWeight + symptomWeight.weight);
      }
    }

    // 找出权重最高的未询问症状
    for (const [symptomId, weight] of Array.from(symptomWeights.entries()).sort(
      (a, b) => b[1] - a[1]
    )) {
      if (!context.questionsAsked.includes(symptomId)) {
        const symptomNode = SYMPTOM_NODES[symptomId];
        if (!symptomNode) continue;

        return {
          id: `q_${symptomId}`,
          category: '主证',
          symptomId,
          symptomName: symptomNode.name,
          options: this.generateOptionsForSymptom(symptomNode),
          naturalLanguage: this.generateNaturalLanguageForSymptom(symptomNode),
          priority: 9 - context.currentStep,
          reasoning: `用于区分 ${possibleSyndromes.join('、')} 等证候`,
        };
      }
    }

    return null;
  }

  /**
   * 获取确认性问题
   */
  private static getConfirmatoryQuestion(
    syndrome: string,
    context: InterviewContext
  ): StructuredQuestion | null {
    const syndromeData = this.getSyndromeData(syndrome);
    if (!syndromeData) return null;

    // 找出已确认的主证中权重最高的未询问症状
    const unaskedKeySymptoms = syndromeData.keySymptoms.filter(
      s => !context.questionsAsked.includes(s.symptomId)
    );

    if (unaskedKeySymptoms.length === 0) {
      return null; // 所有关键症状已询问完毕
    }

    const topSymptom = unaskedKeySymptoms[0];
    const symptomNode = SYMPTOM_NODES[topSymptom.symptomId];
    if (!symptomNode) return null;

    return {
      id: `q_${topSymptom.symptomId}`,
      category: '主证',
      symptomId: topSymptom.symptomId,
      symptomName: topSymptom.symptomName,
      options: this.generateOptionsForSymptom(symptomNode),
      naturalLanguage: this.generateNaturalLanguageForSymptom(symptomNode, syndrome),
      priority: 10 - context.currentStep,
      reasoning: `确认 ${syndrome} 的关键症状`,
    };
  }

  /**
   * 获取兼证问题
   */
  private static getSecondarySymptomQuestion(
    syndrome: string,
    context: InterviewContext
  ): StructuredQuestion | null {
    const syndromeData = this.getSyndromeData(syndrome);
    if (!syndromeData) return null;

    // 找出未询问的兼证
    const unaskedOptionalSymptoms = syndromeData.optionalSymptoms.filter(
      s => !context.questionsAsked.includes(s.symptomId)
    );

    if (unaskedOptionalSymptoms.length === 0) {
      // 兼证问完了，询问舌象、脉象
      if (!context.questionsAsked.includes('tongue')) {
        return this.getTongueQuestion();
      }
      if (!context.questionsAsked.includes('pulse')) {
        return this.getPulseQuestion();
      }
      return null; // 所有问题都问完了
    }

    const topSymptom = unaskedOptionalSymptoms[0];
    const symptomNode = SYMPTOM_NODES[topSymptom.symptomId];
    if (!symptomNode) return null;

    return {
      id: `q_${topSymptom.symptomId}`,
      category: '兼证',
      symptomId: topSymptom.symptomId,
      symptomName: topSymptom.symptomName,
      options: this.generateOptionsForSymptom(symptomNode),
      naturalLanguage: this.generateNaturalLanguageForSymptom(symptomNode, syndrome),
      priority: 5,
      reasoning: `询问 ${syndrome} 的兼证`,
    };
  }

  /**
   * 生成症状的自然语言问题
   */
  private static generateNaturalLanguageForSymptom(
    symptomNode: any,
    currentSyndrome?: string
  ): string {
    const symptomName = symptomNode.name;

    // 使用 Qwen 生成自然语言
    const prompt = `你是一位严谨的经方医师，请用生活化语言询问患者关于"${symptomName}"的症状，每次只问1个关键问题，避免医学术语。

症状：${symptomName}
同义词：${symptomNode.synonyms.join('、')}
${currentSyndrome ? `当前怀疑证候：${currentSyndrome}` : ''}

请生成一个自然、亲切的问法，格式：
"..."（直接输出问法，不要其他内容）`;

    // 这里应该调用 Qwen API，暂时返回模拟结果
    const naturalLanguageMap: Record<string, string> = {
      发热: '您现在感觉身体发热吗？体温大概是多少度？',
      汗出: '您这发热的时候，身上是干的？还是微微出汗？或是大汗淋漓、衣服都湿透了？',
      恶寒: '您有没有觉得怕冷？是穿很多衣服还觉得冷，还是只是稍微有点冷？',
      头痛: '头有没有感觉疼？是整个头都疼，还是太阳穴、后脑勺这些地方疼？',
      口苦: '嘴里有没有发苦的感觉？尤其是早上起床的时候？',
      咽干: '嗓子干不干？是不是觉得嗓子冒烟，想喝水？',
      胸胁胀满: '胸口和两肋有没有觉得胀满、不舒服？',
      不欲饮食: '现在胃口怎么样？想不想吃东西？',
      心烦喜呕: '有没有觉得心里烦躁？或者想吐、恶心？',
      腹泻: '大便怎么样？是稀水样的大便，还是成型的大便？每天几次？',
      便秘: '最近几天大便怎么样？是不是好几天没大便了？大便干不干？',
      畏寒肢冷: '手脚是不是觉得冰凉？是不是怕冷，穿很多衣服还觉得冷？',
      心悸: '心跳有没有觉得快、或者心里发慌？',
      胸闷: '胸口有没有觉得闷，好像有块石头压着？',
    };

    return naturalLanguageMap[symptomName] || `您有没有觉得${symptomName}？`;
  }

  /**
   * 生成症状选项
   */
  private static generateOptionsForSymptom(symptomNode: any): string[] {
    const symptomName = symptomNode.name;

    const optionsMap: Record<string, string[]> = {
      发热: ['发热（体温 > 37.3℃）', '不发热', '不清楚'],
      汗出: ['有汗（微微出汗）', '大汗淋漓', '无汗', '不清楚'],
      恶寒: ['怕冷（穿很多衣服还觉得冷）', '稍微有点冷', '不怕冷', '不清楚'],
      头痛: ['头痛', '头昏', '不痛', '不清楚'],
      口苦: ['口苦', '不口苦', '不清楚'],
      咽干: ['咽干（嗓子冒烟）', '不干', '不清楚'],
      胸胁胀满: ['胸胁胀满', '胸闷', '无不舒适', '不清楚'],
      不欲饮食: ['不想吃东西', '胃口一般', '胃口很好', '不清楚'],
      心烦喜呕: ['心烦、恶心', '只是心烦', '只是恶心', '无不舒适', '不清楚'],
      腹泻: ['腹泻（稀水样）', '大便稀', '大便正常', '便秘', '不清楚'],
      便秘: ['便秘（好几天没大便）', '大便干', '大便正常', '腹泻', '不清楚'],
      畏寒肢冷: ['手脚冰凉，怕冷', '稍微有点凉', '不冷', '不清楚'],
      心悸: ['心悸（心跳快、心里发慌）', '偶尔心慌', '不心慌', '不清楚'],
      胸闷: ['胸闷（胸口闷，像有石头压着）', '稍微有点闷', '不闷', '不清楚'],
    };

    return optionsMap[symptomName] || ['有', '没有', '不清楚'];
  }

  /**
   * 获取舌象问题
   */
  private static getTongueQuestion(): StructuredQuestion {
    return {
      id: 'q_tongue',
      category: '舌象',
      symptomId: 'tongue',
      symptomName: '舌象',
      options: ['舌淡红，苔薄白', '舌红，苔黄', '舌淡胖，苔白腻', '舌紫暗，有瘀斑', '不清楚'],
      naturalLanguage: '请问您照镜子看看，舌头是什么颜色的？舌苔厚不厚？是白的还是黄的？',
      priority: 8,
      reasoning: '舌象是辨证的重要依据',
    };
  }

  /**
   * 获取脉象问题
   */
  private static getPulseQuestion(): StructuredQuestion {
    return {
      id: 'q_pulse',
      category: '脉象',
      symptomId: 'pulse',
      symptomName: '脉象',
      options: ['脉浮（轻取即得）', '脉沉（重按始得）', '脉数（一息五至以上）', '脉缓（一息四至）', '不清楚'],
      naturalLanguage: '请摸摸手腕桡动脉，脉搏感觉怎么样？是浮在表面还是沉在里面？跳得快还是慢？',
      priority: 8,
      reasoning: '脉象是辨证的重要依据',
    };
  }

  /**
   * 更新诊断路径
   */
  static updateDiagnosisPath(context: InterviewContext, answer: string): void {
    const symptoms = context.collectedSymptoms;
    const probabilities = SyndromePatternQuery.calculateSyndromeProbability(symptoms);

    // 更新当前可能的证候（概率 > 0.3）
    context.diagnosisPath.currentSyndromes = probabilities
      .filter(p => p.probability > 0.3)
      .map(p => p.syndrome.id);

    // 更新已确认的证候（概率 > 0.8）
    context.diagnosisPath.confirmedSyndromes = probabilities
      .filter(p => p.probability > 0.8)
      .map(p => p.syndrome.id);

    // 更新已排除的证候（概率 < 0.1）
    context.diagnosisPath.ruledOutSyndromes = probabilities
      .filter(p => p.probability < 0.1)
      .map(p => p.syndrome.id);
  }

  /**
   * 检查是否应该终止问诊
   */
  static shouldTerminate(context: InterviewContext): {
    shouldTerminate: boolean;
    earlyDiagnosis?: {
      syndrome: string;
      formula: string;
      confidence: number;
    };
  } {
    // 如果已确认的证候置信度 > 0.85，可以提前诊断
    if (context.diagnosisPath.confirmedSyndromes.length === 1) {
      const syndromeId = context.diagnosisPath.confirmedSyndromes[0];
      const syndromeData = this.getSyndromeData(syndromeId);
      if (syndromeData) {
        const formulaId = syndromeData.relatedFormulas[0];
        return {
          shouldTerminate: true,
          earlyDiagnosis: {
            syndrome: syndromeData.name,
            formula: formulaId,
            confidence: 0.85,
          },
        };
      }
    }

    // 如果已经问了10个问题，强制终止
    if (context.currentStep >= 10) {
      return { shouldTerminate: true };
    }

    // 如果没有更多问题可问，终止
    const nextQuestion = this.getNextSymptom(context);
    if (!nextQuestion) {
      return { shouldTerminate: true };
    }

    return { shouldTerminate: false };
  }

  /**
   * 获取证候数据
   */
  private static getSyndromeData(syndromeId: string): any {
    // 这里应该从数据库或文件中获取证候数据
    // 暂时返回空对象
    return {};
  }
}

// ============================================
// 结构化问询代理（主代理）
// ============================================
export class StructuredInterviewAgent {
  /**
   * 开始问诊
   */
  static async startInterview(userId: string): Promise<InterviewResponse> {
    const context: InterviewContext = {
      userId,
      sessionId: this.generateSessionId(),
      currentStep: 0,
      collectedSymptoms: [],
      questionsAsked: [],
      answers: new Map(),
      diagnosisPath: {
        currentSyndromes: [],
        confirmedSyndromes: [],
        ruledOutSyndromes: [],
      },
      userDemographics: {},
    };

    // 获取第一个问题
    const question = SixMeridianDecisionTree.getNextSymptom(context);

    if (!question) {
      throw new Error('无法生成问题');
    }

    return {
      question,
      progress: {
        current: 1,
        total: 10,
        percentage: 10,
      },
      possibleDiagnosis: context.diagnosisPath.currentSyndromes,
      nextSteps: ['等待用户回答'],
      shouldTerminate: false,
    };
  }

  /**
   * 继续问诊
   */
  static async continueInterview(
    sessionId: string,
    answer: string,
    questionId: string
  ): Promise<InterviewResponse> {
    // 这里应该从数据库中获取 context
    // 暂时返回模拟数据
    const context: InterviewContext = {
      userId: 'test',
      sessionId,
      currentStep: 1,
      collectedSymptoms: ['发热'],
      questionsAsked: [questionId],
      answers: new Map([[questionId, answer]]),
      diagnosisPath: {
        currentSyndromes: ['taiyang_wind_cold', 'taiyang_excess'],
        confirmedSyndromes: [],
        ruledOutSyndromes: [],
      },
      userDemographics: {},
    };

    // 更新诊断路径
    SixMeridianDecisionTree.updateDiagnosisPath(context, answer);

    // 检查是否应该终止
    const { shouldTerminate, earlyDiagnosis } = SixMeridianDecisionTree.shouldTerminate(context);

    if (shouldTerminate) {
      return {
        question: {
          id: 'terminate',
          category: '结束',
          symptomId: 'terminate',
          symptomName: '问诊结束',
          options: [],
          naturalLanguage: '问诊已结束，正在为您生成诊断结果...',
          priority: 0,
          reasoning: '症状收集完毕',
        },
        progress: {
          current: context.currentStep,
          total: 10,
          percentage: context.currentStep * 10,
        },
        possibleDiagnosis: context.diagnosisPath.currentSyndromes,
        nextSteps: ['生成诊断结果'],
        shouldTerminate: true,
        earlyDiagnosis,
      };
    }

    // 获取下一个问题
    const nextQuestion = SixMeridianDecisionTree.getNextSymptom(context);
    if (!nextQuestion) {
      throw new Error('无法生成问题');
    }

    return {
      question: nextQuestion,
      progress: {
        current: context.currentStep + 1,
        total: 10,
        percentage: (context.currentStep + 1) * 10,
      },
      possibleDiagnosis: context.diagnosisPath.currentSyndromes,
      nextSteps: ['继续问诊'],
      shouldTerminate: false,
    };
  }

  /**
   * 生成会话ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
