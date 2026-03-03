import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class FeedbackService {
  // 创建反馈
  async createFeedback(feedbackData: any) {
    const supabase = getSupabaseClient();

    const newFeedback = {
      ...feedbackData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_feedback')
      .insert(newFeedback)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  // 获取反馈详情
  async getFeedbackById(feedbackId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (error || !data) {
      throw new NotFoundException('反馈不存在');
    }

    return data;
  }

  // 获取用户的反馈列表
  async getUserFeedbacks(userId: string, page: number = 1, pageSize: number = 10) {
    const supabase = getSupabaseClient();
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await supabase
      .from('user_feedback')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new BadRequestException(error.message);
    }

    const total = count || 0;

    return {
      list: data || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // 获取所有反馈（管理员）
  async getAllFeedbacks(page: number = 1, pageSize: number = 10, status?: string, type?: string) {
    const supabase = getSupabaseClient();
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('user_feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('feedback_type', type);
    }

    const { data, error, count } = await query.range(offset, offset + pageSize - 1);

    if (error) {
      throw new BadRequestException(error.message);
    }

    const total = count || 0;

    return {
      list: data || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // 更新反馈状态（管理员）
  async updateFeedbackStatus(feedbackId: string, updates: any) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_feedback')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  // 回复反馈（管理员）
  async replyFeedback(feedbackId: string, adminReply: string, adminId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_feedback')
      .update({
        admin_reply: adminReply,
        reply_at: new Date().toISOString(),
        processed_by: adminId,
        status: 'resolved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  // 删除反馈
  async deleteFeedback(feedbackId: string) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('user_feedback')
      .delete()
      .eq('id', feedbackId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: '反馈删除成功' };
  }
}
