import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 查看数据库表结构
 */
async function inspectDatabaseStructure() {
  console.log('[Inspect] 开始查看数据库表结构...')

  const supabase = getSupabaseClient()

  try {
    // 查看 formulas 表结构
    console.log('\n[Inspect] 查看 formulas 表结构...')
    const { data: formulasColumns, error: formulasError } = await supabase
      .rpc('get_table_columns', { table_name: 'formulas' })

    if (formulasError) {
      console.error('[Inspect] 获取 formulas 表结构失败:', formulasError)
    } else {
      console.log('[Inspect] formulas 表字段:')
      console.log(JSON.stringify(formulasColumns, null, 2))
    }

    // 查看 chronic_diseases 表结构
    console.log('\n[Inspect] 查看 chronic_diseases 表结构...')
    const { data: chronicDiseasesColumns, error: chronicDiseasesError } = await supabase
      .rpc('get_table_columns', { table_name: 'chronic_diseases' })

    if (chronicDiseasesError) {
      console.error('[Inspect] 获取 chronic_diseases 表结构失败:', chronicDiseasesError)
    } else {
      console.log('[Inspect] chronic_diseases 表字段:')
      console.log(JSON.stringify(chronicDiseasesColumns, null, 2))
    }

    // 查看 formula_chronic_relations 表结构
    console.log('\n[Inspect] 查看 formula_chronic_relations 表结构...')
    const { data: relationsColumns, error: relationsError } = await supabase
      .rpc('get_table_columns', { table_name: 'formula_chronic_relations' })

    if (relationsError) {
      console.error('[Inspect] 获取 formula_chronic_relations 表结构失败:', relationsError)
    } else {
      console.log('[Inspect] formula_chronic_relations 表字段:')
      console.log(JSON.stringify(relationsColumns, null, 2))
    }

    // 查看现有数据
    console.log('\n[Inspect] 查看现有方证数据（前5条）...')
    const { data: existingFormulas, error: existingError } = await supabase
      .from('formulas')
      .select('*')
      .limit(5)

    if (existingError) {
      console.error('[Inspect] 获取现有数据失败:', existingError)
    } else {
      console.log('[Inspect] 现有方证数据:')
      console.log(JSON.stringify(existingFormulas, null, 2))
    }

    console.log('\n[Inspect] 查看现有慢性病数据（前3条）...')
    const { data: existingDiseases, error: diseasesError } = await supabase
      .from('chronic_diseases')
      .select('*')
      .limit(3)

    if (diseasesError) {
      console.error('[Inspect] 获取慢性病数据失败:', diseasesError)
    } else {
      console.log('[Inspect] 现有慢性病数据:')
      console.log(JSON.stringify(existingDiseases, null, 2))
    }

    // 查看现有治法数据（前5条）
    console.log('\n[Inspect] 查看现有治法数据（前5条）...')
    const { data: existingTreatmentMethods, error: treatmentMethodsError } = await supabase
      .from('treatment_methods')
      .select('*')
      .limit(5)

    if (treatmentMethodsError) {
      console.error('[Inspect] 获取治法数据失败:', treatmentMethodsError)
    } else {
      console.log('[Inspect] 现有治法数据:')
      console.log(JSON.stringify(existingTreatmentMethods, null, 2))
    }

  } catch (error) {
    console.error('[Inspect] 查看失败:', error)
  }
}

inspectDatabaseStructure()
  .then(() => {
    console.log('[Inspect] 查看完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Inspect] 查看失败:', error)
    process.exit(1)
  })
