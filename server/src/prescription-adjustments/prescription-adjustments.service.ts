import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'

@Injectable()
export class PrescriptionAdjustmentsService {
  async findAll() {
    const supabase = getSupabaseClient()
    const result = await supabase
      .from('prescription_adjustments')
      .select('*')
      .order('adjustment_date', { ascending: false })
    
    return result.data || []
  }

  async findOne(id: string) {
    const supabase = getSupabaseClient()
    const result = await supabase
      .from('prescription_adjustments')
      .select('*')
      .eq('id', id)
      .single()
    
    if (result.error || !result.data) {
      throw new NotFoundException('处方调整记录不存在')
    }
    
    return result.data
  }

  async create(data: any) {
    const supabase = getSupabaseClient()
    const { data: adjustment, error } = await supabase
      .from('prescription_adjustments')
      .insert({
        id: crypto.randomUUID(),
        record_id: data.recordId,
        original_prescription: data.originalPrescription,
        adjusted_prescription: data.adjustedPrescription,
        adjustment_reason: data.adjustmentReason,
        adjustment_date: data.adjustmentDate,
        status: data.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      throw new BadRequestException(error.message)
    }
    
    return adjustment
  }

  async update(id: string, data: any) {
    const supabase = getSupabaseClient()
    const { data: adjustment, error } = await supabase
      .from('prescription_adjustments')
      .update({
        original_prescription: data.originalPrescription,
        adjusted_prescription: data.adjustedPrescription,
        adjustment_reason: data.adjustmentReason,
        status: data.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      throw new BadRequestException(error.message)
    }
    
    return adjustment
  }

  async remove(id: string) {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('prescription_adjustments')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw new BadRequestException(error.message)
    }
    
    return { id }
  }
}
