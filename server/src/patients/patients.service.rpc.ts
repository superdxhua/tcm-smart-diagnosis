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
    console.log('[PatientsService] 使用 Supabase RPC 函数查询 members')

    const client = getSupabaseClient()

    try {
      // 使用 RPC 函数调用
      const { data, error } = await client.rpc('get_all_members')

      if (error) {
        console.error('[PatientsService] RPC 调用错误:', error)
        throw new BadRequestException(error.message)
      }

      console.log('[PatientsService] 查询成功，结果行数:', data?.length || 0)
      return convertToCamelCase(data || [])
    } catch (e: any) {
      console.error('[PatientsService] 查询异常:', e.message)
      throw new BadRequestException('查询失败')
    }
  }

  async countByUser() {
    const client = getSupabaseClient()

    const { data, error } = await client.rpc('get_all_members')

    if (error) {
      console.error('[PatientsService] 计数错误:', error)
      return 0
    }

    return data?.length || 0
  }

  async findOne(id: string) {
    const client = getSupabaseClient()

    const { data, error } = await client.rpc('get_member_by_id', { member_id: id })

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      console.error('[PatientsService] 查询单个用户错误:', error)
      throw new NotFoundException('用户不存在')
    }

    // RPC 返回的可能是一个数组
    const result = Array.isArray(data) ? data[0] : data
    return convertToCamelCase(result)
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

    // 尝试直接插入（可能会失败，因为 PostgREST 无法识别表）
    try {
      const { data: result, error } = await client
        .from('members')
        .insert(insertData)
        .select()
        .single()

      if (!error && result) {
        return convertToCamelCase(result)
      }
    } catch (e) {
      console.error('[PatientsService] 直接插入失败:', e)
    }

    throw new BadRequestException('创建用户失败：PostgREST 无法识别 members 表')
  }

  async update(id: string, data: any) {
    throw new BadRequestException('更新用户失败：PostgREST 无法识别 members 表')
  }

  async remove(id: string) {
    throw new BadRequestException('删除用户失败：PostgREST 无法识别 members 表')
  }

  async incrementVisitCount(id: string) {
    throw new BadRequestException('更新访问次数失败：PostgREST 无法识别 members 表')
  }
}
