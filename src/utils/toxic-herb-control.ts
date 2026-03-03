/**
 * 有毒有害中药材风控配置
 */

export interface ToxicHerb {
  /** 药材名称 */
  name: string
  /** 毒性等级：大毒、有毒、小毒 */
  toxicityLevel: '大毒' | '有毒' | '小毒'
  /** 禁忌人群 */
  contraindications: string[]
  /** 最大剂量（克） */
  maxDosage: number
  /** 注意事项 */
  precautions: string[]
  /** 备注说明 */
  notes?: string
}

/**
 * 配伍禁忌类型
 */
export interface IncompatibilityRule {
  /** 禁忌名称（如：十八反） */
  name: string
  /** 禁忌描述 */
  description: string
  /** 配伍对（成对出现，相互禁忌） */
  pairs: Array<{
    /** 药材A */
    herbA: string
    /** 药材B */
    herbB: string
    /** 风险描述 */
    risk: string
  }>
}

/**
 * 十八反配伍禁忌
 */
export const INCOMPATIBILITY_EIGHTEEN: IncompatibilityRule = {
  name: '十八反',
  description: '十八反是中药配伍禁忌，指某些药物合用会产生剧烈的毒副作用',
  pairs: [
    { herbA: '甘草', herbB: '大戟', risk: '甘草反大戟，同用可产生严重毒副作用' },
    { herbA: '甘草', herbB: '甘遂', risk: '甘草反甘遂，同用可产生严重毒副作用' },
    { herbA: '甘草', herbB: '芫花', risk: '甘草反芫花，同用可产生严重毒副作用' },
    { herbA: '乌头', herbB: '半夏', risk: '乌头反半夏，同用可产生严重毒副作用' },
    { herbA: '乌头', herbB: '瓜蒌', risk: '乌头反瓜蒌，同用可产生严重毒副作用' },
    { herbA: '乌头', herbB: '贝母', risk: '乌头反贝母，同用可产生严重毒副作用' },
    { herbA: '乌头', herbB: '白蔹', risk: '乌头反白蔹，同用可产生严重毒副作用' },
    { herbA: '乌头', herbB: '白芨', risk: '乌头反白芨，同用可产生严重毒副作用' },
    { herbA: '藜芦', herbB: '人参', risk: '藜芦反人参，同用可产生严重毒副作用' },
    { herbA: '藜芦', herbB: '沙参', risk: '藜芦反沙参，同用可产生严重毒副作用' },
    { herbA: '藜芦', herbB: '丹参', risk: '藜芦反丹参，同用可产生严重毒副作用' },
    { herbA: '藜芦', herbB: '玄参', risk: '藜芦反玄参，同用可产生严重毒副作用' },
    { herbA: '藜芦', herbB: '细辛', risk: '藜芦反细辛，同用可产生严重毒副作用' },
    { herbA: '藜芦', herbB: '芍药', risk: '藜芦反芍药，同用可产生严重毒副作用' }
  ]
}

/**
 * 十九畏配伍禁忌
 */
export const INCOMPATIBILITY_NINETEEN: IncompatibilityRule = {
  name: '十九畏',
  description: '十九畏是中药配伍禁忌，指某些药物同用会降低药效或产生不良反应',
  pairs: [
    { herbA: '硫黄', herbB: '朴硝', risk: '硫黄畏朴硝，同用降低药效' },
    { herbA: '水银', herbB: '砒石', risk: '水银畏砒石，同用产生剧毒' },
    { herbA: '狼毒', herbB: '密陀僧', risk: '狼毒畏密陀僧，同用产生剧毒' },
    { herbA: '巴豆', herbB: '牵牛子', risk: '巴豆畏牵牛子，同用加重峻下作用' },
    { herbA: '丁香', herbB: '郁金', risk: '丁香畏郁金，同用降低药效' },
    { herbA: '川乌', herbB: '草乌', risk: '川乌畏草乌，同用毒性增强' },
    { herbA: '牙硝', herbB: '三棱', risk: '牙硝畏三棱，同用降低药效' },
    { herbA: '人参', herbB: '五灵脂', risk: '人参畏五灵脂，同用降低药效' },
    { herbA: '官桂', herbB: '石脂', risk: '官桂畏石脂，同用降低药效' }
  ]
}

/**
 * 配伍禁忌检测结果
 */
export interface IncompatibilityResult {
  /** 是否存在配伍禁忌 */
  hasIncompatibility: boolean
  /** 检测到的配伍禁忌列表 */
  conflicts: Array<{
    /** 药材A */
    herbA: string
    /** 药材B */
    herbB: string
    /** 禁忌类型（十八反/十九畏） */
    type: string
    /** 风险描述 */
    risk: string
  }>
  /** 风险等级 */
  riskLevel: 'low' | 'medium' | 'high' | 'severe'
  /** 警告信息 */
  warningMessage: string
}

/**
 * 妊娠禁忌等级
 */
export type PregnancyContraindicationLevel = '禁用' | '慎用'

/**
 * 妊娠禁忌药材
 */
export interface PregnancyContraindication {
  /** 药材名称 */
  name: string
  /** 禁忌等级：禁用（绝对禁止）、慎用（谨慎使用） */
  level: PregnancyContraindicationLevel
  /** 风险描述 */
  risk: string
  /** 孕期风险（早期/中期/晚期） */
  pregnancyRisk?: string[]
  /** 注意事项 */
  precautions: string[]
}

/**
 * 妊娠禁忌数据库
 */
