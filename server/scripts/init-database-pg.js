const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// 尝试不同的连接配置
const poolConfigs = [
  {
    name: '配置 1: 项目用户',
    config: {
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.dwswtkfbtdohaftnklxx',
      password: 'sbp_6d0d1e2895b79ebebc25f2ff0e833acd7546c372',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: '配置 2: 标准 postgres',
    config: {
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres',
      password: 'sbp_6d0d1e2895b79ebebc25f2ff0e833acd7546c372',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: '配置 3: Direct connection',
    config: {
      host: 'db.dwswtkfbtdohaftnklxx.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'sbp_6d0d1e2895b79ebebc25f2ff0e833acd7546c372',
      ssl: { rejectUnauthorized: false }
    }
  }
];

async function initDatabase() {
  let pool = null;
  let successfulPool = null;

  for (const { name, config } of poolConfigs) {
    try {
      console.log(`尝试 ${name}...`);
      console.log(`  Host: ${config.host}:${config.port}`);
      console.log(`  User: ${config.user}`);

      const testPool = new Pool(config);
      const testClient = await testPool.connect();
      testClient.release();

      console.log(`✅ 连接成功！`);
      pool = testPool;
      successfulPool = name;
      break;
    } catch (error) {
      console.log(`❌ 失败: ${error.message.substring(0, 60)}...`);
    }
  }

  if (!pool) {
    console.log('\n⚠️ 所有连接配置都失败了');
    console.log('\n请从 Supabase Dashboard 获取正确的数据库连接信息：');
    console.log('https://app.supabase.com/project/dwswtkfbtdohaftnklxx/settings/database\n');
    console.log('或者，使用 SQL Editor 手动执行初始化脚本（推荐）：');
    console.log('https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql/new\n');
    console.log('参考 QUICK_START.md 文件中的 SQL 代码\n');
    process.exit(1);
  }

  console.log(`\n使用 ${successfulPool} 继续初始化...\n`);

  let client;
  try {
    console.log('=== 使用 PostgreSQL 连接初始化数据库 ===\n');

    console.log('尝试连接数据库...');
    client = await pool.connect();
    console.log('✅ 数据库连接成功！\n');

    // 步骤 1: 创建 admin 用户
    console.log('步骤 1/3: 创建 admin 用户...');
    const adminPassword = '123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminId = uuidv4();

    // 检查是否存在
    const checkResult = await client.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    let adminUserId;
    if (checkResult.rows.length > 0) {
      adminUserId = checkResult.rows[0].id;
      console.log('  ℹ️  admin 用户已存在，更新密码...');
      await client.query(
        `UPDATE users SET password = $1, role = 'admin', is_active = true, updated_at = NOW() WHERE username = 'admin'`,
        [hashedPassword]
      );
      console.log('  ✅ admin 用户更新成功');
    } else {
      await client.query(
        `INSERT INTO users (id, username, password, role, is_active, created_at, updated_at)
         VALUES ($1, 'admin', $2, 'admin', true, NOW(), NOW())`,
        [adminId, hashedPassword]
      );
      adminUserId = adminId;
      console.log('  ✅ admin 用户创建成功');
    }

    // 步骤 2: 创建权限
    console.log('\n步骤 2/3: 创建 admin 权限...');
    const permCheckResult = await client.query(
      'SELECT id FROM user_permissions WHERE user_id = $1',
      [adminUserId]
    );

    if (permCheckResult.rows.length > 0) {
      await client.query(
        `UPDATE user_permissions SET is_active = true, updated_at = NOW() WHERE user_id = $1`,
        [adminUserId]
      );
      console.log('  ✅ admin 权限更新成功');
    } else {
      await client.query(
        `INSERT INTO user_permissions (id, user_id, is_active, created_at, updated_at)
         VALUES ($1, $2, true, NOW(), NOW())`,
        [uuidv4(), adminUserId]
      );
      console.log('  ✅ admin 权限创建成功');
    }

    // 步骤 3: 导入经方数据
    console.log('\n步骤 3/3: 导入经方数据...');
    const medicalCasesData = require('./medical-cases-data.js');

    const caseCheckResult = await client.query('SELECT COUNT(*) FROM medical_cases');
    const existingCount = parseInt(caseCheckResult.rows[0].count);

    if (existingCount > 0) {
      console.log(`  ℹ️  经方数据已存在，共 ${existingCount} 条，跳过导入`);
    } else {
      console.log(`  准备导入 ${medicalCasesData.length} 条医案...`);

      for (let i = 0; i < medicalCasesData.length; i++) {
        const caseData = medicalCasesData[i];
        const caseId = uuidv4();

        await client.query(
          `INSERT INTO medical_cases (
            id, doctor_name, doctor_era, patient_gender, patient_age,
            main_symptoms, current_illness, tongue, pulse, diagnosis,
            prescription_name, prescription_composition, prescription_dosage,
            prescription_usage, treatment_result, notes, source,
            tags, symptom_keywords, diagnosis_pattern, effectiveness_score,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW())`,
          [
            caseId,
            caseData.doctor_name,
            caseData.doctor_era,
            caseData.patient_gender,
            caseData.patient_age,
            caseData.main_symptoms,
            caseData.current_illness,
            caseData.tongue,
            caseData.pulse,
            caseData.diagnosis,
            caseData.prescription_name,
            caseData.prescription_composition,
            caseData.prescription_dosage,
            caseData.prescription_usage,
            caseData.treatment_result,
            caseData.notes,
            caseData.source,
            JSON.stringify(caseData.tags),
            JSON.stringify(caseData.symptom_keywords),
            caseData.diagnosis_pattern,
            caseData.effectiveness_score
          ]
        );

        console.log(`  ✅ [${i + 1}/${medicalCasesData.length}] ${caseData.prescription_name}`);
      }
    }

    // 验证结果
    console.log('\n=== 验证初始化结果 ===');
    const userResult = await client.query('SELECT COUNT(*) FROM users');
    const caseResult = await client.query('SELECT COUNT(*) FROM medical_cases');

    console.log(`✅ 用户总数: ${userResult.rows[0].count}`);
    console.log(`✅ 医案总数: ${caseResult.rows[0].count}`);

    // 显示医案列表
    const casesResult = await client.query(
      "SELECT prescription_name, doctor_name, diagnosis FROM medical_cases ORDER BY created_at ASC"
    );

    if (casesResult.rows.length > 0) {
      console.log('\n已导入的医案:');
      casesResult.rows.forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.prescription_name} (${row.doctor_name}) - ${row.diagnosis}`);
      });
    }

    console.log('\n========================================');
    console.log('✅ 数据库初始化完成！');
    console.log('========================================');
    console.log('\n登录信息：');
    console.log('  用户名: admin');
    console.log('  密码: 123456');
    console.log('\n========================================\n');

  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

initDatabase();
