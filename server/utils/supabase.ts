/**
 * Supabase 连接池工具函数
 *
 * 目的：创建全局单例 Supabase 客户端，避免每个函数调用都创建新连接
 * 优势：
 * 1. 减少数据库连接数（控制在 50 以内，避免 Supabase 免费版超限）
 * 2. 提升性能（复用连接，减少 TLS 握手开销）
 * 3. 降低冷启动时间（避免重复初始化）
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 全局单例连接池
let supabaseClient: SupabaseClient | null = null;

/**
 * 获取 Supabase 客户端实例（单例模式）
 *
 * 使用场景：
 * - 所有 Serverless Functions 调用
 * - 数据库 CRUD 操作
 *
 * 注意事项：
 * - 该函数在所有函数调用中共享同一个连接
 * - 不要在函数内部创建新的 Supabase 实例
 * - 连接会自动保持活跃（Supabase SDK 内部管理）
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    console.log('[Supabase] Creating new client instance...');

    // 环境变量验证
    const supabaseUrl = process.env.SUPABASE_URL || process.env.COZE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    // 创建 Supabase 客户端
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: false, // Serverless 环境不持久化会话
        autoRefreshToken: false, // 不自动刷新 token
        detectSessionInUrl: false, // 不从 URL 检测会话
      },
      global: {
        headers: {
          'Connection': 'keep-alive', // 保持连接活跃
        },
      },
    });

    console.log('[Supabase] Client instance created successfully');
  } else {
    console.log('[Supabase] Reusing existing client instance');
  }

  return supabaseClient;
}

/**
 * 获取 Supabase 管理客户端（使用 service_role key）
 *
 * 警告：该客户端有超级管理员权限，请谨慎使用
 * 仅用于：
 * - 后台管理操作
 * - 绕过行级安全策略（RLS）
 * - 数据维护和修复
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.COZE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role credentials not found in environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * 重置 Supabase 客户端（用于测试或连接恢复）
 *
 * 使用场景：
 * - 连接池污染后需要重置
 * - 测试环境需要重新初始化
 */
export function resetSupabaseClient(): void {
  console.log('[Supabase] Resetting client instance...');
  supabaseClient = null;
}
