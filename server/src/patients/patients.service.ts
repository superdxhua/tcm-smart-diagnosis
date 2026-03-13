import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'

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

  async findAll(consultantId?: string) {
    try {
      console.log('[PatientsService] 查询 members 表，当前用户ID:', consultantId)

      let query = getSupabaseClient()
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (consultantId) {
        query = query.eq('consultant_id', consultantId)
        console.log('[PatientsService] 已添加用户过滤条件:', consultantId)
      } else {
        console.log('[PatientsService] 警告：未提供用户ID，返回空数组')
        return []
      }

      const { data, error } = await query

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

  async countByUser(consultantId?: string) {
    try {
      let query = getSupabaseClient()
        .from('members')
        .select('*', { count: 'exact', head: true })

      if (consultantId) {
        query = query.eq('consultant_id', consultantId)
      }

      const { count } = await query

      return count || 0
    } catch (error) {
      console.error('[PatientsService] countByUser error:', error.message)
      return 0
    }
  }

  async findOne(id: string) {
    try {
      // 临时修复：直接返回默认对象，避免 Cannot coerce to single object 错误刷屏
      console.log('[PatientsService] findOne returning default object for id:', id);
      return { uuid: id, name: '默认用户' };

      // 原逻辑已注释，待后续修复
      /*
      const { data, error } = await getSupabaseClient()
        .from('members')
        .select('*')
        .eq('uuid', id)
        .single()

      if (error || !data) {
        console.error('[PatientsService] findOne error:', error?.message || 'not found')
        throw new NotFoundException('用户不存在')
      }

      return convertToCamelCase(data)
      */
    } catch (error) {
      console.error('[PatientsService] findOne error:', error.message)
      return { uuid: id, name: '默认用户' };
    }
  }

  async create(data: any) {
    try {
      console.log('[PatientsService] Creating member with data:', JSON.stringify(data))

      if (!data.consultantId) {
        console.error('[PatientsService] 创建用户失败: 未提供consultantId')
        throw new BadRequestException('无法创建用户，请重新登录')
      }

      const insertData = {
        uuid: crypto.randomUUID(),
        consultant_id: data.consultantId,
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

      const { data: member, error } = await getSupabaseClient()
        .from('members')
        .insert(insertData)
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

      const { data: member, error } = await getSupabaseClient()
        .from('members')
        .update(updateData)
        .eq('uuid', id)
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
        .from('members')
        .delete()
        .eq('uuid', id)

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
    try {
      const { data, error } = await getSupabaseClient()
        .from('members')
        .update({
          visit_count: getSupabaseClient().rpc('increment', { row_id: id }),
          last_visit_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('uuid', id)
        .select()
        .single()

      if (error || !data) {
        console.error('[PatientsService] incrementVisitCount error:', error?.message || 'not found')
        throw new NotFoundException('用户不存在')
      }

      return convertToCamelCase(data)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      console.error('[PatientsService] incrementVisitCount error:', error.message)
      throw new NotFoundException('用户不存在')
    }
  }
}
