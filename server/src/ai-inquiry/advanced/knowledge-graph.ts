/**
 * 顶级经方大师 - 三维知识图谱
 * 六经-八纲-方证 完整知识库
 */

import {
  MeridianOntology,
  MeridianType,
  EightGuidesOntology,
  EightGuides,
  FormulaEvidence,
  KnowledgeUnit,
  SymptomOntology,
  SyndromeOntology,
  MeridianTransmission,
} from './ontology-types';
import {
  getAllFormulasWithSupplementary,
  SUNYANG_FORMULAS,
  YANGMING_FORMULAS,
  SHAOYANG_FORMULAS,
  TAIYIN_FORMULAS,
  SHAOYIN_FORMULAS,
  JUEYIN_FORMULAS,
  SUPPLEMENTARY_FORMULAS,
} from '../extended-formula-evidence';

// ============================================
// 第一维度：六经本体论
// ============================================
export const MERIDIAN_ONTOLOGIES: Record<string, MeridianOntology> = {
  太阳: {
    id: '太阳',
    name: '太阳病',
    location: '表',
    nature: '寒',
    keyPathology: '风寒束表，卫阳被遏，营阴郁滞',
    transmissionRules: [
      {
        from: '太阳',
        to: '阳明',
        conditions: ['发热不恶寒反恶热', '汗出而渴'],
        probability: 0.7,
      },
      {
        from: '太阳',
        to: '少阳',
        conditions: ['误下', '胸胁苦满'],
        probability: 0.5,
      },
      {
        from: '太阳',
        to: '少阴',
        conditions: ['误汗亡阳', '脉微细但欲寐'],
        probability: 0.6,
      },
      {
        from: '太阳',
        to: '太阴',
        conditions: ['误下', '腹满而吐'],
        probability: 0.4,
      },
    ],
    classicFormulas: ['桂枝汤', '麻黄汤', '大青龙汤', '小青龙汤', '葛根汤', '五苓散'],
  },
  阳明: {
    id: '阳明',
    name: '阳明病',
    location: '里',
    nature: '热',
    keyPathology: '胃家实热，燥热内结',
    transmissionRules: [
      {
        from: '阳明',
        to: '少阴',
        conditions: ['过下伤阳', '四肢厥冷'],
        probability: 0.3,
      },
    ],
    classicFormulas: ['白虎汤', '大承气汤', '小承气汤', '调胃承气汤', '麻子仁丸'],
  },
  少阳: {
    id: '少阳',
    name: '少阳病',
    location: '半表半里',
    nature: '寒热错杂',
    keyPathology: '枢机不利，胆火内郁',
    transmissionRules: [
      {
        from: '少阳',
        to: '阳明',
        conditions: ['兼阳明里实', '便秘'],
        probability: 0.6,
      },
      {
        from: '少阳',
        to: '太阴',
        conditions: ['误下伤脾', '腹满'],
        probability: 0.4,
      },
    ],
    classicFormulas: ['小柴胡汤', '大柴胡汤', '柴胡桂枝汤', '柴胡加龙骨牡蛎汤'],
  },
  太阴: {
    id: '太阴',
    name: '太阴病',
    location: '里',
    nature: '寒',
    keyPathology: '脾胃虚寒，运化失职',
    transmissionRules: [
      {
        from: '太阴',
        to: '少阴',
        conditions: ['吐利甚', '亡阳'],
        probability: 0.5,
      },
    ],
    classicFormulas: ['理中汤', '桂枝加芍药汤', '桂枝加大黄汤', '小建中汤'],
  },
  少阴: {
    id: '少阴',
    name: '少阴病',
    location: '里',
    nature: '寒热错杂',
    keyPathology: '心肾阳虚，阴寒内盛',
    transmissionRules: [],
    classicFormulas: ['四逆汤', '真武汤', '附子汤', '黄连阿胶汤', '麻黄细辛附子汤'],
  },
  厥阴: {
    id: '厥阴',
    name: '厥阴病',
    location: '里',
    nature: '寒热错杂',
    keyPathology: '肝失疏泄，寒热错杂',
    transmissionRules: [],
    classicFormulas: ['乌梅丸', '当归四逆汤', '吴茱萸汤', '干姜黄芩黄连人参汤'],
  },
};

