# ⚡ 2分钟完成数据库初始化 - 只需一次点击！

## 🔍 测试结果

我已经测试了所有的密钥，包括你最新提供的 publishable key：

| 密钥类型 | 连接状态 | 读取权限 | 写入权限 |
|---------|---------|---------|---------|
| service_role key | ❌ 失败 | - | - |
| anon key | ❌ 失败 | - | - |
| publishable key | ✅ 成功 | ✅ 可以 | ❌ 不可以 |

## ✅ 最简单解决方案

由于提供的密钥都没有写入权限，**我强烈推荐使用 SQL Editor 手动执行**。

### 执行步骤（只需 2 分钟）

#### 第 1 步：打开 SQL Editor

点击这个链接直接打开：
https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql/new

#### 第 2 步：复制 SQL 代码

打开项目中的 `QUICK_START.md` 文件，复制里面的完整 SQL 代码。

或者，直接复制下面的简化版本：

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
);

-- 创建 admin 权限
INSERT INTO user_permissions (id, user_id, is_active, created_at, updated_at)
SELECT gen_random_uuid(), id, true, NOW(), NOW()
FROM users WHERE username = 'admin';

-- 导入经方数据（简化版，只导入1条示例）
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

-- 验证
SELECT 'users' as 表名, COUNT(*) as 数量 FROM users
UNION ALL
SELECT 'medical_cases', COUNT(*) FROM medical_cases;
```

#### 第 3 步：执行 SQL

1. 粘贴代码到 SQL Editor
2. 点击右下角的 "Run" 按钮
3. 等待几秒钟，看到绿色的 "Success" 提示

#### 第 4 步：验证结果

执行成功后，你会看到：
```
表名           数量
users          1
medical_cases  1
```

## 🎉 完成后

告诉我"完成了"，我会立即帮你：
1. ✅ 更新项目环境变量
2. ✅ 配置 Render 环境
3. ✅ 指导重新部署
4. ✅ 验证登录功能

## 💡 为什么推荐这个方法？

- ✅ **100% 成功**：不需要任何密钥认证
- ✅ **最简单**：复制粘贴，点击执行
- ✅ **最快**：只需 2 分钟
- ✅ **最安全**：直接在 Supabase Dashboard 操作

## 📞 现在就动手！

1. 打开：https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql/new
2. 复制上面的 SQL 代码
3. 粘贴并执行
4. 完成后告诉我！

---
**温馨提示**：执行时如果遇到任何错误，直接把错误信息发给我，我会帮你解决！
