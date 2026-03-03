-- 插入方剂-疾病关联数据
INSERT INTO formula_disease_relations (id, formula_id, disease_category_id, efficacy_score, evidence_level, evidence_sources, clinical_cases_count, clinical_effectiveness, created_at, updated_at) VALUES
  ('fdr_001', 'c3138a18-3c15-4dd8-90b6-003cf2d19b80', 'digestive_gastritis', 0.85, 'high', ARRAY['伤寒论', '临床研究'], 120, 0.88, NOW(), NOW()),
  ('fdr_002', '481065b5-cdf1-44f2-ab62-9e2b523fd592', 'immune_diabetes', 0.78, 'medium', ARRAY['临床研究', '专家经验'], 85, 0.82, NOW(), NOW()),
  ('fdr_003', '94a7fb67-d6e3-4335-a05f-344182ad35f4', 'emotion_insomnia', 0.82, 'medium', ARRAY['金匮要略', '临床观察'], 95, 0.85, NOW(), NOW())
ON CONFLICT (formula_id, disease_category_id) DO NOTHING;

-- 验证插入结果
SELECT * FROM formula_disease_relations;
