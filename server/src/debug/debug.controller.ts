import { Controller, Get } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Controller('debug')
export class DebugController {
  @Get('config')
  async getDatabaseConfig() {
    const supabase = getSupabaseClient();

    return {
      code: 200,
      msg: 'success',
      data: {
        databaseUrl: process.env.COZE_SUPABASE_URL || '未设置',
        databaseUrlLength: (process.env.COZE_SUPABASE_URL || '').length,
        environment: process.env.NODE_ENV || '未设置',
        hasSupabaseClient: !!supabase,
      },
    };
  }

  @Get('admin-user')
  async getAdminUser() {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, is_active, created_at')
      .eq('username', 'admin')
      .single();

    return {
      code: 200,
      msg: 'success',
      data: {
        user: data,
        error: error ? error.message : null,
      },
    };
  }
}
