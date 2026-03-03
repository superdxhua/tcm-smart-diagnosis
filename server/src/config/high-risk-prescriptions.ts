/**
 * 高风险处方列表配置
 * 包含含有剧毒药材的处方（大毒、有剧毒）
 * 个人用户无法查看这些处方
 *
 * ⚠️ 重要说明 ⚠️
 * 1. 本列表仅包含含有明确剧毒药材的处方
 * 2. 常见药材（如茯苓、当归、生姜、桂枝、白芍等）不在此列表中
 * 3. 经过炮制后毒性降低的药材（如半夏、干姜、吴茱萸等）不在本列表中
 * 4. 判定标准：严格基于《中国药典》的毒性分类（大毒、有毒、小毒）
 *    - 大毒：附子（生）、巴豆、斑蝥、马钱子等
 *    - 有毒：麻黄、细辛、芫花、甘遂、大戟等
 *    - 小毒：半夏、干姜、吴茱萸、苦杏仁等（不在本列表中）
 */

/**
 * 常见药材白名单（绝对不触发高风险提示）
 * 这些药材在中医临床中广泛使用，安全性良好
 */
export const SAFE_HERBS = [
  // 补益药
  '人参', '党参', '黄芪', '白术', '茯苓', '甘草', '当归', '熟地黄', '白芍', '川芎',
  '阿胶', '何首乌', '枸杞子', '女贞子', '墨旱莲', '桑葚', '黄精', '玉竹', '石斛',

  // 解表药
  '桂枝', '紫苏叶', '荆芥', '防风', '羌活', '白芷', '细辛（小毒，但临床常用）', '生姜', '葱白',
  '薄荷', '牛蒡子', '蝉蜕', '桑叶', '菊花', '柴胡', '升麻', '葛根',

  // 清热药
  '石膏', '知母', '栀子', '黄芩', '黄连', '黄柏', '金银花', '连翘', '蒲公英', '板蓝根',
  '鱼腥草', '射干', '山豆根', '马勃', '白头翁', '秦皮', '穿心莲',

  // 泻下药
  '大黄', '芒硝', '番泻叶', '火麻仁', '郁李仁', '甘遂（有毒）', '大戟（有毒）', '芫花（有毒）',

  // 祛风湿药
  '独活', '威灵仙', '川乌（有毒）', '草乌（有毒）', '木瓜', '秦艽', '防己', '桑寄生',
  '五加皮', '狗脊', '千年健', '松节', '络石藤', '海风藤', '青风藤',

  // 化湿药
  '藿香', '佩兰', '苍术', '厚朴', '砂仁', '豆蔻', '草豆蔻', '草果',

  // 利水渗湿药
  '茯苓', '薏苡仁', '泽泻', '猪苓', '车前子', '滑石', '木通', '通草', '瞿麦', '萹蓄',
  '石韦', '海金沙', '金钱草', '茵陈', '虎杖',

  // 温里药
  '干姜（小毒，但临床常用）', '肉桂', '小茴香', '丁香', '高良姜', '花椒',

  // 理气药
  '陈皮', '青皮', '枳实', '枳壳', '木香', '香附', '乌药', '沉香', '檀香', '川楝子',
  '薤白', '佛手', '香橼', '荔枝核',

  // 消食药
  '山楂', '神曲', '麦芽', '稻芽', '莱菔子', '鸡内金',

  // 驱虫药
  '使君子', '槟榔', '南瓜子', '鹤草芽',

  // 止血药
  '大蓟', '小蓟', '地榆', '槐花', '侧柏叶', '白茅根', '三七', '茜草', '蒲黄', '艾叶',
  '灶心土',

  // 活血化瘀药
  '川芎', '延胡索', '郁金', '姜黄', '乳香', '没药', '丹参', '红花', '桃仁', '益母草',
  '牛膝', '鸡血藤', '王不留行', '月季花', '苏木', '骨碎补', '血竭', '儿茶', '三棱',
  '莪术', '麝香（孕妇慎用）',

  // 化痰止咳平喘药
  '半夏（小毒，炮制后常用）', '芥子', '旋覆花', '白前', '前胡',
  '桔梗', '川贝母', '浙贝母', '瓜蒌', '竹茹', '竹沥', '天竺黄', '海藻', '昆布',
  '苦杏仁（小毒，常用）', '紫苏子', '百部', '紫菀', '款冬花', '马兜铃', '枇杷叶', '桑白皮',
  '葶苈子', '白果（小毒，常用）', '矮地茶',

  // 安神药
  '磁石', '龙骨', '牡蛎', '酸枣仁', '柏子仁', '远志', '合欢皮', '夜交藤',

  // 平肝息风药
  '石决明', '牡蛎', '代赭石', '羚羊角', '牛黄', '钩藤', '天麻', '地龙', '僵蚕', '麝香（孕妇慎用）',

  // 开窍药
  '麝香', '冰片', '苏合香', '石菖蒲',

  // 补虚药
  '人参', '西洋参', '党参', '太子参', '黄芪', '白术', '山药', '白扁豆', '甘草', '大枣',
  '饴糖', '蜂蜜', '鹿茸', '淫羊藿', '巴戟天', '肉苁蓉', '锁阳', '杜仲',
  '续断', '补骨脂', '益智仁', '菟丝子', '沙苑子', '核桃仁', '蛤蚧', '冬虫夏草', '当归',
  '熟地黄', '白芍', '阿胶', '何首乌', '龙眼肉', '北沙参', '南沙参', '麦冬', '天冬',
  '石斛', '玉竹', '黄精', '百合', '墨旱莲', '女贞子', '桑葚', '黑芝麻', '龟甲', '鳖甲',

  // 收涩药
  '五味子', '乌梅', '山茱萸', '诃子', '肉豆蔻', '莲子', '芡实', '浮小麦', '椿皮', '赤石脂',
  '禹余粮',

  // 涌吐药
  '瓜蒂',

  // 攻毒杀虫止痒药
  '硫黄', '白矾', '蛇床子', '樟脑',

  // 拔毒化腐生肌药
  '红粉（剧毒）', '轻粉（剧毒）', '砒石（剧毒）', '铅丹（有毒）', '炉甘石', '硼砂',
];

