import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase 客户端实例
let supabase: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.COZE_SUPABASE_URL
    const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and ANON_KEY must be defined')
    }

    console.log('[PatientsService] 初始化 Supabase 客户端')
    console.log('[PatientsService] Supabase URL:', supabaseUrl)
    console.log('[PatientsService] Supabase Key 长度:', supabaseKey.length)

    supabase = createClient(supabaseUrl, supabaseKey)
  }

  return supabase
}

/**
 * 将数据库的下划线命名转换为驼峰命名
 */
function convertToCamelCase(data: any): any {
  if (!data) return null

  if (Array.isArray(data)) {
    return data.map(item => convertToCamelCase(item))
  }

  if (typeof data === 'object') {
    const result: any = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        result[camelCaseKey] = convertToCamelCase(data[key])
      }
    }
    return result
  }

  return data
}

@Injectable()
export class PatientsService {
  async findAll() {
    console.log('[PatientsService] 使用 Supabase SDK 查询 members')

    const client = getSupabaseClient()

    // 方法 1：尝试直接查询
    let result, error
    try {
      const response = await client
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      result = response.data
      error = response.error
    } catch (e: any) {
      console.error('[PatientsService] 查询异常:', e.message)
      throw new BadRequestException('查询失败')
    }

    if (error) {
      console.error('[PatientsService] 查询错误:', error)
      // 如果是 PGRST205 错误，返回空数组
      if (error.code === 'PGRST205') {
        console.warn('[PatientsService] PostgREST 无法识别 members 表，返回空数组')
        return []
      }
      throw new BadRequestException(error.message)
    }

    console.log('[PatientsService] 查询成功，结果行数:', result?.length || 0)
    return convertToCamelCase(result || [])
  }

  async countByUser() {
    const client = getSupabaseClient()

    const { count, error } = await client
      .from('members')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('[PatientsService] 计数错误:', error)
      return 0
    }

    return count || 0
  }

  async findOne(id: string) {
    const client = getSupabaseClient()

    const { data, error } = await client
      .from('members')
      .select('*')
      .eq('uuid', id)
      .single()

    if (error) {
      console.error('[PatientsService] 查询单个用户错误:', error)
      throw new NotFoundException('用户不存在')
    }

    return convertToCamelCase(data)
  }

  async create(data: any) {
    const client = getSupabaseClient()

    const insertData = {
      uuid: crypto.randomUUID(),
      consultant_id: data.consultantId || 'default-consultant',
      name: data.name,
      gender: data.gender,
      age: data.age,
      birth_year: data.birthYear,
      height: data.height,
      weight: data.weight,
      phone: data.phone,
      contact_info: data.contactInfo,
      address: data.address,
      health_history: data.healthHistory,
      allergies: data.allergies,
      is_pregnant: data.isPregnant || false,
      is_child: data.isChild || false,
      visit_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: result, error } = await client
      .from('members')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('[PatientsService] 创建用户错误:', error)
      throw new BadRequestException(error.message)
    }

    return convertToCamelCase(result)
  }

  async update(id: string, data: any) {
    const client = getSupabaseClient()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.gender !== undefined) updateData.gender = data.gender
    if (data.age !== undefined) updateData.age = data.age
    if (data.birthYear !== undefined) updateData.birth_year = data.birthYear
    if (data.height !== undefined) updateData.height = data.height
    if (data.weight !== undefined) updateData.weight = data.weight
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.contactInfo !== undefined) updateData.contact_info = data.contactInfo
    if (data.address !== undefined) updateData.address = data.address
    if (data.healthHistory !== undefined) updateData.health_history = data.healthHistory
    if (data.allergies !== undefined) updateData.allergies = data.allergies
    if (data.isPregnant !== undefined) updateData.is_pregnant = data.isPregnant
    if (data.isChild !== undefined) updateData.is_child = data.isChild

    const { data: result, error } = await client
      .from('members')
      .update(updateData)
      .eq('uuid', id)
      .select()
      .single()

    if (error) {
      console.error('[PatientsService] 更新用户错误:', error)
      throw new NotFoundException('用户不存在')
    }

    return convertToCamelCase(result)
  }

  async remove(id: string) {
    const client = getSupabaseClient()

    const { error } = await client
      .from('members')
      .delete()
      .eq('uuid', id)

    if (error) {
      console.error('[PatientsService] 删除用户错误:', error)
      throw new NotFoundException('用户不存在')
    }

    return { id }
  }

  async incrementVisitCount(id: string) {
    const client = getSupabaseClient()

    const { data: result, error } = await client
      .from('members')
      .update({
        visit_count: client.rpc('increment', { row_id: id }),
        last_visit_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('uuid', id)
      .select()
      .single()

    if (error) {
      console.error('[PatientsService] 更新访问次数错误:', error)
      throw new NotFoundException('用户不存在')
    }

    return convertToCamelCase(result)
  }
}
