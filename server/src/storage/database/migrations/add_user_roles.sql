-- 添加账户角色和审核相关字段
-- 修改 role 字段默认值为 individual（中医爱好者）
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'individual';
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- 添加审核状态字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS audit_status VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution_license VARCHAR(512);
ALTER TABLE users ADD COLUMN IF NOT EXISTS practice_license VARCHAR(512);
ALTER TABLE users ADD COLUMN IF NOT EXISTS physician_cert VARCHAR(512);
ALTER TABLE users ADD COLUMN IF NOT EXISTS audit_remark TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS audited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS audited_by VARCHAR(36);

-- 添加索引
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_audit_status_idx ON users(audit_status);
CREATE INDEX IF NOT EXISTS users_audited_by_idx ON users(audited_by);

-- 添加外键约束
ALTER TABLE users ADD CONSTRAINT users_audited_by_fkey
  FOREIGN KEY (audited_by) REFERENCES users(id) ON DELETE SET NULL;

-- 添加注释
COMMENT ON COLUMN users.role IS '账户角色：individual（中医爱好者）, institution（机构）, admin（管理员）';
COMMENT ON COLUMN users.audit_status IS '机构账户审核状态：pending（待审核）, approved（已通过）, rejected（已拒绝）';
COMMENT ON COLUMN users.institution_license IS '营业执照（文件URL）';
COMMENT ON COLUMN users.practice_license IS '许可证（文件URL）';
COMMENT ON COLUMN users.physician_cert IS '医师资格证（文件URL）';
COMMENT ON COLUMN users.audit_remark IS '审核备注';
COMMENT ON COLUMN users.audited_at IS '审核时间';
COMMENT ON COLUMN users.audited_by IS '审核人（管理员ID）';

-- 更新现有账户的 role 字段为 individual
UPDATE users SET role = 'individual' WHERE role = 'user' OR role IS NULL;
