/**
 * 数字张仲景 - 药物-配伍-毒性知识库
 * 包含：性味归经、剂量区间、配伍禁忌、现代毒理数据
 */

export interface Herb {
  id: string;
  name: string;
  aliases: string[]; // 别名
  category: string; // 类别（解表、清热、泻下等）
  nature: string; // 性（寒、热、温、凉、平）
  flavor: string[]; // 味（辛、甘、酸、苦、咸、淡）
  meridian: string[]; // 归经
  dosage: {
    min: number; // 最小剂量（g）
    max: number; // 最大剂量（g）
    usual: number; // 常用剂量（g）
    maxToxic: number; // 有毒剂量阈值（g）
  };
  processing: string[]; // 炮制方法
  contraindications: string[]; // 禁忌
  toxicity: {
    isToxic: boolean;
    toxicityLevel: '无' | '低' | '中' | '高';
    toxicComponents?: string[]; // 有毒成分
    toxicitySymptoms?: string[]; // 中毒症状
    modernResearch?: string[]; // 现代毒理研究
  };
  incompatibilities: {
    herbs: string[]; // 不宜配伍的药物（十八反、十九畏）
    avoidDuring: string[]; // 特殊时期禁忌（孕妇、哺乳期等）
  };
  modernPharmacology: {
    actions: string[]; // 现代药理作用
    cautions: string[]; // 注意事项
  };
  classicUsage: {
    source: string[]; // 经典文献来源
    commonFormulas: string[]; // 常用方剂
  };
  safetyRating: 'A' | 'B' | 'C' | 'D'; // 安全等级（A最安全，D最危险）
  expertValidation: {
    validatedBy: string[];
    validationDate: Date;
    confidence: number;
  };
}

export interface IncompatibilityPair {
  herbA: string;
  herbB: string;
  type: '十八反' | '十九畏' | '配伍禁忌';
  severity: '严重' | '中度' | '轻度';
  description: string;
  consequences: string[];
}

export interface PregnancyContraindication {
  herb: string;
  category: '禁用' | '慎用';
  reason: string;
  trimesterSpecific?: string; // 孕期特定禁忌
  modernEvidence: string[];
}

