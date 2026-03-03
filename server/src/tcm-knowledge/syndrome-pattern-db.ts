/**
 * 数字张仲景 - 证候-症状映射图谱
 * 双向推理网络 + 权重机制
 * 支持合病识别
 */

export interface SymptomNode {
  id: string;
  name: string;
  synonyms: string[]; // 同义词
  relatedSyndromes: SyndromeWeight[]; // 关联证候及权重
  modernTerms?: string[]; // 现代医学术语
  extractionRules?: string[]; // 提取规则
}

export interface SyndromeWeight {
  syndromeId: string;
  syndromeName: string;
  weight: number; // 权重 0.0-1.0
  direction: 'positive' | 'negative'; // 正向或反向证据
  evidenceLevel: 'A' | 'B' | 'C';
}

export interface SyndromePattern {
  id: string;
  name: string;
  category: '六经' | '八纲' | '脏腑' | '气血津液';
  meridian?: string; // 六经归属
  nature?: string; // 八纲属性（寒热虚实）
  organ?: string; // 脏腑归属
  keySymptoms: SymptomWeight[]; // 主证及权重
  optionalSymptoms: SymptomWeight[]; // 兼证及权重
  tongue: string[]; // 舌象
  pulse: string[]; // 脉象
  relatedFormulas: string[]; // 关联方剂
  contraindications: string[]; // 禁忌
  complications: string[]; // 并发证
  transmissionRisk: string[]; // 传变风险
  expertValidation: {
    validatedBy: string[];
    validationDate: Date;
    confidence: number;
  };
}

export interface SymptomWeight {
  symptomId: string;
  symptomName: string;
  weight: number; // 0.0-1.0
  isKey: boolean; // 是否为主证
  evidenceLevel: 'A' | 'B' | 'C';
}

export interface CombinedSyndrome {
  name: string;
  meridians: string[]; // 合病六经
  symptoms: string[];
  keySigns: string[]; // 决定性指征
  formulas: string[];
  transmissionPath: string[]; // 传变路径
}

