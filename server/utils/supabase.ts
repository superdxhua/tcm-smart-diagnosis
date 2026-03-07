/**
 * Supabase 客户端 - 提供数据库连接
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 环境变量未配置:');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? '***已设置***' : '未设置');
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export function getSupabaseClient() {
  return supabase;
}

export default supabase;
