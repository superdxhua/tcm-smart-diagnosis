-- ============================================================
-- 统一数据库初始化脚本
-- 用于在 Supabase Dashboard SQL Editor 中执行
-- ============================================================

-- 说明：此脚本需要完整的数据库权限，请通过以下方式执行：
-- 1. 访问 https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql
-- 2. 打开 SQL Editor
-- 3. 复制并执行此脚本
-- ============================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 创建 admin 用户
-- 密码: 123456 (bcrypt 哈希)
-- 注意：如果用户已存在，先删除再创建
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
    DELETE FROM users WHERE username = 'admin';
    DELETE FROM user_permissions WHERE user_id IN (SELECT id FROM users WHERE username = 'admin');
  END IF;
END $$;

INSERT INTO users (
  id,
  username,
  password,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  true,
  NOW(),
  NOW()
);

-- 2. 为 admin 用户创建权限
INSERT INTO user_permissions (
  id,
  user_id,
  is_active,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v4(),
  id,
  true,
  NOW(),
  NOW()
FROM users
WHERE username = 'admin';

-- 3. 导入经方数据

-- 删除现有医案数据（如果需要重新导入）
-- TRUNCATE TABLE medical_cases CASCADE;

-- 张仲景医案 - 桂枝汤
INSERT INTO medical_cases (
  id,
  doctor_name,
  doctor_era,
  patient_gender,
  patient_age,
  main_symptoms,
  current_illness,
  tongue,
  pulse,
  diagnosis,
  prescription_name,
  prescription_composition,
  prescription_dosage,
  prescription_usage,
  treatment_result,
  notes,
  source,
  tags,
  symptom_keywords,
  diagnosis_pattern,
  effectiveness_score,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '张仲景',
  '汉代',
  '男',
  35,
  '发热、头痛、汗出、恶风',
  '患者因外感风寒，出现发热头痛，伴有汗出恶风，脉浮缓。',
  '舌淡苔薄白',
  '浮缓',
  '太阳中风证',
  '桂枝汤',
  '桂枝9g，芍药9g，甘草6g，生姜9g，大枣4枚',
  '水煎服，每日一剂，分三次服',
  '服药后喝热粥，微汗出而愈',
  '服药后喝热粥，微汗出而愈',
  '此为太阳中风证之经典方，解肌发表，调和营卫',
  '《伤寒论》',
  ARRAY['太阳病', '发热', '头痛', '汗出', '恶风'],
  ARRAY['发热', '头痛', '汗出', '恶风', '太阳中风'],
  '太阳病-桂枝汤证',
  0.95,
  NOW(),
  NOW()
);

-- 张仲景医案 - 麻黄汤
INSERT INTO medical_cases (
  id,
  doctor_name,
  doctor_era,
  patient_gender,
  patient_age,
  main_symptoms,
  current_illness,
  tongue,
  pulse,
  diagnosis,
  prescription_name,
  prescription_composition,
  prescription_dosage,
  prescription_usage,
  treatment_result,
  notes,
  source,
  tags,
  symptom_keywords,
  diagnosis_pattern,
  effectiveness_score,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '张仲景',
  '汉代',
  '男',
  28,
  '发热、恶寒、无汗、头痛、身痛',
  '患者因外感风寒，发热恶寒，无汗，全身酸痛，脉浮紧。',
  '舌淡苔薄白',
  '浮紧',
  '太阳伤寒证',
  '麻黄汤',
  '麻黄9g，桂枝6g，甘草3g，杏仁12g',
  '水煎服，每日一剂，分三次服',
  '服药后汗出而愈',
  '服药后汗出而愈',
  '此为太阳伤寒证，发汗解表',
  '《伤寒论》',
  ARRAY['太阳病', '发热', '恶寒', '无汗', '头痛', '身痛'],
  ARRAY['发热', '恶寒', '无汗', '头痛', '身痛', '太阳伤寒'],
  '太阳病-麻黄汤证',
  0.94,
  NOW(),
  NOW()
);

-- 张仲景医案 - 小柴胡汤
INSERT INTO medical_cases (
  id,
  doctor_name,
  doctor_era,
  patient_gender,
  patient_age,
  main_symptoms,
  current_illness,
  tongue,
  pulse,
  diagnosis,
  prescription_name,
  prescription_composition,
  prescription_dosage,
  prescription_usage,
  treatment_result,
  notes,
  source,
  tags,
  symptom_keywords,
  diagnosis_pattern,
  effectiveness_score,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '张仲景',
  '汉代',
  '女',
  42,
  '往来寒热、胸胁苦满、口苦、咽干、目眩',
  '患者因少阳经气不利，出现往来寒热，胸胁苦满，口苦咽干目眩。',
  '舌边红苔薄黄',
  '弦',
  '少阳病',
  '小柴胡汤',
  '柴胡12g，黄芩9g，人参6g，甘草6g，半夏9g，生姜9g，大枣4枚',
  '水煎服，每日一剂，分三次服',
  '服药三剂后症状明显缓解',
  '服药三剂后症状明显缓解',
  '此为少阳病，和解少阳',
  '《伤寒论》',
  ARRAY['少阳病', '往来寒热', '胸胁苦满', '口苦', '咽干', '目眩'],
  ARRAY['往来寒热', '胸胁苦满', '口苦', '咽干', '目眩', '少阳病'],
  '少阳病-小柴胡汤证',
  0.93,
  NOW(),
  NOW()
);

-- 李可医案 - 破格救心汤
INSERT INTO medical_cases (
  id,
  doctor_name,
  doctor_era,
  patient_gender,
  patient_age,
  main_symptoms,
  current_illness,
  tongue,
  pulse,
  diagnosis,
  prescription_name,
  prescription_composition,
  prescription_dosage,
  prescription_usage,
  treatment_result,
  notes,
  source,
  tags,
  symptom_keywords,
  diagnosis_pattern,
  effectiveness_score,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '李可',
  '现代',
  '男',
  65,
  '心悸、气短、畏寒肢冷、面色苍白',
  '患者因心肾阳衰，出现心悸气短，畏寒肢冷，面色苍白，脉微欲绝。',
  '舌淡苔白滑',
  '微弱',
  '心肾阳衰',
  '破格救心汤',
  '附子100g（先煎2小时），干姜30g，炙甘草30g，人参15g，山萸肉30g，生龙骨30g，生牡蛎30g',
  '附子先煎2小时，其余后下，水煎服，每日一剂',
  '服药五剂后心悸气短明显改善，四肢转温',
  '服药五剂后心悸气短明显改善，四肢转温',
  '此为心肾阳衰之危重证，温阳救逆',
  '《李可老中医急危重症疑难病经验专辑》',
  ARRAY['心肾阳衰', '心悸', '气短', '畏寒', '肢冷'],
  ARRAY['心悸', '气短', '畏寒', '肢冷', '阳衰'],
  '心肾阳衰',
  0.92,
  NOW(),
  NOW()
);

-- 4. 验证数据
SELECT
  'users' as table_name,
  COUNT(*) as record_count
FROM users
UNION ALL
SELECT
  'user_permissions',
  COUNT(*)
FROM user_permissions
UNION ALL
SELECT
  'medical_cases',
  COUNT(*)
FROM medical_cases;

-- 5. 显示 admin 用户信息
SELECT
  username,
  role,
  is_active,
  created_at
FROM users
WHERE username = 'admin';

-- ============================================================
-- 执行完成！
-- ============================================================
--
-- 登录信息：
--   URL: https://dwswtkfbtdohaftnklxx.supabase.co
--   用户名: admin
--   密码: 123456
--
-- 下一步：
--   1. 检查 RLS 策略是否正确配置
--   2. 更新环境变量
--   3. 重新部署 Render 服务
--   4. 测试登录功能
-- ============================================================