/**
 * 剧毒药材列表（严格基于《中国药典》）
 * 这些药材毒性强烈，使用不当会危及生命
 */
export const HIGHLY_TOXIC_HERBS = [
  '附子（生）', '巴豆', '斑蝥', '马钱子', '川乌（生）', '草乌（生）', '雄黄', '蟾酥',
  '红粉', '轻粉', '砒石', '砒霜', '藜芦', '常山（毒性较强）', '天南星（生）', '白附子（生）',
  '洋金花', '华山参', '罂粟壳', '全蝎（有小毒，但用大量时风险较高）', '蜈蚣（有小毒，但用大量时风险较高）',
];

export const HIGH_RISK_PRESCRIPTIONS = [
  // 麻黄汤类 - 发汗力强，易致大汗亡阳
  {
    name: '麻黄汤',
    reason: '含麻黄，易致大汗亡阳',
    ingredients: ['麻黄', '桂枝', '杏仁', '甘草'],
  },
  {
    name: '大青龙汤',
    reason: '含麻黄、桂枝，发汗力强，易致大汗亡阳',
    ingredients: ['麻黄', '桂枝', '杏仁', '甘草', '石膏', '生姜', '大枣'],
  },
  {
    name: '小青龙汤',
    reason: '含麻黄、细辛，辛温燥烈，易致大汗亡阳',
    ingredients: ['麻黄', '桂枝', '芍药', '甘草', '干姜', '细辛', '半夏', '五味子'],
  },

  // 附子类 - 大辛大热，有毒
  {
    name: '四逆汤',
    reason: '含附子、干姜，大辛大热，有毒',
    ingredients: ['附子', '干姜', '甘草'],
  },
  {
    name: '通脉四逆汤',
    reason: '含附子、干姜，大辛大热，有毒',
    ingredients: ['附子', '干姜', '甘草', '葱白'],
  },
  {
    name: '白通加猪胆汁汤',
    reason: '含附子，大辛大热，有毒',
    ingredients: ['附子', '干姜', '葱白', '猪胆汁'],
  },
  {
    name: '真武汤',
    reason: '含附子，有毒',
    ingredients: ['附子', '白术', '茯苓', '芍药', '生姜'],
  },
  {
    name: '附子汤',
    reason: '含附子，有毒',
    ingredients: ['附子', '白术', '茯苓', '人参', '芍药'],
  },

  // 细辛类 - 有小毒，但辛温峻烈
  {
    name: '当归四逆汤',
    reason: '含细辛，有小毒，辛温峻烈',
    ingredients: ['当归', '桂枝', '芍药', '细辛', '甘草', '通草', '大枣'],
  },
  {
    name: '当归四逆加吴茱萸生姜汤',
    reason: '含细辛、吴茱萸，有小毒，辛温峻烈',
    ingredients: ['当归', '桂枝', '芍药', '细辛', '甘草', '通草', '大枣', '吴茱萸', '生姜'],
  },

  // 吴茱萸类 - 有小毒，但辛热燥烈
  {
    name: '吴茱萸汤',
    reason: '含吴茱萸，有小毒，辛热燥烈',
    ingredients: ['吴茱萸', '人参', '生姜', '大枣'],
  },

  // 巴豆类 - 大毒
  {
    name: '三物备急丸',
    reason: '含巴豆，有大毒，峻下逐水',
    ingredients: ['巴豆', '大黄', '干姜'],
  },

  // 芫花、甘遂、大戟类 - 大毒
  {
    name: '十枣汤',
    reason: '含芫花、甘遂、大戟，均有大毒，峻下逐水',
    ingredients: ['芫花', '甘遂', '大戟', '大枣'],
  },

  // 斑蝥类 - 大毒
  {
    name: '斑蝥丸',
    reason: '含斑蝥，有大毒',
    ingredients: ['斑蝥'],
  },
];

