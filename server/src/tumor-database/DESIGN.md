# 肿瘤患者经方数据库设计方案

## 一、数据库架构设计

### 1.1 核心原则
- **六经辨证为纲**：所有方证必须明确六经归属
- **动态证候管理**：记录治疗过程中的证候变化
- **安全优先**：内置药物禁忌和相互作用检查
- **分层调理**：区分治标、治本、调和不同层次

### 1.2 数据库表结构

#### 表 1：肿瘤患者体质分类表 (tumor_constitutions)
```sql
CREATE TABLE tumor_constitutions (
  id SERIAL PRIMARY KEY,
  constitution_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  meridian_basis VARCHAR(50) NOT NULL,           -- 六经底色（太阴/少阴/厥阴等）
  tongue_features TEXT[],                        -- 舌象特征
  pulse_features TEXT[],                         -- 脉象特征
  typical_symptoms TEXT[],                       -- 典型症状
  syndrome_combinations TEXT[],                  -- 常见证型组合
  description TEXT,                              -- 详细描述
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 表 2：肿瘤病机分类表 (tumor_pathogenesis)
```sql
CREATE TABLE tumor_pathogenesis (
  id SERIAL PRIMARY KEY,
  pathogenesis_id VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,                 -- 病机类别（瘀血/痰饮/气滞/毒热）
  meridian_type VARCHAR(50) NOT NULL,            -- 六经归属
  description TEXT,                              -- 病机描述
  typical_manifestations TEXT[],                 -- 典型表现
  treatment_principle TEXT,                      -- 治则
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 表 3：现代治疗变证表 (treatment_complications)
```sql
CREATE TABLE treatment_complications (
  id SERIAL PRIMARY KEY,
  complication_id VARCHAR(50) UNIQUE NOT NULL,
  treatment_type VARCHAR(50) NOT NULL,           -- 治疗类型（手术/化疗/放疗/靶向/免疫）
  complication_name VARCHAR(100) NOT NULL,
  meridian_type VARCHAR(50) NOT NULL,            -- 六经归属
  core_pathogenesis TEXT[],                      -- 核心病机
  key_symptoms TEXT[],                           -- 关键症状
  time_window VARCHAR(50),                       -- 发生时间窗口
  severity VARCHAR(20),                          -- 严重程度（轻/中/重）
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 表 4：肿瘤症状支持表 (symptom_support_formulas)
```sql
CREATE TABLE symptom_support_formulas (
  id SERIAL PRIMARY KEY,
  symptom_id VARCHAR(50) UNIQUE NOT NULL,
  symptom_name VARCHAR(100) NOT NULL,
  symptom_category VARCHAR(50) NOT NULL,         -- 症状类别（疼痛/呃逆/水肿等）
  recommended_formula VARCHAR(100) NOT NULL,
  formula_source VARCHAR(100),
  evidence TEXT,                                 -- 依据条文
  meridian_type VARCHAR(50),
  safety_level VARCHAR(10),                      -- 安全等级（A/B/C）
  dosage_adjustment TEXT,
  contraindications TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 表 5：肿瘤经方库 (tumor_formulas)
```sql
CREATE TABLE tumor_formulas (
  id SERIAL PRIMARY KEY,
  formula_id VARCHAR(50) UNIQUE NOT NULL,
  formula_name VARCHAR(100) NOT NULL,
  meridian_type VARCHAR(50) NOT NULL,
  treatment_category VARCHAR(50) NOT NULL,       -- 治疗类别（治标/治本/调和/扶正）
  application_scenario VARCHAR(100),             -- 应用场景（术后/化疗/放疗/常规调理）
  key_indications TEXT[],                        -- 关键适应症
  core_pathogenesis TEXT[],                      -- 核心病机
  herbal_composition TEXT,                       -- 组成
  dosage TEXT,                                   -- 剂量
  instructions TEXT,                             -- 煎服法
  modification_rules TEXT,                       -- 加减法
  contraindications TEXT[],
  safety_level VARCHAR(10),
  evidence_source TEXT,                          -- 经典条文
  modern_context TEXT,                           -- 现代应用背景
  efficacy_expectation TEXT,                     -- 疗效预期
  consultation_required BOOLEAN DEFAULT FALSE,  -- 是否强制面诊
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 表 6：肿瘤方证关联表 (tumor_formula_relations)
```sql
CREATE TABLE tumor_formula_relations (
  id SERIAL PRIMARY KEY,
  formula_id VARCHAR(50) REFERENCES tumor_formulas(formula_id),
  constitution_id VARCHAR(50) REFERENCES tumor_constitutions(constitution_id),
  pathogenesis_id VARCHAR(50) REFERENCES tumor_pathogenesis(pathogenesis_id),
  complication_id VARCHAR(50) REFERENCES treatment_complications(complication_id),
  symptom_id VARCHAR(50) REFERENCES symptom_support_formulas(symptom_id),
  priority INTEGER DEFAULT 0,                    -- 优先级
  indication TEXT,                               -- 适应症描述
  dosage_adjustment TEXT,                        -- 剂量调整
  duration VARCHAR(50),                          -- 疗程
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 表 7：药物安全检查表 (drug_safety_checks)
```sql
CREATE TABLE drug_safety_checks (
  id SERIAL PRIMARY KEY,
  formula_id VARCHAR(50) REFERENCES tumor_formulas(formula_id),
  herb_name VARCHAR(100) NOT NULL,
  toxicity_level VARCHAR(20),                    -- 毒性等级（无毒/小毒/有毒/大毒）
  max_dosage VARCHAR(50),                        -- 最大剂量
  decoction_requirements TEXT,                  -- 煎煮要求
  interactions TEXT[],                           -- 药物相互作用
  contraindications TEXT[],
  warning_level VARCHAR(10),                     -- 警告等级（A/B/C/D）
  hospital_only BOOLEAN DEFAULT FALSE,           -- 是否仅限医院使用
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 表 8：现代药物相互作用表 (modern_drug_interactions)
```sql
CREATE TABLE modern_drug_interactions (
  id SERIAL PRIMARY KEY,
  herb_name VARCHAR(100) NOT NULL,
  modern_drug VARCHAR(100) NOT NULL,             -- 现代药物
  interaction_type VARCHAR(50),                  -- 相互作用类型
  severity VARCHAR(20),                          -- 严重程度（轻/中/重）
  mechanism TEXT,                                -- 作用机制
  recommendation TEXT,                           -- 建议
  evidence_source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 二、核心数据内容

### 2.1 体质分类数据（初步设计）
1. **太阴脾虚质**
   - 舌：淡胖、有齿痕
   - 脉：沉细、缓
   - 证型组合：太阴 + 少阴（脾肾阳虚）
   - 典型方证：理中汤、小建中汤

2. **少阴阳虚质**
   - 舌：淡白、胖嫩
   - 脉：沉微、弱
   - 证型组合：少阴 + 太阴（脾肾阳虚）
   - 典型方证：真武汤、四逆汤

3. **厥阴寒热错杂质**
   - 舌：舌红、苔白或黄腻
   - 脉：弦、数
   - 证型组合：厥阴 + 少阳
   - 典型方证：乌梅丸、柴胡桂枝干姜汤

4. **少阳气郁质**
   - 舌：舌边尖红、苔薄黄
   - 脉：弦
   - 证型组合：少阳 + 厥阴
   - 典型方证：四逆散、小柴胡汤

### 2.2 肿瘤病机分类
1. **瘀血内阻**
   - 方证：桂枝茯苓丸、大黄䗪虫丸
   - 表现：刺痛、肿块固定、舌紫暗

2. **痰饮凝聚**
   - 方证：苓桂术甘汤、泽泻汤
   - 表现：胸胁满、眩晕、苔腻

3. **气滞不行**
   - 方证：四逆散、柴胡剂
   - 表现：胀痛、情绪波动加重

### 2.3 现代治疗变证

#### 手术后
1. **气血大虚**
   - 方证：小建中汤、当归建中汤
   - 时间：术后 1-2 周

2. **阳气外脱**
   - 方证：桂枝加附子汤
   - 时间：术后即刻

3. **腹胀肠鸣**
   - 方证：半夏泻心汤、厚朴生姜半夏甘草人参汤
   - 时间：术后 3-7 天

#### 化疗后
1. **骨髓抑制**
   - 少阴虚劳：肾气丸、炙甘草汤
   - 太阴脾虚：理中汤合当归补血汤

2. **消化道反应**
   - 少阳枢机不利：小柴胡汤
   - 太阴下利：桃花汤、赤石脂禹余粮汤

3. **口腔溃疡**
   - 少阴热化：黄连阿胶汤
   - 津伤胃燥：竹叶石膏汤

#### 放疗后
1. **阴虚火旺**
   - 方证：猪苓汤、麦门冬汤

2. **局部灼热**
   - 方证：百合地黄汤

#### 靶向/免疫治疗
1. **皮疹腹泻**
   - 方证：柴胡桂枝干姜汤

2. **甲状腺炎**
   - 方证：真武汤、桂枝加附子汤

### 2.4 症状支持方证
1. **癌性疼痛**：芍药甘草汤、乌头汤
2. **顽固性呃逆**：旋覆代赭汤
3. **腹水/胸水**：十枣汤（慎用）、牡蛎泽泻散
4. **失眠焦虑**：柴胡加龙骨牡蛎汤、酸枣仁汤

### 2.5 扶正固本方
1. **小建中汤**：虚劳里急、气血不足
2. **肾气丸**：少阴虚劳、腰膝酸冷
3. **薯蓣丸**：体虚易感、正气不足

## 三、安全机制

### 3.1 绝对禁忌库
1. **峻烈药**：十枣汤、甘遂、大戟
2. **毒性药**：附子、细辛（标注剂量上限）

### 3.2 药物相互作用
1. **华法林**：丹参、当归可能增强抗凝
2. **靶向药**：中药与 CYP3A4 代谢酶相互作用

### 3.3 疗效预期管理
- 明确标注：改善症状、提高生活质量，非直接杀灭肿瘤

### 3.4 强制面诊提示
- 晚期、恶液质、多线治疗失败患者