// ============================================
// 第二维度：八纲本体论
// ============================================
export const EIGHT_GUIDES_ONTOLOGIES: Record<string, EightGuidesOntology> = {
  表寒实证: {
    eightGuides: {
      location: '表',
      nature: '寒',
      deficiencyExcess: '实',
      yinYang: '阳',
    },
    characteristics: ['恶寒发热', '无汗', '头项强痛', '脉浮紧'],
    combinationRules: ['表寒+里实', '表寒+里虚'],
    differentiationPoints: ['有汗无汗', '脉浮缓还是浮紧'],
  },
  表寒虚证: {
    eightGuides: {
      location: '表',
      nature: '寒',
      deficiencyExcess: '虚',
      yinYang: '阳',
    },
    characteristics: ['恶风发热', '汗出', '脉浮缓'],
    combinationRules: ['表虚+里虚'],
    differentiationPoints: ['恶风还是恶寒', '汗出还是无汗'],
  },
  里热实证: {
    eightGuides: {
      location: '里',
      nature: '热',
      deficiencyExcess: '实',
      yinYang: '阳',
    },
    characteristics: ['不恶寒反恶热', '大热大汗大渴', '脉洪大或沉实'],
    combinationRules: ['里热+表寒', '里热+阴伤'],
    differentiationPoints: ['有无便秘', '脉象洪大还是沉实'],
  },
  里寒虚证: {
    eightGuides: {
      location: '里',
      nature: '寒',
      deficiencyExcess: '虚',
      yinYang: '阴',
    },
    characteristics: ['畏寒肢冷', '下利清谷', '脉微细'],
    combinationRules: ['里虚+表虚', '里寒+外热（真寒假热）'],
    differentiationPoints: ['有无下利', '脉象微细还是沉迟'],
  },
};

// ============================================
// 第三维度：方证本体论（经典条文）
// ============================================
export const FORMULA_EVIDENCES: Record<string, FormulaEvidence> = {
  桂枝汤: {
    formula: '桂枝汤',
    source: '伤寒论',
    chapter: '太阳病篇',
    originalText: '太阳中风，阳浮而阴弱，阳浮者，热自发；阴弱者，汗自出。啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。',
    keySymptoms: ['恶风', '发热', '汗出', '头痛', '脉浮缓'],
    mechanism: '营卫不和，卫气不固，营阴外泄',
    treatmentMethod: '调和营卫',
    indications: ['太阳中风表虚证', '营卫不和'],
    contraindications: ['表实证无汗', '里热证'],
    dosage: '桂枝9g，芍药9g，炙甘草6g，生姜9g，大枣12枚（擘）',
    instructions: '水煎服，每日1剂，温服。服后啜热稀粥适量，以助药力，覆衣被取微似汗，不可令大汗淋漓。',
  },
  麻黄汤: {
    formula: '麻黄汤',
    source: '伤寒论',
    chapter: '太阳病篇',
    originalText: '太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风无汗而喘者，麻黄汤主之。',
    keySymptoms: ['恶寒', '发热', '无汗', '头痛身痛', '喘', '脉浮紧'],
    mechanism: '风寒束表，营卫郁闭，肺气不宣',
    treatmentMethod: '解表',
    indications: ['太阳伤寒表实证', '风寒束表'],
    contraindications: ['表虚有汗', '体虚者慎用'],
    dosage: '麻黄9g，桂枝6g，杏仁9g，炙甘草3g',
    instructions: '水煎服，每日1剂，先煮麻黄，去上沫，内诸药，煮取药汁，温服，覆取微似汗。',
  },
  大承气汤: {
    formula: '大承气汤',
    source: '伤寒论',
    chapter: '阳明病篇',
    originalText: '阳明病，潮热，大便不通，腹大满不通者，大承气汤主之。',
    keySymptoms: ['不恶寒反恶热', '大便秘结', '腹胀满痛', '谵语', '脉沉实有力'],
    mechanism: '阳明腑实，燥热内结，腑气不通',
    treatmentMethod: '泻下',
    indications: ['阳明腑实证', '燥热内结'],
    contraindications: ['表证未解', '体虚者慎用'],
    dosage: '大黄12g，厚朴24g，枳实12g，芒硝9g',
    instructions: '水煎服，每日1剂，先煮厚朴、枳实，去滓，再下大黄，煮二沸，去滓，最后入芒硝，搅令溶化，温服。得下后余药停服。',
  },
  小柴胡汤: {
    formula: '小柴胡汤',
    source: '伤寒论',
    chapter: '少阳病篇',
    originalText: '少阳之为病，口苦、咽干、目眩也。',
    keySymptoms: ['口苦', '咽干', '目眩', '往来寒热', '胸胁苦满', '默默不欲饮食', '心烦喜呕'],
    mechanism: '枢机不利，胆火内郁，三焦失畅',
    treatmentMethod: '和解',
    indications: ['少阳病', '半表半里证'],
    contraindications: ['表证未解', '纯里实证'],
    dosage: '柴胡12g，黄芩9g，人参6g，半夏9g，炙甘草6g，生姜9g，大枣4枚',
    instructions: '水煎服，每日1剂，分三次温服。',
  },
  四逆汤: {
    formula: '四逆汤',
    source: '伤寒论',
    chapter: '少阴病篇',
    originalText: '少阴病，脉微细，但欲寐也。',
    keySymptoms: ['脉微细', '但欲寐', '畏寒肢冷', '下利清谷', '神衰欲寐'],
    mechanism: '少阴阳虚，阴寒内盛，阳气衰微',
    treatmentMethod: '回阳救逆',
    indications: ['少阴亡阳证', '心肾阳虚'],
    contraindications: ['热证', '阴虚火旺'],
    dosage: '附子12g（生用或先煎），干姜9g，炙甘草12g',
    instructions: '水煎服，每日1剂，附子先煎30分钟，温服。',
  },
};

