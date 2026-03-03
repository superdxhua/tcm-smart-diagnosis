import { Injectable, Logger } from '@nestjs/common';

/**
 * 术语映射（现代 → 古典）
 */
interface TermMapping {
  modern: string[];
  classical: string;
  description?: string;
}

/**
 * 语言风格转换器
 * 将现代医学术语转换为古雅、具象的生活化描述
 */
@Injectable()
export class LanguageStyleConverter {
  private logger = new Logger(LanguageStyleConverter.name);

  /**
   * 术语映射表
   */
  private readonly termMappings: TermMapping[] = [
    // 发热相关
    {
      modern: ['发烧', '体温升高', '发热', '体温过高'],
      classical: '发热',
      description: '身体是否感觉发热？热在皮肤表面还是骨头缝里？'
    },
    {
      modern: ['发冷', '怕冷', '畏寒', '寒战'],
      classical: '恶寒',
      description: '是否怕冷？怕冷时是否想加衣服盖被子？'
    },
    {
      modern: ['忽冷忽热', '一阵冷一阵热', '寒热往来'],
      classical: '往来寒热',
      description: '是否一阵觉得冷，一阵觉得热，交替出现？'
    },

    // 汗液相关
    {
      modern: ['出汗', '冒汗', '汗多'],
      classical: '汗出',
      description: '是否出汗？出汗后怕冷是否减轻？'
    },
    {
      modern: ['没出汗', '无汗', '不出汗'],
      classical: '无汗',
      description: '是否有汗？发热时皮肤干燥还是湿润？'
    },
    {
      modern: ['盗汗', '夜间出汗', '睡后出汗'],
      classical: '盗汗',
      description: '睡觉时是否出汗？醒来后汗止？'
    },
    {
      modern: ['自汗', '白天出汗', '活动后出汗'],
      classical: '自汗',
      description: '白天是否容易出汗？活动后是否出汗更多？'
    },
    {
      modern: ['但头汗出', '只有头部出汗'],
      classical: '但头汗出',
      description: '是否只有头部出汗，身体其他部位无汗？'
    },

    // 头痛相关
    {
      modern: ['头痛', '头疼', '脑袋疼'],
      classical: '头痛',
      description: '头痛部位在头顶、前额、两侧太阳穴还是后脑勺？'
    },
    {
      modern: ['脖子僵硬', '项背强急', '脖子疼'],
      classical: '头项强痛',
      description: '脖子是否僵硬难受？是否感觉脖子转动不灵活？'
    },
    {
      modern: ['头晕', '眩晕', '头昏'],
      classical: '头眩',
      description: '是否感觉头晕目眩？站立时是否感觉不稳？'
    },

    // 口舌相关
    {
      modern: ['口渴', '想喝水', '口干'],
      classical: '口渴',
      description: '是否口渴想喝水？喝水是整口咽下去还是只漱口不欲咽？'
    },
    {
      modern: ['口苦', '嘴里发苦', '苦味'],
      classical: '口苦',
      description: '嘴里是否有苦味？早晨起来是否更明显？'
    },
    {
      modern: ['口干', '口腔干燥', '干燥'],
      classical: '咽干',
      description: '喉咙是否干燥？是否想喝水缓解？'
    },
    {
      modern: ['嘴里淡', '没味道', '口淡'],
      classical: '口淡',
      description: '嘴里是否感觉没有味道？吃什么都不香？'
    },

    // 咳嗽相关
    {
      modern: ['咳嗽', '咳'],
      classical: '咳嗽',
      description: '是否有咳嗽？咳嗽是否有痰？'
    },
    {
      modern: ['喘息', '气喘', '呼吸困难'],
      classical: '喘',
      description: '是否感觉喘息？呼吸是否急促困难？'
    },
    {
      modern: ['气短', '上气不接下气', '气不够用'],
      classical: '短气',
      description: '是否感觉气短？稍微活动就喘不过气？'
    },

    // 胸腹相关
    {
      modern: ['胸闷', '胸堵', '胸胀'],
      classical: '胸闷',
      description: '胸部是否感觉堵塞发闷？'
    },
    {
      modern: ['心慌', '心跳快', '心悸'],
      classical: '心悸',
      description: '是否感觉心慌？心跳是否加速？'
    },
    {
      modern: ['胸胁苦满', '胁肋胀痛', '肋骨疼'],
      classical: '胸胁苦满',
      description: '两肋（侧面）是否感觉胀满不适？'
    },
    {
      modern: ['心里发热', '心烧', '心热'],
      classical: '心中疼热',
      description: '心里是否有灼热感？'
    },

    // 消化相关
    {
      modern: ['恶心', '想吐', '反胃'],
      classical: '恶心',
      description: '是否感觉恶心想吐？'
    },
    {
      modern: ['呕吐', '吐', '呕'],
      classical: '呕吐',
      description: '是否有呕吐？吐出的是什么？'
    },
    {
      modern: ['不思饮食', '不想吃东西', '没食欲'],
      classical: '不欲饮食',
      description: '是否不想吃东西？是否有饥饿感？'
    },
    {
      modern: ['饿了不想吃', '饥而不欲食'],
      classical: '饥而不欲食',
      description: '是否感觉饿了，但不想吃东西？'
    },
    {
      modern: ['吃一点就胀', '食后腹胀', '消化不良'],
      classical: '食后腹胀',
      description: '是否吃一点东西就感觉肚子胀？'
    },
    {
      modern: ['拉肚子', '腹泻', '便溏'],
      classical: '下利',
      description: '是否有拉肚子？大便是否不成形？'
    },
    {
      modern: ['便秘', '大便干燥', '排便困难'],
      classical: '便秘',
      description: '是否有便秘？几天大便一次？大便是否干燥？'
    },
    {
      modern: ['完谷不化', '吃啥拉啥', '大便未消化'],
      classical: '完谷不化',
      description: '大便中是否有未消化的食物残渣？'
    },

    // 疼痛相关
    {
      modern: ['浑身疼', '全身疼痛', '身痛'],
      classical: '身痛',
      description: '是否全身疼痛？疼痛是酸痛、刺痛还是胀痛？'
    },
    {
      modern: ['骨节疼痛', '关节疼', '骨节疼'],
      classical: '骨节疼痛',
      description: '关节是否疼痛？疼痛是否游走不定？'
    },
    {
      modern: ['肚子疼', '腹痛', '胃疼'],
      classical: '腹痛',
      description: '肚子疼吗？疼痛部位在哪里？按着舒服还是更疼？'
    },
    {
      modern: ['喜按', '按着舒服', '想按'],
      classical: '腹痛喜按',
      description: '肚子疼时，按着是否舒服？'
    },
    {
      modern: ['拒按', '按着疼', '不能按'],
      classical: '腹痛拒按',
      description: '肚子疼时，按着是否更疼？'
    },

    // 排泄相关
    {
      modern: ['小便黄', '尿黄', '小便短赤'],
      classical: '小便黄',
      description: '小便颜色如何？是清长的还是黄赤的？'
    },
    {
      modern: ['小便多', '尿频', '尿多'],
      classical: '小便频数',
      description: '小便次数是否增多？是否尿急？'
    },
    {
      modern: ['小便少', '尿少', '小便不利'],
      classical: '小便不利',
      description: '小便是否通畅？尿量是否减少？'
    },

    // 精神状态
    {
      modern: ['想睡觉', '精神萎靡', '嗜睡'],
      classical: '但欲寐',
      description: '是否只想睡觉，精神萎靡不振？'
    },
    {
      modern: ['烦躁', '心烦', '坐立不安'],
      classical: '烦躁',
      description: '是否感觉烦躁不安？心神是否不宁？'
    },
    {
      modern: ['不想说话', '默默', '不语'],
      classical: '默默不欲饮食',
      description: '是否不想说话？心情是否抑郁？'
    },

    // 舌脉（虽无法直接测量，但可询问）
    {
      modern: ['舌淡', '舌色淡'],
      classical: '舌淡',
      description: '舌质颜色是否偏淡？'
    },
    {
      modern: ['舌红', '舌色红'],
      classical: '舌红',
      description: '舌质颜色是否偏红？'
    },
    {
      modern: ['苔白', '舌苔白'],
      classical: '苔白',
      description: '舌苔颜色是否偏白？'
    },
    {
      modern: ['苔黄', '舌苔黄'],
      classical: '苔黄',
      description: '舌苔颜色是否偏黄？'
    },
    {
      modern: ['苔腻', '舌苔厚腻'],
      classical: '苔腻',
      description: '舌苔是否厚腻？是否像油膜一样？'
    },

    // 其他
    {
      modern: ['怕风', '恶风'],
      classical: '恶风',
      description: '是否怕风？有风时是否感觉更冷？'
    },
    {
      modern: ['流鼻涕', '鼻塞流涕'],
      classical: '鼻鸣',
      description: '是否有鼻塞流鼻涕？鼻涕是清稀的还是黏稠的？'
    },
    {
      modern: ['打喷嚏', '喷嚏'],
      classical: '喷嚏',
      description: '是否经常打喷嚏？'
    }
  ];

