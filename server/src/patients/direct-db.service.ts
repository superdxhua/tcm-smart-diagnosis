import { Injectable } from '@nestjs/common'
import { Pool } from 'pg'

@Injectable()
export class DirectDbService {
  private pool: Pool

  constructor() {
    const connectionString = process.env.COZE_SUPABASE_URL + '?apikey=' + process.env.COZE_SUPABASE_ANON_KEY
    
    // Supabase connection URL format: postgresql://postgres:[password]@[host]:[port]/postgres
    // 但我们需要从 COZE_SUPABASE_URL 中提取连接信息
    // 格式通常是: https://dwswtkfbtdohaftnklxx.supabase.co
    // 实际连接字符串应该是: postgresql://postgres:[password]@db.dwswtkfbtdohaftnklxx.supabase.co:5432/postgres
    
    // 由于我们没有数据库密码，我们需要使用不同的方式
    // 使用 Supabase 的连接池
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.COZE_SUPABASE_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  }

  async testConnection() {
    try {
      const result = await this.pool.query('SELECT NOW()')
      return { success: true, data: result.rows[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getAllMembers() {
    try {
      const result = await this.pool.query(
        'SELECT uuid, consultant_id, name, gender, age, phone, address, health_history, allergies, visit_count, created_at, updated_at FROM members ORDER BY created_at DESC'
      )
      
      // 将下划线命名转换为驼峰命名
      return result.rows.map(row => ({
        uuid: row.uuid,
        consultantId: row.consultant_id,
        name: row.name,
        gender: row.gender,
        age: row.age,
        phone: row.phone,
        address: row.address,
        healthHistory: row.health_history,
        allergies: row.allergies,
        visitCount: row.visit_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    } catch (error) {
      console.error('[DirectDbService] getAllMembers error:', error)
      throw error
    }
  }

  async createMember(data: any) {
    try {
      const result = await this.pool.query(
        `INSERT INTO members (consultant_id, name, gender, age, phone, address, health_history, allergies)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING uuid, consultant_id, name, gender, age, phone, address, health_history, allergies, visit_count, created_at, updated_at`,
        [data.consultantId || 'default-consultant', data.name, data.gender, data.age, data.phone, data.address, data.healthHistory, data.allergies]
      )
      
      const row = result.rows[0]
      return {
        uuid: row.uuid,
        consultantId: row.consultant_id,
        name: row.name,
        gender: row.gender,
        age: row.age,
        phone: row.phone,
        address: row.address,
        healthHistory: row.health_history,
        allergies: row.allergies,
        visitCount: row.visit_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    } catch (error) {
      console.error('[DirectDbService] createMember error:', error)
      throw error
    }
  }

  onModuleDestroy() {
    this.pool.end()
  }
}