// ============================================
// 三维知识单元（完整组合）
// ============================================
export const KNOWLEDGE_UNITS: KnowledgeUnit[] = [
  // 太阳病 - 表寒虚证 - 桂枝汤
  {
    id: 'taiyang-guizhi-tang',
    meridian: MERIDIAN_ONTOLOGIES.太阳,
    eightGuides: EIGHT_GUIDES_ONTOLOGIES.表寒虚证,
    formula: FORMULA_EVIDENCES.桂枝汤,
    confidence: 0.85,
    evidenceWeight: 0.9,
    relationships: [
      { type: 'contradiction', targetId: 'taiyang-mahuang-tang', strength: 0.9 },
      { type: 'inclusion', targetId: 'taiyang-taiyin-hebing', strength: 0.5 },
    ],
  },
  // 太阳病 - 表寒实证 - 麻黄汤
  {
    id: 'taiyang-mahuang-tang',
    meridian: MERIDIAN_ONTOLOGIES.太阳,
    eightGuides: EIGHT_GUIDES_ONTOLOGIES.表寒实证,
    formula: FORMULA_EVIDENCES.麻黄汤,
    confidence: 0.88,
    evidenceWeight: 0.95,
    relationships: [
      { type: 'contradiction', targetId: 'taiyang-guizhi-tang', strength: 0.9 },
      { type: 'transmission', targetId: 'shaoyin-sini-tang', strength: 0.6 },
    ],
  },
  // 阳明病 - 里热实证 - 大承气汤
  {
    id: 'yangming-dachengqi-tang',
    meridian: MERIDIAN_ONTOLOGIES.阳明,
    eightGuides: EIGHT_GUIDES_ONTOLOGIES.里热实证,
    formula: FORMULA_EVIDENCES.大承气汤,
    confidence: 0.9,
    evidenceWeight: 0.95,
    relationships: [
      { type: 'contradiction', targetId: 'yangming-baihu-tang', strength: 0.7 },
      { type: 'transmission', targetId: 'shaoyin-sini-tang', strength: 0.3 },
    ],
  },
  // 少阳病 - 半表半里 - 小柴胡汤
  {
    id: 'shaoyang-xiaochaihu-tang',
    meridian: MERIDIAN_ONTOLOGIES.少阳,
    eightGuides: EIGHT_GUIDES_ONTOLOGIES.里寒虚证, // 临时借用，后续需要单独定义
    formula: FORMULA_EVIDENCES.小柴胡汤,
    confidence: 0.87,
    evidenceWeight: 0.9,
    relationships: [
      { type: 'combination', targetId: 'shaoyang-dachaihu-tang', strength: 0.8 },
      { type: 'transmission', targetId: 'yangming-dachengqi-tang', strength: 0.6 },
    ],
  },
  // 少阴病 - 里寒虚证 - 四逆汤
  {
    id: 'shaoyin-sini-tang',
    meridian: MERIDIAN_ONTOLOGIES.少阴,
    eightGuides: EIGHT_GUIDES_ONTOLOGIES.里寒虚证,
    formula: FORMULA_EVIDENCES.四逆汤,
    confidence: 0.92,
    evidenceWeight: 0.95,
    relationships: [
      { type: 'contradiction', targetId: 'shaoyin-huanglian-ejiao-tang', strength: 0.8 },
    ],
  },
];

