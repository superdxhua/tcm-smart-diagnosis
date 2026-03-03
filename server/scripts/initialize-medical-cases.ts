/**
 * 初始化医案数据脚本
 * 用于向数据库中添加示例医案
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// 初始化 Supabase 客户端
const supabaseUrl = process.env.COSE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.COSE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('请设置 COSE_SUPABASE_URL 和 COSE_SUPABASE_ANON_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 示例医案数据
const sampleCases = [
  {
    doctor_name: '张仲景',
    doctor_era: '东汉',
    patient_gender: '男',
    patient_age: 35,
    main_symptoms: '发热恶寒，头痛身痛，无汗而喘，脉浮紧',
    current_illness: '昨天淋雨受凉，今晨开始发热，体温38.5℃',
    past_history: '平时体质一般，无重大疾病史',
    tongue: '舌淡苔薄白',
    pulse: '脉浮紧',
    diagnosis: '太阳病风寒表实证（外感风寒表实证）',
    prescription_name: '麻黄汤',
    prescription_composition: '麻黄9g（先煎去沫）、桂枝6g、炙甘草3g、杏仁9g（去皮尖，捣碎）',
    prescription_dosage: '一剂，水煎两次，分服',
    prescription_usage: '温服，服药后加盖衣被以助发汗',
    treatment_result: '服药后1小时得微汗，发热消退，头痛身痛明显缓解，次日痊愈',
    notes: '麻黄汤为辛温解表之代表方，专治太阳病风寒表实证',
    source: '《伤寒论》',
    tags: ['太阳病', '风寒表实证', '感冒', '麻黄汤'],
    symptom_keywords: ['发热', '恶寒', '头痛', '身痛', '无汗', '喘', '脉浮紧'],
    diagnosis_pattern: '太阳病',
    effectiveness_score: 0.95,
  },
  {
    doctor_name: '张仲景',
    doctor_era: '东汉',
    patient_gender: '女',
    patient_age: 28,
    main_symptoms: '发热，汗出恶风，头痛，脉浮缓',
    current_illness: '三天前外出受风，开始发热，伴有汗出',
    past_history: '体虚易感冒',
    tongue: '舌淡苔薄白',
    pulse: '脉浮缓',
    diagnosis: '太阳病中风证（营卫不和）',
    prescription_name: '桂枝汤',
    prescription_composition: '桂枝9g、芍药9g、炙甘草6g、生姜9g、大枣12枚',
    prescription_dosage: '一剂，水煎两次，分服',
    prescription_usage: '温服，服药后喝热粥以助药力，微汗即止',
    treatment_result: '服药后微汗出，发热消退，诸症悉除',
    notes: '桂枝汤为调和营卫之代表方，专治太阳病中风证',
    source: '《伤寒论》',
    tags: ['太阳病', '中风证', '营卫不和', '桂枝汤'],
    symptom_keywords: ['发热', '汗出', '恶风', '头痛', '脉浮缓'],
    diagnosis_pattern: '太阳病',
    effectiveness_score: 0.92,
  },
  {
    doctor_name: '张仲景',
    doctor_era: '东汉',
    patient_gender: '男',
    patient_age: 45,
    main_symptoms: '往来寒热，胸胁苦满，嘿嘿不欲饮食，心烦喜呕',
    current_illness: '一周前外感，治疗后发热退，但出现寒热往来',
    past_history: '平素情志不畅',
    tongue: '舌淡红苔薄黄',
    pulse: '脉弦',
    diagnosis: '少阳病',
    prescription_name: '小柴胡汤',
    prescription_composition: '柴胡24g、黄芩9g、人参9g、半夏9g、甘草6g、生姜9g、大枣12枚',
    prescription_dosage: '一剂，水煎两次，分服',
    prescription_usage: '分早晚两次温服',
    treatment_result: '服药3剂，寒热往来消失，胸胁舒畅，饮食增加',
    notes: '小柴胡汤为和解少阳之代表方，专治少阳病',
    source: '《伤寒论》',
    tags: ['少阳病', '寒热往来', '小柴胡汤'],
    symptom_keywords: ['寒热往来', '胸胁苦满', '嘿嘿不欲饮食', '心烦喜呕', '脉弦'],
    diagnosis_pattern: '少阳病',
    effectiveness_score: 0.90,
  },
  {
    doctor_name: '张仲景',
    doctor_era: '东汉',
    patient_gender: '女',
    patient_age: 32,
    main_symptoms: '心烦不眠，心悸怔忡，头晕目眩，面色萎黄',
    current_illness: '最近工作压力大，经常熬夜，精神疲倦',
    past_history: '无',
    tongue: '舌淡苔薄白',
    pulse: '脉细数',
    diagnosis: '心脾两虚证',
    prescription_name: '归脾汤',
    prescription_composition: '黄芪15g、党参12g、白术10g、茯苓12g、龙眼肉12g、炒酸枣仁15g、当归10g、远志6g、木香6g、炙甘草6g',
    prescription_dosage: '一剂，水煎两次，分早晚两次温服',
    prescription_usage: '饭后1小时服用',
    treatment_result: '服药7剂，睡眠改善，心悸缓解，面色转红',
    notes: '归脾汤为补益心脾之代表方，专治心脾两虚',
    source: '《济生方》',
    tags: ['心脾两虚', '不寐', '心悸', '归脾汤'],
    symptom_keywords: ['心烦', '不眠', '心悸', '怔忡', '头晕目眩', '面色萎黄'],
    diagnosis_pattern: '心脾两虚',
    effectiveness_score: 0.88,
  },
  {
    doctor_name: '张仲景',
    doctor_era: '东汉',
    patient_gender: '男',
    patient_age: 50,
    main_symptoms: '腹满而吐，食不下，自利益甚，时腹自痛',
    current_illness: '一个月前开始腹痛腹泻，日渐加重',
    past_history: '平素脾胃虚弱',
    tongue: '舌淡苔白',
    pulse: '脉沉迟',
    diagnosis: '太阴病（脾胃虚寒）',
    prescription_name: '理中汤',
    prescription_composition: '人参12g、白术12g、干姜9g、炙甘草6g',
    prescription_dosage: '一剂，水煎两次，分早晚两次温服',
    prescription_usage: '饭后温服',
    treatment_result: '服药5剂，腹痛腹泻明显缓解，食欲增加',
    notes: '理中汤为温中健脾之代表方，专治太阴病脾胃虚寒',
    source: '《伤寒论》',
    tags: ['太阴病', '脾胃虚寒', '理中汤'],
    symptom_keywords: ['腹满', '呕吐', '食不下', '腹泻', '腹痛', '脉沉迟'],
    diagnosis_pattern: '太阴病',
    effectiveness_score: 0.87,
  },
  {
    doctor_name: '李可',
    doctor_era: '现代',
    patient_gender: '女',
    patient_age: 38,
    main_symptoms: '心慌气短，动则尤甚，面色苍白，神疲乏力',
    current_illness: '半年前开始心慌，活动后加重',
    past_history: '有贫血史',
    tongue: '舌淡苔薄白',
    pulse: '脉细弱',
    diagnosis: '气血两虚证',
    prescription_name: '炙甘草汤加味',
    prescription_composition: '炙甘草12g、桂枝9g、人参12g、生地黄30g、阿胶9g（烊化）、麦冬12g、麻仁12g、生姜9g、大枣12枚、黄芪30g',
    prescription_dosage: '一剂，水煎两次，分早晚两次温服',
    prescription_usage: '饭后温服，阿胶烊化后兑入药汁',
    treatment_result: '服药14剂，心慌气短明显改善，体力增加，面色转红',
    notes: '炙甘草汤为气血双补之代表方，加黄芪增强补气之力',
    source: '李可老中医医案',
    tags: ['气血两虚', '心悸', '炙甘草汤'],
    symptom_keywords: ['心慌', '气短', '面色苍白', '神疲乏力', '脉细弱'],
    diagnosis_pattern: '气血两虚',
    effectiveness_score: 0.93,
  },
];

async function initializeMedicalCases() {
  console.log('开始初始化医案数据...');

  let successCount = 0;
  let errorCount = 0;

  for (const caseData of sampleCases) {
    try {
      const caseId = uuidv4();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('medical_cases')
        .insert({
          id: caseId,
          ...caseData,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error(`插入医案失败: ${caseData.doctor_name} - ${caseData.prescription_name}`, error);
        errorCount++;
      } else {
        console.log(`✓ 插入医案成功: ${caseData.doctor_name} - ${caseData.prescription_name}`);
        successCount++;
      }
    } catch (err) {
      console.error(`插入医案异常: ${caseData.doctor_name} - ${caseData.prescription_name}`, err);
      errorCount++;
    }
  }

  console.log(`\n初始化完成：成功 ${successCount} 条，失败 ${errorCount} 条`);

  // 查询总医案数
  const { count } = await supabase
    .from('medical_cases')
    .select('*', { count: 'exact', head: true });

  console.log(`当前数据库中共有 ${count} 条医案`);
}

initializeMedicalCases()
  .then(() => {
    console.log('脚本执行完成');
    process.exit(0);
  })
  .catch((err) => {
    console.error('脚本执行失败:', err);
    process.exit(1);
  });
