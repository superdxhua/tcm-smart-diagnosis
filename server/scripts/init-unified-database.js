const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Supabase 配置
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const anonKey = 'YOUR_SUPABASE_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, anonKey);

// 经方数据（来自 init_medical_cases.sql）
const medicalCasesData = [
  {
    doctor_name: '张仲景',
    doctor_era: '汉代',
    patient_gender: '男',
    patient_age: 35,
    main_symptoms: '发热、头痛、汗出、恶风',
    current_illness: '患者因外感风寒，出现发热头痛，伴有汗出恶风，脉浮缓。',
    tongue: '舌淡苔薄白',
    pulse: '浮缓',
    diagnosis: '太阳中风证',
    prescription_name: '桂枝汤',
    prescription_composition: '桂枝9g，芍药9g，甘草6g，生姜9g，大枣4枚',
    prescription_dosage: '水煎服，每日一剂，分三次服',
    prescription_usage: '服药后喝热粥，微汗出而愈',
    treatment_result: '服药后喝热粥，微汗出而愈',
    notes: '此为太阳中风证之经典方，解肌发表，调和营卫',
    source: '《伤寒论》',
    tags: ['太阳病', '发热', '头痛', '汗出', '恶风'],
    symptom_keywords: ['发热', '头痛', '汗出', '恶风', '太阳中风'],
    diagnosis_pattern: '太阳病-桂枝汤证',
    effectiveness_score: 0.95
  },
  {
    doctor_name: '张仲景',
    doctor_era: '汉代',
    patient_gender: '男',
    patient_age: 28,
    main_symptoms: '发热、恶寒、无汗、头痛、身痛',
    current_illness: '患者因外感风寒，发热恶寒，无汗，全身酸痛，脉浮紧。',
    tongue: '舌淡苔薄白',
    pulse: '浮紧',
    diagnosis: '太阳伤寒证',
    prescription_name: '麻黄汤',
    prescription_composition: '麻黄9g，桂枝6g，甘草3g，杏仁12g',
    prescription_dosage: '水煎服，每日一剂，分三次服',
    prescription_usage: '服药后汗出而愈',
    treatment_result: '服药后汗出而愈',
    notes: '此为太阳伤寒证，发汗解表',
    source: '《伤寒论》',
    tags: ['太阳病', '发热', '恶寒', '无汗', '头痛', '身痛'],
    symptom_keywords: ['发热', '恶寒', '无汗', '头痛', '身痛', '太阳伤寒'],
    diagnosis_pattern: '太阳病-麻黄汤证',
    effectiveness_score: 0.94
  },
  {
    doctor_name: '张仲景',
    doctor_era: '汉代',
    patient_gender: '女',
    patient_age: 42,
    main_symptoms: '往来寒热、胸胁苦满、口苦、咽干、目眩',
    current_illness: '患者因少阳经气不利，出现往来寒热，胸胁苦满，口苦咽干目眩。',
    tongue: '舌边红苔薄黄',
    pulse: '弦',
    diagnosis: '少阳病',
    prescription_name: '小柴胡汤',
    prescription_composition: '柴胡12g，黄芩9g，人参6g，甘草6g，半夏9g，生姜9g，大枣4枚',
    prescription_dosage: '水煎服，每日一剂，分三次服',
    prescription_usage: '服药三剂后症状明显缓解',
    treatment_result: '服药三剂后症状明显缓解',
    notes: '此为少阳病，和解少阳',
    source: '《伤寒论》',
    tags: ['少阳病', '往来寒热', '胸胁苦满', '口苦', '咽干', '目眩'],
    symptom_keywords: ['往来寒热', '胸胁苦满', '口苦', '咽干', '目眩', '少阳病'],
    diagnosis_pattern: '少阳病-小柴胡汤证',
    effectiveness_score: 0.93
  },
  {
    doctor_name: '李可',
    doctor_era: '现代',
    patient_gender: '男',
    patient_age: 65,
    main_symptoms: '心悸、气短、畏寒肢冷、面色苍白',
    current_illness: '患者因心肾阳衰，出现心悸气短，畏寒肢冷，面色苍白，脉微欲绝。',
    tongue: '舌淡苔白滑',
    pulse: '微弱',
    diagnosis: '心肾阳衰',
    prescription_name: '破格救心汤',
    prescription_composition: '附子100g（先煎2小时），干姜30g，炙甘草30g，人参15g，山萸肉30g，生龙骨30g，生牡蛎30g',
    prescription_dosage: '附子先煎2小时，其余后下，水煎服，每日一剂',
    prescription_usage: '服药五剂后心悸气短明显改善，四肢转温',
    treatment_result: '服药五剂后心悸气短明显改善，四肢转温',
    notes: '此为心肾阳衰之危重证，温阳救逆',
    source: '《李可老中医急危重症疑难病经验专辑》',
    tags: ['心肾阳衰', '心悸', '气短', '畏寒', '肢冷'],
    symptom_keywords: ['心悸', '气短', '畏寒', '肢冷', '阳衰'],
    diagnosis_pattern: '心肾阳衰',
    effectiveness_score: 0.92
  }
];

