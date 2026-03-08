/**
 * 中医辨证 API - /api/tcm/analyze
 *
 * 功能：
 * - POST /api/tcm/analyze - 中医辨证分析
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 中医辨证分析
 *
 * POST /api/tcm/analyze
 */
async function analyze(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  console.log('[TCM/Analyze] ========== 开始处理请求 ==========');
  console.log('[TCM/Analyze] user:', user?.id);
  console.log('[TCM/Analyze] 请求体:', JSON.stringify(req.body, null, 2));

  let currentStep = 'start';

  try {
    currentStep = 'parse_body';
    // 支持新旧两种前端数据结构
    const {
      // 新诊疗流程字段
      patientId,
      patientInfo,
      chiefComplaint,
      supplementaryInfo,
      aiInquiry,
      // 旧版字段（兼容）
      symptoms,
      history,
      memberId
    } = req.body;

    currentStep = 'extract_fields';
    // 统一提取关键信息
    const finalMemberId = patientId || memberId;
    const finalSymptoms = chiefComplaint || symptoms || '';
    const finalHistory = aiInquiry || history || '';
    const medicalHistory = supplementaryInfo?.medicalHistory || '';
    const allergyHistory = supplementaryInfo?.allergyHistory || '';
    const medicationHistory = supplementaryInfo?.medicationHistory || '';

    currentStep = 'validate_symptoms';
    if (!finalSymptoms) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '缺少症状信息',
      });
    }

    currentStep = 'get_supabase';
    const supabase = getSupabaseClient();
    console.log('[TCM/Analyze] Supabase 客户端已获取');

    currentStep = 'build_prompt';
    // 构建详细的问诊信息
    const patientInfoText = patientInfo ?
      `患者信息：${patientInfo.name}，${patientInfo.gender}，${patientInfo.age}岁` : '';

    const supplementaryText = [
      medicalHistory ? `既往病史：${medicalHistory}` : '',
      allergyHistory ? `过敏史：${allergyHistory}` : '',
      medicationHistory ? `用药史：${medicationHistory}` : '',
    ].filter(Boolean).join('；');

    currentStep = 'generate_analysis';
    // 这里应该调用通义千问 API 进行中医辨证分析
    // 暂时返回基于规则的模拟数据
    const analysis = {
      diagnosis: '肝郁脾虚证',
      differentiation: '肝气郁结，疏泄失常，横逆犯脾，脾失健运',
      treatmentPrinciple: '疏肝解郁，健脾益气',
      prescription: {
        formulaName: '逍遥散加减',
        ingredients: [
          { name: '柴胡', dosage: '10g', special: '' },
          { name: '当归', dosage: '10g', special: '酒炒' },
          { name: '白芍', dosage: '10g', special: '炒' },
          { name: '白术', dosage: '10g', special: '炒' },
          { name: '茯苓', dosage: '15g', special: '' },
          { name: '甘草', dosage: '6g', special: '炙' },
          { name: '薄荷', dosage: '6g', special: '后下' },
        ],
        decoctionMethod: '水煎服，每日 1 剂，分 2 次服用',
        dosageMethod: '早晚各 1 次，饭后服用',
        precautions: '保持心情舒畅，避免情志刺激',
      },
      explanation: `根据患者症状${patientInfoText}，${finalSymptoms}。${supplementaryText}辨证为肝郁脾虚证。治以疏肝解郁、健脾益气为法`,
      advice: '建议配合情志疏导，保持心情舒畅，避免过度劳累',
      referenceCases: [],
    };
    console.log('[TCM/Analyze] 分析结果已生成:', JSON.stringify(analysis, null, 2));

    currentStep = 'save_to_db';
    // 保存健康档案到数据库
    console.log('[TCM/Analyze] 开始保存健康档案...');
    console.log('[TCM/Analyze] finalMemberId:', finalMemberId);
    console.log('[TCM/Analyze] user.id:', user.id);

    const memberIdForRecord = finalMemberId || user.id;
    console.log('[TCM/Analyze] 使用的 memberId:', memberIdForRecord);

    // 使用 RPC 函数保存健康档案
    const { data: recordData, error: recordError } = await supabase.rpc(
      'create_health_record_with_transaction',
      {
        p_member_id: memberIdForRecord,
        p_consultant_id: user.id,
        p_visit_number: 1,
        p_chief_complaint: finalSymptoms,
        p_history: finalHistory || null,
        p_past_history: medicalHistory || null,
        p_analysis_result: null,
        p_differentiation: analysis.differentiation,
        p_treatment_principle: analysis.treatmentPrinciple,
        p_health_plan: JSON.stringify(analysis.prescription),
        p_advice: analysis.advice,
        p_status: 'active'
      }
    );

    console.log('[TCM/Analyze] RPC 返回结果:', { recordData, recordError });

    currentStep = 'handle_db_result';
    if (recordError) {
      console.error('[TCM/Analyze] 保存健康档案失败:', JSON.stringify(recordError, null, 2));
      // 返回数据库错误给前端
      return res.status(500).json({
        code: 500,
        msg: '保存健康档案失败',
        failedStep: 'save_to_db',
        errorDetail: recordError.message || JSON.stringify(recordError),
        errorCode: recordError.code || '',
        errorHint: recordError.hint || '',
        dbError: recordError,
        envCheck: {
          hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
          hasSupabaseKey: !!(process.env.SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        }
      });
    } else {
      console.log('[TCM/Analyze] 健康档案保存成功:', recordData);
      analysis.healthRecordId = recordData;
    }

    currentStep = 'return_response';
    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: analysis,
    });
  } catch (error: any) {
    console.error('==========================================');
    console.error('[TCM/Analyze] ========== 诊疗分析错误 ==========');
    console.error('失败步骤 (currentStep):', currentStep);
    console.error('错误信息:', error?.message || error);
    console.error('错误堆栈:', error?.stack || '无堆栈信息');
    console.error('==========================================');

    // 返回详细的错误信息给前端
    return res.status(500).json({
      code: 500,
      msg: '诊疗分析失败',
      failedStep: currentStep,
      errorDetail: error?.message || error?.toString() || '未知错误',
      errorStack: error?.stack || '',
      envCheck: {
        hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasSupabaseKey: !!(process.env.SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        urlValue: process.env.COZE_SUPABASE_URL ? '***已设置***' : '未设置',
        keyValue: process.env.COZE_SUPABASE_ANON_KEY ? '***已设置***' : '未设置'
      }
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticate(req, res);

  if (!user) {
    return; // authenticate 已经返回了错误响应
  }

  if (req.method === 'POST') {
    return analyze(req, res, user);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