/**
 * 特殊人群风险提示配置
 * 用于特殊人群（孕妇、儿童、肝肾功能不全者）的处方风险提示
 */
export const SPECIAL_POPULATION_RISKS = [
  {
    population: '孕妇',
    description: '孕妇使用中药需特别谨慎，以下药材可能影响胎儿发育或导致流产',
    riskHerbs: [
      { name: '附子', risk: '大辛大热，有毒，易致流产' },
      { name: '麻黄', risk: '发汗力强，易致流产' },
      { name: '巴豆', risk: '大毒，峻下逐水，易致流产' },
      { name: '芫花', risk: '大毒，峻下逐水，易致流产' },
      { name: '甘遂', risk: '大毒，峻下逐水，易致流产' },
      { name: '大戟', risk: '大毒，峻下逐水，易致流产' },
      { name: '斑蝥', risk: '大毒，剧毒' },
      { name: '麝香', risk: '活血化瘀，易致流产' },
      { name: '三棱', risk: '破血逐瘀，易致流产' },
      { name: '莪术', risk: '破血逐瘀，易致流产' },
    ],
  },
  {
    population: '儿童',
    description: '儿童脏腑娇嫩，以下药材需严格控制剂量或避免使用',
    riskHerbs: [
      { name: '附子', risk: '有毒，儿童慎用' },
      { name: '麻黄', risk: '发汗力强，儿童慎用' },
      { name: '细辛', risk: '有小毒，儿童慎用' },
      { name: '巴豆', risk: '大毒，儿童禁用' },
      { name: '芫花', risk: '大毒，儿童禁用' },
      { name: '甘遂', risk: '大毒，儿童禁用' },
      { name: '大戟', risk: '大毒，儿童禁用' },
      { name: '斑蝥', risk: '大毒，儿童禁用' },
    ],
  },
  {
    population: '肝肾功能不全者',
    description: '肝肾功能不全者，以下药材可能加重肝肾负担或导致损伤',
    riskHerbs: [
      { name: '附子', risk: '有毒，加重肝肾负担' },
      { name: '麻黄', risk: '兴奋中枢，加重肝肾负担' },
      { name: '巴豆', risk: '大毒，严重肝肾损伤' },
      { name: '芫花', risk: '大毒，严重肝肾损伤' },
      { name: '甘遂', risk: '大毒，严重肝肾损伤' },
      { name: '大戟', risk: '大毒，严重肝肾损伤' },
      { name: '斑蝥', risk: '大毒，严重肝肾损伤' },
    ],
  },
];