export const PREGNANCY_CONTRAINDICATIONS: PregnancyContraindication[] = [
  // 禁用药（对胎儿或孕妇有严重危害，绝对禁止使用）
  {
    name: '斑蝥',
    level: '禁用',
    risk: '剧毒，可导致流产、死胎',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '外用也需极其谨慎']
  },
  {
    name: '麝香',
    level: '禁用',
    risk: '活血祛瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '人工流产时可适量使用']
  },
  {
    name: '水蛭',
    level: '禁用',
    risk: '破血逐瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '体虚者慎用']
  },
  {
    name: '虻虫',
    level: '禁用',
    risk: '破血逐瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '体虚者慎用']
  },
  {
    name: '土鳖虫',
    level: '禁用',
    risk: '破血逐瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '月经过多者慎用']
  },
  {
    name: '三棱',
    level: '禁用',
    risk: '破血行气，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '月经过多者慎用']
  },
  {
    name: '莪术',
    level: '禁用',
    risk: '破血行气，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '月经过多者慎用']
  },
  {
    name: '川乌',
    level: '禁用',
    risk: '大毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '必须严格炮制']
  },
  {
    name: '草乌',
    level: '禁用',
    risk: '大毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '必须严格炮制']
  },
  {
    name: '马钱子',
    level: '禁用',
    risk: '剧毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '严格控制剂量']
  },
  {
    name: '巴豆',
    level: '禁用',
    risk: '峻下逐水，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '去油取霜后使用']
  },
  {
    name: '牵牛子',
    level: '禁用',
    risk: '峻下逐水，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '体虚者慎用']
  },
  {
    name: '甘遂',
    level: '禁用',
    risk: '峻下逐水，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '不宜与甘草同用']
  },
  {
    name: '大戟',
    level: '禁用',
    risk: '峻下逐水，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '不宜与甘草同用']
  },
  {
    name: '芫花',
    level: '禁用',
    risk: '峻下逐水，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '不宜与甘草同用']
  },
  {
    name: '商陆',
    level: '禁用',
    risk: '峻下逐水，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '对肾脏有损害']
  },
  {
    name: '红娘虫',
    level: '禁用',
    risk: '剧毒，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '必须严格炮制']
  },
  {
    name: '青娘虫',
    level: '禁用',
    risk: '剧毒，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '必须严格炮制']
  },
  {
    name: '蟾酥',
    level: '禁用',
    risk: '剧毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '对心脏有严重毒性']
  },
  {
    name: '水银',
    level: '禁用',
    risk: '剧毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '严禁内服']
  },
  {
    name: '砒石',
    level: '禁用',
    risk: '剧毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '严格控制剂量']
  },
  {
    name: '雄黄',
    level: '禁用',
    risk: '有毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '含硫化砷']
  },
  {
    name: '朱砂',
    level: '禁用',
    risk: '有毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '含硫化汞']
  },
  {
    name: '轻粉',
    level: '禁用',
    risk: '有毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '含氯化亚汞']
  },
  {
    name: '红粉',
    level: '禁用',
    risk: '剧毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '含氧化汞']
  },
  {
    name: '白降丹',
    level: '禁用',
    risk: '剧毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '仅限外用']
  },
  {
    name: '干漆',
    level: '禁用',
    risk: '破血逐瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '体虚者慎用']
  },
  {
    name: '急性子',
    level: '禁用',
    risk: '软坚散结，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '体虚者慎用']
  },
  {
    name: '天花粉',
    level: '禁用',
    risk: '引产作用，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '体虚者慎用']
  },
  {
    name: '皂角',
    level: '禁用',
    risk: '峻下催产，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '体虚者慎用']
  },
  {
    name: '猪牙皂',
    level: '禁用',
    risk: '峻下催产，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '体虚者慎用']
  },
  {
    name: '大皂角',
    level: '禁用',
    risk: '峻下催产，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '体虚者慎用']
  },
  {
    name: '常山',
    level: '禁用',
    risk: '涌吐截疟，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '催吐后易体虚']
  },
  {
    name: '藜芦',
    level: '禁用',
    risk: '涌吐杀虫，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '剧毒']
  },
  {
    name: '麝香',
    level: '禁用',
    risk: '活血祛瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '人工流产时可适量使用']
  },
  {
    name: '乌药',
    level: '禁用',
    risk: '行气止痛，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['孕妇绝对禁用', '体虚者慎用']
  },

  // 慎用药（对胎儿或孕妇有一定风险，需要谨慎使用）
  {
    name: '红花',
    level: '慎用',
    risk: '活血祛瘀，孕期早期禁用，中晚期慎用',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '桃仁',
    level: '慎用',
    risk: '活血祛瘀，孕期早期禁用，中晚期慎用',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '益母草',
    level: '慎用',
    risk: '活血调经，孕期早期禁用，中晚期慎用',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '当归',
    level: '慎用',
    risk: '补血活血，孕期早期禁用，中晚期慎用',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '丹参',
    level: '慎用',
    risk: '活血化瘀，孕期早期禁用，中晚期慎用',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '川芎',
    level: '慎用',
    risk: '活血行气，孕期早期禁用，中晚期慎用',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '牛膝',
    level: '慎用',
    risk: '活血通经，引血下行，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '王不留行',
    level: '慎用',
    risk: '活血通经，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '刘寄奴',
    level: '慎用',
    risk: '活血祛瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '苏木',
    level: '慎用',
    risk: '活血祛瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '姜黄',
    level: '慎用',
    risk: '活血行气，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '延胡索',
    level: '慎用',
    risk: '活血行气，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '乳香',
    level: '慎用',
    risk: '活血止痛，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '没药',
    level: '慎用',
    risk: '活血止痛，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '泽兰',
    level: '慎用',
    risk: '活血调经，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '月季花',
    level: '慎用',
    risk: '活血调经，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '凌霄花',
    level: '慎用',
    risk: '活血调经，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '自然铜',
    level: '慎用',
    risk: '活血化瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '骨碎补',
    level: '慎用',
    risk: '活血化瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '穿山甲',
    level: '慎用',
    risk: '活血通经，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '五灵脂',
    level: '慎用',
    risk: '活血化瘀，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用', '不宜与人参同用']
  },
  {
    name: '大黄',
    level: '慎用',
    risk: '泻下攻积，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用', '酒制后毒性降低']
  },
  {
    name: '芒硝',
    level: '慎用',
    risk: '泻下攻积，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '番泻叶',
    level: '慎用',
    risk: '泻下攻积，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '芦荟',
    level: '慎用',
    risk: '泻下攻积，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '附子',
    level: '慎用',
    risk: '辛热有毒，可致胎儿畸形或流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '必须严格炮制', '久煎可降低毒性']
  },
  {
    name: '肉桂',
    level: '慎用',
    risk: '辛热助阳，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '干姜',
    level: '慎用',
    risk: '辛热助阳，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '半夏',
    level: '慎用',
    risk: '有毒，可致胎儿畸形',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '必须严格炮制', '小剂量使用']
  },
  {
    name: '天南星',
    level: '慎用',
    risk: '有毒，可致胎儿畸形',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '必须严格炮制', '小剂量使用']
  },
  {
    name: '白附子',
    level: '慎用',
    risk: '有毒，可致胎儿畸形',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '必须严格炮制', '小剂量使用']
  },
  {
    name: '禹白附',
    level: '慎用',
    risk: '有毒，可致胎儿畸形',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '必须严格炮制', '小剂量使用']
  },
  {
    name: '关白附',
    level: '慎用',
    risk: '有毒，可致胎儿畸形',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '必须严格炮制', '小剂量使用']
  },
  {
    name: '吴茱萸',
    level: '慎用',
    risk: '辛热有小毒，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '细辛',
    level: '慎用',
    risk: '辛温有小毒，可致胎儿畸形',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用', '不宜与藜芦同用']
  },
  {
    name: '苦杏仁',
    level: '慎用',
    risk: '有小毒，可致胎儿畸形',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '必须严格炮制', '小剂量使用']
  },
  {
    name: '薏苡仁',
    level: '慎用',
    risk: '滑利降泄，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '滑石',
    level: '慎用',
    risk: '滑利降泄，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '瞿麦',
    level: '慎用',
    risk: '滑利降泄，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '冬葵子',
    level: '慎用',
    risk: '滑利降泄，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  },
  {
    name: '车前子',
    level: '慎用',
    risk: '滑利降泄，易导致流产',
    pregnancyRisk: ['早期', '中期', '晚期'],
    precautions: ['早期禁用', '中晚期在医师指导下使用', '小剂量使用']
  }
]

