-- 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 症状向量表
CREATE TABLE IF NOT EXISTS symptom_vectors (
  id SERIAL PRIMARY KEY,
  symptom TEXT NOT NULL UNIQUE,
  vector vector(1536) NOT NULL,
  meridian VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引：使用 HNSW 算法加速向量检索
CREATE INDEX IF NOT EXISTS symptom_vectors_vector_idx ON symptom_vectors
USING hnsw (vector vector_cosine_ops);

-- 方证向量表
CREATE TABLE IF NOT EXISTS formula_vectors (
  id SERIAL PRIMARY KEY,
  formula_id INTEGER NOT NULL UNIQUE REFERENCES formulas(id) ON DELETE CASCADE,
  formula_name TEXT NOT NULL,
  vector vector(1536) NOT NULL,
  meridian VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引：使用 HNSW 算法加速向量检索
CREATE INDEX IF NOT EXISTS formula_vectors_vector_idx ON formula_vectors
USING hnsw (vector vector_cosine_ops);

-- 创建索引：formula_id
CREATE INDEX IF NOT EXISTS formula_vectors_formula_id_idx ON formula_vectors(formula_id);

-- 创建索引：meridian
CREATE INDEX IF NOT EXISTS formula_vectors_meridian_idx ON formula_vectors(meridian);

-- 创建向量相似度检索函数（方证匹配）
CREATE OR REPLACE FUNCTION match_formulas(
  query_vector vector(1536),
  match_count INTEGER DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  formula_id INTEGER,
  formula_name TEXT,
  meridian VARCHAR(20),
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fv.formula_id,
    fv.formula_name,
    fv.meridian,
    1 - (fv.vector <=> query_vector) AS similarity
  FROM formula_vectors fv
  WHERE 1 - (fv.vector <=> query_vector) >= match_threshold
  ORDER BY fv.vector <=> query_vector
  LIMIT match_count;
END;
$$;

-- 创建向量相似度检索函数（症状匹配）
CREATE OR REPLACE FUNCTION match_symptoms(
  query_vector vector(1536),
  match_count INTEGER DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id INTEGER,
  symptom TEXT,
  meridian VARCHAR(20),
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sv.id,
    sv.symptom,
    sv.meridian,
    1 - (sv.vector <=> query_vector) AS similarity
  FROM symptom_vectors sv
  WHERE 1 - (sv.vector <=> query_vector) >= match_threshold
  ORDER BY sv.vector <=> query_vector
  LIMIT match_count;
END;
$$;

-- 添加注释
COMMENT ON TABLE symptom_vectors IS '症状向量表：存储症状的语义向量表示，支持基于语义的相似度检索';
COMMENT ON TABLE formula_vectors IS '方证向量表：存储方证的语义向量表示，支持基于语义的相似度检索';
COMMENT ON FUNCTION match_formulas IS '基于向量相似度匹配方证';
COMMENT ON FUNCTION match_symptoms IS '基于向量相似度匹配症状';

-- 显示表结构
\d symptom_vectors
\d formula_vectors
