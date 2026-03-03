import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'

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
export class PatientsService implements OnModuleInit {
  async onModuleInit() {
    console.log('[PatientsService] Initialized')
  }

  async findAll() {
    try {
      // 使用 users 表（在 schema cache 中）
      const { data, error } = await getSupabaseClient()
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('[PatientsService] findAll error:', error.message)
        return []
      }
      
      console.log('[PatientsService] findAll result:', data?.length || 0, 'rows')
      return convertToCamelCase(data || [])
    } catch (error) {
      console.error('[PatientsService] findAll error:', error.message)
      return []
    }
  }

  async countByUser() {
    try {
      const { count } = await getSupabaseClient()
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      return count || 0
    } catch (error) {
      console.error('[PatientsService] countByUser error:', error.message)
      return 0
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await getSupabaseClient()
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error || !data) {
        console.error('[PatientsService] findOne error:', error?.message || 'not found')
        throw new NotFoundException('用户不存在')
      }
      
      return convertToCamelCase(data)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      console.error('[PatientsService] findOne error:', error.message)
      throw new NotFoundException('用户不存在')
    }
  }

  async create(data: any) {
    try {
      console.log('[PatientsService] Creating member with data:', JSON.stringify(data))
      
      const { data: member, error } = await getSupabaseClient()
        .from('users')
        .insert({
          id: data.uuid || data.id,
          username: data.name || data.phone,
          password: data.password || 'default',
          role: data.role || 'member',
          is_active: true
        })
        .select()
        .single()
      
      if (error) {
        console.error('[PatientsService] create error:', error.message)
        throw new BadRequestException(error.message)
      }
      
      console.log('[PatientsService] create success:', member)
      return convertToCamelCase(member)
    } catch (error) {
      console.error('[PatientsService] create error:', error.message)
      throw new BadRequestException(error.message)
    }
  }

  async update(id: string, data: any) {
    try {
      const { data: member, error } = await getSupabaseClient()
        .from('users')
        .update({
          username: data.name || data.username,
          role: data.role
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error || !member) {
        console.error('[PatientsService] update error:', error?.message || 'not found')
        throw new NotFoundException('用户不存在')
      }
      
      return convertToCamelCase(member)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      console.error('[PatientsService] update error:', error.message)
      throw new BadRequestException(error.message)
    }
  }

  async remove(id: string) {
    try {
      const { error } = await getSupabaseClient()
        .from('users')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('[PatientsService] remove error:', error.message)
        throw new BadRequestException(error.message)
      }
      
      return { id }
    } catch (error) {
      console.error('[PatientsService] remove error:', error.message)
      throw new BadRequestException(error.message)
    }
  }

  async incrementVisitCount(id: string) {
    // users 表没有 visit_count 字段，直接返回
    const { data } = await this.findOne(id)
    return data
  }
}
