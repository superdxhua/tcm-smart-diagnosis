/**
 * 数字张仲景 - 多模态输入服务
 * 支持文字、图像（舌象）、可穿戴设备数据
 */

// import { load_skill } from '@/utils/skill-loader';  // 暂时禁用
// import { Network } from '@/network';  // 暂时禁用

// ============================================
// 类型定义
// ============================================

interface HeartRateData {
  current: number;
  variability?: number;
}

interface TemperatureData {
  current: number;
  trend?: '上升' | '下降' | '稳定';
}

interface BloodPressureData {
  systolic: number;
  diastolic: number;
}

interface SleepData {
  duration: number; // 睡眠时长（小时）
  quality?: '优' | '良' | '中' | '差';
  cycles?: number; // 睡眠周期数
}

export interface MultimodalInputRequest {
  textInput?: {
    symptoms: string[]; // 症状列表
    tongue?: string; // 舌象描述
    pulse?: string; // 脉象描述
    history?: string; // 病史
  };
  imageInput?: {
    tongueImage?: string; // 舌象图片URL
    faceImage?: string; // 面色图片URL
  };
  wearableData?: {
    heartRate?: {
      current: number; // 当前心率
      variability?: number; // 心率变异性（HRV）
    };
    temperature?: {
      current: number; // 当前体温
      trend?: '上升' | '下降' | '稳定'; // 体温趋势
    };
    bloodPressure?: {
      systolic: number; // 收缩压
      diastolic: number; // 舒张压
    };
    sleep?: {
      duration: number; // 睡眠时长（小时）
      quality: '优' | '良' | '中' | '差'; // 睡眠质量
    };
  };
}

export interface MultimodalInputResult {
  standardizedSymptoms: string[]; // 标准化症状
  tongueAnalysis?: TongueAnalysis; // 舌象分析
  pulseAnalysis?: PulseAnalysis; // 脉象分析
  wearableInsights?: WearableInsights; // 可穿戴设备洞察
  confidence: number; // 输入置信度
}

export interface TongueAnalysis {
  tongueColor: '淡红' | '淡白' | '红' | '绛' | '紫' | '青紫'; // 舌质颜色
  tongueShape: '正常' | '胖大' | '瘦薄' | '齿痕' | '裂纹' | '芒刺'; // 舌质形态
  coatingColor: '白' | '黄' | '灰黑' | '少苔' | '无苔'; // 苔色
  coatingThickness: '薄' | '厚' | '腻' | '燥'; // 苔质
  coatingDistribution?: '全' | '根' | '剥落'; // 苔的分布
  diagnosis: string; // 舌象诊断
  extractedSymptoms: string[]; // 提取的症状
  confidence: number; // 分析置信度
}

export interface PulseAnalysis {
  pulseType: '浮' | '沉' | '迟' | '数' | '滑' | '涩' | '弦' | '紧' | '细' | '微' | '弱' | '洪' | '实' | '虚'; // 脉象类型
  depth: '浮' | '中' | '沉'; // 脉位
  speed: '迟' | '缓' | '平' | '数' | '疾'; // 脉率
  force: '虚' | '实'; // 脉力
  shape: '滑' | '涩' | '细' | '洪' | '紧' | '弦'; // 脉形
  diagnosis: string; // 脉象诊断
  extractedSymptoms: string[]; // 提取的症状
  confidence: number; // 分析置信度
}

export interface WearableInsights {
  heartRateInsight: string; // 心率洞察
  temperatureInsight: string; // 体温洞察
  bloodPressureInsight: string; // 血压洞察
  sleepInsight: string; // 睡眠洞察
  extractedSymptoms: string[]; // 提取的症状
  riskAssessment: {
    level: '低' | '中' | '高'; // 风险等级
    items: string[]; // 风险项目
  };
}

// ============================================
// 文字输入服务
// ============================================
export class TextInputService {
  /**
   * 标准化文本输入
   */
  static async standardizeTextInput(input: MultimodalInputRequest['textInput']): Promise<{
    symptoms: string[];
    tongue?: string;
    pulse?: string;
    history?: string;
  }> {
    // 症状提取（使用 NLU）
    const symptoms = await this.extractSymptomsFromText(input?.symptoms || []);

    // 舌象提取
    const tongue = input?.tongue || undefined;

    // 脉象提取
    const pulse = input?.pulse || undefined;

    return {
      symptoms,
      tongue,
      pulse,
      history: input?.history,
    };
  }

