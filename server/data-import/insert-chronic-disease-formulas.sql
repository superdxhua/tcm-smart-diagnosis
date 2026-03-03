-- 插入慢性病方剂配置数据
-- 注意：由于数据包含 JSONB 类型和数组，需要使用正确的语法

-- 1. 插入基础数据（不包含 lifecycle_advice）
INSERT INTO chronic_disease_formulas (id, formula_id, disease_category_id, disease_stage, symptom_pattern, syndrome_type, dosage_adjustment, duration_notes, combination_formulas, contraindications, special_cautions, created_at, updated_at) VALUES
  ('cdf_001', 'c3138a18-3c15-4dd8-90b6-003cf2d19b80', 'digestive_gastritis', 'all', '胃痛、胀满、嗳气', '脾胃气虚', '原方剂量，可酌加黄芪30g', '4周为一个疗程', ARRAY[]::TEXT[], ARRAY['胃阴不足', '胃火炽盛'], ARRAY['服药期间忌食生冷', '避免过度劳累'], NOW(), NOW()),
  ('cdf_002', '481065b5-cdf1-44f2-ab62-9e2b523fd592', 'immune_diabetes', 'middle', '消渴、乏力、口干', '气阴两虚', '原方剂量，可酌加天花粉15g', '8周为一个疗程', ARRAY[]::TEXT[], ARRAY['阴虚火旺'], ARRAY['定期监测血糖'], NOW(), NOW())
ON CONFLICT (formula_id, disease_category_id, disease_stage, symptom_pattern) DO NOTHING;

-- 2. 更新 lifecycle_advice（单独更新）
UPDATE chronic_disease_formulas SET lifestyle_advice = '{"diet": "易消化饮食，少食多餐", "exercise": "适度运动，避免剧烈运动", "sleep": "规律作息，避免熬夜", "emotion": "保持心情舒畅，避免焦虑"}'::JSONB WHERE id = 'cdf_001';

UPDATE chronic_disease_formulas SET lifestyle_advice = '{"diet": "控制总热量，低糖低脂", "exercise": "适量运动，每天30分钟", "sleep": "保证充足睡眠", "emotion": "保持情绪稳定"}'::JSONB WHERE id = 'cdf_002';

-- 验证插入结果
SELECT id, formula_id, disease_category_id, disease_stage, syndrome_type FROM chronic_disease_formulas;
