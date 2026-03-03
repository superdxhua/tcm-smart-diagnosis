import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 补充缺失的方证数据（修复版）
 */
async function supplementMissingFormulas() {
  console.log('[Supplement] 开始补充缺失的方证数据...')

  const supabase = getSupabaseClient()

  // 缺失的方证列表（使用正确的字段名）
  const missingFormulas = [
    // 消化系统
    { formula_name: '理中汤', meridian_category: '太阴', treatment_method: '温中健脾', source: '伤寒论', chapter: '辨霍乱病脉证并治' },
    { formula_name: '半夏泻心汤', meridian_category: '少阳', treatment_method: '寒热平调，和胃降逆', source: '伤寒论', chapter: '辨太阳病脉证并治下' },
    { formula_name: '四逆散', meridian_category: '厥阴', treatment_method: '疏肝理脾', source: '伤寒论', chapter: '辨少阴病脉证并治' },
    { formula_name: '麻子仁丸', meridian_category: '阳明', treatment_method: '润肠通便', source: '伤寒论', chapter: '辨阳明病脉证并治' },
    { formula_name: '桃花汤', meridian_category: '少阴', treatment_method: '温涩固脱', source: '伤寒论', chapter: '辨少阴病脉证并治' },
    { formula_name: '痛泻要方', meridian_category: '厥阴', treatment_method: '疏肝理脾', source: '景岳全书', chapter: '新方八阵' },
    { formula_name: '参苓白术散', meridian_category: '太阴', treatment_method: '益气健脾，渗湿止泻', source: '和剂局方', chapter: '卷三' },

    // 免疫与代谢类疾病
    { formula_name: '桂枝加附子汤', meridian_category: '太阳', treatment_method: '扶阳固表', source: '伤寒论', chapter: '辨太阳病脉证并治上' },
    { formula_name: '白虎加人参汤', meridian_category: '阳明', treatment_method: '清热生津', source: '伤寒论', chapter: '辨阳明病脉证并治' },
    { formula_name: '肾气丸', meridian_category: '少阴', treatment_method: '温补肾阳，化气生津', source: '金匮要略', chapter: '消渴小便不利淋病脉证并治' },
    { formula_name: '五苓散', meridian_category: '太阳', treatment_method: '化气行水', source: '伤寒论', chapter: '辨太阳病脉证并治中' },
    { formula_name: '黄芪桂枝五物汤', meridian_category: '太阳', treatment_method: '益气和营，通阳行痹', source: '金匮要略', chapter: '血痹虚劳病脉证并治' },

    // 情志与神经系统
    { formula_name: '柴胡加龙骨牡蛎汤', meridian_category: '少阳', treatment_method: '和解镇惊', source: '伤寒论', chapter: '辨太阳病脉证并治下' },
    { formula_name: '甘麦大枣汤', meridian_category: '厥阴', treatment_method: '养心安神', source: '金匮要略', chapter: '妇人杂病脉证并治' },
    { formula_name: '酸枣仁汤', meridian_category: '厥阴', treatment_method: '养血清热安神', source: '金匮要略', chapter: '血痹虚劳病脉证并治' },
    { formula_name: '温胆汤', meridian_category: '少阳', treatment_method: '理气化痰，清胆和胃', source: '三因极一病证方论', chapter: '卷十' },
    { formula_name: '黄连阿胶汤', meridian_category: '少阴', treatment_method: '滋阴降火，交通心肾', source: '伤寒论', chapter: '辨少阴病脉证并治' },
    { formula_name: '归脾汤', meridian_category: '太阴', treatment_method: '益气补血，健脾养心', source: '济生方', chapter: '卷四' },
    { formula_name: '桂枝加龙骨牡蛎汤', meridian_category: '太阳', treatment_method: '调和阴阳，潜阳固摄', source: '金匮要略', chapter: '血痹虚劳病脉证并治' },

    // 慢性疲劳综合征
    { formula_name: '小建中汤', meridian_category: '太阳', treatment_method: '建中气，调阴阳', source: '伤寒论', chapter: '辨太阳病脉证并治中' },
    { formula_name: '薯蓣丸', meridian_category: '太阴', treatment_method: '扶正祛邪，全面调理', source: '金匮要略', chapter: '血痹虚劳病脉证并治' },
    { formula_name: '黄芪建中汤', meridian_category: '太阳', treatment_method: '温中补气，和里缓急', source: '金匮要略', chapter: '血痹虚劳病脉证并治' },
    { formula_name: '桂枝加黄芪汤', meridian_category: '太阳', treatment_method: '益气和营，调和营卫', source: '金匮要略', chapter: '水气病脉证并治' },

    // 风湿免疫与退行性疾病
    { formula_name: '桂枝芍药知母汤', meridian_category: '太阳', treatment_method: '温清并用', source: '金匮要略', chapter: '中风历节病脉证并治' },
    { formula_name: '乌头汤', meridian_category: '太阳', treatment_method: '温经散寒止痛', source: '金匮要略', chapter: '中风历节病脉证并治' },
    { formula_name: '防己黄芪汤', meridian_category: '太阳', treatment_method: '益气祛湿', source: '金匮要略', chapter: '水气病脉证并治' },
    { formula_name: '桂枝附子汤', meridian_category: '太阳', treatment_method: '温经散寒，祛风除湿', source: '伤寒论', chapter: '辨太阳病脉证并治下' },

    // 妇科慢性病
    { formula_name: '温经汤', meridian_category: '厥阴', treatment_method: '温经养血', source: '金匮要略', chapter: '妇人杂病脉证并治' },
    { formula_name: '桂枝茯苓丸', meridian_category: '厥阴', treatment_method: '缓消癥块', source: '金匮要略', chapter: '妇人妊娠病脉证并治' },
    { formula_name: '胶艾汤', meridian_category: '厥阴', treatment_method: '养血止血，调经安胎', source: '金匮要略', chapter: '妇人妊娠病脉证并治' },

    // 更年期综合征
    { formula_name: '二仙汤', meridian_category: '少阴', treatment_method: '温肾阳，补肾精，泻相火，调冲任', source: '中医方剂临床手册', chapter: '第十章' },
    { formula_name: '甘麦大枣汤合酸枣仁汤', meridian_category: '厥阴', treatment_method: '养心安神', source: '中医方剂临床手册', chapter: '第十章' },
    { formula_name: '六味地黄丸', meridian_category: '少阴', treatment_method: '滋阴补肾', source: '小儿药证直诀', chapter: '卷下' },
    { formula_name: '金匮肾气丸', meridian_category: '少阴', treatment_method: '温补肾阳', source: '金匮要略', chapter: '消渴小便不利淋病脉证并治' }
  ]

  let insertedCount = 0
  let skippedCount = 0

  try {
    for (const formula of missingFormulas) {
      // 检查是否已存在
      const { data: existing, error: checkError } = await supabase
        .from('formulas')
        .select('id, formula_name')
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
          original_text: '',  // 暂时空，后续补充
          mechanism: '',      // 暂时空，后续补充
          indications: [],    // 暂时空，后续补充
          contraindications: [],  // 暂时空，后续补充
          dosage: '',         // 暂时空，后续补充
          instructions: '',   // 暂时空，后续补充
          version: 1,
          is_active: true,
          comment: `慢性病方证数据，来源：${formula.source}`
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
