import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 补充慢性病相关方证
 */
async function supplementChronicDiseaseFormulas() {
  console.log('[Supplement] 开始补充慢性病相关方证...')

  const supabase = getSupabaseClient()

  // 缺失的方证列表
  const missingFormulas = [
    // 消化系统
    {
      formula_name: '香砂六君子汤',
      meridian_category: '太阴',
      treatment_method: '益气健脾，和胃止痛',
      source: '名医方论',
      chapter: '卷六',
      original_text: '香砂六君子汤，治脾胃气虚，寒湿滞于中焦，胸膈痞闷，呕吐清水，大便溏薄者。',
      mechanism: '脾胃气虚，寒湿中阻',
      indications: ['脾胃气虚', '胃脘胀满', '嗳气', '食欲不振', '倦怠乏力'],
      contraindications: ['阴虚火旺'],
      dosage: '党参12g，白术9g，茯苓9g，甘草6g，陈皮6g，半夏6g，香附6g，砂仁6g',
      instructions: '水煎服，日一剂，分早晚两次温服。'
    },
    {
      formula_name: '济川煎',
      meridian_category: '少阴',
      treatment_method: '温肾通便',
      source: '景岳全书',
      chapter: '新方八阵',
      original_text: '济川煎，治凡肾虚气弱，大便不行，或下焦不通，便结不通，而并不胀满，非若实热秘结之证。',
      mechanism: '肾虚便秘',
      indications: ['肾虚便秘', '腰膝酸软', '小便清长', '大便秘结'],
      contraindications: ['实热便秘'],
      dosage: '当归12g，牛膝9g，肉苁蓉9g，泽泻6g，升麻3g，枳壳6g',
      instructions: '水煎服，日一剂，分早晚两次温服。'
    },
    {
      formula_name: '黄芪汤',
      meridian_category: '太阴',
      treatment_method: '益气润肠',
      source: '金匮翼',
      chapter: '卷一',
      original_text: '黄芪汤，治老人气虚便秘，大便不干，但无力排出者。',
      mechanism: '气虚便秘',
      indications: ['气虚便秘', '大便不干', '排便无力', '面色萎黄'],
      contraindications: ['实热便秘'],
      dosage: '黄芪30g，陈皮12g，火麻仁12g，白蜜一勺',
      instructions: '水煎服，日一剂，分早晚两次温服。'
    },

    // 免疫与代谢类疾病
    {
      formula_name: '当归芍药散',
      meridian_category: '厥阴',
      treatment_method: '养血和血，健脾利湿',
      source: '金匮要略',
      chapter: '妇人妊娠病脉证并治',
      original_text: '妇人怀妊，腹中痛，当归芍药散主之。',
      mechanism: '肝血不足，脾虚湿盛',
      indications: ['面色萎黄', '月经不调', '轻度浮肿', '腹痛'],
      contraindications: ['湿热内蕴'],
      dosage: '当归9g，芍药30g，茯苓12g，白术12g，泽泻12g，川芎9g',
      instructions: '为散，每服方寸匕，酒和，日三服。'
    },
    {
      formula_name: '小柴胡汤合五苓散',
      meridian_category: '少阳',
      treatment_method: '和解少阳，化气利水',
      source: '临床经验方',
      chapter: '合方应用',
      original_text: '小柴胡汤合五苓散，治少阳病兼水气内停，胸胁苦满，口苦咽干，小便不利者。',
      mechanism: '少阳枢机不利，水湿内停',
      indications: ['胸胁苦满', '口苦咽干', '小便不利', '微恶寒'],
      contraindications: ['纯虚无邪'],
      dosage: '柴胡12g，黄芩9g，人参6g，甘草6g，半夏6g，生姜9g，大枣4枚，猪苓9g，茯苓9g，白术9g，桂枝6g，泽泻9g',
      instructions: '水煎服，日一剂，分早晚两次温服。'
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
          comment: '慢性病方证数据，来源于古籍和临床经验'
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
supplementChronicDiseaseFormulas()
  .then(() => {
    console.log('[Supplement] 补充脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Supplement] 补充脚本执行失败:', error)
    process.exit(1)
  })
