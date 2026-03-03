-- ============================================
-- 同名同姓问题修复脚本
-- ============================================

-- 步骤 1：添加患者编号字段
ALTER TABLE members
ADD COLUMN IF NOT EXISTS patient_code VARCHAR(20);

-- 步骤 2：为现有患者生成编号
-- 格式：P + 日期(YYYYMMDD) + 序号(4位)
-- 例如：P202403010001
UPDATE members
SET patient_code = 'P' || TO_CHAR(created_at, 'YYYYMMDD') || LPAD(
  ROW_NUMBER() OVER (
    PARTITION BY DATE(created_at)
    ORDER BY created_at
  )::TEXT,
  4,
  '0'
)
WHERE patient_code IS NULL;

-- 步骤 3：添加唯一约束（防止重复编号）
ALTER TABLE members
ADD CONSTRAINT uk_members_patient_code
UNIQUE (patient_code);

-- 步骤 4：手机号唯一约束（防止重复注册）
-- 注意：如果有重复手机号的数据，需要先清理

-- 检查是否有重复手机号
SELECT
  phone,
  COUNT(*) as count
FROM members
WHERE phone IS NOT NULL
GROUP BY phone
HAVING COUNT(*) > 1;

-- 如果没有重复手机号，添加唯一约束
-- （如果有重复，需要手动处理后再执行）
-- ALTER TABLE members
-- ADD CONSTRAINT uk_members_phone
-- UNIQUE (phone);

-- 步骤 5：添加索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_members_phone
ON members(phone);

CREATE INDEX IF NOT EXISTS idx_members_patient_code
ON members(patient_code);

-- 步骤 6：验证结果
SELECT
  uuid::text,
  name,
  patient_code,
  phone,
  age,
  created_at
FROM members
ORDER BY created_at;

-- ============================================
-- 注意事项
-- ============================================

-- 1. 患者编号生成规则：
--    - 格式：P + 日期(YYYYMMDD) + 序号(4位)
--    - 每天从 0001 开始编号
--    - 永不重复

-- 2. 手机号唯一约束：
--    - 需要确保没有重复手机号
--    - 如果有重复，需要手动合并或删除
--    - 手机号为可选字段，不影响现有数据

-- 3. 前端显示建议：
--    - 患者列表：姓名 | 患者编号 | 手机号 | 年龄 | 就诊次数
--    - 手机号脱敏：138****0001
--    - 选择患者时显示确认弹窗

-- 4. 数据隐私：
--    - 手机号在前端脱敏显示
--    - 完整手机号只在详情页显示
--    - 记录患者信息访问历史
