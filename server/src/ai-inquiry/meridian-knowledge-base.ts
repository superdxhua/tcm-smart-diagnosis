/**
 * 六经辨证知识库
 * 基于《伤寒论》《金匮要略》构建的经方医学专业辨证体系
 */

export interface MeridianSyndrome {
  name: string;                  // 六经名称
  description: string;           // 病机总纲
  location: '表' | '里' | '半表半里';  // 病位
  nature: '寒' | '热' | '寒热错杂';   // 病性
  keySymptoms: string[];         // 关键症状（主证）
  differentialPoints: string[];  // 辨证要点
  classicFormulas: string[];     // 经典方剂
  transmissionRules: string[];   // 传变规律
  complications: string[];       // 合病并病
}

export interface FormulaEvidence {
  formulaName: string;           // 方剂名称
  source: '伤寒论' | '金匮要略';  // 出处
  meridianSyndrome: string;      // 所属六经
  keySymptoms: string[];         // 关键症状（方证）
  indication: string;            // 适应症
  contraindications: string[];   // 禁忌症
  modifications: string[];       // 加减变化
  weight: number;                // 权重（1-10，权重越高越关键）
}

export interface SymptomWeight {
  symptom: string;               // 症状名称
  weight: number;                // 权重（1-10，权重越高越关键）
  relatedMeridians: string[];    // 相关六经
  relatedFormulas: string[];     // 相关方剂
}

export interface ContradictionRule {
  name: string;                  // 假象名称
  description: string;           // 假象描述
  trueSyndrome: string;          // 真实病机
  keyIndicators: string[];       // 关键指征
  followUpQuestions: string[];   // 追问问题
}

/**
 * 六经病证数据
 */
export const MERIDIAN_SYNDROMES: MeridianSyndrome[] = [
  {
    name: '太阳病',
    description: '风寒束表，卫阳被遏，营阴郁滞',
    location: '表',
    nature: '寒',
    keySymptoms: [
      '恶寒发热',
      '头项强痛',
      '脉浮'
    ],
    differentialPoints: [
      '汗出与否（中风/伤寒）',
      '头痛部位',
      '有无喘息',
      '有无身痛骨节疼痛'
    ],
    classicFormulas: [
      '桂枝汤',
      '麻黄汤',
      '大青龙汤',
      '小青龙汤',
      '葛根汤'
    ],
    transmissionRules: [
      '失治误治可传入阳明（热化）',
      '素体阳虚可传入少阴（寒化）',
      '素体湿盛可传入太阴'
    ],
    complications: [
      '太阳阳明合病',
      '太阳少阳合病',
      '太阳太阴合病'
    ]
  },
  {
    name: '阳明病',
    description: '胃家实热，燥热内结',
    location: '里',
    nature: '热',
    keySymptoms: [
      '不恶寒反恶热',
      '大热大汗大渴',
      '脉洪大或沉实'
    ],
    differentialPoints: [
      '有无便秘（经证/腑证）',
      '有无谵语',
      '有无腹胀满痛',
      '有无潮热'
    ],
    classicFormulas: [
      '白虎汤',
      '白虎加人参汤',
      '承气汤类（大承气、小承气、调胃承气）',
      '麻子仁丸'
    ],
    transmissionRules: [
      '太阳病失治传入',
      '少阳病误下传入',
      '可热盛伤阴转为少阴'
    ],
    complications: [
      '三阳合病',
      '阳明太阴合病'
    ]
  },
  {
    name: '少阳病',
    description: '枢机不利，胆火内郁',
    location: '半表半里',
    nature: '寒热错杂',
    keySymptoms: [
      '口苦咽干目眩',
      '往来寒热',
      '胸胁苦满',
      '默默不欲饮食',
      '心烦喜呕'
    ],
    differentialPoints: [
      '有无口苦咽干',
      '有无胸胁苦满',
      '有无心烦喜呕',
      '有无往来寒热'
    ],
    classicFormulas: [
      '小柴胡汤',
      '大柴胡汤',
      '柴胡桂枝汤',
      '柴胡加龙骨牡蛎汤'
    ],
    transmissionRules: [
      '太阳病传入',
      '阳明病传入',
      '可传三阴（太阴/少阴/厥阴）'
    ],
    complications: [
      '太阳少阳合病',
      '少阳阳明合病',
      '三阳合病'
    ]
  },
  {
    name: '太阴病',
    description: '脾胃虚寒，运化失职',
    location: '里',
    nature: '寒',
    keySymptoms: [
      '腹满而吐',
      '食不下',
      '自利益甚',
      '时腹自痛'
    ],
    differentialPoints: [
      '腹痛喜按与否（虚/实）',
      '得温减否（寒/热）',
      '大便是否完谷不化',
      '有无口渴'
    ],
    classicFormulas: [
      '理中汤',
      '桂枝加芍药汤',
      '桂枝加大黄汤',
      '小建中汤'
    ],
    transmissionRules: [
      '太阳病误下传入',
      '少阳病误下传入',
      '可转归少阴（肾阳虚衰）'
    ],
    complications: [
      '太阳太阴合病',
      '太阴少阴合病'
    ]
  },
  {
    name: '少阴病',
    description: '心肾阳虚，阴寒内盛',
    location: '里',
    nature: '寒',
    keySymptoms: [
      '脉微细',
      '但欲寐',
      '恶寒蜷卧'
    ],
    differentialPoints: [
      '脉象（微细/沉伏）',
      '精神状态（但欲寐/烦躁）',
      '有无下利清谷',
      '有无四肢厥冷'
    ],
    classicFormulas: [
      '四逆汤',
      '真武汤',
      '附子汤',
      '白通汤',
      '通脉四逆汤'
    ],
    transmissionRules: [
      '太阴病传入',
      '少阳病传入',
      '误治亡阳所致'
    ],
    complications: [
      '少阴太阴合病',
      '少阴厥阴合病',
      '少阴阴竭阳脱'
    ]
  },
  {
    name: '厥阴病',
    description: '阴阳两虚，寒热错杂',
    location: '里',
    nature: '寒热错杂',
    keySymptoms: [
      '消渴',
      '气上撞心',
      '心中疼热',
      '饥而不欲食',
      '吐蛔'
    ],
    differentialPoints: [
      '有无寒热错杂表现',
      '有无心中疼热',
      '有无饥而不欲食',
      '有无四肢厥逆'
    ],
    classicFormulas: [
      '乌梅丸',
      '当归四逆汤',
      '麻黄升麻汤',
      '干姜黄芩黄连人参汤'
    ],
    transmissionRules: [
      '少阴病传入',
      '太阴病传入',
      '阴阳两虚转归'
    ],
    complications: [
      '厥阴少阴合病',
      '厥阴太阴合病'
    ]
  }
];