/**
 * 妊娠禁忌检测结果
 */
export interface PregnancyContraindicationResult {
  /** 是否存在妊娠禁忌 */
  hasContraindication: boolean
  /** 用户是否怀孕 */
  isPregnant: boolean
  /** 检测到的妊娠禁忌药材列表 */
  forbiddenHerbs: Array<PregnancyContraindication>
  /** 检测到的妊娠慎用药材列表 */
  cautiousHerbs: Array<PregnancyContraindication>
  /** 风险等级 */
  riskLevel: 'low' | 'medium' | 'high' | 'severe'
  /** 警告信息 */
  warningMessage: string
}

/**
 * 有毒有害中药材列表
 */
export const TOXIC_HERBS: ToxicHerb[] = [
  // 大毒类
  {
    name: '川乌',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '老年人', '体质虚弱者'],
    maxDosage: 1.5,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量，不可过量',
      '久煎可降低毒性',
      '禁止与半夏、瓜蒌、贝母、白蔹、白芨同用（十八反）'
    ],
    notes: '生品内服极易中毒，甚至致死'
  },
  {
    name: '草乌',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '老年人', '体质虚弱者'],
    maxDosage: 1.5,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量，不可过量',
      '久煎可降低毒性',
      '禁止与半夏、瓜蒌、贝母、白蔹、白芨同用（十八反）'
    ],
    notes: '生品内服极易中毒，甚至致死'
  },
  {
    name: '马钱子',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '老年人', '体质虚弱者', '心脏病患者'],
    maxDosage: 0.3,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量，过量可导致呼吸肌痉挛而死亡',
      '中毒初期表现为抽搐、角弓反张'
    ],
    notes: '毒性极强，需在医生严格监控下使用'
  },
  {
    name: '天仙子',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '青光眼患者'],
    maxDosage: 0.6,
    precautions: [
      '严格控制剂量',
      '过量可导致口干、瞳孔散大、心动过速'
    ],
    notes: '含莨菪碱，有中枢兴奋作用'
  },
  {
    name: '巴豆',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '体弱者', '慢性肠炎患者'],
    maxDosage: 0.1,
    precautions: [
      '去油取霜后使用',
      '严禁过量',
      '过量可导致剧烈腹泻、脱水'
    ],
    notes: '峻下逐水药，毒性极强'
  },

  // 有毒类
  {
    name: '附子',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '阴虚阳亢者'],
    maxDosage: 15,
    precautions: [
      '必须经过炮制后使用',
      '久煎可降低毒性',
      '避免与瓜蒌、贝母、白蔹、白芨同用（十八反）',
      '注意个体差异，从小剂量开始'
    ],
    notes: '辛热有毒，回阳救逆第一要药'
  },
  {
    name: '半夏',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '阴虚燥咳者'],
    maxDosage: 9,
    precautions: [
      '必须经过炮制后使用',
      '生半夏内服可导致口舌麻木、失音',
      '不宜与乌头类药物同用'
    ],
    notes: '生品有毒，炮制后毒性降低'
  },
  {
    name: '天南星',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '阴虚燥咳者'],
    maxDosage: 9,
    precautions: [
      '必须经过炮制后使用',
      '生品刺激口腔黏膜，可导致失音',
      '不宜与乌头类药物同用'
    ],
    notes: '燥湿化痰，祛风止痉'
  },
  {
    name: '洋金花',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '青光眼患者', '心动过速患者'],
    maxDosage: 0.6,
    precautions: [
      '严格控制剂量',
      '过量可导致口干、瞳孔散大、心跳加快'
    ],
    notes: '含莨菪碱，有麻醉作用'
  },
  {
    name: '闹羊花',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者'],
    maxDosage: 0.6,
    precautions: [
      '严格控制剂量',
      '过量可导致血压下降、心律失常'
    ],
    notes: '有毒中药，慎用'
  },

  // 小毒类
  {
    name: '吴茱萸',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '阴虚火旺者'],
    maxDosage: 5,
    precautions: [
      '适量使用，不宜过量',
      '过量可导致口腔刺激'
    ],
    notes: '辛热有小毒，温中止痛'
  },
  {
    name: '蛇床子',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '肾阳虚者'],
    maxDosage: 10,
    precautions: [
      '适量使用',
      '外用为主'
    ],
    notes: '外用杀虫止痒，内服温肾壮阳'
  },
  {
    name: '川楝子',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '脾胃虚寒者'],
    maxDosage: 10,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适'
    ],
    notes: '行气止痛，疏肝泄热'
  },
  {
    name: '山豆根',
    toxicityLevel: '小毒',
    contraindications: ['脾胃虚寒者'],
    maxDosage: 6,
    precautions: [
      '适量使用',
      '过量可导致呕吐、腹泻'
    ],
    notes: '清热解毒，利咽消肿'
  },
  {
    name: '苍耳子',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '血虚头痛者'],
    maxDosage: 10,
    precautions: [
      '必须经过炮制后使用',
      '过量可导致中毒'
    ],
    notes: '通鼻窍，祛风湿'
  },
  {
    name: '苦杏仁',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '婴幼儿'],
    maxDosage: 10,
    precautions: [
      '必须经过炮制后使用',
      '过量可导致呼吸困难',
      '不宜久服'
    ],
    notes: '含苦杏仁苷，水解后产生氢氰酸'
  },
  {
    name: '细辛',
    toxicityLevel: '小毒',
    contraindications: ['阴虚火旺者', '气虚多汗者'],
    maxDosage: 3,
    precautions: [
      '严格限制剂量',
      '过量可导致呼吸麻痹',
      '不宜与藜芦同用'
    ],
    notes: '辛温有小毒，散寒止痛'
  },
  // 新增大毒类
  {
    name: '雷公藤',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '老年人', '体质虚弱者', '肝肾功能不全者'],
    maxDosage: 0.5,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量，不可过量',
      '对肝肾功能有损害',
      '长期使用需定期监测肝肾功能'
    ],
    notes: '毒性极强，可导致多器官衰竭'
  },
  {
    name: '斑蝥',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '肾功能不全者'],
    maxDosage: 0.1,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量，不可过量',
      '对肾功能有严重损害',
      '中毒可导致急性肾衰竭'
    ],
    notes: '毒性极强，外用可导致皮肤灼伤'
  },
  {
    name: '红娘虫',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者'],
    maxDosage: 0.3,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量',
      '过量可导致胃肠道出血'
    ],
    notes: '毒性极强，峻下逐水'
  },
  {
    name: '青娘虫',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者'],
    maxDosage: 0.3,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量',
      '过量可导致胃肠道出血'
    ],
    notes: '毒性极强，峻下逐水'
  },
  {
    name: '蟾酥',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '心脏病患者'],
    maxDosage: 0.015,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量',
      '过量可导致心律失常、心跳骤停'
    ],
    notes: '毒性极强，对心脏有严重毒性'
  },
  {
    name: '水银',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '肝肾功能不全者'],
    maxDosage: 0.1,
    precautions: [
      '严禁内服',
      '仅限外用',
      '外用时严格控制剂量',
      '可导致汞中毒'
    ],
    notes: '剧毒，可导致中枢神经系统损伤'
  },
  {
    name: '砒石',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '肝肾功能不全者'],
    maxDosage: 0.003,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量',
      '过量可导致多器官衰竭',
      '严禁与水银同用'
    ],
    notes: '剧毒，可导致急性砷中毒'
  },
  {
    name: '雄黄',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '肝肾功能不全者'],
    maxDosage: 0.3,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量',
      '过量可导致砷中毒',
      '严禁火煅'
    ],
    notes: '有毒，含硫化砷'
  },
  {
    name: '红粉',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者'],
    maxDosage: 0.009,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量',
      '仅限外用'
    ],
    notes: '剧毒，含氧化汞'
  },
  {
    name: '轻粉',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '肾功能不全者'],
    maxDosage: 0.1,
    precautions: [
      '严格控制剂量',
      '对肾功能有损害',
      '仅限外用'
    ],
    notes: '有毒，含氯化亚汞'
  },
  {
    name: '白降丹',
    toxicityLevel: '大毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者'],
    maxDosage: 0.03,
    precautions: [
      '必须经过严格炮制后使用',
      '严格控制剂量',
      '仅限外用'
    ],
    notes: '剧毒，含汞化合物'
  },
  // 新增有毒类
  {
    name: '雷公藤多苷',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '老年人', '肝肾功能不全者'],
    maxDosage: 0.6,
    precautions: [
      '严格控制剂量',
      '对肝肾功能有损害',
      '长期使用需定期监测',
      '可导致白细胞减少'
    ],
    notes: '有免疫抑制作用'
  },
  {
    name: '昆明山海棠',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '老年人', '肝肾功能不全者'],
    maxDosage: 0.6,
    precautions: [
      '严格控制剂量',
      '对肝肾功能有损害',
      '长期使用需定期监测'
    ],
    notes: '有免疫抑制作用'
  },
  {
    name: '关木通',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '肾功能不全者'],
    maxDosage: 3,
    precautions: [
      '严格控制剂量',
      '对肾功能有损害',
      '长期使用需定期监测肾功能',
      '现多用木通替代'
    ],
    notes: '含马兜铃酸，可导致肾损害'
  },
  {
    name: '广防己',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '肾功能不全者'],
    maxDosage: 4.5,
    precautions: [
      '严格控制剂量',
      '对肾功能有损害',
      '含马兜铃酸',
      '现多用防己替代'
    ],
    notes: '含马兜铃酸，可导致肾损害'
  },
  {
    name: '马兜铃',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '肾功能不全者'],
    maxDosage: 3,
    precautions: [
      '严格控制剂量',
      '对肾功能有损害',
      '含马兜铃酸',
      '长期使用需定期监测肾功能'
    ],
    notes: '含马兜铃酸，可导致肾损害'
  },
  {
    name: '朱砂',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '肝肾功能不全者'],
    maxDosage: 0.5,
    precautions: [
      '必须经过炮制后使用',
      '严格控制剂量',
      '对肾功能有损害',
      '不可大量或长期服用'
    ],
    notes: '含硫化汞，可导致汞中毒'
  },
  {
    name: '硫黄',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '阴虚火旺者'],
    maxDosage: 1.5,
    precautions: [
      '必须经过炮制后使用',
      '严格控制剂量',
      '过量可导致腹痛、腹泻',
      '不宜与朴硝同用'
    ],
    notes: '有毒，外用内服均可'
  },
  {
    name: '白附子',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '阴虚火旺者'],
    maxDosage: 3,
    precautions: [
      '必须经过炮制后使用',
      '生品刺激口腔黏膜',
      '过量可导致失音'
    ],
    notes: '生品有毒，炮制后毒性降低'
  },
  {
    name: '禹白附',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '阴虚火旺者'],
    maxDosage: 3,
    precautions: [
      '必须经过炮制后使用',
      '生品刺激口腔黏膜',
      '过量可导致失音'
    ],
    notes: '生品有毒，炮制后毒性降低'
  },
  {
    name: '关白附',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '阴虚火旺者'],
    maxDosage: 3,
    precautions: [
      '必须经过炮制后使用',
      '生品刺激口腔黏膜',
      '过量可导致失音'
    ],
    notes: '生品有毒，炮制后毒性降低'
  },
  {
    name: '商陆',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '脾虚水肿者'],
    maxDosage: 3,
    precautions: [
      '严格控制剂量',
      '过量可导致恶心、呕吐、腹泻',
      '对肾脏有损害'
    ],
    notes: '峻下逐水，有毒'
  },
  {
    name: '狼毒',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者'],
    maxDosage: 0.9,
    precautions: [
      '严格控制剂量',
      '过量可导致腹痛、腹泻',
      '对肝肾功能有损害'
    ],
    notes: '有毒，峻下逐水'
  },
  {
    name: '甘遂',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '脾虚水肿者'],
    maxDosage: 0.5,
    precautions: [
      '严格控制剂量',
      '过量可导致剧烈腹泻',
      '不宜与甘草同用'
    ],
    notes: '峻下逐水，有毒'
  },
  {
    name: '大戟',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '脾虚水肿者'],
    maxDosage: 0.5,
    precautions: [
      '严格控制剂量',
      '过量可导致剧烈腹泻',
      '不宜与甘草同用'
    ],
    notes: '峻下逐水，有毒'
  },
  {
    name: '芫花',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '脾虚水肿者'],
    maxDosage: 0.6,
    precautions: [
      '严格控制剂量',
      '过量可导致剧烈腹泻',
      '不宜与甘草同用'
    ],
    notes: '峻下逐水，有毒'
  },
  {
    name: '常山',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '脾胃虚弱者'],
    maxDosage: 5,
    precautions: [
      '严格控制剂量',
      '过量可导致恶心、呕吐、腹泻',
      '催吐后易导致体虚'
    ],
    notes: '有毒，涌吐截疟'
  },
  {
    name: '蓖麻子',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者', '肝肾功能不全者'],
    maxDosage: 0.6,
    precautions: [
      '必须经过严格炮制后使用',
      '过量可导致胃肠道出血',
      '对肝肾功能有损害'
    ],
    notes: '有毒，峻下逐水'
  },
  {
    name: '藤黄',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者'],
    maxDosage: 0.03,
    precautions: [
      '严格控制剂量',
      '过量可导致腹痛、腹泻、出血',
      '仅限外用'
    ],
    notes: '有毒，消肿排脓'
  },
  {
    name: '土荆皮',
    toxicityLevel: '有毒',
    contraindications: ['孕妇', '婴幼儿', '体质虚弱者'],
    maxDosage: 3,
    precautions: [
      '严格控制剂量',
      '过量可导致胃肠道不适',
      '仅限外用'
    ],
    notes: '有毒，杀虫止痒'
  },
  // 新增小毒类
  {
    name: '皂角',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '婴幼儿', '体虚者'],
    maxDosage: 1,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适',
      '外用可导致皮肤刺激'
    ],
    notes: '辛温有小毒，祛痰开窍'
  },
  {
    name: '猪牙皂',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '婴幼儿', '体虚者'],
    maxDosage: 1,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适'
    ],
    notes: '辛温有小毒，祛痰开窍'
  },
  {
    name: '大皂角',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '婴幼儿', '体虚者'],
    maxDosage: 1,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适'
    ],
    notes: '辛温有小毒，祛痰开窍'
  },
  {
    name: '艾叶',
    toxicityLevel: '小毒',
    contraindications: ['阴虚血热者'],
    maxDosage: 9,
    precautions: [
      '适量使用',
      '过量可导致口干、咽喉肿痛'
    ],
    notes: '辛温有小毒，温经止血'
  },
  {
    name: '绵萆薢',
    toxicityLevel: '小毒',
    contraindications: ['肾虚阴亏者'],
    maxDosage: 9,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适'
    ],
    notes: '祛风除湿'
  },
  {
    name: '粉萆薢',
    toxicityLevel: '小毒',
    contraindications: ['肾虚阴亏者'],
    maxDosage: 9,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适'
    ],
    notes: '祛风除湿'
  },
  {
    name: '川楝子',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '脾胃虚寒者'],
    maxDosage: 10,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适'
    ],
    notes: '行气止痛，疏肝泄热'
  },
  {
    name: '山豆根',
    toxicityLevel: '小毒',
    contraindications: ['脾胃虚寒者'],
    maxDosage: 6,
    precautions: [
      '适量使用',
      '过量可导致呕吐、腹泻'
    ],
    notes: '清热解毒，利咽消肿'
  },
  {
    name: '北豆根',
    toxicityLevel: '小毒',
    contraindications: ['脾胃虚寒者'],
    maxDosage: 6,
    precautions: [
      '适量使用',
      '过量可导致呕吐、腹泻'
    ],
    notes: '清热解毒，利咽消肿'
  },
  {
    name: '仙茅',
    toxicityLevel: '小毒',
    contraindications: ['阴虚火旺者'],
    maxDosage: 9,
    precautions: [
      '适量使用',
      '过量可导致口干、便秘'
    ],
    notes: '辛热有小毒，补肾阳，强筋骨'
  },
  {
    name: '鸦胆子',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '脾胃虚寒者'],
    maxDosage: 0.3,
    precautions: [
      '严格控制剂量',
      '过量可导致胃肠道出血',
      '外用可导致皮肤刺激'
    ],
    notes: '有毒，清热解毒'
  },
  {
    name: '重楼',
    toxicityLevel: '小毒',
    contraindications: ['体质虚弱者', '孕妇'],
    maxDosage: 9,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适'
    ],
    notes: '清热解毒，消肿止痛'
  },
  {
    name: '七叶一枝花',
    toxicityLevel: '小毒',
    contraindications: ['体质虚弱者', '孕妇'],
    maxDosage: 9,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适'
    ],
    notes: '清热解毒，消肿止痛'
  },
  {
    name: '了哥王',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '体质虚弱者'],
    maxDosage: 9,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适'
    ],
    notes: '清热解毒，散结止痛'
  },
  {
    name: '木鳖子',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '体质虚弱者'],
    maxDosage: 0.9,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适',
      '外用可导致皮肤刺激'
    ],
    notes: '散结消肿'
  },
  {
    name: '水蛭',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '体虚者', '月经过多者'],
    maxDosage: 1.5,
    precautions: [
      '适量使用',
      '过量可导致出血不止',
      '孕妇禁用'
    ],
    notes: '破血逐瘀'
  },
  {
    name: '虻虫',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '体虚者', '月经过多者'],
    maxDosage: 1.5,
    precautions: [
      '适量使用',
      '过量可导致出血不止',
      '孕妇禁用'
    ],
    notes: '破血逐瘀'
  },
  {
    name: '土鳖虫',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '体虚者', '月经过多者'],
    maxDosage: 3,
    precautions: [
      '适量使用',
      '过量可导致出血不止',
      '孕妇禁用'
    ],
    notes: '破血逐瘀'
  },
  {
    name: '干漆',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '体虚者', '月经过多者'],
    maxDosage: 3,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适'
    ],
    notes: '破血逐瘀'
  },
  {
    name: '三棱',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '体虚者', '月经过多者'],
    maxDosage: 9,
    precautions: [
      '适量使用',
      '过量可导致出血不止',
      '孕妇禁用',
      '不宜与牙硝同用'
    ],
    notes: '破血行气'
  },
  {
    name: '莪术',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '体虚者', '月经过多者'],
    maxDosage: 9,
    precautions: [
      '适量使用',
      '过量可导致出血不止',
      '孕妇禁用'
    ],
    notes: '破血行气'
  },
  {
    name: '急性子',
    toxicityLevel: '小毒',
    contraindications: ['孕妇', '体虚者'],
    maxDosage: 3,
    precautions: [
      '适量使用',
      '过量可导致胃肠道不适',
      '孕妇禁用'
    ],
    notes: '软坚散结'
  }
]