// ============================================
// 症状本体论（中医术语标准化）
// ============================================
export const SYMPTOM_ONTOLOGIES: Record<string, SymptomOntology> = {
  发热: {
    id: 'symptom_fare',
    name: '发热',
    alias: ['发烧', '身热', '体温高', '身体发烫'],
    category: '主症',
    severity: '中',
    duration: '急性',
    standardization: '发热',
    associatedMeridians: ['太阳', '阳明', '少阳'],
    associatedFormulas: ['桂枝汤', '麻黄汤', '白虎汤', '小柴胡汤'],
    probability: {
      太阳: 0.9,
      阳明: 0.95,
      少阳: 0.85,
      太阴: 0.3,
      少阴: 0.2,
      厥阴: 0.25,
    },
  },
  恶寒: {
    id: 'symptom_ehan',
    name: '恶寒',
    alias: ['怕冷', '畏寒', '身冷', '发冷'],
    category: '主症',
    severity: '中',
    duration: '急性',
    standardization: '恶寒',
    associatedMeridians: ['太阳', '少阴'],
    associatedFormulas: ['桂枝汤', '麻黄汤', '四逆汤'],
    probability: {
      太阳: 0.95,
      阳明: 0.1,
      少阳: 0.2,
      太阴: 0.5,
      少阴: 0.9,
      厥阴: 0.6,
    },
  },
  恶风: {
    id: 'symptom_efeng',
    name: '恶风',
    alias: ['怕风', '风吹就冷'],
    category: '主症',
    severity: '轻',
    duration: '急性',
    standardization: '恶风',
    associatedMeridians: ['太阳'],
    associatedFormulas: ['桂枝汤'],
    probability: {
      太阳: 0.8,
      阳明: 0.05,
      少阳: 0.1,
      太阴: 0.1,
      少阴: 0.05,
      厥阴: 0.05,
    },
  },
  汗出: {
    id: 'symptom_hanchu',
    name: '汗出',
    alias: ['出汗', '冒汗', '流汗'],
    category: '主症',
    severity: '中',
    duration: '急性',
    standardization: '汗出',
    associatedMeridians: ['太阳', '阳明'],
    associatedFormulas: ['桂枝汤', '白虎汤'],
    probability: {
      太阳: 0.7,
      阳明: 0.9,
      少阳: 0.3,
      太阴: 0.2,
      少阴: 0.1,
      厥阴: 0.15,
    },
  },
  无汗: {
    id: 'symptom_wuhan',
    name: '无汗',
    alias: ['不出汗', '皮肤干燥', '没汗'],
    category: '主症',
    severity: '中',
    duration: '急性',
    standardization: '无汗',
    associatedMeridians: ['太阳'],
    associatedFormulas: ['麻黄汤', '大青龙汤'],
    probability: {
      太阳: 0.8,
      阳明: 0.1,
      少阳: 0.1,
      太阴: 0.1,
      少阴: 0.1,
      厥阴: 0.1,
    },
  },
  头痛: {
    id: 'symptom_toutong',
    name: '头痛',
    alias: ['头疼', '头晕痛', '脑壳痛'],
    category: '主症',
    severity: '中',
    duration: '急性',
    standardization: '头痛',
    associatedMeridians: ['太阳', '少阳', '厥阴'],
    associatedFormulas: ['桂枝汤', '麻黄汤', '小柴胡汤', '吴茱萸汤'],
    probability: {
      太阳: 0.85,
      阳明: 0.4,
      少阳: 0.7,
      太阴: 0.3,
      少阴: 0.2,
      厥阴: 0.8,
    },
  },
  身痛: {
    id: 'symptom_shentong',
    name: '身痛',
    alias: ['全身疼痛', '浑身酸痛', '骨节疼痛'],
    category: '主症',
    severity: '中',
    duration: '急性',
    standardization: '身痛',
    associatedMeridians: ['太阳', '少阴'],
    associatedFormulas: ['麻黄汤', '附子汤'],
    probability: {
      太阳: 0.8,
      阳明: 0.2,
      少阳: 0.1,
      太阴: 0.3,
      少阴: 0.7,
      厥阴: 0.4,
    },
  },
  口苦: {
    id: 'symptom_kouku',
    name: '口苦',
    alias: ['嘴里苦', '口腔苦味'],
    category: '主症',
    severity: '轻',
    duration: '急性',
    standardization: '口苦',
    associatedMeridians: ['少阳', '厥阴'],
    associatedFormulas: ['小柴胡汤', '乌梅丸'],
    probability: {
      太阳: 0.1,
      阳明: 0.3,
      少阳: 0.9,
      太阴: 0.1,
      少阴: 0.1,
      厥阴: 0.6,
    },
  },
  咽干: {
    id: 'symptom_yangan',
    name: '咽干',
    alias: ['喉咙干', '嗓子干'],
    category: '主症',
    severity: '轻',
    duration: '急性',
    standardization: '咽干',
    associatedMeridians: ['少阳', '阳明'],
    associatedFormulas: ['小柴胡汤', '白虎汤'],
    probability: {
      太阳: 0.15,
      阳明: 0.7,
      少阳: 0.85,
      太阴: 0.1,
      少阴: 0.1,
      厥阴: 0.2,
    },
  },
  往来寒热: {
    id: 'symptom_wanglaihanre',
    name: '往来寒热',
    alias: ['一阵冷一阵热', '寒热交替'],
    category: '主症',
    severity: '中',
    duration: '发作性',
    standardization: '往来寒热',
    associatedMeridians: ['少阳'],
    associatedFormulas: ['小柴胡汤'],
    probability: {
      太阳: 0.05,
      阳明: 0.1,
      少阳: 0.95,
      太阴: 0.05,
      少阴: 0.05,
      厥阴: 0.1,
    },
  },
  大便秘结: {
    id: 'symptom_bianjie',
    name: '大便秘结',
    alias: ['便秘', '大便干', '拉不出', '排便困难'],
    category: '主症',
    severity: '重',
    duration: '急性',
    standardization: '大便秘结',
    associatedMeridians: ['阳明', '少阳'],
    associatedFormulas: ['大承气汤', '小承气汤', '大柴胡汤'],
    probability: {
      太阳: 0.1,
      阳明: 0.9,
      少阳: 0.6,
      太阴: 0.3,
      少阴: 0.2,
      厥阴: 0.2,
    },
  },
  腹胀满痛: {
    id: 'symptom_fuzhang',
    name: '腹胀满痛',
    alias: ['肚子胀', '腹胀痛', '腹部胀满'],
    category: '主症',
    severity: '中',
    duration: '急性',
    standardization: '腹胀满痛',
    associatedMeridians: ['阳明', '太阴'],
    associatedFormulas: ['大承气汤', '理中汤'],
    probability: {
      太阳: 0.1,
      阳明: 0.85,
      少阳: 0.4,
      太阴: 0.8,
      少阴: 0.5,
      厥阴: 0.4,
    },
  },
  下利清谷: {
    id: 'symptom_xiali',
    name: '下利清谷',
    alias: ['拉稀', '腹泻', '大便稀', '完谷不化'],
    category: '主症',
    severity: '重',
    duration: '急性',
    standardization: '下利清谷',
    associatedMeridians: ['太阴', '少阴'],
    associatedFormulas: ['理中汤', '四逆汤', '真武汤'],
    probability: {
      太阳: 0.05,
      阳明: 0.1,
      少阳: 0.1,
      太阴: 0.9,
      少阴: 0.85,
      厥阴: 0.4,
    },
  },
  脉微细: {
    id: 'symptom_maiweixi',
    name: '脉微细',
    alias: ['脉弱', '脉搏微弱'],
    category: '脉象',
    severity: '重',
    duration: '急性',
    standardization: '脉微细',
    associatedMeridians: ['少阴'],
    associatedFormulas: ['四逆汤', '真武汤'],
    probability: {
      太阳: 0.05,
      阳明: 0.05,
      少阳: 0.05,
      太阴: 0.3,
      少阴: 0.95,
      厥阴: 0.5,
    },
  },
  但欲寐: {
    id: 'symptom_danyuemei',
    name: '但欲寐',
    alias: ['想睡觉', '精神萎靡', '嗜睡'],
    category: '主症',
    severity: '重',
    duration: '急性',
    standardization: '但欲寐',
    associatedMeridians: ['少阴'],
    associatedFormulas: ['四逆汤'],
    probability: {
      太阳: 0.05,
      阳明: 0.05,
      少阳: 0.1,
      太阴: 0.2,
      少阴: 0.9,
      厥阴: 0.2,
    },
  },
};