  /**
   * 将现代术语转换为古典术语
   */
  convertToClassical(text: string): string {
    let result = text;

    for (const mapping of this.termMappings) {
      for (const modern of mapping.modern) {
        const regex = new RegExp(modern, 'gi');
        result = result.replace(regex, mapping.classical);
      }
    }

    this.logger.log(`语言转换："${text}" → "${result}"`);
    return result;
  }

  /**
   * 将古典术语转换为现代术语（用于理解用户回答）
   */
  convertToModern(text: string): string {
    let result = text;

    for (const mapping of this.termMappings) {
      const regex = new RegExp(mapping.classical, 'gi');
      if (regex.test(result)) {
        // 使用第一个现代术语作为代表
        result = result.replace(regex, mapping.modern[0]);
      }
    }

    return result;
  }

  /**
   * 获取术语的古典描述（用于问询）
   */
  getClassicalDescription(modernTerm: string): string | null {
    const mapping = this.termMappings.find(m =>
      m.modern.some(modern => modernTerm.includes(modern))
    );

    if (mapping) {
      return mapping.description || mapping.classical;
    }

    return null;
  }

  /**
   * 将问题转换为古雅风格
   */
  convertQuestionToClassical(question: string): string {
    let result = question;

    // 转换术语
    result = this.convertToClassical(result);

    // 调整句式
    result = result.replace(/是否/g, '是否');
    result = result.replace(/有没有/g, '是否有');
    result = result.replace(/什么/g, '何');
    result = result.replace(/怎么/g, '如何');

    // 添加古雅语气词
    if (!result.endsWith('？') && !result.endsWith('?')) {
      result += '？';
    }

    this.logger.log(`问题转换："${question}" → "${result}"`);
    return result;
  }