/**
 * 检测处方中是否含有毒有害中药材
 * @param ingredients 药物组成
 * @returns 有毒有害中药材列表
 */
export function detectToxicHerbs(
  ingredients: Array<{ name: string; dosage: string; special?: string }>
): Array<ToxicHerb & { currentDosage: string; dosageExceeded: boolean }> {
  const toxicHerbsFound: Array<ToxicHerb & { currentDosage: string; dosageExceeded: boolean }> = []

  ingredients.forEach(ingredient => {
    const toxicHerb = TOXIC_HERBS.find(th =>
      ingredient.name.includes(th.name) || th.name.includes(ingredient.name)
    )

    if (toxicHerb) {
      // 解析剂量
      const dosageMatch = ingredient.dosage.match(/(\d+(\.\d+)?)/)
      const currentDosage = dosageMatch ? parseFloat(dosageMatch[1]) : 0

      toxicHerbsFound.push({
        ...toxicHerb,
        currentDosage: ingredient.dosage,
        dosageExceeded: currentDosage > toxicHerb.maxDosage
      })
    }
  })

  return toxicHerbsFound
}

/**
 * 检查用户是否属于禁忌人群
 * @param toxicHerb 有毒有害中药材
 * @param patientInfo 用户信息
 * @returns 是否属于禁忌人群
 */