// ============================================
// 证候本体论（支持合病/并病/坏病）
// ============================================
export const SYNDROME_ONTOLOGIES: Record<string, SyndromeOntology> = {
  // 单经证
  太阳中风证: {
    id: 'syndrome_taiyang_zhongfeng',
    name: '太阳中风证',
    type: '单经证',
    meridian: '太阳',
    eightGuides: {
      location: '表',
      nature: '寒',
      deficiencyExcess: '虚',
      yinYang: '阳',
    },
    keySymptoms: ['恶风', '发热', '汗出', '头痛', '脉浮缓'],
    supportingSymptoms: ['鼻鸣', '干呕'],
    differentiationPoints: ['有汗无汗', '脉浮缓还是浮紧'],
    formula: '桂枝汤',
    alternativeFormulas: ['桂枝加葛根汤', '桂枝加厚朴杏子汤'],
    mechanism: '营卫不和，卫气不固，营阴外泄',
    transmission: [
      {
        to: 'syndrome_taiyang_shaohan',
        conditions: ['误汗', '转为无汗'],
        triggers: ['发汗太过'],
        probability: 0.3,
      },
      {
        to: 'syndrome_yangming_fushi',
        conditions: ['发热不恶寒'],
        triggers: ['汗出伤津'],
        probability: 0.4,
      },
    ],
  },
  太阳伤寒证: {
    id: 'syndrome_taiyang_shaohan',
    name: '太阳伤寒证',
    type: '单经证',
    meridian: '太阳',
    eightGuides: {
      location: '表',
      nature: '寒',
      deficiencyExcess: '实',
      yinYang: '阳',
    },
    keySymptoms: ['恶寒', '发热', '无汗', '头痛身痛', '脉浮紧'],
    supportingSymptoms: ['喘'],
    differentiationPoints: ['有汗无汗', '脉浮紧还是浮缓'],
    formula: '麻黄汤',
    alternativeFormulas: ['葛根汤', '大青龙汤'],
    mechanism: '风寒束表，营卫郁闭，肺气不宣',
    transmission: [
      {
        to: 'syndrome_shaoyin_wangyang',
        conditions: ['误汗亡阳', '脉微细'],
        triggers: ['发汗太过', '素体阳虚'],
        probability: 0.6,
      },
      {
        to: 'syndrome_yangming_fushi',
        conditions: ['大汗出', '转为不恶寒'],
        triggers: ['汗出过多'],
        probability: 0.5,
      },
    ],
  },
  阳明腑实证: {
    id: 'syndrome_yangming_fushi',
    name: '阳明腑实证',
    type: '单经证',
    meridian: '阳明',
    eightGuides: {
      location: '里',
      nature: '热',
      deficiencyExcess: '实',
      yinYang: '阳',
    },
    keySymptoms: ['不恶寒反恶热', '大便秘结', '腹胀满痛', '脉沉实有力'],
    supportingSymptoms: ['谵语', '潮热', '手足濈然汗出'],
    differentiationPoints: ['有无便秘', '脉象洪大还是沉实'],
    formula: '大承气汤',
    alternativeFormulas: ['小承气汤', '调胃承气汤'],
    mechanism: '阳明腑实，燥热内结，腑气不通',
    transmission: [
      {
        to: 'syndrome_shaoyin_wangyang',
        conditions: ['过下伤阳', '四肢厥冷'],
        triggers: ['攻下太过', '素体阳虚'],
        probability: 0.3,
      },
    ],
  },
  少阳病证: {
    id: 'syndrome_shaoyang',
    name: '少阳病证',
    type: '单经证',
    meridian: '少阳',
    eightGuides: {
      location: '半表半里',
      nature: '寒热错杂',
      deficiencyExcess: '虚实夹杂',
      yinYang: '阳',
    },
    keySymptoms: ['口苦', '咽干', '目眩', '往来寒热', '胸胁苦满'],
    supportingSymptoms: ['默默不欲饮食', '心烦喜呕'],
    differentiationPoints: ['是否有往来寒热', '是否有胸胁苦满'],
    formula: '小柴胡汤',
    alternativeFormulas: ['大柴胡汤', '柴胡桂枝汤'],
    mechanism: '枢机不利，胆火内郁，三焦失畅',
    transmission: [
      {
        to: 'syndrome_yangming_fushi',
        conditions: ['兼阳明里实', '便秘'],
        triggers: ['病邪传变'],
        probability: 0.6,
      },
      {
        to: 'syndrome_taiyin',
        conditions: ['误下伤脾', '腹满'],
        triggers: ['误下'],
        probability: 0.4,
      },
    ],
  },
  太阴病证: {
    id: 'syndrome_taiyin',
    name: '太阴病证',
    type: '单经证',
    meridian: '太阴',
    eightGuides: {
      location: '里',
      nature: '寒',
      deficiencyExcess: '虚',
      yinYang: '阴',
    },
    keySymptoms: ['腹满而吐', '食不下', '自利益甚'],
    supportingSymptoms: ['时腹自痛'],
    differentiationPoints: ['腹痛喜按与否', '大便是否完谷不化'],
    formula: '理中汤',
    alternativeFormulas: ['桂枝加芍药汤', '小建中汤'],
    mechanism: '脾胃虚寒，运化失职',
    transmission: [
      {
        to: 'syndrome_shaoyin_wangyang',
        conditions: ['吐利甚', '亡阳'],
        triggers: ['病情加重'],
        probability: 0.5,
      },
    ],
  },
  少阴亡阳证: {
    id: 'syndrome_shaoyin_wangyang',
    name: '少阴亡阳证',
    type: '单经证',
    meridian: '少阴',
    eightGuides: {
      location: '里',
      nature: '寒',
      deficiencyExcess: '虚',
      yinYang: '阳',
    },
    keySymptoms: ['脉微细', '但欲寐', '畏寒肢冷', '下利清谷'],
    supportingSymptoms: ['神衰欲寐', '面赤（真寒假热）'],
    differentiationPoints: ['脉象微细', '四肢厥冷'],
    formula: '四逆汤',
    alternativeFormulas: ['真武汤', '通脉四逆汤'],
    mechanism: '少阴阳虚，阴寒内盛，阳气衰微',
    transmission: [],
  },
  // 合病（多经同时发病）
  太阳阳明合病: {
    id: 'syndrome_taiyang_yangming_hebing',
    name: '太阳阳明合病',
    type: '合病',
    meridian: ['太阳', '阳明'],
    eightGuides: {
      location: '表里同病',
      nature: '寒热错杂',
      deficiencyExcess: '虚实夹杂',
      yinYang: '阳',
    },
    keySymptoms: ['发热', '汗出', '不恶寒', '大便秘结'],
    supportingSymptoms: ['腹满痛'],
    differentiationPoints: ['表证与里证并存'],
    formula: '葛根汤',
    alternativeFormulas: ['大柴胡汤'],
    mechanism: '表邪未解，内传阳明',
    transmission: [
      {
        to: 'syndrome_yangming_fushi',
        conditions: ['表证解'],
        triggers: ['病邪传变'],
        probability: 0.8,
      },
    ],
  },
  太阳少阳合病: {
    id: 'syndrome_taiyang_shaoyang_hebing',
    name: '太阳少阳合病',
    type: '合病',
    meridian: ['太阳', '少阳'],
    eightGuides: {
      location: '表里同病',
      nature: '寒热错杂',
      deficiencyExcess: '虚实夹杂',
      yinYang: '阳',
    },
    keySymptoms: ['发热', '微恶寒', '口苦', '咽干'],
    supportingSymptoms: ['目眩', '胸胁苦满'],
    differentiationPoints: ['表证与少阳证并存'],
    formula: '柴胡桂枝汤',
    alternativeFormulas: ['小柴胡汤'],
    mechanism: '太阳表证未解，邪犯少阳',
    transmission: [
      {
        to: 'syndrome_shaoyang',
        conditions: ['表证解'],
        triggers: ['病邪传变'],
        probability: 0.7,
      },
    ],
  },
  阳明少阳合病: {
    id: 'syndrome_yangming_shaoyang_hebing',
    name: '阳明少阳合病',
    type: '合病',
    meridian: ['阳明', '少阳'],
    eightGuides: {
      location: '表里同病',
      nature: '热',
      deficiencyExcess: '实',
      yinYang: '阳',
    },
    keySymptoms: ['口苦', '咽干', '大便秘结', '腹胀满痛'],
    supportingSymptoms: ['往来寒热'],
    differentiationPoints: ['少阳证与阳明腑实证并存'],
    formula: '大柴胡汤',
    alternativeFormulas: ['小柴胡汤', '大承气汤'],
    mechanism: '少阳枢机不利，阳明腑实内结',
    transmission: [
      {
        to: 'syndrome_yangming_fushi',
        conditions: ['少阳证解'],
        triggers: ['病邪传变'],
        probability: 0.6,
      },
    ],
  },
  // 并病（病邪从一经传到另一经）
  太阳并病少阴: {
    id: 'syndrome_taiyang_bing_shaoyin',
    name: '太阳并病少阴',
    type: '并病',
    meridian: ['太阳', '少阴'],
    eightGuides: {
      location: '表里同病',
      nature: '寒',
      deficiencyExcess: '虚',
      yinYang: '阴盛格阳',
    },
    keySymptoms: ['发热', '恶寒', '脉微细', '但欲寐'],
    supportingSymptoms: ['下利清谷'],
    differentiationPoints: ['表证未解，少阴已虚'],
    formula: '麻黄细辛附子汤',
    alternativeFormulas: ['四逆汤'],
    mechanism: '太阳表证未解，少阴阳虚已现',
    transmission: [
      {
        to: 'syndrome_shaoyin_wangyang',
        conditions: ['表证解'],
        triggers: ['病邪传变'],
        probability: 0.9,
      },
    ],
  },
  // 坏病（误治变证）
  误汗亡阳: {
    id: 'syndrome_wuhan_wangyang',
    name: '误汗亡阳',
    type: '坏病',
    meridian: ['少阴'],
    eightGuides: {
      location: '里',
      nature: '寒',
      deficiencyExcess: '虚',
      yinYang: '阴盛格阳',
    },
    keySymptoms: ['大汗淋漓', '畏寒肢冷', '脉微欲绝'],
    supportingSymptoms: ['神志不清', '呼吸微弱'],
    differentiationPoints: ['有误汗史'],
    formula: '四逆汤',
    alternativeFormulas: ['通脉四逆汤', '参附汤'],
    mechanism: '误汗亡阳，阳气暴脱',
    transmission: [],
  },
  误下伤脾: {
    id: 'syndrome_wuxia_shangpi',
    name: '误下伤脾',
    type: '坏病',
    meridian: ['太阴'],
    eightGuides: {
      location: '里',
      nature: '寒',
      deficiencyExcess: '虚',
      yinYang: '阴',
    },
    keySymptoms: ['腹满而吐', '食不下', '自利'],
    supportingSymptoms: ['时腹自痛'],
    differentiationPoints: ['有误下史'],
    formula: '理中汤',
    alternativeFormulas: ['桂枝加芍药汤'],
    mechanism: '误下伤脾，脾胃虚寒',
    transmission: [
      {
        to: 'syndrome_shaoyin_wangyang',
        conditions: ['病情加重'],
        triggers: ['吐利甚'],
        probability: 0.5,
      },
    ],
  },
};

