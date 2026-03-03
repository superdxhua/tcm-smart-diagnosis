# 数据库迁移指南

## 概述

本指南说明如何手动执行数据库迁移，以创建新的数据库表和扩展现有表结构。

## 前置条件

1. 拥有 Supabase 项目的管理员权限
2. 可以访问 Supabase Dashboard

## 迁移步骤

### 方法一：通过 Supabase Dashboard 执行

1. **登录 Supabase Dashboard**
   - 访问 https://supabase.com/dashboard
   - 选择你的项目

2. **打开 SQL Editor**
   - 在左侧导航栏点击 "SQL Editor"
   - 点击 "New Query" 创建新查询

3. **执行迁移脚本**
   - 打开迁移脚本文件：`server/migrations/003_add_comprehensive_database_schema.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor 中
   - 点击 "Run" 执行

4. **验证迁移结果**
   - 执行完成后，检查是否有错误信息
   - 在左侧导航栏点击 "Table Editor"
   - 确认以下表已创建：
     - `disease_categories`
     - `formula_disease_relations`
     - `chronic_disease_formulas`
     - `formula_evidence`
     - `tumor_formula_relations`（应已存在）

### 方法二：通过 psql 命令行工具执行

如果你有 PostgreSQL 的 psql 客户端，可以使用以下命令：

```bash
# 从 Supabase Dashboard 获取数据库连接信息
# Database URL 格式: postgresql://postgres:[password]@[host]:5432/postgres

psql "postgresql://postgres:[password]@[host]:5432/postgres" -f server/migrations/003_add_comprehensive_database_schema.sql
```

## 迁移内容

### 第一部分：扩展现有表

1. **formulas 表**
   - 添加 `category` 字段（方剂分类）
   - 添加 `applicable_diseases` 字段（适用疾病列表）
   - 添加 `applicable_syndromes` 字段（适用证型列表）
   - 添加 `evidence_level` 字段（循证等级）
   - 添加 `clinical_usage_count` 字段（临床使用次数）

2. **tumor_formula_relations 表**
   - 添加 `efficacy_notes` 字段（疗效说明）
   - 添加 `clinical_evidence` 字段（临床证据）
   - 添加 `evidence_level` 字段（证据等级）

### 第二部分：创建新表

3. **disease_categories**（疾病分类表）
   - 支持层级结构（一级、二级、三级分类）
   - 包含中医疾病名称
   - 字段：id, name, parent_id, level, description, tcm_name

4. **formula_disease_relations**（方剂-疾病关联表）
   - 记录方剂与疾病的关联关系
   - 包含疗效评分和循证等级
   - 字段：id, formula_id, disease_category_id, efficacy_score, evidence_level, clinical_cases_count, clinical_effectiveness

5. **chronic_disease_formulas**（慢性病专用配置表）
   - 记录慢性病专用方剂的配置信息
   - 包含剂量调整、疗程说明、禁忌症等
   - 字段：id, formula_id, disease_category_id, disease_stage, symptom_pattern, syndrome_type, dosage_adjustment, duration_notes, combination_formulas, contraindications, special_cautions, lifestyle_advice

6. **formula_evidence**（循证医学证据表）
   - 记录方剂的循证医学证据
   - 支持多种证据类型（临床试验、荟萃分析、病例研究）
   - 字段：id, formula_id, disease_category_id, evidence_type, title, authors, source, year, volume, issue, pages, doi, sample_size, effectiveness, p_value, confidence_interval, url, abstract, key_findings, limitations

### 第三部分：数据初始化

7. **插入默认疾病分类**
   - 一级分类：8 大类（消化、免疫、情志、风湿、妇科、呼吸、心血管、肿瘤）
   - 二级分类：40+ 亚类

8. **更新现有方剂数据**
   - 设置默认分类为 'general'
   - 设置循证等级为 'high'（基于伤寒论、金匮要略）

### 第四部分：创建视图

9. **v_formula_details**（方剂详细信息视图）
   - 关联方剂、疾病、证据数据
   - 提供方剂的完整信息

10. **v_chronic_disease_recommendations**（慢性病方剂推荐视图）
    - 慢性病方剂的推荐信息
    - 按疗效评分排序

### 第五部分：创建触发器

11. **updated_at 自动更新触发器**
    - 为所有新表创建自动更新时间戳的触发器

## 数据导入

迁移完成后，执行数据导入：

```bash
cd /workspace/projects/server
npx tsx data-import/import-data.ts
```

导入的数据包括：
- 方剂-疾病关联：3 条
- 慢性病方剂配置：15 条
- 循证医学证据：15 条
- 肿瘤方剂关系：2 条

## 验证步骤

1. **检查表结构**
   ```sql
   SELECT table_name, column_name, data_type
   FROM information_schema.columns
   WHERE table_schema = 'public'
   ORDER BY table_name, ordinal_position;
   ```

2. **检查数据**
   ```sql
   -- 检查疾病分类
   SELECT * FROM disease_categories ORDER BY level, name;
   
   -- 检查方剂-疾病关联
   SELECT * FROM formula_disease_relations;
   
   -- 检查慢性病方剂配置
   SELECT * FROM chronic_disease_formulas;
   
   -- 检查循证医学证据
   SELECT * FROM formula_evidence;
   ```

3. **检查视图**
   ```sql
   SELECT * FROM v_formula_details LIMIT 10;
   SELECT * FROM v_chronic_disease_recommendations LIMIT 10;
   ```

## 常见问题

### Q1: 执行迁移时出现错误

**A**: 检查错误信息：
- 如果是 "relation already exists"，表示表已存在，可以忽略
- 如果是 "column already exists"，表示列已存在，可以忽略
- 其他错误请根据错误信息处理

### Q2: 数据导入失败

**A**: 确保：
1. 迁移脚本已成功执行
2. 所有表都已创建
3. Supabase 环境变量配置正确

### Q3: 权限不足

**A**: 确保你拥有：
1. Supabase 项目的管理员权限
2. 或使用 service_role_key（而非 anon_key）

## 回滚

如果需要回滚迁移，执行以下 SQL：

```sql
-- 删除视图
DROP VIEW IF EXISTS v_chronic_disease_recommendations;
DROP VIEW IF EXISTS v_formula_details;

