import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 肿瘤数据库数据验证脚本
 */
async function validateTumorDatabase() {
  console.log('[Validate] 开始验证肿瘤数据库...')

  const supabase = getSupabaseClient()

  try {
    // 1. 验证体质分类数据
    console.log('\n[Validate] 验证体质分类数据...')
    const { data: constitutions, error: constitutionsError } = await supabase
      .from('tumor_constitutions')
      .select('*')

    if (constitutionsError) {
      console.error('[Validate] 查询体质数据失败:', constitutionsError)
    } else {
      console.log(`[Validate] 体质分类: ${constitutions.length} 条`)
      constitutions.forEach(c => {
        console.log(`  - ${c.name} (${c.meridian_basis})`)
      })
    }

    // 2. 验证病机分类数据
    console.log('\n[Validate] 验证病机分类数据...')
    const { data: pathogenesis, error: pathogenesisError } = await supabase
      .from('tumor_pathogenesis')
      .select('*')

    if (pathogenesisError) {
      console.error('[Validate] 查询病机数据失败:', pathogenesisError)
    } else {
      console.log(`[Validate] 病机分类: ${pathogenesis.length} 条`)
      pathogenesis.forEach(p => {
        console.log(`  - ${p.category} (${p.meridian_type})`)
      })
    }

    // 3. 验证治疗变证数据
    console.log('\n[Validate] 验证治疗变证数据...')
    const { data: complications, error: complicationsError } = await supabase
      .from('treatment_complications')
      .select('*')
      .order('treatment_type')

    if (complicationsError) {
      console.error('[Validate] 查询变证数据失败:', complicationsError)
    } else {
      console.log(`[Validate] 治疗变证: ${complications.length} 条`)
      const groupedByType = complications.reduce((acc, curr) => {
        acc[curr.treatment_type] = (acc[curr.treatment_type] || 0) + 1
        return acc
      }, {})
      Object.entries(groupedByType).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} 条`)
      })
    }

    // 4. 验证症状支持数据
    console.log('\n[Validate] 验证症状支持数据...')
    const { data: symptoms, error: symptomsError } = await supabase
      .from('symptom_support_formulas')
      .select('*')

    if (symptomsError) {
      console.error('[Validate] 查询症状数据失败:', symptomsError)
    } else {
      console.log(`[Validate] 症状支持: ${symptoms.length} 条`)
      symptoms.forEach(s => {
        console.log(`  - ${s.symptom_name} (推荐: ${s.recommended_formula}, 安全等级: ${s.safety_level})`)
      })
    }

    // 5. 验证方证关联数据
    console.log('\n[Validate] 验证方证关联数据...')
    const { data: relations, error: relationsError } = await supabase
      .from('tumor_formula_relations')
      .select(`
        *,
        formulas!inner(formula_name)
      `)
      .order('priority', { ascending: false })

    if (relationsError) {
      console.error('[Validate] 查询方证关联失败:', relationsError)
    } else {
      console.log(`[Validate] 方证关联: ${relations.length} 条`)
      relations.slice(0, 10).forEach(r => {
        console.log(`  - ${r.formulas.formula_name} (优先级: ${r.priority})`)
      })
    }

    // 6. 验证药物相互作用数据
    console.log('\n[Validate] 验证药物相互作用数据...')
    const { data: interactions, error: interactionsError } = await supabase
      .from('modern_drug_interactions')
      .select('*')

    if (interactionsError) {
      console.error('[Validate] 查询药物相互作用失败:', interactionsError)
    } else {
      console.log(`[Validate] 药物相互作用: ${interactions.length} 条`)
      interactions.forEach(i => {
        console.log(`  - ${i.herb_name} + ${i.modern_drug} (${i.severity})`)
      })
    }

    // 7. 验证数据完整性
    console.log('\n[Validate] 验证数据完整性...')

    // 检查是否有孤立的关联记录
    const { count: orphanRelations } = await supabase
      .from('tumor_formula_relations')
      .select('*', { count: 'exact', head: true })

    if (orphanRelations !== null && orphanRelations > 0) {
      console.log(`[Validate] ⚠️  发现 ${orphanRelations} 条关联记录`)
    }

    // 检查方证关联的完整性
    const { data: relationsWithDetails } = await supabase
      .from('tumor_formula_relations')
      .select(`
        formula_id,
        constitution_id,
        pathogenesis_id,
        complication_id,
        symptom_id
      `)

    let missingReferences = 0
    for (const relation of relationsWithDetails || []) {
      if (!relation.formula_id) missingReferences++
    }

    if (missingReferences > 0) {
      console.log(`[Validate] ⚠️  发现 ${missingReferences} 条缺少方证ID的关联记录`)
    }

    console.log('\n[Validate] 验证完成！')
    console.log(`[Validate] 体质分类: ${constitutions.length} 条`)
    console.log(`[Validate] 病机分类: ${pathogenesis.length} 条`)
    console.log(`[Validate] 治疗变证: ${complications.length} 条`)
    console.log(`[Validate] 症状支持: ${symptoms.length} 条`)
    console.log(`[Validate] 方证关联: ${relations.length} 条`)
    console.log(`[Validate] 药物相互作用: ${interactions.length} 条`)
    console.log(`[Validate] 总计: ${constitutions.length + pathogenesis.length + complications.length + symptoms.length + relations.length + interactions.length} 条`)

  } catch (error) {
    console.error('[Validate] 验证失败:', error)
    process.exit(1)
  }
}

// 执行验证
validateTumorDatabase()
  .then(() => {
    console.log('[Validate] 验证脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Validate] 验证脚本执行失败:', error)
    process.exit(1)
  })