// ============================================
// 知识图谱查询接口
// ============================================
export class KnowledgeGraphQuery {
  /**
   * 根据症状查找可能的六经
   */
  static findMeridiansBySymptoms(symptoms: string[]): MeridianType[] {
    const meridianScores: Record<string, number> = {};

    symptoms.forEach(symptom => {
      const symptomOntology = Object.values(SYMPTOM_ONTOLOGIES).find(
        s => s.alias.includes(symptom) || s.name === symptom
      );

      if (symptomOntology) {
        symptomOntology.associatedMeridians.forEach(meridian => {
          meridianScores[meridian] =
            (meridianScores[meridian] || 0) + symptomOntology.probability[meridian];
        });
      }
    });

    // 按得分排序
    const sorted = Object.entries(meridianScores)
      .sort((a, b) => b[1] - a[1])
      .map(([meridian]) => meridian as MeridianType);

    return sorted;
  }

  /**
   * 根据症状查找可能的方剂
   */
  static findFormulasBySymptoms(symptoms: string[]): string[] {
    const formulaScores: Record<string, number> = {};

    symptoms.forEach(symptom => {
      const symptomOntology = Object.values(SYMPTOM_ONTOLOGIES).find(
        s => s.alias.includes(symptom) || s.name === symptom
      );

      if (symptomOntology) {
        symptomOntology.associatedFormulas.forEach(formula => {
          formulaScores[formula] = (formulaScores[formula] || 0) + 1;
        });
      }
    });

    // 按得分排序
    const sorted = Object.entries(formulaScores)
      .sort((a, b) => b[1] - a[1])
      .map(([formula]) => formula);

    return sorted;
  }