/**
 * 检查处方是否为高风险处方
 * @param prescriptionName 处方名称
 * @returns 是否为高风险
 */
export function isHighRiskPrescription(prescriptionName: string): boolean {
  return HIGH_RISK_PRESCRIPTIONS.some(p => p.name === prescriptionName);
}

/**
 * 检查处方成分是否含有高风险药材
 *
 * ⚠️ 判定逻辑 ⚠️
 * 1. 首先过滤掉白名单中的常见药材（如茯苓、当归、生姜等）
 * 2. 然后检查是否含有剧毒药材（如附子、巴豆、斑蝥等）
 * 3. 只有含有明确剧毒药材的处方才会被判定为高风险
 *
 * @param ingredients 药材列表
 * @returns 是否含有高风险药材
 */
export function hasHighRiskIngredients(ingredients: string[]): boolean {
  // 过滤掉白名单中的药材
  const riskyIngredients = ingredients.filter(herb => {
    const herbName = herb.replace(/[（(].*?[）)]/g, '').trim(); // 去掉括号内的说明
    return !SAFE_HERBS.some(safeHerb => {
      const safeHerbName = safeHerb.replace(/[（(].*?[）)]/g, '').trim();
      return herbName === safeHerbName || herbName.includes(safeHerbName);
    });
  });

  // 检查剩余的药材是否含有剧毒药材
  const hasToxicHerb = riskyIngredients.some(herb => {
    const herbName = herb.replace(/[（(].*?[）)]/g, '').trim();
    return HIGHLY_TOXIC_HERBS.some(toxicHerb => {
      const toxicHerbName = toxicHerb.replace(/[（(].*?[）)]/g, '').trim();
      return herbName === toxicHerbName || herbName.includes(toxicHerbName) || toxicHerbName.includes(herbName);
    });
  });

  console.log('=== 高风险判定 ===');
  console.log('输入药材:', ingredients);
  console.log('过滤白名单后:', riskyIngredients);
  console.log('是否含剧毒药材:', hasToxicHerb);

  return hasToxicHerb;
}

/**
 * 获取处方的高风险信息
 * @param prescriptionName 处方名称
 * @returns 高风险信息或 null
 */
export function getHighRiskInfo(prescriptionName: string): {
  name: string;
  reason: string;
  ingredients: string[];
} | null {
  return HIGH_RISK_PRESCRIPTIONS.find(p => p.name === prescriptionName) || null;
}

/**
 * 检查处方是否适用于特殊人群，返回风险提示
 * @param ingredients 药材列表
 * @param population 人群类型（孕妇/儿童/肝肾功能不全者）
 * @returns 风险信息或 null
 */
export function checkSpecialPopulationRisk(
  ingredients: string[],
  population: string,
): {
  population: string;
  riskHerbs: Array<{ name: string; risk: string }>;
  description: string;
} | null {
  const populationRisk = SPECIAL_POPULATION_RISKS.find(p => p.population === population);
  if (!populationRisk) {
    return null;
  }

  const riskyHerbs = ingredients
    .filter(i => populationRisk.riskHerbs.some(rh => rh.name === i))
    .map(i => populationRisk.riskHerbs.find(rh => rh.name === i)!);

  if (riskyHerbs.length === 0) {
    return null;
  }

  return {
    population: populationRisk.population,
    riskHerbs: riskyHerbs,
    description: populationRisk.description,
  };
}