export function checkContraindication(
  toxicHerb: ToxicHerb,
  patientInfo: {
    age?: number
    gender?: string
    isPregnant?: boolean
    healthCondition?: string
  }
): { isContraindicated: boolean; reason?: string } {
  // 检查孕妇
  if (patientInfo.isPregnant && toxicHerb.contraindications.includes('孕妇')) {
    return { isContraindicated: true, reason: '孕妇禁用' }
  }

  // 检查婴幼儿（< 3 岁）
  if (patientInfo.age && patientInfo.age < 3 && toxicHerb.contraindications.includes('婴幼儿')) {
    return { isContraindicated: true, reason: '婴幼儿禁用' }
  }

  // 检查老年人（> 65 岁）
  if (patientInfo.age && patientInfo.age > 65 && toxicHerb.contraindications.includes('老年人')) {
    return { isContraindicated: true, reason: '老年人慎用' }
  }

  return { isContraindicated: false }
}

/**
 * 生成风控警告信息
 * @param toxicHerbs 有毒有害中药材列表
 * @returns 风控警告信息
 */
export function generateRiskWarning(
  toxicHerbs: Array<ToxicHerb & { currentDosage: string; dosageExceeded: boolean }>
): {
  riskLevel: 'low' | 'medium' | 'high' | 'severe'
  warningMessage: string
  hasContraindications: boolean
  hasDosageExceeded: boolean
} {
  if (toxicHerbs.length === 0) {
    return {
      riskLevel: 'low',
      warningMessage: '未检测到有毒有害中药材',
      hasContraindications: false,
      hasDosageExceeded: false
    }
  }

  const hasBigToxicity = toxicHerbs.some(th => th.toxicityLevel === '大毒')
  const hasDosageExceeded = toxicHerbs.some(th => th.dosageExceeded)

  let riskLevel: 'low' | 'medium' | 'high' | 'severe' = 'low'
  let warningMessage = ''

  if (hasBigToxicity) {
    riskLevel = 'severe'
    warningMessage = `⚠️ 严重风险：处方中包含 ${toxicHerbs.filter(th => th.toxicityLevel === '大毒').map(th => th.name).join('、')} 等大毒药材，必须在专业中医师严格监控下使用！`
  } else if (hasDosageExceeded) {
    riskLevel = 'high'
    warningMessage = `⚠️ 高风险：处方中 ${toxicHerbs.filter(th => th.dosageExceeded).map(th => th.name).join('、')} 的剂量已超过安全范围，请立即调整！`
  } else {
    riskLevel = 'medium'
    warningMessage = `⚠️ 中等风险：处方中包含 ${toxicHerbs.map(th => th.name).join('、')} 等有毒有害中药材，请严格按照注意事项使用！`
  }

  return {
    riskLevel,
    warningMessage,
    hasContraindications: false,
    hasDosageExceeded
  }
}