  /**
   * 生成问询问题（基于症状）
   */
  generateInquiryQuestion(symptom: string): string {
    const description = this.getClassicalDescription(symptom);

    if (description) {
      return description;
    }

    // 如果没有预设描述，生成通用问询
    const classicalSymptom = this.convertToClassical(symptom);
    return `是否有${classicalSymptom}？`;
  }

  /**
   * 标准化用户回答
   */
  standardizeUserAnswer(answer: string): string {
    let result = answer.trim();

    // 统一肯定回答
    result = result.replace(/(是|有|对|是的|有啊|嗯)/gi, '是');

    // 统一否定回答
    result = result.replace(/(不是|没有|不对|无|没)/gi, '否');

    // 移除多余标点
    result = result.replace(/[，。！？、]/g, ' ');

    // 去重
    result = result.replace(/\s+/g, ' ');

    return result;
  }

  /**
   * 检测用户回答是否包含古典术语
   */
  detectClassicalTerms(answer: string): string[] {
    const detected: string[] = [];

    for (const mapping of this.termMappings) {
      if (answer.toLowerCase().includes(mapping.classical.toLowerCase())) {
        detected.push(mapping.classical);
      }
    }

    return detected;
  }

  /**
   * 获取术语建议（当用户使用模糊表达时）
   */
  getTermSuggestions(fuzzyExpression: string): string[] {
    const suggestions: string[] = [];

    for (const mapping of this.termMappings) {
      for (const modern of mapping.modern) {
        // 模糊匹配
        if (modern.includes(fuzzyExpression) || fuzzyExpression.includes(modern)) {
          suggestions.push(mapping.classical);
          break;
        }
      }
    }

    return suggestions;
  }

  /**
   * 批量转换症状列表
   */
  convertSymptomList(symptoms: string[]): string[] {
    return symptoms.map(symptom => this.convertToClassical(symptom));
  }

  /**
   * 生成症状说明（用于向用户解释）
   */
  generateSymptomExplanation(symptom: string): string {
    const classicalTerm = this.convertToClassical(symptom);
    const description = this.getClassicalDescription(symptom);

    if (description) {
      return `${classicalTerm}：${description}`;
    }

    return classicalTerm;
  }
}
