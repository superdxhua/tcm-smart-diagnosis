import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

let envLoaded = false;

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function loadEnv(): void {
  if (envLoaded || (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY)) {
    return;
  }

  try {
    try {
      require('dotenv').config();
      if (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY) {
        envLoaded = true;
        return;
      }
    } catch {
      // dotenv not available
    }

    // 在 Vercel 环境中，跳过 Python 脚本加载
    if (process.env.VERCEL) {
      console.log('[SupabaseClient] Vercel 环境，跳过 Python 脚本加载');
      return;
    }

    // 本地环境使用 Python 脚本加载
    const pythonCode = `
import os
import sys
try:
    from coze_workload_identity import Client
    client = Client()
    env_vars = client.get_project_env_vars()
    client.close()
    for env_var in env_vars:
        print(f"{env_var.key}={env_var.value}")
except Exception as e:
    print(f"# Error: {e}", file=sys.stderr)
`;

    const output = execSync(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const eqIndex = line.indexOf('=');
      if (eqIndex > 0) {
        const key = line.substring(0, eqIndex);
        let value = line.substring(eqIndex + 1);
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }

    envLoaded = true;
  } catch (error) {
    console.error('[SupabaseClient] 加载环境变量失败:', error.message);
    // 在 Vercel 环境中，环境变量应该从 Dashboard 读取
    if (!process.env.VERCEL) {
      throw error;
    }
  }
}

function getSupabaseCredentials(): SupabaseCredentials {
  loadEnv();

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  console.log('[SupabaseClient] URL:', url);
  console.log('[SupabaseClient] ANON_KEY:', anonKey ? anonKey.substring(0, 20) + '...' : '未设置');
  console.log('[SupabaseClient] ANON_KEY length:', anonKey?.length || 0);

  if (!url) {
    throw new Error('COZE_SUPABASE_URL is not set');
  }
  if (!anonKey) {
    throw new Error('COZE_SUPABASE_ANON_KEY is not set');
  }

  return { url, anonKey };
}

function getSupabaseClient(token?: string): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();

  if (token) {
    return createClient(url, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      db: {
        timeout: 60000,
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return createClient(url, anonKey, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getSupabaseAdminClient(): SupabaseClient {
  const { url } = getSupabaseCredentials();
  const serviceRoleKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

  console.log('[SupabaseClient] SERVICE_ROLE_KEY:', serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : '未设置');

  if (!serviceRoleKey) {
    console.warn('[SupabaseClient] SERVICE_ROLE_KEY not set, falling back to ANON_KEY');
    return getSupabaseClient();
  }

  return createClient(url, serviceRoleKey, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { loadEnv, getSupabaseCredentials, getSupabaseClient, getSupabaseAdminClient };

// 获取 Postgres 数据库 URL
export function getDatabaseUrl(): string {
  loadEnv();

  // 优先使用 DATABASE_URL（包含完整的连接信息）
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // 如果没有 DATABASE_URL，尝试从 Supabase URL 构建
  const url = process.env.COZE_SUPABASE_URL;
  const serviceRoleKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (url && serviceRoleKey) {
    // 从 Supabase URL 中提取 host
    const host = url.replace('https://', '').replace('http://', '');
    // 构建连接字符串
    return `postgres://postgres.${host}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=no-verify`;
  }

  throw new Error('DATABASE_URL or COZE_SUPABASE_SERVICE_ROLE_KEY is required for database connection');
}
