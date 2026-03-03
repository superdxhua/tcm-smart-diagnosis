const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const serviceRoleKey = 'sbp_6d0d1e2895b79ebebc25f2ff0e833acd7546c372';

// 使用 service role key 创建客户端（有完全权限）
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDatabaseStructure() {
  try {
    console.log('=== 检查 Supabase 数据库结构 ===\n');
    console.log('项目 URL:', supabaseUrl);
    console.log('使用权限: Service Role (完全权限)\n');

    // 1. 查询所有表
    console.log('1. 查询所有表...');
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_schema', 'public')
        .neq('table_name', '_prisma_migrations');

      if (tablesError) {
        console.log('❌ 查询表失败:', tablesError.message);
        console.log('尝试使用 PostgreSQL 系统视图...');
      } else {
        console.log('✅ 找到', tables.length, '个表:');
        tables.forEach((table, index) => {
          console.log(`  ${index + 1}. ${table.table_name} (${table.table_schema})`);
        });
      }
    } catch (e) {
      console.log('⚠️ 使用 REST API 无法查询系统表，尝试检查常见表...');
    }

    // 2. 检查常见业务表
    console.log('\n2. 检查业务表是否存在...');
    const commonTables = [
      'users',
      'user_permissions',
      'prescriptions',
      'herbs',
      'prescription_herbs',
      'tcm_records',
      'tcm_symptoms',
      'tcm_diagnoses'
    ];

    for (const tableName of commonTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message.substring(0, 50)}...`);
        } else {
          console.log(`  ✅ ${tableName}: 存在，记录数 ${count}`);
        }
      } catch (e) {
        console.log(`  ❌ ${tableName}: 访问失败`);
      }
    }

    // 3. 检查 users 表结构
    console.log('\n3. 检查 users 表结构...');
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (usersError) {
        console.log('  ❌ users 表不存在或无访问权限:', usersError.message);
      } else {
        console.log('  ✅ users 表存在');
        if (usersData && usersData.length > 0) {
          console.log('  字段:', Object.keys(usersData[0]).join(', '));
        }

        // 查询所有用户
        const { data: allUsers, count } = await supabase
          .from('users')
          .select('*', { count: 'exact' });
        console.log(`  总用户数: ${count}`);
        if (allUsers && allUsers.length > 0) {
          console.log('  用户列表:');
          allUsers.forEach((user, i) => {
            console.log(`    ${i + 1}. ${user.username} (${user.role}) - 激活: ${user.is_active}`);
          });
        }
      }
    } catch (e) {
      console.log('  ❌ 检查失败:', e.message);
    }

    // 4. 检查经方相关表
    console.log('\n4. 检查经方数据库...');
    const prescriptionTables = ['prescriptions', 'herbs', 'prescription_herbs'];

    for (const tableName of prescriptionTables) {
      try {
        const { data, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' });

        if (data) {
          console.log(`  ✅ ${tableName}: ${count} 条记录`);
          if (count > 0 && count < 5) {
            console.log(`    示例数据:`, JSON.stringify(data[0], null, 2).substring(0, 200));
          }
        }
      } catch (e) {
        console.log(`  ❌ ${tableName}: 不存在`);
      }
    }

    console.log('\n=== 检查完成 ===');
    console.log('\n建议操作：');
    console.log('1. 如果 users 表不存在，需要创建');
    console.log('2. 如果经方表已存在，保留现有数据');
    console.log('3. 根据检查结果制定迁移方案');

  } catch (error) {
    console.error('\n❌ 检查失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

checkDatabaseStructure();