/**
 * 方证对应数据库（经典方剂）
 */
export const FORMULA_EVIDENCES: FormulaEvidence[] = [
  // 太阳病方剂
  {
    formulaName: '桂枝汤',
    source: '伤寒论',
    meridianSyndrome: '太阳病（中风）',
    keySymptoms: [
      '发热汗出',
      '恶风',
      '脉浮缓',
      '头痛',
      '鼻鸣干呕'
    ],
    indication: '太阳中风表虚证，营卫不和',
    contraindications: [
      '无汗脉浮紧者禁用',
      '酒客不喜甘者禁用'
    ],
    modifications: [
      '喘者加厚朴、杏子',
      '项背强几几者加葛根',
      '胸满者去芍药'
    ],
    weight: 10
  },
  {
    formulaName: '麻黄汤',
    source: '伤寒论',
    meridianSyndrome: '太阳病（伤寒）',
    keySymptoms: [
      '恶寒发热',
      '无汗而喘',
      '头痛身痛',
      '骨节疼痛',
      '脉浮紧'
    ],
    indication: '太阳伤寒表实证，风寒束表',
    contraindications: [
      '表虚自汗者禁用',
      '体虚者慎用',
      '孕妇禁用'
    ],
    modifications: [
      '烦躁者加石膏（大青龙汤）',
      '兼水饮内停者加细辛、干姜等（小青龙汤）',
      '项背强几几者加葛根（葛根汤）'
    ],
    weight: 10
  },
  {
    formulaName: '大青龙汤',
    source: '伤寒论',
    meridianSyndrome: '太阳病（伤寒兼内热）',
    keySymptoms: [
      '发热恶寒',
      '身疼痛',
      '不汗出而烦躁',
      '脉浮紧'
    ],
    indication: '太阳伤寒兼内热，表寒里热',
    contraindications: [
      '脉微弱者禁用（亡阳之虑）',
      '汗出恶风者禁用'
    ],
    modifications: [],
    weight: 8
  },
  {
    formulaName: '小青龙汤',
    source: '伤寒论',
    meridianSyndrome: '太阳病（外寒内饮）',
    keySymptoms: [
      '恶寒发热',
      '无汗',
      '咳嗽气喘',
      '痰多清稀',
      '头面浮肿'
    ],
    indication: '外寒内饮，风寒束表，水饮内停',
    contraindications: [
      '阴虚火旺者慎用',
      '咳血者慎用'
    ],
    modifications: [
      '若渴去半夏加瓜蒌根',
      '若微利去麻黄加荛花',
      '若噎去麻黄加附子',
      '若小便不利小腹满去麻黄加茯苓'
    ],
    weight: 9
  },
  {
    formulaName: '葛根汤',
    source: '伤寒论',
    meridianSyndrome: '太阳病（项背强急）',
    keySymptoms: [
      '项背强几几',
      '无汗恶风',
      '身痛',
      '脉浮紧'
    ],
    indication: '太阳病项背强急，太阳经输不利',
    contraindications: [
      '表虚自汗者慎用'
    ],
    modifications: [
      '下利者倍葛根'
    ],
    weight: 8
  },

  // 阳明病方剂
  {
    formulaName: '白虎汤',
    source: '伤寒论',
    meridianSyndrome: '阳明病（经证）',
    keySymptoms: [
      '四大：大热大汗大渴脉洪大',
      '不恶寒反恶热',
      '面赤',
      '烦躁'
    ],
    indication: '阳明经证，阳明气分热盛',
    contraindications: [
      '表证未解者禁用',
      '无汗者慎用',
      '脉浮者禁用'
    ],
    modifications: [
      '气阴两虚者加人参（白虎加人参汤）'
    ],
    weight: 10
  },
  {
    formulaName: '大承气汤',
    source: '伤寒论',
    meridianSyndrome: '阳明病（腑实证）',
    keySymptoms: [
      '大便秘结',
      '腹胀满痛',
      '潮热',
      '谵语',
      '脉沉实有力'
    ],
    indication: '阳明腑实证，燥热内结',
    contraindications: [
      '表证未解者禁用',
      '年老体弱者慎用',
      '孕妇禁用',
      '病后津伤者慎用'
    ],
    modifications: [
      '轻者用小承气汤',
      '轻用缓下者用调胃承气汤'
    ],
    weight: 10
  },
  {
    formulaName: '小承气汤',
    source: '伤寒论',
    meridianSyndrome: '阳明病（轻症腑实证）',
    keySymptoms: [
      '大便不通',
      '腹胀满',
      '微烦',
      '脉沉实'
    ],
    indication: '阳明腑实证轻症，热结便秘',
    contraindications: [
      '表证未解者禁用',
      '体虚者慎用'
    ],
    modifications: [],
    weight: 7
  },

  // 少阳病方剂
  {
    formulaName: '小柴胡汤',
    source: '伤寒论',
    meridianSyndrome: '少阳病',
    keySymptoms: [
      '口苦咽干目眩',
      '往来寒热',
      '胸胁苦满',
      '默默不欲饮食',
      '心烦喜呕'
    ],
    indication: '少阳病，枢机不利，胆火内郁',
    contraindications: [
      '纯表证禁用',
      '纯里实便秘禁用'
    ],
    modifications: [
      '胸中烦而不呕去半夏、人参，加瓜蒌',
      '渴者去半夏加瓜蒌根、人参',
      '腹中痛去黄芩加芍药',
      '胁下痞硬去大枣加牡蛎',
      '心下悸小便不利去黄芩加茯苓'
    ],
    weight: 10
  },
  {
    formulaName: '大柴胡汤',
    source: '伤寒论',
    meridianSyndrome: '少阳病（兼阳明腑实）',
    keySymptoms: [
      '往来寒热',
      '胸胁苦满',
      '呕不止',
      '心下急',
      '郁郁微烦',
      '便秘'
    ],
    indication: '少阳兼阳明腑实，少阳阳明合病',
    contraindications: [
      '体虚者慎用',
      '孕妇慎用'
    ],
    modifications: [],
    weight: 9
  },

  // 太阴病方剂
  {
    formulaName: '理中汤',
    source: '伤寒论',
    meridianSyndrome: '太阴病',
    keySymptoms: [
      '腹满而吐',
      '食不下',
      '自利益甚',
      '时腹自痛',
      '舌苔白润'
    ],
    indication: '太阴病，脾胃虚寒，运化失职',
    contraindications: [
      '胃热实证禁用',
      '阴虚火旺者慎用'
    ],
    modifications: [
      '肾阳虚甚加附子（附子理中丸）',
      '吐甚加生姜',
      '下利甚加茯苓、白术增量'
    ],
    weight: 10
  },
  {
    formulaName: '小建中汤',
    source: '伤寒论',
    meridianSyndrome: '太阴病（虚劳里急）',
    keySymptoms: [
      '腹中急痛',
      '心中悸而烦',
      '面色无华',
      '手足烦热'
    ],
    indication: '太阴虚劳，中焦虚寒，营卫不和',
    contraindications: [
      '呕家禁用',
      '中满者禁用',
      '吐蛔者禁用'
    ],
    modifications: [
      '气虚甚加黄芪（黄芪建中汤）',
      '血虚甚加当归（当归建中汤）'
    ],
    weight: 8
  },

  // 少阴病方剂
  {
    formulaName: '四逆汤',
    source: '伤寒论',
    meridianSyndrome: '少阴病（亡阳）',
    keySymptoms: [
      '四肢厥冷',
      '恶寒蜷卧',
      '神衰欲寐',
      '下利清谷',
      '脉微欲绝'
    ],
    indication: '少阴病，心肾阳虚，阴寒内盛',
    contraindications: [
      '真热假寒禁用',
      '热厥禁用'
    ],
    modifications: [
      '脉不出加人参（四逆加人参汤）',
      '里寒外热面赤者加葱白（通脉四逆汤）'
    ],
    weight: 10
  },
  {
    formulaName: '真武汤',
    source: '伤寒论',
    meridianSyndrome: '少阴病（阳虚水泛）',
    keySymptoms: [
      '头眩',
      '心下悸',
      '身瞤动',
      '小便不利',
      '四肢沉重疼痛',
      '腹痛下利'
    ],
    indication: '少阴病，脾肾阳虚，水气内停',
    contraindications: [
      '阴虚火旺者禁用',
      '热淋者禁用'
    ],
    modifications: [
      '咳者加五味子、细辛、干姜',
      '小便利者去茯苓',
      '下利者去芍药加干姜',
      '呕者去附子加生姜'
    ],
    weight: 10
  },

  // 厥阴病方剂
  {
    formulaName: '乌梅丸',
    source: '伤寒论',
    meridianSyndrome: '厥阴病（寒热错杂）',
    keySymptoms: [
      '消渴',
      '气上撞心',
      '心中疼热',
      '饥而不欲食',
      '吐蛔',
      '四肢厥冷'
    ],
    indication: '厥阴病，寒热错杂，蛔厥',
    contraindications: [
      '无蛔虫者慎用',
      '纯寒无热者慎用'
    ],
    modifications: [],
    weight: 10
  },
  {
    formulaName: '当归四逆汤',
    source: '伤寒论',
    meridianSyndrome: '厥阴病（血虚寒厥）',
    keySymptoms: [
      '手足厥冷',
      '肢体疼痛',
      '脉细欲绝',
      '面色苍白'
    ],
    indication: '厥阴病，血虚寒凝，经脉不利',
    contraindications: [
      '热厥禁用',
      '阴虚火旺者慎用'
    ],
    modifications: [
      '内有久寒者加吴茱萸、生姜',
      '腹痛者加重芍药'
    ],
    weight: 9
  }
];