  /**
   * 从文本中提取症状（使用 NLU）
   */
  private static async extractSymptomsFromText(text: string[]): Promise<string[]> {
    const extractedSymptoms: string[] = [];

    // 症状关键词库
    const symptomKeywords = [
      '发热', '恶寒', '汗出', '头痛', '身痛', '咽痛',
      '咳嗽', '喘', '口苦', '口干', '口渴', '不欲饮食',
      '胸胁胀满', '心烦', '呕吐', '腹泻', '便秘', '腹胀',
      '腹痛', '畏寒肢冷', '心悸', '胸闷', '气短', '神疲',
      '乏力', '失眠', '多梦', '盗汗', '自汗',
    ];

    for (const textItem of text) {
      for (const keyword of symptomKeywords) {
        if (textItem.includes(keyword) && !extractedSymptoms.includes(keyword)) {
          extractedSymptoms.push(keyword);
        }
      }
    }

    return extractedSymptoms;
  }
}

// ============================================
// 图像输入服务（舌象分析）
// ============================================
export class ImageInputService {
  /**
   * 分析舌象图像
   */
  static async analyzeTongueImage(imageUrl: string): Promise<TongueAnalysis> {
    try {
      // 调用图像识别 API（使用 LLM Vision）
      // 暂时禁用，等待 Network 模块实现
      // const response = await Network.request({
      //   url: '/api/llm/vision',
      //   method: 'POST',
      //   data: {
      //     imageUrl,
      //     prompt: '请分析这张舌象图片，包括舌质颜色、舌质形态、苔色、苔厚、苔质等，并给出中医辨证建议。输出格式为JSON。',
      //   },
      // });

      // const result = response.data.data;

      // 返回模拟结果
      return {
        tongueColor: '淡红',
        tongueShape: '正常',
        coatingColor: '白',
        coatingThickness: '薄',
        coatingDistribution: '全',
        diagnosis: '舌象正常',
        extractedSymptoms: [],
        confidence: 0.5,
      };
    } catch (error) {
      console.error('舌象分析失败:', error);
      throw new Error('舌象图像分析失败，请重试或使用文字描述');
    }
  }

  /**
   * 分析面色图像
   */
  static async analyzeFaceImage(imageUrl: string): Promise<{
    facialColor: string;
    complexion: string;
    diagnosis: string;
    extractedSymptoms: string[];
    confidence: number;
  }> {
    try {
      // 暂时禁用，等待 Network 模块实现
      // const response = await Network.request({
      //   url: '/api/llm/vision',
      //   method: 'POST',
      //   data: {
      //     imageUrl,
      //     prompt: '请分析这张面部照片，包括面色、面色光泽、是否有暗斑等，并给出中医辨证建议。输出格式为JSON。',
      //   },
      // });

      // const result = response.data.data;

      // 返回模拟结果
      return {
        facialColor: '正常',
        complexion: '有光泽',
        diagnosis: '面色正常',
        extractedSymptoms: [],
        confidence: 0.5,
      };
    } catch (error) {
      console.error('面色分析失败:', error);
      throw new Error('面色图像分析失败，请重试或使用文字描述');
    }
  }
}

// ============================================
// 可穿戴设备数据服务
// ============================================
export class WearableDataService {
  /**
   * 分析可穿戴设备数据
   */
  static async analyzeWearableData(data: MultimodalInputRequest['wearableData']): Promise<WearableInsights> {
    const extractedSymptoms: string[] = [];
    const riskItems: string[] = [];

    // 心率分析
    const heartRateInsight = this.analyzeHeartRate(data?.heartRate);
    extractedSymptoms.push(...heartRateInsight.symptoms);
    riskItems.push(...heartRateInsight.riskItems);

    // 体温分析
    const temperatureInsight = this.analyzeTemperature(data?.temperature);
    extractedSymptoms.push(...temperatureInsight.symptoms);
    riskItems.push(...temperatureInsight.riskItems);

    // 血压分析
    const bloodPressureInsight = this.analyzeBloodPressure(data?.bloodPressure);
    extractedSymptoms.push(...bloodPressureInsight.symptoms);
    riskItems.push(...bloodPressureInsight.riskItems);

    // 睡眠分析
    const sleepInsight = this.analyzeSleep(data?.sleep);
    extractedSymptoms.push(...sleepInsight.symptoms);
    riskItems.push(...sleepInsight.riskItems);

    // 风险评估
    const riskLevel = riskItems.length === 0 ? '低' : riskItems.length <= 2 ? '中' : '高';

    return {
      heartRateInsight: heartRateInsight.insight,
      temperatureInsight: temperatureInsight.insight,
      bloodPressureInsight: bloodPressureInsight.insight,
      sleepInsight: sleepInsight.insight,
      extractedSymptoms,
      riskAssessment: {
        level: riskLevel,
        items: riskItems,
      },
    };
  }