-- 删除触发器
DROP TRIGGER IF EXISTS update_formula_evidence_updated_at ON formula_evidence;
DROP TRIGGER IF EXISTS update_chronic_disease_formulas_updated_at ON chronic_disease_formulas;
DROP TRIGGER IF EXISTS update_formula_disease_relations_updated_at ON formula_disease_relations;
DROP TRIGGER IF EXISTS update_disease_categories_updated_at ON disease_categories;

-- 删除函数
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 删除表
DROP TABLE IF EXISTS formula_evidence;
DROP TABLE IF EXISTS chronic_disease_formulas;
DROP TABLE IF EXISTS formula_disease_relations;
DROP TABLE IF EXISTS disease_categories;

-- 删除添加的列（如果不需要）
ALTER TABLE tumor_formula_relations DROP COLUMN IF EXISTS efficacy_notes;
ALTER TABLE tumor_formula_relations DROP COLUMN IF EXISTS clinical_evidence;
ALTER TABLE tumor_formula_relations DROP COLUMN IF EXISTS evidence_level;

ALTER TABLE formulas DROP COLUMN IF EXISTS category;
ALTER TABLE formulas DROP COLUMN IF EXISTS applicable_diseases;
ALTER TABLE formulas DROP COLUMN IF EXISTS applicable_syndromes;
ALTER TABLE formulas DROP COLUMN IF EXISTS evidence_level;
ALTER TABLE formulas DROP COLUMN IF EXISTS clinical_usage_count;
```

## 联系支持

如果在迁移过程中遇到问题，请联系技术支持或查阅 Supabase 官方文档。