/**
 * 症状权重表（关键症状排序）
 */
export const SYMPTOM_WEIGHTS: SymptomWeight[] = [
  { symptom: '恶寒发热', weight: 10, relatedMeridians: ['太阳病'], relatedFormulas: ['桂枝汤', '麻黄汤'] },
  { symptom: '无汗', weight: 9, relatedMeridians: ['太阳病'], relatedFormulas: ['麻黄汤', '大青龙汤'] },
  { symptom: '汗出', weight: 9, relatedMeridians: ['太阳病'], relatedFormulas: ['桂枝汤', '白虎汤'] },
  { symptom: '往来寒热', weight: 10, relatedMeridians: ['少阳病'], relatedFormulas: ['小柴胡汤'] },
  { symptom: '口苦咽干', weight: 9, relatedMeridians: ['少阳病'], relatedFormulas: ['小柴胡汤'] },
  { symptom: '胸胁苦满', weight: 8, relatedMeridians: ['少阳病'], relatedFormulas: ['小柴胡汤', '大柴胡汤'] },
  { symptom: '大渴', weight: 9, relatedMeridians: ['阳明病'], relatedFormulas: ['白虎汤'] },
  { symptom: '大便秘结', weight: 8, relatedMeridians: ['阳明病'], relatedFormulas: ['大承气汤'] },
  { symptom: '腹满而吐', weight: 8, relatedMeridians: ['太阴病'], relatedFormulas: ['理中汤'] },
  { symptom: '下利清谷', weight: 10, relatedMeridians: ['少阴病'], relatedFormulas: ['四逆汤'] },
  { symptom: '脉微细', weight: 10, relatedMeridians: ['少阴病'], relatedFormulas: ['四逆汤', '真武汤'] },
  { symptom: '但欲寐', weight: 9, relatedMeridians: ['少阴病'], relatedFormulas: ['四逆汤'] },
  { symptom: '四肢厥冷', weight: 9, relatedMeridians: ['少阴病', '厥阴病'], relatedFormulas: ['四逆汤', '当归四逆汤'] },
  { symptom: '头眩心下悸', weight: 8, relatedMeridians: ['少阴病'], relatedFormulas: ['真武汤'] },
  { symptom: '消渴', weight: 8, relatedMeridians: ['厥阴病'], relatedFormulas: ['乌梅丸'] },
  { symptom: '心中疼热', weight: 8, relatedMeridians: ['厥阴病'], relatedFormulas: ['乌梅丸'] },
  { symptom: '舌淡苔白', weight: 7, relatedMeridians: ['太阴病', '少阴病'], relatedFormulas: ['理中汤', '四逆汤'] },
  { symptom: '舌红苔黄', weight: 7, relatedMeridians: ['阳明病'], relatedFormulas: ['白虎汤'] },
];