  /**
   * 分析心率
   */
  private static analyzeHeartRate(
    heartRate?: HeartRateData
  ): { insight: string; symptoms: string[]; riskItems: string[] } {
    if (!heartRate) {
      return { insight: '无心率数据', symptoms: [], riskItems: [] };
    }

    const symptoms: string[] = [];
    const riskItems: string[] = [];
    let insight = '';

    if (heartRate.current > 100) {
      symptoms.push('心悸');
      symptoms.push('心率偏快');
      insight = '心率偏快（>100次/分），可能提示心火亢盛或阴虚火旺';
      riskItems.push('心率过快');
    } else if (heartRate.current < 60) {
      symptoms.push('心悸');
      symptoms.push('心率偏慢');
      insight = '心率偏慢（<60次/分），可能提示心阳不足或气虚';
      riskItems.push('心率过慢');
    } else {
      insight = '心率正常（60-100次/分）';
    }

    // 心率变异性分析
    if (heartRate.variability) {
      if (heartRate.variability < 20) {
        symptoms.push('神疲');
        symptoms.push('乏力');
        insight += '，心率变异性偏低，提示自主神经功能减弱';
      } else if (heartRate.variability > 80) {
        insight += '，心率变异性偏高，提示交感神经兴奋';
      }
    }

    return { insight, symptoms, riskItems };
  }

  /**
   * 分析体温
   */
  private static analyzeTemperature(
    temperature?: TemperatureData
  ): { insight: string; symptoms: string[]; riskItems: string[] } {
    if (!temperature) {
      return { insight: '无体温数据', symptoms: [], riskItems: [] };
    }

    const symptoms: string[] = [];
    const riskItems: string[] = [];
    let insight = '';

    if (temperature.current > 37.3) {
      symptoms.push('发热');
      if (temperature.current > 38.5) {
        symptoms.push('壮热');
        riskItems.push('高热');
        insight = `体温偏高（${temperature.current.toFixed(1)}℃），属壮热`;
      } else {
        insight = `体温偏高（${temperature.current.toFixed(1)}℃），属低热`;
      }
    } else if (temperature.current < 36.0) {
      symptoms.push('畏寒');
      symptoms.push('四肢厥冷');
      riskItems.push('体温过低');
      insight = `体温偏低（${temperature.current.toFixed(1)}℃），提示阳虚或里寒`;
    } else {
      insight = '体温正常';
    }

    if (temperature.trend) {
      insight += `，趋势${temperature.trend}`;
      if (temperature.trend === '上升') {
        riskItems.push('体温上升');
      }
    }

    return { insight, symptoms, riskItems };
  }

  /**
   * 分析血压
   */
  private static analyzeBloodPressure(
    bloodPressure?: BloodPressureData
  ): { insight: string; symptoms: string[]; riskItems: string[] } {
    if (!bloodPressure) {
      return { insight: '无血压数据', symptoms: [], riskItems: [] };
    }

    const symptoms: string[] = [];
    const riskItems: string[] = [];
    let insight = '';

    if (bloodPressure.systolic > 140 || bloodPressure.diastolic > 90) {
      symptoms.push('头晕');
      symptoms.push('头胀');
      riskItems.push('高血压');
      insight = `血压偏高（${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg）`;
    } else if (bloodPressure.systolic < 90 || bloodPressure.diastolic < 60) {
      symptoms.push('头晕');
      symptoms.push('乏力');
      symptoms.push('心悸');
      riskItems.push('低血压');
      insight = `血压偏低（${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg）`;
    } else {
      insight = `血压正常（${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg）`;
    }

    return { insight, symptoms, riskItems };
  }

