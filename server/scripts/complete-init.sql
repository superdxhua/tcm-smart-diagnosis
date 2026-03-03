-- ============================================================
-- 完整数据库初始化脚本（创建表 + 插入数据）
-- ============================================================

-- 1. 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  secondary_admin VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 user_permissions 表
CREATE TABLE IF NOT EXISTS user_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL,
  authorized_by VARCHAR(36),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_permissions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 创建 medical_cases 表
CREATE TABLE IF NOT EXISTS medical_cases (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_name VARCHAR(100) NOT NULL,
  doctor_era VARCHAR(50),
  patient_gender VARCHAR(10),
  patient_age INTEGER,
  main_symptoms TEXT NOT NULL,
  current_illness TEXT,
  tongue VARCHAR(200),
  pulse VARCHAR(200),
  diagnosis TEXT NOT NULL,
  prescription_name VARCHAR(200),
  prescription_composition TEXT,
  prescription_dosage TEXT,
  prescription_usage TEXT,
  treatment_result TEXT,
  notes TEXT,
  source VARCHAR(200),
  tags TEXT[] DEFAULT '{}',
  symptom_keywords TEXT[] DEFAULT '{}',
  diagnosis_pattern VARCHAR(200),
  effectiveness_score NUMERIC(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- 5. 插入 admin 用户（密码: 123456）
INSERT INTO users (id, username, password, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  true,
  NOW(),
  NOW()
);

-- 6. 插入 admin 权限
INSERT INTO user_permissions (id, user_id, is_active, created_at, updated_at)
SELECT gen_random_uuid(), id, true, NOW(), NOW()
FROM users WHERE username = 'admin';

-- 7. 插入经方数据：桂枝汤
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

-- 8. 验证结果
SELECT 'users' as 表名, COUNT(*) as 数量 FROM users
UNION ALL
SELECT 'user_permissions', COUNT(*) FROM user_permissions
UNION ALL
SELECT 'medical_cases', COUNT(*) FROM medical_cases;
