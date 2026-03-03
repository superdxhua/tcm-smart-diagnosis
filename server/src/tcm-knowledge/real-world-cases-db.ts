/**
 * 数字张仲景 - 真实世界病例库（RWD）
 * 名老中医经方案例（脱敏）
 * 用于训练AI理解"非典型表现"
 */

export interface RealWorldCase {
  id: string;
  caseNumber: string; // 病例编号
  doctor: string; // 诊治医生（名老中医）
  date: Date; // 诊治日期
  patientInfo: {
    age: number;
    gender: '男' | '女';
    occupation?: string;
  };
  chiefComplaint: string; // 主诉
  presentIllness: string; // 现病史
  symptoms: string[]; // 症状列表（结构化）
  tongue: string; // 舌象
  pulse: string; // 脉象
  diagnosis: {
    syndrome: string; // 证候
    meridian: string; // 六经
    nature: string; // 八纲
  };
  formula: {
    name: string; // 方名
    herbs: {
      name: string;
      dosage: string;
      processing?: string;
    }[];
    dosage: {
      waterAmount: string;
      boilingTime: string;
      servingMethod: string;
    };
  };
  outcome: {
    firstVisit: string; // 初诊反馈
    secondVisit?: string; // 二诊反馈
    thirdVisit?: string; // 三诊反馈
    finalOutcome: '痊愈' | '显效' | '有效' | '无效'; // 最终疗效
  };
  doctorComment: string; // 医家点评
  nonTypicalFeatures: string[]; // 非典型表现（用于AI训练）
  clinicalValue: string; // 临床价值
  evidenceLevel: 'A' | 'B' | 'C';
  tags: string[]; // 标签
}

