require('dotenv').config();
const { execSync } = require('child_process');

// 从 Python 脚本加载环境变量
try {
    const output = execSync(`
        python3 -c "
        try:
            from coze_workload_identity import Client
            client = Client()
            env_vars = client.get_project_env_vars()
            client.close()
            for env_var in env_vars:
                if 'SUPABASE' in env_var.key:
                    print(f'{env_var.key}={env_var.value}')
        except Exception as e:
            print(f'# Error: {e}', file=__import__('sys').stderr)
        "
    `, { encoding: 'utf-8' });
    
    const lines = output.trim().split('\n');
    for (const line of lines) {
        if (line.startsWith('#')) continue;
        const eqIndex = line.indexOf('=');
        if (eqIndex > 0) {
            const key = line.substring(0, eqIndex);
            const value = line.substring(eqIndex + 1);
            process.env[key] = value;
        }
    }
} catch (error) {
    console.error('加载环境变量失败:', error.message);
}

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

console.log('=== 创建 admin 用户 ===');
console.log('数据库:', process.env.COZE_SUPABASE_URL);

const supabase = createClient(
    process.env.COZE_SUPABASE_URL,
    process.env.COZE_SUPABASE_ANON_KEY
);

(async () => {
    try {
        // 检查是否已存在 admin 用户
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('username', 'admin')
            .single();

        if (existingUser) {
            console.log('❌ admin 用户已存在');
            console.log('用户信息:', existingUser);
        } else {
            console.log('✅ admin 用户不存在，开始创建...');
            
            // 生成密码哈希
            const password = '123456';
            const passwordHash = await bcrypt.hash(password, 10);
            
            // 创建 admin 用户
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    username: 'admin',
                    password: passwordHash,
                    role: 'admin',
                    is_active: true
                })
                .select()
                .single();

            if (createError) {
                console.log('❌ 创建失败:', createError.message);
            } else {
                console.log('✅ admin 用户创建成功');
                console.log('用户信息:', newUser);
            }
        }

        console.log('\n用户名: admin');
        console.log('密码: 123456');
    } catch (error) {
        console.error('❌ 操作失败:', error.message);
    }
})();
