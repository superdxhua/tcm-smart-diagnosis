-- 创建用户积分余额表
CREATE TABLE IF NOT EXISTS user_points (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  available_points INTEGER NOT NULL DEFAULT 0,
  used_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS user_points_user_id_idx ON user_points(user_id);
CREATE INDEX IF NOT EXISTS user_points_available_points_idx ON user_points(available_points);

-- 添加注释
COMMENT ON TABLE user_points IS '用户积分余额表';
COMMENT ON COLUMN user_points.user_id IS '用户ID';
COMMENT ON COLUMN user_points.total_points IS '总积分（累计获得）';
COMMENT ON COLUMN user_points.available_points IS '可用积分';
COMMENT ON COLUMN user_points.used_points IS '已使用积分';

-- 创建签到记录表
CREATE TABLE IF NOT EXISTS sign_in_records (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sign_in_date TIMESTAMP WITH TIME ZONE NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  consecutive_days INTEGER NOT NULL DEFAULT 0,
  is_bonus_day BOOLEAN NOT NULL DEFAULT false,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS sign_in_records_user_id_idx ON sign_in_records(user_id);
CREATE INDEX IF NOT EXISTS sign_in_records_sign_in_date_idx ON sign_in_records(sign_in_date);
CREATE INDEX IF NOT EXISTS sign_in_records_user_id_date_idx ON sign_in_records(user_id, sign_in_date);

-- 添加注释
COMMENT ON TABLE sign_in_records IS '签到记录表';
COMMENT ON COLUMN sign_in_records.user_id IS '用户ID';
COMMENT ON COLUMN sign_in_records.sign_in_date IS '签到日期';
COMMENT ON COLUMN sign_in_records.points_awarded IS '本次签到获得的积分';
COMMENT ON COLUMN sign_in_records.consecutive_days IS '连续签到天数';
COMMENT ON COLUMN sign_in_records.is_bonus_day IS '是否奖励日（7天、30天）';
COMMENT ON COLUMN sign_in_records.bonus_points IS '额外奖励积分';
