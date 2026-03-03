const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const anonKey = 'YOUR_SUPABASE_ANON_KEY_HERE'; // 使用 ANON_KEY

const supabase = createClient(supabaseUrl, anonKey);

async function checkTables() {
  console.log('=== 检查 Supabase 数据库表 ===\n');
  console.log('项目 URL:', supabaseUrl);

  // 检查所有已定义的表
  const tables = [
    'users',
    'user_permissions',
    'recharge_orders',
    'register_qrcodes',
    'file_records',
    'user_balance',
    'medication_feedback',
    'patients',
    'patient_records',
    'prescription_adjustments',
    'app_versions',
    'packages',
    'orders',
    'user_feedback',
    'refunds',
    'medical_cases',
    'medical_case_feedback',
    'health_check'
  ];

  console.log('\n检查各表是否存在及其数据量：\n');
  const results = {
    exist: [],
    missing: [],
    errors: []
  };

  for (const tableName of tables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.message.includes('Could not find the table')) {
          results.missing.push(tableName);
          console.log(`❌ ${tableName}: 表不存在`);
        } else {
          results.errors.push({ table: tableName, error: error.message });
          console.log(`⚠️ ${tableName}: ${error.message.substring(0, 80)}...`);
        }
      } else {
        results.exist.push({ table: tableName, count });
        console.log(`✅ ${tableName}: 存在，记录数 ${count || 0}`);
      }
    } catch (e) {
      results.errors.push({ table: tableName, error: e.message });
      console.log(`⚠️ ${tableName}: 访问异常 - ${e.message}`);
    }
  }

  // 总结
  console.log('\n=== 总结 ===');
  console.log(`✅ 已存在的表: ${results.exist.length} 个`);
  console.log(`❌ 缺失的表: ${results.missing.length} 个`);
  console.log(`⚠️  访问异常: ${results.errors.length} 个`);

  if (results.missing.length > 0) {
    console.log('\n缺失的表:');
    results.missing.forEach(table => console.log(`  - ${table}`));
  }

  if (results.errors.length > 0) {
    console.log('\n访问异常:');
    results.errors.forEach(({ table, error }) => {
      console.log(`  - ${table}: ${error.substring(0, 80)}`);
    });
  }

  // 重点检查业务关键表
  console.log('\n=== 关键业务表检查 ===');
  const criticalTables = ['users', 'medical_cases', 'patients', 'patient_records'];
  criticalTables.forEach(table => {
    const found = results.exist.find(t => t.table === table);
    if (found) {
      console.log(`✅ ${table}: ${found.count} 条记录`);
    } else {
      console.log(`❌ ${table}: 不存在`);
    }
  });

  return results;
}

checkTables().then(results => {
  if (results.missing.length > 0) {
    console.log('\n建议：需要创建缺失的表');
  }
  if (results.errors.length > 0) {
    console.log('\n建议：检查 RLS 权限配置');
  }
}).catch(err => {
  console.error('检查失败:', err.message);
  process.exit(1);
});
