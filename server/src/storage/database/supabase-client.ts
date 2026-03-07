/**
 * Supabase 客户端 - 提供数据库连接
 */
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 环境变量未配置:');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? '***已设置***' : '未设置');
}

// 创建 Supabase 客户端（确保传入有效的 URL 和 Key）
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export function getSupabaseClient() {
  return supabase;
}

// 导出数据库URL（用于某些旧代码兼容）
export function getDatabaseUrl(): string {
  return supabaseUrl || '';
}

export default supabase;
