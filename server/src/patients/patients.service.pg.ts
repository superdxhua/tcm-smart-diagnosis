import { Injectable } from '@nestjs/common'
import { Pool } from 'pg'

// 构建连接字符串，禁用 SSL 验证
const baseConnectionString = process.env.DATABASE_URL || process.env.COZE_SUPABASE_URL || ''
const connectionString = baseConnectionString.includes('?')
  ? `${baseConnectionString}&ssl=no-verify`
  : `${baseConnectionString}?ssl=no-verify`

console.log('[PatientsServicePg] Connection string (masked):', connectionString.replace(/:[^:]*@/, ':****@'))

// PostgreSQL 连接池
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
})

pool.on('error', (err) => {
  console.error('[PatientsServicePg] Unexpected error on idle client', err)
})

@Injectable()
export class PatientsServicePg {
  async findAll() {
    try {
      console.log('[PatientsServicePg] Executing query: SELECT * FROM members ORDER BY created_at DESC LIMIT 100')
      const result = await pool.query(
        'SELECT * FROM members ORDER BY created_at DESC LIMIT 100'
      )
      console.log('[PatientsServicePg] Query result count:', result.rows.length)
      return result.rows
    } catch (error) {
      console.error('[PatientsServicePg] Query error:', error.message)
      throw error
    }
  }

  async findOne(id: string) {
    try {
      console.log(`[PatientsServicePg] Executing query: SELECT * FROM members WHERE id = $1`, [id])
      const result = await pool.query(
        'SELECT * FROM members WHERE id = $1',
        [id]
      )
      console.log('[PatientsServicePg] Query result count:', result.rows.length)
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('[PatientsServicePg] Query error:', error.message)
      throw error
    }
  }

  async countByUser() {
    try {
      console.log('[PatientsServicePg] Executing query: SELECT COUNT(*) FROM members')
      const result = await pool.query('SELECT COUNT(*) as count FROM members')
      return parseInt(result.rows[0].count)
    } catch (error) {
      console.error('[PatientsServicePg] Count error:', error.message)
      throw error
    }
  }

  async create(data: any) {
    try {
      console.log('[PatientsServicePg] Creating member:', JSON.stringify(data))
      const result = await pool.query(
        `INSERT INTO members (name, gender, age, contact, phone, email, address, allergies, chronic_diseases, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING *`,
        [
          data.name,
          data.gender || null,
          data.age || null,
          data.contact || null,
          data.phone || null,
          data.email || null,
          data.address || null,
          data.allergies || null,
          data.chronic_diseases || null,
          data.notes || null
        ]
      )
      console.log('[PatientsServicePg] Created member:', result.rows[0].id)
      return result.rows[0]
    } catch (error) {
      console.error('[PatientsServicePg] Create error:', error.message)
      throw error
    }
  }

  async update(id: string, data: any) {
    try {
      console.log('[PatientsServicePg] Updating member:', id, JSON.stringify(data))
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      const fields = ['name', 'gender', 'age', 'contact', 'phone', 'email', 'address', 'allergies', 'chronic_diseases', 'notes']
      for (const field of fields) {
        if (data[field] !== undefined) {
          updates.push(`${field} = $${paramIndex}`)
          values.push(data[field])
          paramIndex++
        }
      }

      updates.push(`updated_at = NOW()`)
      values.push(id)

      const query = `UPDATE members SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`
      const result = await pool.query(query, values)

      if (result.rows.length === 0) {
        return null
      }
      return result.rows[0]
    } catch (error) {
      console.error('[PatientsServicePg] Update error:', error.message)
      throw error
    }
  }

  async remove(id: string) {
    try {
      console.log('[PatientsServicePg] Deleting member:', id)
      const result = await pool.query(
        'DELETE FROM members WHERE id = $1 RETURNING *',
        [id]
      )
      if (result.rows.length === 0) {
        return null
      }
      return result.rows[0]
    } catch (error) {
      console.error('[PatientsServicePg] Delete error:', error.message)
      throw error
    }
  }
}