  /**
   * 根据六经和八纲查找知识单元
   */
  static findKnowledgeUnits(
    meridian: MeridianType,
    eightGuides?: Partial<EightGuides>
  ): KnowledgeUnit[] {
    return KNOWLEDGE_UNITS.filter(unit => {
      if (unit.meridian.id !== meridian) return false;

      if (eightGuides) {
        const unitGuides = unit.eightGuides.eightGuides;
        if (eightGuides.location && unitGuides.location !== eightGuides.location)
          return false;
        if (eightGuides.nature && unitGuides.nature !== eightGuides.nature)
          return false;
        if (
          eightGuides.deficiencyExcess &&
          unitGuides.deficiencyExcess !== eightGuides.deficiencyExcess
        )
          return false;
        if (eightGuides.yinYang && unitGuides.yinYang !== eightGuides.yinYang)
          return false;
      }

      return true;
    });
  }

  /**
   * 查找合病/并病/坏病
   */
  static findCombinedSyndromes(type: '合病' | '并病' | '坏病'): SyndromeOntology[] {
    return Object.values(SYNDROME_ONTOLOGIES).filter(syndrome => syndrome.type === type);
  }

  /**
   * 查找可能的传变路径
   */
  static findTransmissionPath(from: string): MeridianTransmission[] {
    const fromMeridian = Object.values(MERIDIAN_ONTOLOGIES).find(
      m => m.id === from
    );

    if (fromMeridian) {
      return fromMeridian.transmissionRules;
    }

    return [];
  }
}