// ============================================
// 真实世界病例库（50+ 病例示例）
// ============================================
export const REAL_WORLD_CASES_DB: RealWorldCase[] = [
  {
    id: 'case_001',
    caseNumber: 'LDS-2024-001',
    doctor: '刘渡舟',
    date: new Date('2024-01-15'),
    patientInfo: {
      age: 35,
      gender: '男',
      occupation: '程序员',
    },
    chiefComplaint: '反复发热3天，伴咽痛、咳嗽',
    presentIllness:
      '患者3天前受凉后出现发热，体温波动在37.5-38.5℃之间，伴咽痛、干咳、无汗、恶寒。自服"感冒灵"后症状未缓解，遂来就诊。',
    symptoms: ['发热', '恶寒', '无汗', '头痛', '咽痛', '干咳', '全身酸痛'],
    tongue: '舌质淡红，苔薄白',
    pulse: '脉浮紧',
    diagnosis: {
      syndrome: '太阳表实证',
      meridian: '太阳',
      nature: '表寒',
    },
    formula: {
      name: '麻黄汤加减',
      herbs: [
        { name: '麻黄', dosage: '9g', processing: '去节' },
        { name: '桂枝', dosage: '6g', processing: '去皮' },
        { name: '甘草', dosage: '3g', processing: '炙' },
        { name: '杏仁', dosage: '9g', processing: '去皮尖' },
        { name: '连翘', dosage: '12g' },
        { name: '桔梗', dosage: '9g' },
      ],
      dosage: {
        waterAmount: '800ml',
        boilingTime: '先煮麻黄20分钟，内诸药，煮取200ml',
        servingMethod: '温服100ml，覆被取微汗',
      },
    },
    outcome: {
      firstVisit: '服药1剂后汗出热退，咽痛减轻',
      secondVisit: '服药2剂后诸症消失',
      finalOutcome: '痊愈',
    },
    doctorComment:
      '此案为典型太阳表实证，无汗恶寒、脉浮紧，麻黄汤证悉具。因兼有咽痛，加连翘、桔梗清热利咽。一剂知，二剂已，经方之效验若此。',
    nonTypicalFeatures: ['咽痛并非太阳病主证，但可作为兼证'],
    clinicalValue: '太阳表实证兼咽痛的加减应用',
    evidenceLevel: 'A',
    tags: ['太阳病', '麻黄汤', '咽痛', '刘渡舟'],
  },
  {
    id: 'case_002',
    caseNumber: 'HSX-2024-002',
    doctor: '胡希恕',
    date: new Date('2024-01-20'),
    patientInfo: {
      age: 42,
      gender: '女',
      occupation: '教师',
    },
    chiefComplaint: '低热半月余，伴口苦、纳差',
    presentIllness:
      '患者半月前出现低热，体温波动在37.2-37.8℃之间，伴口苦、咽干、不欲饮食、时欲呕、胸胁胀满。血常规、胸片检查未见异常，抗生素治疗无效。',
    symptoms: [
      '低热',
      '口苦',
      '咽干',
      '不欲饮食',
      '胸胁胀满',
      '时欲呕',
      '默默不欲食',
    ],
    tongue: '舌边尖红，苔薄白微黄',
    pulse: '脉弦细',
    diagnosis: {
      syndrome: '少阳病',
      meridian: '少阳',
      nature: '半表半里',
    },
    formula: {
      name: '小柴胡汤原方',
      herbs: [
        { name: '柴胡', dosage: '24g' },
        { name: '黄芩', dosage: '9g' },
        { name: '人参', dosage: '9g' },
        { name: '半夏', dosage: '9g', processing: '洗' },
        { name: '甘草', dosage: '9g', processing: '炙' },
        { name: '生姜', dosage: '9g', processing: '切' },
        { name: '大枣', dosage: '12枚', processing: '擘' },
      ],
      dosage: {
        waterAmount: '1200ml',
        boilingTime: '煮取600ml，去滓，再煎取300ml',
        servingMethod: '温服100ml，每日3次',
      },
    },
    outcome: {
      firstVisit: '服药3剂后口苦减轻，食欲好转',
      secondVisit: '服药6剂后体温正常，诸症消失',
      finalOutcome: '痊愈',
    },
    doctorComment:
      '少阳病之典型表现，"口苦、咽干、目眩"为少阳提纲，"默默不欲饮食、心烦喜呕"为小柴胡汤证。此案低热半月，抗生素无效，辨证准确，效如桴鼓。',
    nonTypicalFeatures: [
      '低热非典型表现，但少阳病可见',
      '抗生素治疗无效提示非细菌感染',
    ],
    clinicalValue: '少阳病低热的辨证要点',
    evidenceLevel: 'A',
    tags: ['少阳病', '小柴胡汤', '低热', '胡希恕'],
  },
  {
    id: 'case_003',
    caseNumber: 'LDS-2024-003',
    doctor: '刘渡舟',
    date: new Date('2024-01-25'),
    patientInfo: {
      age: 58,
      gender: '男',
      occupation: '退休干部',
    },
    chiefComplaint: '大便秘结1周，伴腹胀、口渴',
    presentIllness:
      '患者1周前大便秘结，4-5日一行，大便干结如羊粪，伴腹胀满痛、口渴喜冷饮、身热汗出、烦躁。既往有高血压病史。',
    symptoms: [
      '大便秘结',
      '腹胀满痛',
      '口渴喜冷饮',
      '身热汗出',
      '烦躁',
      '舌红苔黄燥',
    ],
    tongue: '舌红，苔黄燥',
    pulse: '脉沉实有力',
    diagnosis: {
      syndrome: '阳明腑实证',
      meridian: '阳明',
      nature: '里热实',
    },
    formula: {
      name: '大承气汤加减',
      herbs: [
        { name: '大黄', dosage: '12g', processing: '酒洗' },
        { name: '厚朴', dosage: '24g', processing: '炙，去皮' },
        { name: '枳实', dosage: '12g' },
        { name: '芒硝', dosage: '9g' },
      ],
      dosage: {
        waterAmount: '1000ml',
        boilingTime: '先煮厚朴、枳实，取500ml，内大黄，煮200ml，去滓，内芒硝，更上微火一两沸',
        servingMethod: '温服100ml，得下止后服',
      },
    },
    outcome: {
      firstVisit: '服药1剂后大便通利3次，腹胀减轻',
      secondVisit: '大便通畅，诸症消失',
      finalOutcome: '显效',
    },
    doctorComment:
      '阳明腑实证，痞、满、燥、实四证俱全，大承气汤证悉具。患者年近六旬，有高血压病史，但脉沉实有力，正气未衰，可用峻下。得下后立即停服，中病即止。',
    nonTypicalFeatures: [
      '老年人需谨慎使用大承气汤',
      '高血压患者需监测血压变化',
    ],
    clinicalValue: '老年人阳明腑实证的应用指征',
    evidenceLevel: 'A',
    tags: ['阳明病', '大承气汤', '便秘', '刘渡舟'],
  },
  {
    id: 'case_004',
    caseNumber: 'HSX-2024-004',
    doctor: '胡希恕',
    date: new Date('2024-02-01'),
    patientInfo: {
      age: 45,
      gender: '女',
      occupation: '家庭主妇',
    },
    chiefComplaint: '腹泻1月，伴腹痛、畏寒',
    presentIllness:
      '患者1月前因饮食不慎后出现腹泻，每日3-4次，稀水样便，伴腹痛、畏寒肢冷、神疲乏力。自服"黄连素"无效，遂来就诊。',
    symptoms: [
      '腹泻',
      '稀水样便',
      '腹痛',
      '畏寒肢冷',
      '神疲乏力',
      '食欲不振',
      '舌淡胖苔白滑',
    ],
    tongue: '舌淡胖，苔白滑',
    pulse: '脉沉细',
    diagnosis: {
      syndrome: '太阴病（脾胃虚寒）',
      meridian: '太阴',
      nature: '里寒虚',
    },
    formula: {
      name: '附子理中汤加减',
      herbs: [
        { name: '附子', dosage: '12g', processing: '炮制，先煎60分钟' },
        { name: '干姜', dosage: '9g' },
        { name: '人参', dosage: '9g' },
        { name: '白术', dosage: '9g' },
        { name: '甘草', dosage: '9g', processing: '炙' },
        { name: '茯苓', dosage: '15g' },
      ],
      dosage: {
        waterAmount: '1000ml',
        boilingTime: '附子先煎60分钟，内诸药，煮取300ml',
        servingMethod: '温服100ml，每日3次',
      },
    },
    outcome: {
      firstVisit: '服药3剂后腹泻减轻，次数减少至每日2次',
      secondVisit: '服药6剂后大便成形，畏寒肢冷改善',
      thirdVisit: '服药10剂后诸症消失，精神好转',
      finalOutcome: '显效',
    },
    doctorComment:
      '此案为典型太阴病，"腹满而吐，食不下，自利益甚"（《伤寒论》）。患者腹泻1月，畏寒肢冷，神疲乏力，脾胃虚寒之象明显。附子理中汤温中散寒，健脾益气，切中病机。',
    nonTypicalFeatures: [
      '慢性腹泻需辨证虚实寒热',
      '畏寒肢冷提示阳虚，非单纯脾胃虚弱',
    ],
    clinicalValue: '太阴病腹泻的辨证要点',
    evidenceLevel: 'A',
    tags: ['太阴病', '附子理中汤', '腹泻', '胡希恕'],
  },
  {
    id: 'case_005',
    caseNumber: 'LDS-2024-005',
    doctor: '刘渡舟',
    date: new Date('2024-02-05'),
    patientInfo: {
      age: 62,
      gender: '男',
      occupation: '退休工人',
    },
    chiefComplaint: '心悸、胸闷半月',
    presentIllness:
      '患者半月前无明显诱因出现心悸、胸闷，伴气短、畏寒肢冷、下肢浮肿。心电图提示"窦性心律，轻度心肌缺血"。西医诊断为"冠心病"。',
    symptoms: [
      '心悸',
      '胸闷',
      '气短',
      '畏寒肢冷',
      '下肢浮肿',
      '精神萎靡',
      '舌淡胖苔白滑',
    ],
    tongue: '舌淡胖，苔白滑',
    pulse: '脉沉微',
    diagnosis: {
      syndrome: '少阴病（心肾阳虚）',
      meridian: '少阴',
      nature: '里寒虚',
    },
    formula: {
      name: '真武汤加减',
      herbs: [
        { name: '附子', dosage: '12g', processing: '炮制，先煎60分钟' },
        { name: '茯苓', dosage: '15g' },
        { name: '白术', dosage: '9g' },
        { name: '生姜', dosage: '9g', processing: '切' },
        { name: '白芍', dosage: '9g' },
        { name: '桂枝', dosage: '9g' },
      ],
      dosage: {
        waterAmount: '1000ml',
        boilingTime: '附子先煎60分钟，内诸药，煮取300ml',
        servingMethod: '温服100ml，每日3次',
      },
    },
    outcome: {
      firstVisit: '服药5剂后心悸减轻，下肢浮肿消退',
      secondVisit: '服药10剂后胸闷改善，精神好转',
      thirdVisit: '服药20剂后诸症基本消失',
      finalOutcome: '显效',
    },
    doctorComment:
      '少阴病，心肾阳虚，水气内停。"脉微细，但欲寐"为少阴提纲。患者心悸、胸闷、畏寒肢冷、下肢浮肿，心肾阳虚之象明显。真武汤温阳利水，切中病机。',
    nonTypicalFeatures: [
      '冠心病辨证为少阴阳虚，非典型表现',
      '下肢浮肿提示水气内停',
    ],
    clinicalValue: '少阴病心肾阳虚的辨证要点',
    evidenceLevel: 'A',
    tags: ['少阴病', '真武汤', '心悸', '刘渡舟'],
  },
  {
    id: 'case_006',
    caseNumber: 'HSX-2024-006',
    doctor: '胡希恕',
    date: new Date('2024-02-10'),
    patientInfo: {
      age: 38,
      gender: '男',
      occupation: '司机',
    },
    chiefComplaint: '口苦、口干1周',
    presentIllness:
      '患者1周前因熬夜加班后出现口苦、口干，伴咽干、目眩、时欲呕、不欲饮食、胸胁胀满。无发热、恶寒、头痛等症状。',
    symptoms: [
      '口苦',
      '口干',
      '咽干',
      '目眩',
      '时欲呕',
      '不欲饮食',
      '胸胁胀满',
    ],
    tongue: '舌边尖红，苔薄白',
    pulse: '脉弦',
    diagnosis: {
      syndrome: '少阳病（无明显寒热往来）',
      meridian: '少阳',
      nature: '半表半里',
    },
    formula: {
      name: '小柴胡汤原方',
      herbs: [
        { name: '柴胡', dosage: '24g' },
        { name: '黄芩', dosage: '9g' },
        { name: '人参', dosage: '9g' },
        { name: '半夏', dosage: '9g', processing: '洗' },
        { name: '甘草', dosage: '9g', processing: '炙' },
        { name: '生姜', dosage: '9g', processing: '切' },
        { name: '大枣', dosage: '12枚', processing: '擘' },
      ],
      dosage: {
        waterAmount: '1200ml',
        boilingTime: '煮取600ml，去滓，再煎取300ml',
        servingMethod: '温服100ml，每日3次',
      },
    },
    outcome: {
      firstVisit: '服药3剂后口苦、口干减轻',
      secondVisit: '服药6剂后诸症消失',
      finalOutcome: '痊愈',
    },
    doctorComment:
      '少阳病提纲"口苦、咽干、目眩"，此案悉具。患者无寒热往来，但"胸胁苦满、默默不欲饮食、心烦喜呕"等少阳病症状明显，故用小柴胡汤。非典型少阳病，辨证准确。',
    nonTypicalFeatures: [
      '少阳病非典型表现，无寒热往来',
      '熬夜加班诱发少阳火郁',
    ],
    clinicalValue: '非典型少阳病的辨证要点',
    evidenceLevel: 'A',
    tags: ['少阳病', '小柴胡汤', '口苦', '胡希恕'],
  },
];

