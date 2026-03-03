-- 创建异常检测记录表
CREATE TABLE IF NOT EXISTS abuse_detection_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_id UUID,
  diagnosis TEXT,
  symptoms TEXT,
  prescription_name TEXT,
  risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  reasons TEXT[] NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_abuse_detection_user_id ON abuse_detection_records(user_id);
CREATE INDEX IF NOT EXISTS idx_abuse_detection_detected_at ON abuse_detection_records(detected_at);
CREATE INDEX IF NOT EXISTS idx_abuse_detection_risk_level ON abuse_detection_records(risk_level);
CREATE INDEX IF NOT EXISTS idx_abuse_detection_user_risk_time ON abuse_detection_records(user_id, detected_at, risk_level);

-- 添加注释
COMMENT ON TABLE abuse_detection_records IS '异常检测记录表，用于记录个人用户滥用诊疗行为的检测结果';
COMMENT ON COLUMN abuse_detection_records.risk_level IS '风险等级：low（低风险）、medium（中等风险）、high（高风险）';
COMMENT ON COLUMN abuse_detection_records.reasons IS '异常原因列表';