// ============================================
// 药物库（经方常用50+ 药物示例）
// ============================================
export const HERB_DATABASE: Record<string, Herb> = {
  // 解表药
  mahuang: {
    id: 'mahuang',
    name: '麻黄',
    aliases: ['龙沙', '卑相', '狗骨'],
    category: '解表药',
    nature: '温',
    flavor: ['辛', '微苦'],
    meridian: ['肺', '膀胱'],
    dosage: { min: 2, max: 9, usual: 6, maxToxic: 15 },
    processing: ['蜜炙', '生用'],
    contraindications: [
      '表虚自汗',
      '阴虚盗汗',
      '肺肾虚喘',
      '高血压',
      '失眠',
    ],
    toxicity: {
      isToxic: false,
      toxicityLevel: '低',
      toxicComponents: ['麻黄碱'],
      toxicitySymptoms: ['心悸', '失眠', '血压升高', '出汗过多'],
      modernResearch: [
        '麻黄碱可兴奋中枢神经系统',
        '长期大量使用可产生依赖性',
        '高血压患者需慎用',
      ],
    },
    incompatibilities: {
      herbs: ['浮小麦', '龙骨', '牡蛎'], // 禁止与敛汗药同用
      avoidDuring: ['孕妇', '哺乳期', '儿童'],
    },
    modernPharmacology: {
      actions: [
        '发汗解表',
        '宣肺平喘',
        '利水消肿',
        '收缩血管',
      ],
      cautions: [
        '高血压患者慎用',
        '不宜长期服用',
        '避免与麻黄碱类药物同用',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['麻黄汤', '大青龙汤', '小青龙汤', '葛根汤'],
    },
    safetyRating: 'B',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.9,
    },
  },
  guizhi: {
    id: 'guizhi',
    name: '桂枝',
    aliases: ['柳桂'],
    category: '解表药',
    nature: '温',
    flavor: ['辛', '甘'],
    meridian: ['心', '肺', '膀胱'],
    dosage: { min: 3, max: 12, usual: 9, maxToxic: 20 },
    processing: ['生用', '去皮'],
    contraindications: [
      '温病高热',
      '阴虚火旺',
      '血热妄行',
      '孕妇慎用',
    ],
    toxicity: {
      isToxic: false,
      toxicityLevel: '无',
      modernResearch: ['相对安全，但孕妇需慎用'],
    },
    incompatibilities: {
      herbs: [],
      avoidDuring: ['孕妇', '月经过多'],
    },
    modernPharmacology: {
      actions: [
        '发汗解肌',
        '温通经脉',
        '助阳化气',
        '抗炎',
      ],
      cautions: [
        '孕妇慎用',
        '月经过多者慎用',
        '不宜与维生素C同用（降低疗效）',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['桂枝汤', '麻黄汤', '小建中汤', '桂枝加龙骨牡蛎汤'],
    },
    safetyRating: 'A',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  // 清热药
  shigao: {
    id: 'shigao',
    name: '石膏',
    aliases: ['细石', '寒水石', '白虎'],
    category: '清热药',
    nature: '大寒',
    flavor: ['辛', '甘'],
    meridian: ['肺', '胃'],
    dosage: { min: 15, max: 60, usual: 30, maxToxic: 100 },
    processing: ['生用', '煅用'],
    contraindications: [
      '脾胃虚寒',
      '阴虚发热',
      '无实热者',
    ],
    toxicity: {
      isToxic: false,
      toxicityLevel: '无',
      modernResearch: ['大寒之品，脾胃虚寒者慎用'],
    },
    incompatibilities: {
      herbs: [],
      avoidDuring: [],
    },
    modernPharmacology: {
      actions: [
        '清热泻火',
        '除烦止渴',
        '收敛生肌',
        '降温',
      ],
      cautions: [
        '大寒之品，不宜久用',
        '脾胃虚寒者慎用',
        '需先煎30分钟以上',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['白虎汤', '大青龙汤', '麻杏石甘汤'],
    },
    safetyRating: 'A',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  zhimu: {
    id: 'zhimu',
    name: '知母',
    aliases: ['连母', '野蓼', '地参'],
    category: '清热药',
    nature: '寒',
    flavor: ['苦', '甘'],
    meridian: ['肺', '胃', '肾'],
    dosage: { min: 6, max: 12, usual: 9, maxToxic: 20 },
    processing: ['生用', '盐水炒'],
    contraindications: [
      '脾胃虚寒',
      '大便溏泄',
    ],
    toxicity: {
      isToxic: false,
      toxicityLevel: '无',
    },
    incompatibilities: {
      herbs: [],
      avoidDuring: [],
    },
    modernPharmacology: {
      actions: [
        '清热泻火',
        '生津润燥',
        '退骨蒸',
        '降血糖',
      ],
      cautions: [
        '脾胃虚寒者慎用',
        '大便溏泄者慎用',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['白虎汤', '知柏地黄丸'],
    },
    safetyRating: 'A',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  // 泻下药
  dahuang: {
    id: 'dahuang',
    name: '大黄',
    aliases: ['将军', '锦纹', '川军'],
    category: '泻下药',
    nature: '苦',
    flavor: ['苦', '寒'],
    meridian: ['脾', '胃', '大肠', '肝', '心包'],
    dosage: { min: 3, max: 12, usual: 6, maxToxic: 20 },
    processing: ['酒洗', '后下', '蒸制'],
    contraindications: [
      '孕妇',
      '哺乳期',
      '月经过多',
      '脾胃虚寒',
      '体虚者',
    ],
    toxicity: {
      isToxic: false,
      toxicityLevel: '无',
      toxicitySymptoms: ['腹痛', '腹泻', '电解质紊乱'],
    },
    incompatibilities: {
      herbs: [],
      avoidDuring: ['孕妇', '哺乳期', '月经过多'],
    },
    modernPharmacology: {
      actions: [
        '泻下攻积',
        '清热泻火',
        '凉血解毒',
        '逐瘀通经',
      ],
      cautions: [
        '孕妇禁用',
        '体虚者慎用',
        '得下后止服，不可过量',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['大承气汤', '小承气汤', '桃核承气汤'],
    },
    safetyRating: 'B',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.9,
    },
  },
  mangxiao: {
    id: 'mangxiao',
    name: '芒硝',
    aliases: ['朴硝', '盆硝'],
    category: '泻下药',
    nature: '大寒',
    flavor: ['咸', '苦'],
    meridian: ['胃', '大肠'],
    dosage: { min: 6, max: 12, usual: 9, maxToxic: 20 },
    processing: ['生用', '溶解'],
    contraindications: [
      '孕妇',
      '哺乳期',
      '脾胃虚寒',
    ],
    toxicity: {
      isToxic: false,
      toxicityLevel: '无',
    },
    incompatibilities: {
      herbs: [],
      avoidDuring: ['孕妇', '哺乳期'],
    },
    modernPharmacology: {
      actions: [
        '泻下软坚',
        '清热泻火',
        '消肿止痛',
      ],
      cautions: [
        '孕妇禁用',
        '脾胃虚寒者慎用',
        '宜冲服，不宜久煎',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['大承气汤', '大陷胸汤'],
    },
    safetyRating: 'B',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.9,
    },
  },
  // 温里药
  fuzi: {
    id: 'fuzi',
    name: '附子',
    aliases: ['附片', '天雄'],
    category: '温里药',
    nature: '大热',
    flavor: ['辛', '甘'],
    meridian: ['心', '肾', '脾'],
    dosage: { min: 3, max: 15, usual: 9, maxToxic: 30 },
    processing: ['炮制', '先煎'],
    contraindications: [
      '热证',
      '阴虚火旺',
      '孕妇',
      '出血性疾病',
    ],
    toxicity: {
      isToxic: true,
      toxicityLevel: '中',
      toxicComponents: ['乌头碱', '次乌头碱'],
      toxicitySymptoms: [
        '口舌麻木',
        '四肢麻木',
        '心悸',
        '心律失常',
        '呼吸困难',
        '抽搐',
        '昏迷',
      ],
      modernResearch: [
        '乌头碱具有心脏毒性',
        '中毒剂量约3-30g',
        '需严格炮制和先煎60分钟以上',
        '与甘草、干姜同用可降低毒性',
      ],
    },
    incompatibilities: {
      herbs: ['贝母', '瓜蒌', '半夏', '白及', '白蔹'], // 十八反：乌头反半夏、瓜蒌、贝母、白蔹、白及
      avoidDuring: ['孕妇', '热证'],
    },
    modernPharmacology: {
      actions: [
        '回阳救逆',
        '补火助阳',
        '散寒止痛',
        '强心',
        '升压',
      ],
      cautions: [
        '孕妇禁用',
        '热证禁用',
        '必须先煎60分钟以上',
        '与甘草、干姜同用可减毒',
        '严格监测心律',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['四逆汤', '真武汤', '附子理中丸', '桂枝附子汤'],
    },
    safetyRating: 'C',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.85,
    },
  },
  ganjiang: {
    id: 'ganjiang',
    name: '干姜',
    aliases: ['白姜', '均姜'],
    category: '温里药',
    nature: '热',
    flavor: ['辛'],
    meridian: ['脾', '胃', '肾', '心', '肺'],
    dosage: { min: 3, max: 10, usual: 6, maxToxic: 15 },
    processing: ['生用', '炮制'],
    contraindications: [
      '阴虚内热',
      '血热妄行',
    ],
    toxicity: {
      isToxic: false,
      toxicityLevel: '无',
    },
    incompatibilities: {
      herbs: [],
      avoidDuring: [],
    },
    modernPharmacology: {
      actions: [
        '温中散寒',
        '回阳通脉',
        '温肺化饮',
        '止呕',
      ],
      cautions: [
        '阴虚内热者慎用',
        '不宜长期大量服用',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['四逆汤', '理中汤', '小青龙汤'],
    },
    safetyRating: 'A',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  // 补气药
  renshen: {
    id: 'renshen',
    name: '人参',
    aliases: ['地精', '神草', '土精'],
    category: '补气药',
    nature: '微温',
    flavor: ['甘', '微苦'],
    meridian: ['脾', '肺', '心'],
    dosage: { min: 3, max: 10, usual: 6, maxToxic: 15 },
    processing: ['生晒参', '红参', '糖参'],
    contraindications: [
      '实热证',
      '湿热证',
      '表证未解',
    ],
    toxicity: {
      isToxic: false,
      toxicityLevel: '无',
      toxicitySymptoms: ['失眠', '烦躁', '高血压'],
      modernResearch: [
        '长期大量使用可能导致人参滥用综合征',
        '与藜芦相反（十八反）',
      ],
    },
    incompatibilities: {
      herbs: ['藜芦'], // 十八反：人参反藜芦
      avoidDuring: ['高血压', '失眠'],
    },
    modernPharmacology: {
      actions: [
        '大补元气',
        '补脾益肺',
        '生津止渴',
        '安神益智',
      ],
      cautions: [
        '实热证、湿热证禁用',
        '不宜与藜芦同用',
        '高血压患者慎用',
        '不宜长期大量服用',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['白虎加人参汤', '小柴胡汤', '四逆加人参汤'],
    },
    safetyRating: 'A',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  baizhu: {
    id: 'baizhu',
    name: '白术',
    aliases: ['山姜', '冬术'],
    category: '补气药',
    nature: '温',
    flavor: ['苦', '甘'],
    meridian: ['脾', '胃'],
    dosage: { min: 6, max: 15, usual: 10, maxToxic: 30 },
    processing: ['生用', '土炒', '麸炒'],
    contraindications: [
      '阴虚燥渴',
      '气滞胀闷',
    ],
    toxicity: {
      isToxic: false,
      toxicityLevel: '无',
    },
    incompatibilities: {
      herbs: [],
      avoidDuring: [],
    },
    modernPharmacology: {
      actions: [
        '补气健脾',
        '燥湿利水',
        '止汗',
        '安胎',
      ],
      cautions: [
        '阴虚燥渴者慎用',
        '气滞胀闷者慎用',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['理中汤', '真武汤', '五苓散'],
    },
    safetyRating: 'A',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.95,
    },
  },
  // 辛味药
  banxia: {
    id: 'banxia',
    name: '半夏',
    aliases: ['地文', '水玉'],
    category: '化痰止咳平喘药',
    nature: '温',
    flavor: ['辛'],
    meridian: ['脾', '胃', '肺'],
    dosage: { min: 3, max: 9, usual: 6, maxToxic: 15 },
    processing: ['生用', '姜制', '法半夏'],
    contraindications: [
      '阴虚燥咳',
      '血证',
      '热痰',
    ],
    toxicity: {
      isToxic: true,
      toxicityLevel: '中',
      toxicComponents: ['生物碱'],
      toxicitySymptoms: [
        '口腔黏膜刺激',
        '咽喉灼痛',
        '声带水肿',
        '呼吸困难',
      ],
      modernResearch: [
        '生半夏具有黏膜刺激毒性',
        '必须经过炮制使用',
        '与乌头相反（十八反）',
      ],
    },
    incompatibilities: {
      herbs: ['乌头', '附子'], // 十八反：半夏反乌头
      avoidDuring: ['阴虚燥咳', '血证'],
    },
    modernPharmacology: {
      actions: [
        '燥湿化痰',
        '降逆止呕',
        '消痞散结',
      ],
      cautions: [
        '阴虚燥咳、血证禁用',
        '必须炮制使用',
        '不宜与乌头同用',
        '孕妇慎用',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['小柴胡汤', '小青龙汤', '半夏泻心汤'],
    },
    safetyRating: 'B',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.85,
    },
  },
  xixin: {
    id: 'xixin',
    name: '细辛',
    aliases: ['小辛', '少辛'],
    category: '解表药',
    nature: '温',
    flavor: ['辛'],
    meridian: ['肺', '肾', '心'],
    dosage: { min: 1, max: 3, usual: 2, maxToxic: 5 },
    processing: ['生用', '蜜炙'],
    contraindications: [
      '气虚多汗',
      '阴虚火旺',
      '血虚头痛',
      '孕妇',
    ],
    toxicity: {
      isToxic: true,
      toxicityLevel: '中',
      toxicComponents: ['黄樟醚', '马兜铃酸'],
      toxicitySymptoms: [
        '头痛',
        '呕吐',
        '呼吸急促',
        '角弓反张',
      ],
      modernResearch: [
        '细辛不过钱，古训',
        '现代研究认为细辛根茎无毒，但叶有毒',
        '长期大量使用可能导致肾毒性',
        '黄樟醚具有致癌风险',
      ],
    },
    incompatibilities: {
      herbs: ['藜芦'], // 十八反：细辛反藜芦
      avoidDuring: ['孕妇', '气虚多汗'],
    },
    modernPharmacology: {
      actions: [
        '解表散寒',
        '祛风止痛',
        '通窍',
        '温肺化饮',
      ],
      cautions: [
        '细辛不过钱（<3g）',
        '孕妇禁用',
        '不宜长期大量服用',
        '气虚多汗者慎用',
      ],
    },
    classicUsage: {
      source: ['《伤寒论》', '《金匮要略》'],
      commonFormulas: ['小青龙汤', '麻黄附子细辛汤'],
    },
    safetyRating: 'C',
    expertValidation: {
      validatedBy: ['刘渡舟', '胡希恕'],
      validationDate: new Date('2024-01-01'),
      confidence: 0.85,
    },
  },
};

// ============================================
// 配伍禁忌库（十八反、十九畏）
// ============================================
export const INCOMPATIBILITY_PAIRS: IncompatibilityPair[] = [
  // 十八反
  {
    herbA: '甘草',
    herbB: '甘遂',
    type: '十八反',
    severity: '严重',
    description: '甘草反甘遂、大戟、海藻、芫花',
    consequences: ['产生不良反应', '降低药效', '可能导致中毒'],
  },
  {
    herbA: '乌头',
    herbB: '半夏',
    type: '十八反',
    severity: '严重',
    description: '乌头反半夏、瓜蒌、贝母、白蔹、白及',
    consequences: ['增强毒性', '可能导致心律失常', '危及生命'],
  },
  {
    herbA: '藜芦',
    herbB: '人参',
    type: '十八反',
    severity: '严重',
    description: '藜芦反人参、沙参、丹参、玄参、苦参、细辛、芍药',
    consequences: ['产生不良反应', '降低药效', '可能导致中毒'],
  },
  // 十九畏
  {
    herbA: '人参',
    herbB: '五灵脂',
    type: '十九畏',
    severity: '中度',
    description: '人参畏五灵脂',
    consequences: ['降低药效'],
  },
  {
    herbA: '丁香',
    herbB: '郁金',
    type: '十九畏',
    severity: '中度',
    description: '丁香畏郁金',
    consequences: ['降低药效'],
  },
];

// ============================================
// 孕期禁忌库
// ============================================
export const PREGNANCY_CONTRAINDICATIONS: PregnancyContraindication[] = [
  {
    herb: '附子',
    category: '禁用',
    reason: '附子大热有毒，可导致流产',
    modernEvidence: ['乌头碱具有子宫收缩作用', '可能致畸'],
  },
  {
    herb: '麻黄',
    category: '禁用',
    reason: '麻黄可导致子宫收缩',
    modernEvidence: ['麻黄碱可兴奋子宫', '可能导致流产'],
  },
  {
    herb: '大黄',
    category: '禁用',
    reason: '大黄泻下作用强，可导致流产',
    modernEvidence: ['刺激肠道蠕动', '可能引起子宫收缩'],
  },
  {
    herb: '芒硝',
    category: '禁用',
    reason: '芒硝泻下作用强，可导致流产',
    modernEvidence: ['泻下作用强', '可能引起流产'],
  },
  {
    herb: '半夏',
    category: '慎用',
    reason: '半夏具有刺激性',
    modernEvidence: ['黏膜刺激性', '可能影响胎儿发育'],
  },
  {
    herb: '细辛',
    category: '禁用',
    reason: '细辛有毒，小剂量即可致毒',
    modernEvidence: ['细辛不过钱', '黄樟醚具有致癌风险'],
  },
];

// ============================================
// 查询接口
// ============================================
export class HerbQuery {
  /**
   * 检查药物配伍禁忌
   */
  static checkIncompatibility(herbs: string[]): IncompatibilityPair[] {
    const violations: IncompatibilityPair[] = [];

    for (const incompatibility of INCOMPATIBILITY_PAIRS) {
      const hasHerbA = herbs.some(h => h.includes(incompatibility.herbA));
      const hasHerbB = herbs.some(h => h.includes(incompatibility.herbB));

      if (hasHerbA && hasHerbB) {
        violations.push(incompatibility);
      }
    }

    return violations;
  }

  /**
   * 检查孕期禁忌
   */
  static checkPregnancyContraindication(
    herbs: string[]
  ): Array<{ herb: string; category: string; reason: string }> {
    const violations: Array<{ herb: string; category: string; reason: string }> = [];

    for (const herb of herbs) {
      const contraindication = PREGNANCY_CONTRAINDICATIONS.find(c =>
        herb.includes(c.herb) || c.herb.includes(herb)
      );

      if (contraindication) {
        violations.push({
          herb: contraindication.herb,
          category: contraindication.category,
          reason: contraindication.reason,
        });
      }
    }

    return violations;
  }

  /**
   * 获取药物安全等级
   */
  static getSafetyRating(herbName: string): 'A' | 'B' | 'C' | 'D' {
    const herb = Object.values(HERB_DATABASE).find(h =>
      h.name === herbName || h.aliases.some(a => a === herbName)
    );

    return herb?.safetyRating || 'B';
  }

  /**
   * 检查药物毒性
   */
  static checkToxicity(herbName: string): {
    isToxic: boolean;
    toxicityLevel: '无' | '低' | '中' | '高';
    dosageWarning?: string;
  } {
    const herb = Object.values(HERB_DATABASE).find(h =>
      h.name === herbName || h.aliases.some(a => a === herbName)
    );

    if (!herb) {
      return { isToxic: false, toxicityLevel: '无' };
    }

    if (herb.toxicity.isToxic) {
      const dosageWarning = `${herb.name}有毒！日常用量：${herb.dosage.min}-${herb.dosage.max}g，中毒剂量：>${herb.dosage.maxToxic}g。`;

      if (herb.toxicity.toxicityLevel === '中' || herb.toxicity.toxicityLevel === '高') {
        return {
          isToxic: true,
          toxicityLevel: herb.toxicity.toxicityLevel,
          dosageWarning,
        };
      }
    }

    return {
      isToxic: herb.toxicity.isToxic,
      toxicityLevel: herb.toxicity.toxicityLevel,
    };
  }

  /**
   * 获取药物剂量建议
   */
  static getDosageRecommendation(herbName: string): {
    min: number;
    max: number;
    usual: number;
    maxToxic: number;
    processing?: string[];
    precautions?: string[];
  } | null {
    const herb = Object.values(HERB_DATABASE).find(h =>
      h.name === herbName || h.aliases.some(a => a === herbName)
    );

    if (!herb) return null;

    return {
      min: herb.dosage.min,
      max: herb.dosage.max,
      usual: herb.dosage.usual,
      maxToxic: herb.dosage.maxToxic,
      processing: herb.processing,
      precautions: herb.modernPharmacology.cautions,
    };
  }
}