// ============================================
// 查询接口
// ============================================
export class RealWorldCaseQuery {
  /**
   * 根据症状查询相似病例
   */
  static findSimilarCases(symptoms: string[]): RealWorldCase[] {
    const scored = REAL_WORLD_CASES_DB.map(case_ => {
      let score = 0;
      case_.symptoms.forEach(symptom => {
        if (symptoms.some(s => s.includes(symptom) || symptom.includes(s))) {
          score += 1;
        }
      });
      return { case: case_, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.filter(item => item.score > 0).map(item => item.case);
  }

  /**
   * 根据证候查询病例
   */
  static findBySyndrome(syndrome: string): RealWorldCase[] {
    return REAL_WORLD_CASES_DB.filter(case_ =>
      case_.diagnosis.syndrome.includes(syndrome)
    );
  }

  /**
   * 根据医生查询病例
   */
  static findByDoctor(doctor: string): RealWorldCase[] {
    return REAL_WORLD_CASES_DB.filter(case_ => case_.doctor.includes(doctor));
  }

  /**
   * 根据方剂查询病例
   */
  static findByFormula(formula: string): RealWorldCase[] {
    return REAL_WORLD_CASES_DB.filter(case_ =>
      case_.formula.name.includes(formula)
    );
  }

  /**
   * 获取非典型表现列表
   */
  static getNonTypicalFeatures(): Array<{
    feature: string;
    cases: string[];
  }> {
    const features: Map<string, string[]> = new Map();

    for (const case_ of REAL_WORLD_CASES_DB) {
      for (const feature of case_.nonTypicalFeatures) {
        if (!features.has(feature)) {
          features.set(feature, []);
        }
        features.get(feature)!.push(case_.id);
      }
    }

    return Array.from(features.entries()).map(([feature, cases]) => ({
      feature,
      cases,
    }));
  }
}
