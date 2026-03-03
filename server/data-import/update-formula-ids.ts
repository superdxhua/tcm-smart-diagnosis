/**
 * 更新扩展数据中的 formula_id
 * 将简单的 ID（如 formula_001）映射到数据库中的实际 UUID
 */

import * as fs from 'fs';
import * as path from 'path';

// 加载 UUID 映射
const mappingPath = path.join(__dirname, 'formula-uuid-mapping.json');
const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
const formulaIdMapping = mappingData.formula_id_mapping;

// 加载扩展数据
const dataPath = path.join(__dirname, 'chronic-disease-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// 更新方剂-疾病关联数据
data.formula_disease_relations = data.formula_disease_relations.map(item => ({
  ...item,
  formula_id: formulaIdMapping[item.formula_id] || item.formula_id
}));

// 更新慢性病方剂配置数据
data.chronic_disease_formulas = data.chronic_disease_formulas.map(item => ({
  ...item,
  formula_id: formulaIdMapping[item.formula_id] || item.formula_id,
  // 更新 combination_formulas 中的 formula_id
  combination_formulas: (item.combination_formulas || []).map(id =>
    formulaIdMapping[id] || id
  )
}));

// 更新循证医学证据数据
data.formula_evidence = data.formula_evidence.map(item => ({
  ...item,
  formula_id: formulaIdMapping[item.formula_id] || item.formula_id
}));

// 更新肿瘤方剂关系数据
data.tumor_formula_relations = data.tumor_formula_relations.map(item => ({
  ...item,
  formula_id: formulaIdMapping[item.formula_id] || item.formula_id
}));

// 保存更新后的数据
const outputPath = path.join(__dirname, 'chronic-disease-data-updated.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log('✅ 扩展数据 formula_id 已更新');
console.log(`📁 输出文件: ${outputPath}`);
console.log('\n更新统计:');
console.log(`  - 方剂-疾病关联: ${data.formula_disease_relations.length} 条`);
console.log(`  - 慢性病方剂配置: ${data.chronic_disease_formulas.length} 条`);
console.log(`  - 循证医学证据: ${data.formula_evidence.length} 条`);
console.log(`  - 肿瘤方剂关系: ${data.tumor_formula_relations.length} 条`);
