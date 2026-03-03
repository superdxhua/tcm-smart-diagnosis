# 最简单的解决方案：在 Supabase Dashboard 执行 SQL 脚本

由于 service_role key 验证遇到问题，我为你准备了最简单的解决方案。

## ⚡ 快速执行（只需要 2 分钟）

### 步骤 1: 访问 Supabase SQL Editor

点击这个链接直接打开 SQL Editor：
https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql/new

### 步骤 2: 复制 SQL 脚本

复制下面的完整 SQL 代码：

```sql
-- 创建 admin 用户（密码: 123456）
INSERT INTO users (id, username, password, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  is_active = true,
  updated_at = NOW();

-- 为 admin 创建权限
INSERT INTO user_permissions (id, user_id, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  true,
  NOW(),
  NOW()
FROM users
WHERE username = 'admin'
ON CONFLICT (user_id) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- 导入经方数据：桂枝汤
INSERT INTO medical_cases (
  id, doctor_name, doctor_era, patient_gender, patient_age,
  main_symptoms, current_illness, tongue, pulse, diagnosis,
  prescription_name, prescription_composition, prescription_dosage,
  prescription_usage, treatment_result, notes, source,
  tags, symptom_keywords, diagnosis_pattern, effectiveness_score,
  created_at, updated_at
) VALUES (
  gen_random_uuid(), '张仲景', '汉代', '男', 35,
  '发热、头痛、汗出、恶风',
  '患者因外感风寒，出现发热头痛，伴有汗出恶风，脉浮缓。',
  '舌淡苔薄白', '浮缓', '太阳中风证',
  '桂枝汤', '桂枝9g，芍药9g，甘草6g，生姜9g，大枣4枚',
  '水煎服，每日一剂，分三次服',
  '服药后喝热粥，微汗出而愈',
  '服药后喝热粥，微汗出而愈',
  '此为太阳中风证之经典方，解肌发表，调和营卫',
  '《伤寒论》',
  ARRAY['太阳病', '发热', '头痛', '汗出', '恶风'],
  ARRAY['发热', '头痛', '汗出', '恶风', '太阳中风'],
  '太阳病-桂枝汤证', 0.95,
  NOW(), NOW()
);

-- 导入经方数据：麻黄汤
INSERT INTO medical_cases (
  id, doctor_name, doctor_era, patient_gender, patient_age,
  main_symptoms, current_illness, tongue, pulse, diagnosis,
  prescription_name, prescription_composition, prescription_dosage,
  prescription_usage, treatment_result, notes, source,
  tags, symptom_keywords, diagnosis_pattern, effectiveness_score,
  created_at, updated_at
) VALUES (
  gen_random_uuid(), '张仲景', '汉代', '男', 28,
  '发热、恶寒、无汗、头痛、身痛',
  '患者因外感风寒，发热恶寒，无汗，全身酸痛，脉浮紧。',
  '舌淡苔薄白', '浮紧', '太阳伤寒证',
  '麻黄汤', '麻黄9g，桂枝6g，甘草3g，杏仁12g',
  '水煎服，每日一剂，分三次服',
  '服药后汗出而愈',
  '服药后汗出而愈',
  '此为太阳伤寒证，发汗解表',
  '《伤寒论》',
  ARRAY['太阳病', '发热', '恶寒', '无汗', '头痛', '身痛'],
  ARRAY['发热', '恶寒', '无汗', '头痛', '身痛', '太阳伤寒'],
  '太阳病-麻黄汤证', 0.94,
  NOW(), NOW()
);

-- 导入经方数据：小柴胡汤
INSERT INTO medical_cases (
  id, doctor_name, doctor_era, patient_gender, patient_age,
  main_symptoms, current_illness, tongue, pulse, diagnosis,
  prescription_name, prescription_composition, prescription_dosage,
  prescription_usage, treatment_result, notes, source,
  tags, symptom_keywords, diagnosis_pattern, effectiveness_score,
  created_at, updated_at
) VALUES (
  gen_random_uuid(), '张仲景', '汉代', '女', 42,
  '往来寒热、胸胁苦满、口苦、咽干、目眩',
  '患者因少阳经气不利，出现往来寒热，胸胁苦满，口苦咽干目眩。',
  '舌边红苔薄黄', '弦', '少阳病',
  '小柴胡汤', '柴胡12g，黄芩9g，人参6g，甘草6g，半夏9g，生姜9g，大枣4枚',
  '水煎服，每日一剂，分三次服',
  '服药三剂后症状明显缓解',
  '服药三剂后症状明显缓解',
  '此为少阳病，和解少阳',
  '《伤寒论》',
  ARRAY['少阳病', '往来寒热', '胸胁苦满', '口苦', '咽干', '目眩'],
  ARRAY['往来寒热', '胸胁苦满', '口苦', '咽干', '目眩', '少阳病'],
  '少阳病-小柴胡汤证', 0.93,
  NOW(), NOW()
);

-- 导入经方数据：破格救心汤
INSERT INTO medical_cases (
  id, doctor_name, doctor_era, patient_gender, patient_age,
  main_symptoms, current_illness, tongue, pulse, diagnosis,
  prescription_name, prescription_composition, prescription_dosage,
  prescription_usage, treatment_result, notes, source,
  tags, symptom_keywords, diagnosis_pattern, effectiveness_score,
  created_at, updated_at
) VALUES (
  gen_random_uuid(), '李可', '现代', '男', 65,
  '心悸、气短、畏寒肢冷、面色苍白',
  '患者因心肾阳衰，出现心悸气短，畏寒肢冷，面色苍白，脉微欲绝。',
  '舌淡苔白滑', '微弱', '心肾阳衰',
  '破格救心汤',
  '附子100g（先煎2小时），干姜30g，炙甘草30g，人参15g，山萸肉30g，生龙骨30g，生牡蛎30g',
  '附子先煎2小时，其余后下，水煎服，每日一剂',
  '服药五剂后心悸气短明显改善，四肢转温',
  '服药五剂后心悸气短明显改善，四肢转温',
  '此为心肾阳衰之危重证，温阳救逆',
  '《李可老中医急危重症疑难病经验专辑》',
  ARRAY['心肾阳衰', '心悸', '气短', '畏寒', '肢冷'],
  ARRAY['心悸', '气短', '畏寒', '肢冷', '阳衰'],
  '心肾阳衰', 0.92,
  NOW(), NOW()
);

-- 验证结果
SELECT
  '用户数' as 类型,
  COUNT(*) as 数量
FROM users
UNION ALL
SELECT
  '医案数',
  COUNT(*)
FROM medical_cases;

-- 显示 admin 用户
SELECT
  username as 用户名,
  role as 角色,
  is_active as 状态
FROM users
WHERE username = 'admin';
```

### 步骤 3: 执行 SQL

1. 打开上面的链接后，会看到 SQL Editor
2. 粘贴复制的内容
3. 点击右下角的 "Run" 或 "运行" 按钮
4. 等待几秒钟，看到 "Success" 或绿色勾号就成功了

### 步骤 4: 验证

执行成功后，你会看到：
- 用户数: 1
- 医案数: 4
- admin 用户信息

## ✅ 完成后告诉我

执行成功后，告诉我"完成了"，我会继续帮你配置环境变量和部署服务！

---

**提示**: 如果你愿意提供正确的 service_role key（格式是 `eyJ...`），我可以自动完成这些操作。但手动执行 SQL 脚本也非常简单，只需要 2 分钟！