/**
 * 检测十八反配伍禁忌
 * @param ingredients 药物组成
 * @returns 十八反配伍禁忌检测结果
 */
export function checkEighteenAnti(
  ingredients: Array<{ name: string; dosage: string; special?: string }>
): IncompatibilityResult {
  const conflicts: Array<{
    herbA: string
    herbB: string
    type: string
    risk: string
  }> = []

  const herbNames = ingredients.map(ing => ing.name)

  // 检查每一对配伍禁忌
  INCOMPATIBILITY_EIGHTEEN.pairs.forEach(pair => {
    // 检查是否包含药材A
    const hasHerbA = herbNames.some(name =>
      name.includes(pair.herbA) || pair.herbA.includes(name)
    )

    // 检查是否包含药材B
    const hasHerbB = herbNames.some(name =>
      name.includes(pair.herbB) || pair.herbB.includes(name)
    )

    if (hasHerbA && hasHerbB) {
      conflicts.push({
        herbA: pair.herbA,
        herbB: pair.herbB,
        type: '十八反',
        risk: pair.risk
      })
    }
  })

  const hasIncompatibility = conflicts.length > 0

  return {
    hasIncompatibility,
    conflicts,
    riskLevel: hasIncompatibility ? 'severe' : 'low',
    warningMessage: hasIncompatibility
      ? `⚠️ 严重风险：检测到十八反配伍禁忌！${conflicts.map(c => c.herbA + '与' + c.herbB).join('；')}`
      : '未检测到十八反配伍禁忌'
  }
}

