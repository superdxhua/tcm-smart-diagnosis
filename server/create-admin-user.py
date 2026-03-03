import os
import sys
try:
    from coze_workload_identity import Client
    client = Client()
    env_vars = client.get_project_env_vars()
    client.close()
    for env_var in env_vars:
        os.environ[env_var.key] = env_var.value
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)

import bcrypt
from supabase import create_client

supabase_url = os.environ['COZE_SUPABASE_URL']
supabase_key = os.environ['COZE_SUPABASE_ANON_KEY']

print('=== 创建 admin 用户 ===')
print('数据库:', supabase_url)

supabase = create_client(supabase_url, supabase_key)

# 检查是否已存在 admin 用户
result = supabase.table('users').select('*').eq('username', 'admin').execute()
existing_user = result.data
find_error = result.error

if existing_user and len(existing_user) > 0:
    print('❌ admin 用户已存在')
    print('用户信息:', existing_user[0])
else:
    print('✅ admin 用户不存在，开始创建...')
    
    # 生成密码哈希
    password = '123456'
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # 创建 admin 用户
    create_result = supabase.table('users').insert({
        'username': 'admin',
        'password': password_hash,
        'role': 'admin',
        'is_active': True
    }).execute()
    new_user = create_result.data
    create_error = create_result.error
    
    if create_error:
        print('❌ 创建失败:', create_error)
    else:
        print('✅ admin 用户创建成功')
        print('用户信息:', new_user[0])

print('\n用户名: admin')
print('密码: 123456')