// ============================================
// 症状节点库
// ============================================
export const SYMPTOM_NODES: Record<string, SymptomNode> = {
  // 太阳病症状
  fever: {
    id: 'fever',
    name: '发热',
    synonyms: ['身热', '体温升高', '发烧', '燥热', '壮热', '微热'],
    relatedSyndromes: [
      { syndromeId: 'taiyang_wind_cold', syndromeName: '太阳中风', weight: 0.8, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'yangming_excess', syndromeName: '阳明实证', weight: 0.9, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.7, direction: 'positive', evidenceLevel: 'A' },
    ],
    modernTerms: ['pyrexia', 'hyperthermia'],
    extractionRules: [
      '体温超过37.3℃',
      '自觉身体发热',
      '皮肤发烫',
    ],
  },
  sweating: {
    id: 'sweating',
    name: '汗出',
    synonyms: ['出汗', '大汗', '微汗', '自汗', '盗汗', '冷汗', '热汗'],
    relatedSyndromes: [
      { syndromeId: 'taiyang_wind_cold', syndromeName: '太阳中风', weight: 0.9, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyin_yang_deficiency', syndromeName: '少阴阳虚', weight: 0.8, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'taiyang_excess', syndromeName: '太阳表实', weight: 0.7, direction: 'negative', evidenceLevel: 'A' },
    ],
    modernTerms: ['diaphoresis', 'hyperhidrosis'],
    extractionRules: [
      '皮肤湿润',
      '汗珠出现',
      '衣服潮湿',
    ],
  },
  aversion_to_cold: {
    id: 'aversion_to_cold',
    name: '恶寒',
    synonyms: ['怕冷', '畏寒', '恶风', '怕风', '寒颤', '发冷'],
    relatedSyndromes: [
      { syndromeId: 'taiyang_wind_cold', syndromeName: '太阳中风', weight: 0.8, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'taiyang_excess', syndromeName: '太阳表实', weight: 0.9, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyin_yang_deficiency', syndromeName: '少阴阳虚', weight: 0.9, direction: 'positive', evidenceLevel: 'A' },
    ],
    modernTerms: ['chills', 'cold intolerance'],
    extractionRules: [
      '自觉寒冷',
      '需加衣保暖',
      '寒颤',
    ],
  },
  headache: {
    id: 'headache',
    name: '头痛',
    synonyms: ['头项强痛', '项背强几几', '头昏', '头晕', '头重'],
    relatedSyndromes: [
      { syndromeId: 'taiyang_wind_cold', syndromeName: '太阳中风', weight: 0.7, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'taiyang_excess', syndromeName: '太阳表实', weight: 0.8, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.6, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['cephalgia', 'headache'],
    extractionRules: [
      '头部疼痛',
      '颈项不适',
      '头部沉重',
    ],
  },
  // 阳明病症状
  constipation: {
    id: 'constipation',
    name: '大便秘结',
    synonyms: ['大便干结', '排便困难', '数日一行', '便硬', '大便不行'],
    relatedSyndromes: [
      { syndromeId: 'yangming_excess', syndromeName: '阳明实证', weight: 0.9, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.5, direction: 'negative', evidenceLevel: 'B' },
    ],
    modernTerms: ['constipation', 'defecation difficulty'],
    extractionRules: [
      '排便费力',
      '大便干燥',
      '排便频率低',
    ],
  },
  thirst: {
    id: 'thirst',
    name: '大渴',
    synonyms: ['口渴', '口干', '欲饮水', '喜冷饮', '烦渴'],
    relatedSyndromes: [
      { syndromeId: 'yangming_excess', syndromeName: '阳明实证', weight: 0.9, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'taiyin_dampness', syndromeName: '太阴湿盛', weight: 0.6, direction: 'negative', evidenceLevel: 'B' },
      { syndromeId: 'shaoyin_yin_deficiency', syndromeName: '少阴阴虚', weight: 0.7, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['polydipsia', 'thirst'],
    extractionRules: [
      '需要大量饮水',
      '口干舌燥',
      '饮水频繁',
    ],
  },
  abdominal_distension: {
    id: 'abdominal_distension',
    name: '腹胀满痛',
    synonyms: ['腹胀', '腹痛', '脘腹胀满', '腹部膨隆', '腹胀如鼓'],
    relatedSyndromes: [
      { syndromeId: 'yangming_excess', syndromeName: '阳明实证', weight: 0.8, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'taiyin_dampness', syndromeName: '太阴湿盛', weight: 0.7, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.6, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['abdominal distension', 'bloating'],
    extractionRules: [
      '腹部发胀',
      '腹部疼痛',
      '胃部不适',
    ],
  },
  // 少阳病症状
  bitter_taste: {
    id: 'bitter_taste',
    name: '口苦',
    synonyms: ['口中苦', '苦味', '口苦咽干'],
    relatedSyndromes: [
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.9, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyin_fire', syndromeName: '少阴火旺', weight: 0.6, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['bitter taste in mouth'],
    extractionRules: [
      '口中发苦',
      '苦涩味',
    ],
  },
  alternating_chills_fever: {
    id: 'alternating_chills_fever',
    name: '往来寒热',
    synonyms: ['寒热往来', '时寒时热', '寒热交替'],
    relatedSyndromes: [
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.95, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'taiyang_excess', syndromeName: '太阳表实', weight: 0.3, direction: 'negative', evidenceLevel: 'C' },
    ],
    modernTerms: ['intermittent fever', 'alternating chills and fever'],
    extractionRules: [
      '时而发热时而怕冷',
      '寒热交替出现',
    ],
  },
  chest_hypochondriac_fullness: {
    id: 'chest_hypochondriac_fullness',
    name: '胸胁苦满',
    synonyms: ['胸胁胀满', '胸闷', '胁痛', '胸胁不舒'],
    relatedSyndromes: [
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.85, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'liver_qi_stagnation', syndromeName: '肝气郁结', weight: 0.7, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['chest and hypochondriac fullness'],
    extractionRules: [
      '胸部发闷',
      '胁肋不适',
      '胸胁胀满',
    ],
  },
  silent_aphasia: {
    id: 'silent_aphasia',
    name: '默默不欲饮食',
    synonyms: ['不欲饮食', '纳差', '食欲不振', '默默不欲食'],
    relatedSyndromes: [
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.8, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'taiyin_dampness', syndromeName: '太阴湿盛', weight: 0.7, direction: 'positive', evidenceLevel: 'A' },
    ],
    modernTerms: ['loss of appetite', 'anorexia'],
    extractionRules: [
      '不想吃东西',
      '食欲下降',
      '胃口不好',
    ],
  },
  vexation: {
    id: 'vexation',
    name: '心烦喜呕',
    synonyms: ['心烦', '烦躁', '喜呕', '恶心', '呕吐'],
    relatedSyndromes: [
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.75, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyin_fire', syndromeName: '少阴火旺', weight: 0.6, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['irritability', 'nausea'],
    extractionRules: [
      '心情烦躁',
      '恶心呕吐',
      '情绪不安',
    ],
  },
  // 太阴病症状
  diarrhea: {
    id: 'diarrhea',
    name: '自利益甚',
    synonyms: ['下利', '腹泻', '便溏', '水泻', '大便稀'],
    relatedSyndromes: [
      { syndromeId: 'taiyin_dampness', syndromeName: '太阴湿盛', weight: 0.9, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyin_yang_deficiency', syndromeName: '少阴阳虚', weight: 0.85, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'yangming_excess', syndromeName: '阳明实证', weight: 0.7, direction: 'negative', evidenceLevel: 'A' },
    ],
    modernTerms: ['diarrhea', 'loose stools'],
    extractionRules: [
      '大便不成形',
      '排便次数增多',
      '大便稀薄',
    ],
  },
  no_appetite: {
    id: 'no_appetite',
    name: '食不下',
    synonyms: ['纳呆', '不思饮食', '厌食', '食纳差'],
    relatedSyndromes: [
      { syndromeId: 'taiyin_dampness', syndromeName: '太阴湿盛', weight: 0.85, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.7, direction: 'positive', evidenceLevel: 'A' },
    ],
    modernTerms: ['anorexia', 'poor appetite'],
    extractionRules: [
      '无法进食',
      '吃东西没味道',
      '不想吃东西',
    ],
  },
  abdominal_pain: {
    id: 'abdominal_pain',
    name: '时腹自痛',
    synonyms: ['腹痛', '腹中痛', '腹痛阵作'],
    relatedSyndromes: [
      { syndromeId: 'taiyin_dampness', syndromeName: '太阴湿盛', weight: 0.8, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyang_fire', syndromeName: '少阳火郁', weight: 0.6, direction: 'positive', evidenceLevel: 'B' },
      { syndromeId: 'yangming_excess', syndromeName: '阳明实证', weight: 0.7, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['abdominal pain'],
    extractionRules: [
      '腹部疼痛',
      '肚子疼',
      '腹痛阵作',
    ],
  },
  // 少阴病症状
  faint_pulse: {
    id: 'faint_pulse',
    name: '脉微细',
    synonyms: ['脉微', '脉细', '脉弱', '脉沉'],
    relatedSyndromes: [
      { syndromeId: 'shaoyin_yang_deficiency', syndromeName: '少阴阳虚', weight: 0.95, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyin_yin_deficiency', syndromeName: '少阴阴虚', weight: 0.7, direction: 'positive', evidenceLevel: 'B' },
      { syndromeId: 'taiyin_dampness', syndromeName: '太阴湿盛', weight: 0.6, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['faint pulse', 'thready pulse'],
    extractionRules: [
      '脉搏细弱',
      '脉象微细',
    ],
  },
  lethargy: {
    id: 'lethargy',
    name: '但欲寐',
    synonyms: ['精神萎靡', '嗜睡', '神疲', '欲寐', '精神不振'],
    relatedSyndromes: [
      { syndromeId: 'shaoyin_yang_deficiency', syndromeName: '少阴阳虚', weight: 0.9, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'shaoyin_yin_deficiency', syndromeName: '少阴阴虚', weight: 0.6, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['lethargy', 'drowsiness'],
    extractionRules: [
      '总想睡觉',
      '精神不振',
      '嗜睡',
    ],
  },
  cold_limbs: {
    id: 'cold_limbs',
    name: '畏寒肢冷',
    synonyms: ['四肢厥冷', '手足冰冷', '四肢不温', '手脚冰凉'],
    relatedSyndromes: [
      { syndromeId: 'shaoyin_yang_deficiency', syndromeName: '少阴阳虚', weight: 0.95, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'taiyin_dampness', syndromeName: '太阴湿盛', weight: 0.7, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['cold limbs', 'acrocyanosis'],
    extractionRules: [
      '手脚冰冷',
      '四肢发冷',
      '怕冷',
    ],
  },
  clear_gruel_diarrhea: {
    id: 'clear_gruel_diarrhea',
    name: '下利清谷',
    synonyms: ['完谷不化', '水谷不化', '下利完谷'],
    relatedSyndromes: [
      { syndromeId: 'shaoyin_yang_deficiency', syndromeName: '少阴阳虚', weight: 0.95, direction: 'positive', evidenceLevel: 'A' },
      { syndromeId: 'taiyin_dampness', syndromeName: '太阴湿盛', weight: 0.7, direction: 'positive', evidenceLevel: 'B' },
    ],
    modernTerms: ['diarrhea with undigested food'],
    extractionRules: [
      '大便中有未消化食物',
      '完谷不化',
      '水泻',
    ],
  },
};

// ============================================
// 证候模式库
// ============================================
export const SYNDROME_PATTERNS: Record<string, SyndromePattern> = {
  // 太阳病
  taiyang_wind_cold: {
    id: 'taiyang_wind_cold',
    name: '太阳中风',
    category: '六经',
    meridian: '太阳',
    nature: '表寒',
    keySymptoms: [
      { symptomId: 'fever', symptomName: '发热', weight: 0.8, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'sweating', symptomName: '汗出', weight: 0.9, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'aversion_to_cold', symptomName: '恶风', weight: 0.8, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'headache', symptomName: '头痛', weight: 0.7, isKey: false, evidenceLevel: 'A' },
    ],
    optionalSymptoms: [
      { symptomId: 'faint_pulse', symptomName: '脉浮缓', weight: 0.6, isKey: false, evidenceLevel: 'A' },
    ],
    tongue: ['舌淡红', '苔薄白'],
    pulse: ['浮缓', '浮弱'],
    relatedFormulas: ['guizhi_tang'],
    contraindications: ['无汗', '脉紧', '高热不退'],
    complications: ['taiyang_excess', 'shaoyang_fire', 'yangming_excess'],
    transmissionRisk: ['shaoyang_fire', 'yangming_excess'],
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  taiyang_excess: {
    id: 'taiyang_excess',
    name: '太阳表实',
    category: '六经',
    meridian: '太阳',
    nature: '表寒',
    keySymptoms: [
      { symptomId: 'fever', symptomName: '发热', weight: 0.9, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'aversion_to_cold', symptomName: '恶寒', weight: 0.95, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'headache', symptomName: '头痛身痛', weight: 0.85, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'sweating', symptomName: '无汗', weight: 0.9, isKey: true, evidenceLevel: 'A' },
    ],
    optionalSymptoms: [
      { symptomId: 'faint_pulse', symptomName: '喘', weight: 0.6, isKey: false, evidenceLevel: 'A' },
    ],
    tongue: ['舌淡红', '苔薄白'],
    pulse: ['浮紧', '紧'],
    relatedFormulas: ['mahuang_tang'],
    contraindications: ['表虚有汗', '体虚者', '心悸'],
    complications: ['taiyang_wind_cold', 'shaoyang_fire', 'yangming_excess'],
    transmissionRisk: ['shaoyang_fire', 'yangming_excess'],
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  // 阳明病
  yangming_excess: {
    id: 'yangming_excess',
    name: '阳明实证',
    category: '六经',
    meridian: '阳明',
    nature: '里热实',
    keySymptoms: [
      { symptomId: 'fever', symptomName: '不恶寒反恶热', weight: 0.95, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'thirst', symptomName: '大渴', weight: 0.9, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'sweating', symptomName: '大汗', weight: 0.85, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'constipation', symptomName: '大便秘结', weight: 0.9, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'abdominal_distension', symptomName: '腹胀满痛', weight: 0.8, isKey: true, evidenceLevel: 'A' },
    ],
    optionalSymptoms: [
      { symptomId: 'vexation', symptomName: '谵语', weight: 0.7, isKey: false, evidenceLevel: 'A' },
    ],
    tongue: ['舌红', '苔黄燥', '苔焦黑'],
    pulse: ['洪大', '沉实有力'],
    relatedFormulas: ['baihu_tang', 'dachengqi_tang'],
    contraindications: ['表证未解', '体虚者', '孕妇'],
    complications: ['shaoyin_yang_deficiency', 'shaoyin_yin_deficiency'],
    transmissionRisk: ['shaoyin_yang_deficiency', 'shaoyin_yin_deficiency'],
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  // 少阳病
  shaoyang_fire: {
    id: 'shaoyang_fire',
    name: '少阳火郁',
    category: '六经',
    meridian: '少阳',
    nature: '半表半里',
    keySymptoms: [
      { symptomId: 'bitter_taste', symptomName: '口苦', weight: 0.9, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'alternating_chills_fever', symptomName: '往来寒热', weight: 0.95, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'chest_hypochondriac_fullness', symptomName: '胸胁苦满', weight: 0.85, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'silent_aphasia', symptomName: '默默不欲饮食', weight: 0.8, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'vexation', symptomName: '心烦喜呕', weight: 0.75, isKey: true, evidenceLevel: 'A' },
    ],
    optionalSymptoms: [
      { symptomId: 'headache', symptomName: '目眩', weight: 0.6, isKey: false, evidenceLevel: 'A' },
    ],
    tongue: ['舌边尖红', '苔薄白或微黄'],
    pulse: ['弦', '弦细'],
    relatedFormulas: ['xiaochaihu_tang'],
    contraindications: ['表证未解', '纯里实证'],
    complications: ['yangming_excess', 'taiyin_dampness', 'shaoyin_fire'],
    transmissionRisk: ['yangming_excess', 'taiyin_dampness'],
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  // 太阴病
  taiyin_dampness: {
    id: 'taiyin_dampness',
    name: '太阴湿盛',
    category: '六经',
    meridian: '太阴',
    nature: '里寒湿',
    keySymptoms: [
      { symptomId: 'abdominal_distension', symptomName: '腹满而吐', weight: 0.85, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'no_appetite', symptomName: '食不下', weight: 0.9, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'diarrhea', symptomName: '自利益甚', weight: 0.95, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'abdominal_pain', symptomName: '时腹自痛', weight: 0.8, isKey: true, evidenceLevel: 'A' },
    ],
    optionalSymptoms: [
      { symptomId: 'cold_limbs', symptomName: '四肢沉重', weight: 0.6, isKey: false, evidenceLevel: 'B' },
    ],
    tongue: ['舌淡', '苔白腻'],
    pulse: ['缓', '沉缓'],
    relatedFormulas: ['lizhong_tang'],
    contraindications: ['阳明实证', '热证'],
    complications: ['shaoyin_yang_deficiency'],
    transmissionRisk: ['shaoyin_yang_deficiency'],
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  // 少阴病
  shaoyin_yang_deficiency: {
    id: 'shaoyin_yang_deficiency',
    name: '少阴阳虚',
    category: '六经',
    meridian: '少阴',
    nature: '里寒虚',
    keySymptoms: [
      { symptomId: 'faint_pulse', symptomName: '脉微细', weight: 0.95, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'lethargy', symptomName: '但欲寐', weight: 0.9, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'cold_limbs', symptomName: '畏寒肢冷', weight: 0.9, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'clear_gruel_diarrhea', symptomName: '下利清谷', weight: 0.9, isKey: true, evidenceLevel: 'A' },
    ],
    optionalSymptoms: [
      { symptomId: 'sweating', symptomName: '自汗', weight: 0.6, isKey: false, evidenceLevel: 'B' },
      { symptomId: 'abdominal_pain', symptomName: '腹痛', weight: 0.5, isKey: false, evidenceLevel: 'B' },
    ],
    tongue: ['舌淡胖', '苔白滑'],
    pulse: ['微细', '沉微'],
    relatedFormulas: ['sini_tang', 'zhenwu_tang'],
    contraindications: ['热证', '阴虚火旺', '阳盛格阴'],
    complications: ['shaoyin_yin_deficiency'],
    transmissionRisk: ['death', 'shaoyin_yin_deficiency'],
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  shaoyin_yin_deficiency: {
    id: 'shaoyin_yin_deficiency',
    name: '少阴阴虚',
    category: '六经',
    meridian: '少阴',
    nature: '里热虚',
    keySymptoms: [
      { symptomId: 'faint_pulse', symptomName: '脉细数', weight: 0.85, isKey: true, evidenceLevel: 'B' },
      { symptomId: 'lethargy', symptomName: '心烦不得卧', weight: 0.9, isKey: true, evidenceLevel: 'A' },
      { symptomId: 'thirst', symptomName: '口干舌燥', weight: 0.85, isKey: true, evidenceLevel: 'A' },
    ],
    optionalSymptoms: [
      { symptomId: 'fever', symptomName: '手足心热', weight: 0.7, isKey: false, evidenceLevel: 'B' },
      { symptomId: 'sweating', symptomName: '盗汗', weight: 0.7, isKey: false, evidenceLevel: 'B' },
    ],
    tongue: ['舌红少津', '苔少'],
    pulse: ['细数', '细'],
    relatedFormulas: ['huanglian_ejiao_tang'],
    contraindications: ['阳虚证'],
    complications: ['shaoyin_yang_deficiency'],
    transmissionRisk: ['death'],
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.9,
    },
  },
};

// ============================================
// 合病识别库
// ============================================
export const COMBINED_SYNDROMES: Record<string, CombinedSyndrome> = {
  taiyang_shaoyang_yangming: {
    name: '太阳少阳阳明合病',
    meridians: ['太阳', '少阳', '阳明'],
    symptoms: ['发热', '恶寒', '汗出', '口苦', '便秘', '腹胀'],
    keySigns: ['发热恶寒', '口苦', '腹胀满痛'],
    formulas: ['xiaochaihu_tang', 'dachengqi_tang'],
    transmissionPath: ['太阳', '少阳', '阳明'],
  },
  taiyang_shaoyang: {
    name: '太阳少阳合病',
    meridians: ['太阳', '少阳'],
    symptoms: ['发热', '恶寒', '口苦', '胸胁苦满'],
    keySigns: ['发热恶寒', '口苦'],
    formulas: ['xiaochaihu_tang', 'guizhi_tang'],
    transmissionPath: ['太阳', '少阳'],
  },
  shaoyang_yangming: {
    name: '少阳阳明合病',
    meridians: ['少阳', '阳明'],
    symptoms: ['口苦', '往来寒热', '便秘', '腹胀'],
    keySigns: ['口苦', '便秘'],
    formulas: ['dachaihu_tang'],
    transmissionPath: ['少阳', '阳明'],
  },
};

// ============================================
// 查询接口
// ============================================
export class SyndromePatternQuery {
  /**
   * 根据症状计算证候概率
   */
  static calculateSyndromeProbability(
    symptoms: string[]
  ): Array<{ syndrome: SyndromePattern; probability: number; matchedSymptoms: string[] }> {
    const results: Array<{ syndrome: SyndromePattern; probability: number; matchedSymptoms: string[] }> = [];

    for (const syndrome of Object.values(SYNDROME_PATTERNS)) {
      let totalWeight = 0;
      const matchedSymptoms: string[] = [];

      for (const symptomWeight of syndrome.keySymptoms) {
        const symptomNode = SYMPTOM_NODES[symptomWeight.symptomId];
        if (!symptomNode) continue;

        // 检查症状是否匹配
        const matched = symptoms.some(s => {
          const symptomLower = s.toLowerCase();
          return (
            symptomNode.name === s ||
            symptomNode.synonyms.some(syn => syn === s) ||
            symptomNode.name.includes(s) ||
            s.includes(symptomNode.name)
          );
        });

        if (matched) {
          totalWeight += symptomWeight.weight;
          matchedSymptoms.push(symptomWeight.symptomName);
        }
      }

      // 计算概率
      const totalKeyWeight = syndrome.keySymptoms.reduce((sum, s) => sum + s.weight, 0);
      const probability = totalWeight / totalKeyWeight;

      if (probability > 0) {
        results.push({
          syndrome,
          probability,
          matchedSymptoms,
        });
      }
    }

    results.sort((a, b) => b.probability - a.probability);
    return results;
  }

  /**
   * 识别合病
   */
  static identifyCombinedSyndrome(
    syndromes: SyndromePattern[]
  ): CombinedSyndrome | null {
    // 检查是否符合已知合病模式
    for (const combinedSyndrome of Object.values(COMBINED_SYNDROMES)) {
      const matchedMeridians = syndromes
        .filter(s => s.meridian && combinedSyndrome.meridians.includes(s.meridian))
        .map(s => s.meridian);

      if (matchedMeridians.length >= 2) {
        return combinedSyndrome;
      }
    }

    return null;
  }

  /**
   * 根据证候获取症状标准化
   */
  static standardizeSymptoms(inputSymptoms: string[]): string[] {
    const standardized: string[] = [];

    for (const input of inputSymptoms) {
      const inputLower = input.toLowerCase();
      let found = false;

      // 查找匹配的症状节点
      for (const symptomNode of Object.values(SYMPTOM_NODES)) {
        if (
          symptomNode.name === input ||
          symptomNode.synonyms.some(syn => syn === input) ||
          symptomNode.name.includes(input) ||
          input.includes(symptomNode.name)
        ) {
          if (!standardized.includes(symptomNode.name)) {
            standardized.push(symptomNode.name);
          }
          found = true;
          break;
        }
      }

      // 如果没有找到匹配，保留原始输入
      if (!found && !standardized.includes(input)) {
        standardized.push(input);
      }
    }

    return standardized;
  }
}
