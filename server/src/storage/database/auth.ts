/**
 * 数据库认证模块
 */
import { getSupabaseClient } from './supabase-client';

export async function authenticateRequest(token: string): Promise<{
  id: string;
  email: string;
  role?: string;
} | null> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token验证失败:', error);
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: (user as any).role || 'user',
    };
  } catch (error) {
    console.error('认证过程出错:', error);
    return null;
  }
}

export function getDatabaseUrl(): string {
  // 从环境变量获取数据库URL，而不是访问受保护的属性
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}