/**
 * 假象识别规则（矛盾检测）
 */
export const CONTRADICTION_RULES: ContradictionRule[] = [
  {
    name: '阴盛格阳（真寒假热）',
    description: '体内阴寒过盛，格阳于外，出现假热象',
    trueSyndrome: '少阴病（亡阳）',
    keyIndicators: [
      '发热但想盖厚被',
      '面赤但手足冰冷',
      '口渴但只想漱口不欲咽',
      '脉虽浮而无力'
    ],
    followUpQuestions: [
      '发热时是否想盖厚被子？',
      '手脚是否冰冷？',
      '喝水时是整口咽下去还是只漱口？',
      '精神是否疲惫想睡觉？'
    ]
  },
  {
    name: '阳盛格阴（真热假寒）',
    description: '体内热盛，格阴于外，出现假寒象',
    trueSyndrome: '阳明病（热盛）',
    keyIndicators: [
      '四肢冰冷但身热胸热',
      '恶寒但不欲加衣',
      '口渴喜冷饮',
      '脉沉有力或滑数'
    ],
    followUpQuestions: [
      '手脚冷时胸腹部是否发热？',
      '是否不想加衣服盖被子？',
      '是否想喝冷水？',
      '小便是否黄赤？'
    ]
  },
  {
    name: '瘀血内阻',
    description: '瘀血阻滞，气血运行不畅',
    trueSyndrome: '瘀血证',
    keyIndicators: [
      '口渴但只漱水不欲咽',
      '身体局部疼痛固定',
      '面色晦暗',
      '舌质紫暗有瘀点'
    ],
    followUpQuestions: [
      '身体某处是否长期疼痛？',
      '痛处是否固定不移？',
      '舌头边缘是否有瘀点？',
      '皮肤是否容易青紫？'
    ]
  },
  {
    name: '寒湿内阻',
    description: '寒湿内阻，气机不畅',
    trueSyndrome: '太阴病（寒湿）',
    keyIndicators: [
      '口渴但不想喝水',
      '胸脘痞闷',
      '头重如裹',
      '舌苔白腻'
    ],
    followUpQuestions: [
      '胸腹部是否感觉堵得慌？',
      '头是否感觉很重？',
      '小便是否清长？',
      '大便是否黏腻不爽？'
    ]
  }
];