  /**
   * 分析睡眠
   */
  private static analyzeSleep(
    sleep?: SleepData
  ): { insight: string; symptoms: string[]; riskItems: string[] } {
    if (!sleep) {
      return { insight: '无睡眠数据', symptoms: [], riskItems: [] };
    }

    const symptoms: string[] = [];
    const riskItems: string[] = [];
    let insight = '';

    if (sleep.duration < 6) {
      symptoms.push('失眠');
      symptoms.push('神疲');
      riskItems.push('睡眠不足');
      insight = `睡眠时长不足（${sleep.duration}小时），建议保证7-8小时睡眠`;
    } else if (sleep.duration > 10) {
      symptoms.push('嗜睡');
      symptoms.push('乏力');
      insight = `睡眠时长过多（${sleep.duration}小时），提示可能存在睡眠障碍或阳气不足`;
    } else {
      insight = `睡眠时长正常（${sleep.duration}小时）`;
    }

    if (sleep.quality === '差') {
      symptoms.push('失眠');
      symptoms.push('多梦');
      riskItems.push('睡眠质量差');
      insight += '，但睡眠质量较差，建议改善睡眠环境';
    } else if (sleep.quality === '优') {
      insight += '，睡眠质量优秀';
    }

    return { insight, symptoms, riskItems };
  }
}

// ============================================
// 多模态输入服务（主服务）
// ============================================
export class MultimodalInputService {
  /**
   * 处理多模态输入
   */
  static async processMultimodalInput(request: MultimodalInputRequest): Promise<MultimodalInputResult> {
    const allSymptoms: string[] = [];

    // 1. 文字输入
    if (request.textInput) {
      const textResult = await TextInputService.standardizeTextInput(request.textInput);
      allSymptoms.push(...textResult.symptoms);
    }

    // 2. 图像输入（舌象）
    let tongueAnalysis: TongueAnalysis | undefined;
    if (request.imageInput?.tongueImage) {
      tongueAnalysis = await ImageInputService.analyzeTongueImage(request.imageInput.tongueImage);
      allSymptoms.push(...tongueAnalysis.extractedSymptoms);
    }

    // 3. 图像输入（面色）
    if (request.imageInput?.faceImage) {
      const faceAnalysis = await ImageInputService.analyzeFaceImage(request.imageInput.faceImage);
      allSymptoms.push(...faceAnalysis.extractedSymptoms);
    }

    // 4. 可穿戴设备数据
    let wearableInsights: WearableInsights | undefined;
    if (request.wearableData) {
      wearableInsights = await WearableDataService.analyzeWearableData(request.wearableData);
      allSymptoms.push(...wearableInsights.extractedSymptoms);
    }

    // 5. 计算输入置信度
    const confidence = this.calculateConfidence(request, tongueAnalysis, wearableInsights);

    return {
      standardizedSymptoms: Array.from(new Set(allSymptoms)),
      tongueAnalysis,
      pulseAnalysis: undefined, // 脉象需专业医生诊断，暂不支持
      wearableInsights,
      confidence,
    };
  }

  /**
   * 计算输入置信度
   */
  private static calculateConfidence(
    request: MultimodalInputRequest,
    tongueAnalysis?: TongueAnalysis,
    wearableInsights?: WearableInsights
  ): number {
    let confidence = 0;
    let totalWeight = 0;

    // 文字输入权重 0.4
    if (request.textInput?.symptoms && request.textInput.symptoms.length > 0) {
      confidence += 0.4;
    }
    totalWeight += 0.4;

    // 图像输入权重 0.3
    if (tongueAnalysis && tongueAnalysis.confidence > 0.7) {
      confidence += 0.3 * tongueAnalysis.confidence;
    }
    totalWeight += 0.3;

    // 可穿戴设备权重 0.3
    if (wearableInsights && wearableInsights.riskAssessment.level !== '低') {
      confidence += 0.3;
    }
    totalWeight += 0.3;

    return totalWeight > 0 ? confidence / totalWeight : 0;
  }
}
