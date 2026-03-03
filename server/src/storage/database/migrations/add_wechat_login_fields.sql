-- 添加微信登录相关字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS openid VARCHAR(128) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_key VARCHAR(128);

-- 添加索引
CREATE INDEX IF NOT EXISTS users_openid_idx ON users(openid);

-- 添加注释
COMMENT ON COLUMN users.openid IS '微信用户的 openid';
COMMENT ON COLUMN users.session_key IS '微信用户的 session_key（用于解密敏感数据）';