/**
 * 检测十九畏配伍禁忌
 * @param ingredients 药物组成
 * @returns 十九畏配伍禁忌检测结果
 */
export function checkNineteenDread(
  ingredients: Array<{ name: string; dosage: string; special?: string }>
): IncompatibilityResult {
  const conflicts: Array<{
    herbA: string
    herbB: string
    type: string
    risk: string
  }> = []

  const herbNames = ingredients.map(ing => ing.name)

  // 检查每一对配伍禁忌
  INCOMPATIBILITY_NINETEEN.pairs.forEach(pair => {
    // 检查是否包含药材A
    const hasHerbA = herbNames.some(name =>
      name.includes(pair.herbA) || pair.herbA.includes(name)
    )

    // 检查是否包含药材B
    const hasHerbB = herbNames.some(name =>
      name.includes(pair.herbB) || pair.herbB.includes(name)
    )

    if (hasHerbA && hasHerbB) {
      conflicts.push({
        herbA: pair.herbA,
        herbB: pair.herbB,
        type: '十九畏',
        risk: pair.risk
      })
    }
  })

  const hasIncompatibility = conflicts.length > 0

  return {
    hasIncompatibility,
    conflicts,
    riskLevel: hasIncompatibility ? 'high' : 'low',
    warningMessage: hasIncompatibility
      ? `⚠️ 高风险：检测到十九畏配伍禁忌！${conflicts.map(c => c.herbA + '与' + c.herbB).join('；')}`
      : '未检测到十九畏配伍禁忌'
  }
}

/**
 * 综合检测配伍禁忌（十八反 + 十九畏）
 * @param ingredients 药物组成
 * @returns 综合配伍禁忌检测结果
 */
export function checkAllIncompatibilities(
  ingredients: Array<{ name: string; dosage: string; special?: string }>
): IncompatibilityResult {
  const eighteenResult = checkEighteenAnti(ingredients)
  const nineteenResult = checkNineteenDread(ingredients)

  const conflicts = [...eighteenResult.conflicts, ...nineteenResult.conflicts]
  const hasIncompatibility = conflicts.length > 0

  // 风险等级：十八反为严重风险，十九畏为高风险
  let riskLevel: 'low' | 'medium' | 'high' | 'severe' = 'low'
  if (eighteenResult.hasIncompatibility) {
    riskLevel = 'severe'
  } else if (nineteenResult.hasIncompatibility) {
    riskLevel = 'high'
  }

  const warningMessage = hasIncompatibility
    ? `⚠️ 配伍禁忌警告：${conflicts.length} 处配伍禁忌，包括 ${eighteenResult.conflicts.length} 处十八反，${nineteenResult.conflicts.length} 处十九畏！`
    : '未检测到配伍禁忌'

  return {
    hasIncompatibility,
    conflicts,
    riskLevel,
    warningMessage
  }
}

/**
 * 生成综合风控警告（包含有毒有害中药材 + 配伍禁忌）
 * @param ingredients 药物组成
 * @returns 综合风控警告
 */
export function generateComprehensiveRiskWarning(
  ingredients: Array<{ name: string; dosage: string; special?: string }>
): {
  riskLevel: 'low' | 'medium' | 'high' | 'severe'
  warningMessage: string
  toxicHerbs: Array<ToxicHerb & { currentDosage: string; dosageExceeded: boolean }>
  incompatibilities: IncompatibilityResult
} {
  // 检测有毒有害中药材
  const toxicHerbs = detectToxicHerbs(ingredients)
  const toxicWarning = generateRiskWarning(toxicHerbs)

  // 检测配伍禁忌
  const incompatibilities = checkAllIncompatibilities(ingredients)

  // 综合评估风险等级
  let numericRiskLevel = 0
  const warnings: string[] = []

  // 配伍禁忌风险优先（十八反 > 十九畏）
  if (incompatibilities.hasIncompatibility) {
    numericRiskLevel = Math.max(numericRiskLevel, incompatibilities.riskLevel === 'severe' ? 3 : incompatibilities.riskLevel === 'high' ? 2 : 1)
    warnings.push(incompatibilities.warningMessage)
  }

  // 有毒有害中药材风险
  if (toxicHerbs.length > 0) {
    const toxicRiskLevel = toxicWarning.riskLevel === 'severe' ? 3 : toxicWarning.riskLevel === 'high' ? 2 : toxicWarning.riskLevel === 'medium' ? 1 : 0
    numericRiskLevel = Math.max(numericRiskLevel, toxicRiskLevel)
    warnings.push(toxicWarning.warningMessage)
  }

  // 生成综合警告信息
  let finalRiskLevel: 'low' | 'medium' | 'high' | 'severe' = 'low'
  if (numericRiskLevel >= 3) {
    finalRiskLevel = 'severe'
  } else if (numericRiskLevel >= 2) {
    finalRiskLevel = 'high'
  } else if (numericRiskLevel >= 1) {
    finalRiskLevel = 'medium'
  }

  const warningMessage = warnings.length > 0
    ? `⚠️ 风险提醒：\n${warnings.join('\n\n')}`
    : '处方安全，未检测到风险'

  return {
    riskLevel: finalRiskLevel,
    warningMessage,
    toxicHerbs,
    incompatibilities
  }
}

/**
 * 检测妊娠禁忌
 * @param ingredients 药物组成
 * @param patientInfo 用户信息
 * @returns 妊娠禁忌检测结果
 */
