import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 补充缺失的方证数据
 */
async function supplementMissingFormulas() {
  console.log('[Supplement] 开始补充缺失的方证数据...')

  const supabase = getSupabaseClient()

  // 缺失的方证列表
  const missingFormulas = [
    {
      formula_name: '炙甘草汤',
      meridian_category: '少阴',
      treatment_method: '益气养血，通阳复脉',
      source: '伤寒论',
      chapter: '辨太阳病脉证并治下',
      original_text: '伤寒脉结代，心动悸，炙甘草汤主之。',
      mechanism: '气血两虚，心脉失养',
      indications: ['气血两虚', '心悸气短', '脉结代'],
      contraindications: ['实热证', '阴虚火旺'],
      dosage: '炙甘草12g，生姜9g，人参6g，生地黄30g，桂枝9g，阿胶6g，麦门冬10g，麻仁10g，大枣10枚',
      instructions: '水煎服，日一剂，分早晚两次温服。阿胶烊化。'
    },
    {
      formula_name: '麦门冬汤',
      meridian_category: '太阴',
      treatment_method: '滋养肺胃，降逆下气',
      source: '金匮要略',
      chapter: '肺痿肺痈咳嗽上气病脉证并治',
      original_text: '大逆上气，咽喉不利，止逆下气者，麦门冬汤主之。',
      mechanism: '肺阴亏虚，燥邪伤肺',
      indications: ['肺阴亏虚', '干咳', '咽燥', '咳逆上气'],
      contraindications: ['寒痰', '湿痰'],
      dosage: '麦门冬70g，半夏10g，人参6g，甘草6g，粳米10g，大枣4枚',
      instructions: '水煎服，日一剂，分早晚两次温服。'
    },
    {
      formula_name: '旋覆代赭汤',
      meridian_category: '太阴',
      treatment_method: '降逆化痰，益气和胃',
      source: '伤寒论',
      chapter: '辨太阳病脉证并治下',
      original_text: '伤寒发汗，若吐若下，解后，心下痞硬，噫气不除者，旋覆代赭汤主之。',
      mechanism: '胃气虚逆，痰饮内阻',
      indications: ['胃气虚逆', '噫气不除', '心下痞硬', '恶心呕吐'],
      contraindications: ['胃热炽盛', '无胃气虚'],
      dosage: '旋覆花9g（包煎），代赭石15g（先煎），人参6g，生姜15g，半夏10g，甘草9g，大枣12枚',
      instructions: '水煎服，日一剂，分早晚两次温服。'
    },
    {
      formula_name: '苓桂术甘汤',
      meridian_category: '太阴',
      treatment_method: '温阳化饮，健脾利水',
      source: '伤寒论',
      chapter: '辨太阳病脉证并治中',
      original_text: '伤寒若吐若下后，心下逆满，气上冲胸，起则头眩，脉沉紧，发汗则动经，身为振振摇者，茯苓桂枝白术甘草汤主之。',
      mechanism: '脾失健运，水湿内停',
      indications: ['痰饮内停', '胸胁满闷', '眩晕', '心下逆满'],
      contraindications: ['阴虚', '湿热'],
      dosage: '茯苓12g，桂枝9g，白术6g，甘草6g',
      instructions: '水煎服，日一剂，分早晚两次温服。'
    },
    {
      formula_name: '牡蛎泽泻散',
      meridian_category: '太阳',
      treatment_method: '逐水消肿',
      source: '金匮要略',
      chapter: '水气病脉证并治',
      original_text: '病水肿，小便不利，其脉沉伏者，牡蛎泽泻散主之。',
      mechanism: '水湿内停，泛滥肌肤',
      indications: ['水湿内停', '腹水胸水', '小便不利', '浮肿'],
      contraindications: ['体质虚弱', '肝肾功能不全', '孕妇'],
      dosage: '牡蛎、泽泻、蜀漆、葶苈子、商陆根、海藻、栝楼根各等分',
      instructions: '为散，每服方寸匕，日三服。短期使用，严密监护。'
    }
  ]

  let insertedCount = 0
  let skippedCount = 0

  try {
    for (const formula of missingFormulas) {
      // 检查是否已存在
      const { data: existing, error: checkError } = await supabase
        .from('formulas')
        .select('id')
        .eq('formula_name', formula.formula_name)
        .single()

      if (existing) {
        console.log(`[Supplement] 方证已存在，跳过: ${formula.formula_name}`)
        skippedCount++
        continue
      }

      // 插入新方证
      const { error: insertError } = await supabase
        .from('formulas')
        .insert({
          formula_name: formula.formula_name,
          meridian_category: formula.meridian_category,
          treatment_method: formula.treatment_method,
          source: formula.source,
          chapter: formula.chapter,
          original_text: formula.original_text,
          mechanism: formula.mechanism,
          indications: formula.indications,
          contraindications: formula.contraindications,
          dosage: formula.dosage,
          instructions: formula.instructions,
          version: 1,
          is_active: true,
          comment: '肿瘤经方数据库补充方证'
        })

      if (insertError) {
        console.error(`[Supplement] 插入方证失败: ${formula.formula_name}`, insertError)
      } else {
        console.log(`[Supplement] 方证已插入: ${formula.formula_name}`)
        insertedCount++
      }
    }

    console.log('\n[Supplement] 补充完成！')
    console.log(`[Supplement] 插入数量: ${insertedCount}`)
    console.log(`[Supplement] 跳过数量: ${skippedCount}`)
  } catch (error) {
    console.error('[Supplement] 补充失败:', error)
    process.exit(1)
  }
}

// 执行补充
supplementMissingFormulas()
  .then(() => {
    console.log('[Supplement] 补充脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Supplement] 补充脚本执行失败:', error)
    process.exit(1)
  })