/**
 * 辨证树节点定义
 */
export interface DiagnosticTreeNode {
  id: string;
  question: string;
  type: 'determinant' | 'confirmatory' | 'differentiation';  // 判定性/确认性/鉴别性
  targetMeridians: string[];
  targetFormulas?: string[];
  weight: number;
  branches: {
    answer: string | string[];  // 可以是单个答案或答案数组
    nextNodeId: string | 'complete';  // 下一节点ID或完成
    meridianAdjustments?: { meridian: string; delta: number }[];  // 经典概率调整
    formulaConfirmations?: { formula: string; confirmed: boolean }[];  // 方剂确认
  }[];
}

/**
 * 初始辨证树（太阳病入口）
 */
export const INITIAL_DIAGNOSTIC_TREE: DiagnosticTreeNode = {
  id: 'root',
  question: '是否恶寒（怕冷）？',
  type: 'determinant',
  targetMeridians: ['太阳病'],
  weight: 10,
  branches: [
    {
      answer: ['是', '有'],
      nextNodeId: 'fever_check',
      meridianAdjustments: [{ meridian: '太阳病', delta: 10 }]
    },
    {
      answer: ['否', '没有'],
      nextNodeId: 'other_meridian_check'
    }
  ]
};

/**
 * 辨证树节点集（完整）
 */