export function checkPregnancyContraindication(
  ingredients: Array<{ name: string; dosage: string; special?: string }>,
  patientInfo?: {
    age?: number
    gender?: string
    isPregnant?: boolean
    healthCondition?: string
  }
): PregnancyContraindicationResult {
  const isPregnant = patientInfo?.isPregnant ?? false

  // 如果用户不是孕妇，直接返回无妊娠禁忌
  if (!isPregnant) {
    return {
      hasContraindication: false,
      isPregnant: false,
      forbiddenHerbs: [],
      cautiousHerbs: [],
      riskLevel: 'low',
      warningMessage: '✅ 处方安全，未检测到妊娠禁忌（用户非孕妇）'
    }
  }

  const forbiddenHerbs: Array<PregnancyContraindication> = []
  const cautiousHerbs: Array<PregnancyContraindication> = []

  const herbNames = ingredients.map(ing => ing.name)

  // 检查每个药材是否属于妊娠禁忌
  PREGNANCY_CONTRAINDICATIONS.forEach(pregnancyHerb => {
    const isFound = herbNames.some(name =>
      name.includes(pregnancyHerb.name) || pregnancyHerb.name.includes(name)
    )

    if (isFound) {
      if (pregnancyHerb.level === '禁用') {
        forbiddenHerbs.push(pregnancyHerb)
      } else if (pregnancyHerb.level === '慎用') {
        cautiousHerbs.push(pregnancyHerb)
      }
    }
  })

  const hasContraindication = forbiddenHerbs.length > 0 || cautiousHerbs.length > 0

  // 评估风险等级
  let riskLevel: 'low' | 'medium' | 'high' | 'severe' = 'low'

  if (forbiddenHerbs.length > 0) {
    // 检测到妊娠禁用药，严重风险
    riskLevel = 'severe'
  } else if (cautiousHerbs.length > 0) {
    // 仅检测到妊娠慎用药，高风险
    riskLevel = 'high'
  }

  // 生成警告信息
  let warningMessage = ''

  if (forbiddenHerbs.length > 0) {
    warningMessage = `🚨 严重风险：处方中包含 ${forbiddenHerbs.length} 种妊娠禁用药（${forbiddenHerbs.map(h => h.name).join('、')}），对胎儿有严重危害，绝对禁止使用！`
    if (cautiousHerbs.length > 0) {
      warningMessage += `\n⚠️ 高风险：还包含 ${cautiousHerbs.length} 种妊娠慎用药（${cautiousHerbs.map(h => h.name).join('、')}），需要在医师指导下谨慎使用！`
    }
  } else if (cautiousHerbs.length > 0) {
    warningMessage = `⚠️ 高风险：处方中包含 ${cautiousHerbs.length} 种妊娠慎用药（${cautiousHerbs.map(h => h.name).join('、')}），对胎儿有一定风险，需要在专业中医师指导下谨慎使用！`
  } else {
    warningMessage = '✅ 处方安全，未检测到妊娠禁忌'
  }

  return {
    hasContraindication,
    isPregnant,
    forbiddenHerbs,
    cautiousHerbs,
    riskLevel,
    warningMessage
  }
}

/**
 * 生成完整风控警告（包含有毒有害中药材 + 配伍禁忌 + 妊娠禁忌）
 * @param ingredients 药物组成
 * @param patientInfo 用户信息
 * @returns 完整风控警告
 */
export function generateCompleteRiskWarning(
  ingredients: Array<{ name: string; dosage: string; special?: string }>,
  patientInfo?: {
    age?: number
    gender?: string
    isPregnant?: boolean
    healthCondition?: string
  }
): {
  riskLevel: 'low' | 'medium' | 'high' | 'severe'
  warningMessage: string
  toxicHerbs: Array<ToxicHerb & { currentDosage: string; dosageExceeded: boolean }>
  incompatibilities: IncompatibilityResult
  pregnancyContraindications: PregnancyContraindicationResult
} {
  // 检测有毒有害中药材
  const toxicHerbs = detectToxicHerbs(ingredients)
  const toxicWarning = generateRiskWarning(toxicHerbs)

  // 检测配伍禁忌
  const incompatibilities = checkAllIncompatibilities(ingredients)

  // 检测妊娠禁忌
  const pregnancyContraindications = checkPregnancyContraindication(ingredients, patientInfo)

  // 收集所有警告信息
  const warnings: string[] = []

  // 妊娠禁忌警告（仅在用户是孕妇时才显示）
  if (pregnancyContraindications.hasContraindication) {
    warnings.push(pregnancyContraindications.warningMessage)
  }

  // 配伍禁忌警告
  if (incompatibilities.hasIncompatibility) {
    warnings.push(incompatibilities.warningMessage)
  }

  // 有毒有害中药材警告
  if (toxicHerbs.length > 0) {
    warnings.push(toxicWarning.warningMessage)
  }

  // 生成综合警告信息
  let finalRiskLevel: 'low' | 'medium' | 'high' | 'severe' = 'low'

  // 风险等级判定优先级：
  // 1. 妊娠禁用药（孕妇） > 2. 十八反 > 3. 大毒药材/妊娠慎用药（孕妇）> 4. 十九畏/有毒药材 > 5. 小毒药材

  // 1. 妊娠禁用药（孕妇） - 严重风险
  if (pregnancyContraindications.isPregnant && pregnancyContraindications.forbiddenHerbs.length > 0) {
    finalRiskLevel = 'severe'
  }
  // 2. 十八反配伍禁忌 - 严重风险
  else if (incompatibilities.hasIncompatibility && incompatibilities.riskLevel === 'severe') {
    finalRiskLevel = 'severe'
  }
  // 3. 大毒药材 - 严重风险
  else if (toxicHerbs.some(h => h.toxicityLevel === '大毒')) {
    finalRiskLevel = 'severe'
  }
  // 4. 妊娠慎用药（孕妇）- 高风险
  else if (pregnancyContraindications.isPregnant && pregnancyContraindications.cautiousHerbs.length > 0) {
    finalRiskLevel = 'high'
  }
  // 5. 十九畏配伍禁忌 - 高风险
  else if (incompatibilities.hasIncompatibility && incompatibilities.riskLevel === 'high') {
    finalRiskLevel = 'high'
  }
  // 6. 有毒药材 - 高风险
  else if (toxicHerbs.some(h => h.toxicityLevel === '有毒')) {
    finalRiskLevel = 'high'
  }
  // 7. 小毒药材 - 中等风险
  else if (toxicHerbs.length > 0) {
    finalRiskLevel = 'medium'
  }

  const warningMessage = warnings.length > 0
    ? `⚠️ 综合风险提醒：\n${warnings.join('\n\n')}`
    : '处方安全，未检测到风险'

  return {
    riskLevel: finalRiskLevel,
    warningMessage,
    toxicHerbs,
    incompatibilities,
    pregnancyContraindications
  }
}
