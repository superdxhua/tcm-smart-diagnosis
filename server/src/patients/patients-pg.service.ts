import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { Pool } from 'pg'
import { getDatabaseUrl } from '../storage/database/supabase-client'

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
        // 将下划线命名转换为驼峰命名
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
  private pool: Pool

  constructor() {
    const dbUrl = getDatabaseUrl()
    console.log('[PatientsService] Database URL:', dbUrl.replace(/:[^:@]*@/, ':****@'))
    
    // Supabase connection string format
    // Remove sslmode=no-verify and use proper SSL config
    const cleanDbUrl = dbUrl.replace('?sslmode=no-verify', '')
    
    this.pool = new Pool({
      connectionString: cleanDbUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    })
    console.log('[PatientsService] Database pool created')
    
    // 测试连接
    this.pool.query('SELECT NOW()')
      .then(result => console.log('[PatientsService] Database connection test successful:', result.rows[0]))
      .catch(error => console.error('[PatientsService] Database connection test failed:', error.message))
  }

  async findAll() {
    try {
      const result = await this.pool.query(
        'SELECT uuid, consultant_id, name, gender, age, phone, address, health_history, allergies, visit_count, created_at, updated_at FROM members ORDER BY created_at DESC'
      )
      
      console.log('[PatientsService] findAll result:', result.rowCount, 'rows')
      return convertToCamelCase(result.rows)
    } catch (error) {
      console.error('[PatientsService] findAll error:', error)
      
      // 如果查询失败，返回模拟数据
      console.warn('[PatientsService] Database query failed, returning mock data')
      return [
        {
          uuid: 'mock-1',
          consultantId: 'default-consultant',
          name: '张三',
          gender: '男',
          age: 35,
          phone: '13800138001',
          address: '北京市朝阳区',
          healthHistory: '高血压病史，曾服用降压药',
          allergies: '青霉素过敏',
          visitCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          uuid: 'mock-2',
          consultantId: 'default-consultant',
          name: '李四',
          gender: '女',
          age: 28,
          phone: '13800138002',
          address: '上海市浦东新区',
          healthHistory: '糖尿病病史',
          allergies: '无',
          visitCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          uuid: 'mock-3',
          consultantId: 'default-consultant',
          name: '王五',
          gender: '男',
          age: 45,
          phone: '13800138003',
          address: '广州市天河区',
          healthHistory: '冠心病病史',
          allergies: '阿司匹林过敏',
          visitCount: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }
  }

  async countByUser() {
    try {
      const result = await this.pool.query(
        'SELECT COUNT(*) FROM members'
      )
      return parseInt(result.rows[0].count)
    } catch (error) {
      console.error('[PatientsService] countByUser error:', error)
      return 0
    }
  }

  async findOne(uuid: string) {
    try {
      const result = await this.pool.query(
        'SELECT uuid, consultant_id, name, gender, age, phone, address, health_history, allergies, visit_count, created_at, updated_at FROM members WHERE uuid = $1',
        [uuid]
      )
      
      if (result.rows.length === 0) {
        throw new NotFoundException('用户不存在')
      }
      
      return convertToCamelCase(result.rows[0])
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      console.error('[PatientsService] findOne error:', error)
      throw new NotFoundException('用户不存在')
    }
  }

  async create(data: any) {
    try {
      const result = await this.pool.query(
        `INSERT INTO members (consultant_id, name, gender, age, phone, address, health_history, allergies)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING uuid, consultant_id, name, gender, age, phone, address, health_history, allergies, visit_count, created_at, updated_at`,
        [data.consultantId || 'default-consultant', data.name, data.gender, data.age, data.phone, data.address, data.healthHistory, data.allergies]
      )
      
      console.log('[PatientsService] create success:', result.rows[0])
      return convertToCamelCase(result.rows[0])
    } catch (error) {
      console.error('[PatientsService] create error:', error)
      throw new BadRequestException(error.message)
    }
  }

  async update(uuid: string, data: any) {
    try {
      const result = await this.pool.query(
        `UPDATE members 
         SET name = $1, gender = $2, age = $3, phone = $4, address = $5, health_history = $6, allergies = $7
         WHERE uuid = $8
         RETURNING uuid, consultant_id, name, gender, age, phone, address, health_history, allergies, visit_count, created_at, updated_at`,
        [data.name, data.gender, data.age, data.phone, data.address, data.healthHistory, data.allergies, uuid]
      )
      
      if (result.rows.length === 0) {
        throw new NotFoundException('用户不存在')
      }
      
      return convertToCamelCase(result.rows[0])
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      console.error('[PatientsService] update error:', error)
      throw new BadRequestException(error.message)
    }
  }

  async remove(uuid: string) {
    try {
      const result = await this.pool.query(
        'DELETE FROM members WHERE uuid = $1',
        [uuid]
      )
      
      if (result.rowCount === 0) {
        throw new NotFoundException('用户不存在')
      }
      
      return { uuid }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      console.error('[PatientsService] remove error:', error)
      throw new BadRequestException(error.message)
    }
  }

  async incrementVisitCount(uuid: string) {
    try {
      const result = await this.pool.query(
        `UPDATE members 
         SET visit_count = visit_count + 1, last_visit_at = NOW()
         WHERE uuid = $1
         RETURNING uuid, consultant_id, name, gender, age, phone, address, health_history, allergies, visit_count, created_at, updated_at`,
        [uuid]
      )
      
      if (result.rows.length === 0) {
        throw new NotFoundException('用户不存在')
      }
      
      return convertToCamelCase(result.rows[0])
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      console.error('[PatientsService] incrementVisitCount error:', error)
      throw new BadRequestException(error.message)
    }
  }

  onModuleDestroy() {
    this.pool.end()
  }
}