export const DIAGNOSTIC_TREE_NODES: Map<string, DiagnosticTreeNode> = new Map([
  ['root', INITIAL_DIAGNOSTIC_TREE],
  [
    'fever_check',
    {
      id: 'fever_check',
      question: '是否发热（发烧）？',
      type: 'determinant',
      targetMeridians: ['太阳病'],
      weight: 10,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'sweat_check',
          meridianAdjustments: [{ meridian: '太阳病', delta: 10 }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'taiyang_cold',
          formulaConfirmations: [{ formula: '桂枝汤', confirmed: true }]
        }
      ]
    }
  ],
  [
    'sweat_check',
    {
      id: 'sweat_check',
      question: '是否出汗？',
      type: 'determinant',
      targetMeridians: ['太阳病'],
      weight: 10,
      branches: [
        {
          answer: ['是', '有', '出汗'],
          nextNodeId: 'headache_check',
          meridianAdjustments: [
            { meridian: '太阳病', delta: 10 },
            { meridian: '太阳病（中风）', delta: 15 }
          ],
          formulaConfirmations: [{ formula: '桂枝汤', confirmed: true }]
        },
        {
          answer: ['否', '没有', '无汗'],
          nextNodeId: 'pain_check',
          meridianAdjustments: [
            { meridian: '太阳病', delta: 10 },
            { meridian: '太阳病（伤寒）', delta: 15 }
          ],
          formulaConfirmations: [{ formula: '麻黄汤', confirmed: true }]
        }
      ]
    }
  ],
  [
    'headache_check',
    {
      id: 'headache_check',
      question: '是否有头痛或身体疼痛？',
      type: 'confirmatory',
      targetMeridians: ['太阳病'],
      weight: 7,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'taiyang_wind_stroke',
          formulaConfirmations: [{ formula: '桂枝汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'other_symptoms'
        }
      ]
    }
  ],
  [
    'pain_check',
    {
      id: 'pain_check',
      question: '是否全身疼痛或骨节疼痛？',
      type: 'confirmatory',
      targetMeridians: ['太阳病'],
      weight: 7,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'breath_check',
          formulaConfirmations: [{ formula: '麻黄汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'breath_check'
        }
      ]
    }
  ],
  [
    'breath_check',
    {
      id: 'breath_check',
      question: '是否喘息或呼吸急促？',
      type: 'differentiation',
      targetMeridians: ['太阳病'],
      targetFormulas: ['麻黄汤', '大青龙汤'],
      weight: 8,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'dagan_check',
          meridianAdjustments: [{ meridian: '太阳病（伤寒）', delta: 10 }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'taiyang_cold'
        }
      ]
    }
  ],
  [
    'dagan_check',
    {
      id: 'dagan_check',
      question: '是否烦躁不安？',
      type: 'differentiation',
      targetMeridians: ['太阳病'],
      targetFormulas: ['大青龙汤'],
      weight: 8,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '大青龙汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '麻黄汤', confirmed: true }]
        }
      ]
    }
  ],
  [
    'taiyang_wind_stroke',
    {
      id: 'taiyang_wind_stroke',
      question: '是否恶风（怕风，有风则冷，无风则减）？',
      type: 'confirmatory',
      targetMeridians: ['太阳病'],
      weight: 8,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '桂枝汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '桂枝汤', confirmed: true }]
        }
      ]
    }
  ],
  [
    'taiyang_cold',
    {
      id: 'taiyang_cold',
      question: '是否头项强痛（脖子僵硬）？',
      type: 'confirmatory',
      targetMeridians: ['太阳病'],
      weight: 6,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '葛根汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'other_symptoms',
    {
      id: 'other_symptoms',
      question: '是否有以下症状？\n\nA. 口苦咽干、胸胁苦满\nB. 大热大汗大渴\nC. 腹满而吐、食不下\nD. 脉微细、但欲寐\nE. 消渴、心中疼热',
      type: 'determinant',
      targetMeridians: ['少阳病', '阳明病', '太阴病', '少阴病', '厥阴病'],
      weight: 10,
      branches: [
        {
          answer: ['A', '口苦咽干', '胸胁苦满'],
          nextNodeId: 'shaoyang_check',
          meridianAdjustments: [{ meridian: '少阳病', delta: 15 }]
        },
        {
          answer: ['B', '大热大汗大渴'],
          nextNodeId: 'yangming_check',
          meridianAdjustments: [{ meridian: '阳明病', delta: 30 }]
        },
        {
          answer: ['C', '腹满而吐', '食不下'],
          nextNodeId: 'taiyin_check',
          meridianAdjustments: [{ meridian: '太阴病', delta: 15 }]
        },
        {
          answer: ['D', '脉微细', '但欲寐'],
          nextNodeId: 'shaoyin_check',
          meridianAdjustments: [{ meridian: '少阴病', delta: 15 }]
        },
        {
          answer: ['E', '消渴', '心中疼热'],
          nextNodeId: 'jueyin_check',
          meridianAdjustments: [{ meridian: '厥阴病', delta: 15 }]
        }
      ]
    }
  ],
  [
    'other_meridian_check',
    {
      id: 'other_meridian_check',
      question: '是否有以下症状？\n\nA. 口苦咽干、往来寒热\nB. 大热大汗大渴\nC. 腹满而吐、自利\nD. 脉微细、但欲寐\nE. 消渴、心中疼热',
      type: 'determinant',
      targetMeridians: ['少阳病', '阳明病', '太阴病', '少阴病', '厥阴病'],
      weight: 10,
      branches: [
        {
          answer: ['A', '口苦咽干', '往来寒热'],
          nextNodeId: 'shaoyang_check',
          meridianAdjustments: [{ meridian: '少阳病', delta: 15 }]
        },
        {
          answer: ['B', '大热大汗大渴'],
          nextNodeId: 'yangming_check',
          meridianAdjustments: [{ meridian: '阳明病', delta: 30 }]
        },
        {
          answer: ['C', '腹满而吐', '自利'],
          nextNodeId: 'taiyin_check',
          meridianAdjustments: [{ meridian: '太阴病', delta: 15 }]
        },
        {
          answer: ['D', '脉微细', '但欲寐'],
          nextNodeId: 'shaoyin_check',
          meridianAdjustments: [{ meridian: '少阴病', delta: 15 }]
        },
        {
          answer: ['E', '消渴', '心中疼热'],
          nextNodeId: 'jueyin_check',
          meridianAdjustments: [{ meridian: '厥阴病', delta: 15 }]
        }
      ]
    }
  ],
  [
    'shaoyang_check',
    {
      id: 'shaoyang_check',
      question: '是否往来寒热（一阵冷一阵热）？',
      type: 'confirmatory',
      targetMeridians: ['少阳病'],
      weight: 10,
      branches: [
        {
          answer: ['是', '有'],
          meridianAdjustments: [{ meridian: '少阳病', delta: 20 }],
          nextNodeId: 'xiao_chaihu_check',
          formulaConfirmations: [{ formula: '小柴胡汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'xiao_chaihu_check',
    {
      id: 'xiao_chaihu_check',
      question: '是否默默不欲饮食、心烦喜呕？',
      type: 'confirmatory',
      targetMeridians: ['少阳病'],
      weight: 8,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '小柴胡汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'yangming_check',
    {
      id: 'yangming_check',
      question: '是否大便秘结、腹胀满痛？',
      type: 'differentiation',
      targetMeridians: ['阳明病'],
      targetFormulas: ['白虎汤', '大承气汤'],
      weight: 9,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'da_chengqi_check',
          meridianAdjustments: [{ meridian: '阳明病', delta: 20 }],
          formulaConfirmations: [{ formula: '大承气汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'baihu_check',
          meridianAdjustments: [{ meridian: '阳明病', delta: 20 }],
          formulaConfirmations: [{ formula: '白虎汤', confirmed: true }]
        }
      ]
    }
  ],
  [
    'da_chengqi_check',
    {
      id: 'da_chengqi_check',
      question: '是否有谵语（胡言乱语）？',
      type: 'confirmatory',
      targetMeridians: ['阳明病'],
      weight: 8,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '大承气汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'baihu_check',
    {
      id: 'baihu_check',
      question: '是否脉洪大？',
      type: 'confirmatory',
      targetMeridians: ['阳明病'],
      weight: 7,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '白虎汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'taiyin_check',
    {
      id: 'taiyin_check',
      question: '腹痛是否喜按（按着舒服）？得温是否减轻？',
      type: 'confirmatory',
      targetMeridians: ['太阴病'],
      weight: 9,
      branches: [
        {
          answer: ['是', '有', '喜按', '得温减'],
          nextNodeId: 'lizhong_check',
          formulaConfirmations: [{ formula: '理中汤', confirmed: true }]
        },
        {
          answer: ['否', '没有', '拒按', '得热不减'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'lizhong_check',
    {
      id: 'lizhong_check',
      question: '大便是否完谷不化（吃啥拉啥）？',
      type: 'confirmatory',
      targetMeridians: ['太阴病'],
      weight: 7,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '理中汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'shaoyin_check',
    {
      id: 'shaoyin_check',
      question: '是否但欲寐（只想睡觉，精神萎靡）？',
      type: 'confirmatory',
      targetMeridians: ['少阴病'],
      weight: 10,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'sini_check',
          formulaConfirmations: [{ formula: '四逆汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'sini_check',
    {
      id: 'sini_check',
      question: '是否四肢厥冷（手脚冰凉）？',
      type: 'confirmatory',
      targetMeridians: ['少阴病'],
      weight: 9,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'xiaoli_check',
          formulaConfirmations: [{ formula: '四逆汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'xiaoli_check',
    {
      id: 'xiaoli_check',
      question: '是否下利清谷（拉肚子，拉出未消化的食物）？',
      type: 'confirmatory',
      targetMeridians: ['少阴病'],
      weight: 9,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '四逆汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'zhenwu_check'
        }
      ]
    }
  ],
  [
    'zhenwu_check',
    {
      id: 'zhenwu_check',
      question: '是否头眩、心下悸、小便不利？',
      type: 'confirmatory',
      targetMeridians: ['少阴病'],
      weight: 8,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '真武汤', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'jueyin_check',
    {
      id: 'jueyin_check',
      question: '是否饥而不欲食（饿了但不想吃东西）？',
      type: 'confirmatory',
      targetMeridians: ['厥阴病'],
      weight: 9,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'wumei_check',
          formulaConfirmations: [{ formula: '乌梅丸', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ],
  [
    'wumei_check',
    {
      id: 'wumei_check',
      question: '是否心中疼热（心里有灼热感）？',
      type: 'confirmatory',
      targetMeridians: ['厥阴病'],
      weight: 8,
      branches: [
        {
          answer: ['是', '有'],
          nextNodeId: 'complete',
          formulaConfirmations: [{ formula: '乌梅丸', confirmed: true }]
        },
        {
          answer: ['否', '没有'],
          nextNodeId: 'complete'
        }
      ]
    }
  ]
]);