async function initializeDatabase() {
  console.log('=== 初始化数据库 ===\n');
  console.log('数据库 URL:', supabaseUrl);

  try {
    // 1. 创建 admin 用户
    console.log('\n1. 创建 admin 用户...');
    const adminPassword = '123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminId = uuidv4();

    // 先检查是否已存在 admin 用户
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (existingAdmin) {
      console.log('  ℹ️  admin 用户已存在，跳过创建');
    } else {
      const { error: insertError } = await supabase.from('users').insert({
        id: adminId,
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        console.log('  ❌ 创建 admin 用户失败:', insertError.message);
        throw insertError;
      }
      console.log('  ✅ admin 用户创建成功');
      console.log('     用户名: admin');
      console.log('     密码: 123456');
    }

    // 2. 创建 admin 用户权限
    console.log('\n2. 创建 admin 用户权限...');
    const adminUserId = existingAdmin ? existingAdmin.id : adminId;

    const { data: existingPermission } = await supabase
      .from('user_permissions')
      .select('id')
      .eq('user_id', adminUserId)
      .single();

    if (existingPermission) {
      console.log('  ℹ️  admin 用户权限已存在，跳过创建');
    } else {
      const { error: permError } = await supabase.from('user_permissions').insert({
        id: uuidv4(),
        user_id: adminUserId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (permError) {
        console.log('  ❌ 创建 admin 权限失败:', permError.message);
        throw permError;
      }
      console.log('  ✅ admin 用户权限创建成功');
    }

    // 3. 检查并导入经方数据
    console.log('\n3. 导入经方数据...');
    const { data: existingCases, error: checkError } = await supabase
      .from('medical_cases')
      .select('id')
      .limit(1);

    if (checkError) {
      console.log('  ❌ 检查经方数据失败:', checkError.message);
      throw checkError;
    }

    if (existingCases && existingCases.length > 0) {
      console.log('  ℹ️  经方数据已存在，跳过导入');
    } else {
      console.log(`  准备导入 ${medicalCasesData.length} 条医案...`);

      for (let i = 0; i < medicalCasesData.length; i++) {
        const caseData = {
          ...medicalCasesData[i],
          id: uuidv4(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('medical_cases')
          .insert(caseData);

        if (insertError) {
          console.log(`  ❌ 导入第 ${i + 1} 条医案失败:`, insertError.message);
          throw insertError;
        }

        console.log(`  ✅ 导入第 ${i + 1}/${medicalCasesData.length} 条: ${caseData.prescription_name}`);
      }
    }

    // 4. 验证数据
    console.log('\n4. 验证数据...');
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact' });
    const { count: caseCount } = await supabase.from('medical_cases').select('*', { count: 'exact' });

    console.log(`  ✅ 用户总数: ${userCount}`);
    console.log(`  ✅ 医案总数: ${caseCount}`);

    console.log('\n=== 初始化完成 ===');
    console.log('\n登录信息：');
    console.log('  URL: https://dwswtkfbtdohaftnklxx.supabase.co');
    console.log('  用户名: admin');
    console.log('  密码: 123456');
    console.log('\n下一步：');
    console.log('  1. 更新环境变量配置');
    console.log('  2. 重新部署 Render 服务');
    console.log('  3. 测试登录功能');

  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

initializeDatabase();
