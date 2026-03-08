/**
 * Supabase 客户端 - 提供数据库连接
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

// 从环境变量获取 Supabase 配置（支持多种变量命名方式）
const supabaseUrl = process.env.SUPABASE_URL || process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('==========================================');
  console.error('[Supabase] 环境变量未正确配置:');
  console.error('  SUPABASE_URL:', supabaseUrl || '未设置');
  console.error('  COZE_SUPABASE_URL:', process.env.COZE_SUPABASE_URL ? '***已设置***' : '未设置');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '***已设置***' : '未设置');
  console.error('  SUPABASE_ANON_KEY:', supabaseAnonKey ? '***已设置***' : '未设置');
  console.error('  COZE_SUPABASE_ANON_KEY:', process.env.COZE_SUPABASE_ANON_KEY ? '***已设置***' : '未设置');
  console.error('==========================================');
} else {
  console.log('[Supabase] 客户端初始化成功');
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export function getSupabaseClient() {
  return supabase;
}

export default supabase;
