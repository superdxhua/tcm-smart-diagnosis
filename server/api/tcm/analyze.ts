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
  console.log('[TCM/Analyze] 收到请求, user:', user?.id);
  console.log('[TCM/Analyze] 请求体:', JSON.stringify(req.body, null, 2));

  try {
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

    // 统一提取关键信息
    const finalMemberId = patientId || memberId;
    const finalSymptoms = chiefComplaint || symptoms || '';
    const finalHistory = aiInquiry || history || '';
    const medicalHistory = supplementaryInfo?.medicalHistory || '';
    const allergyHistory = supplementaryInfo?.allergyHistory || '';
    const medicationHistory = supplementaryInfo?.medicationHistory || '';

    if (!finalSymptoms) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '缺少症状信息',
      });
    }

    const supabase = getSupabaseClient();

    // 构建详细的问诊信息
    const patientInfoText = patientInfo ?
      `患者信息：${patientInfo.name}，${patientInfo.gender}，${patientInfo.age}岁` : '';

    const supplementaryText = [
      medicalHistory ? `既往病史：${medicalHistory}` : '',
      allergyHistory ? `过敏史：${allergyHistory}` : '',
      medicationHistory ? `用药史：${medicationHistory}` : '',
    ].filter(Boolean).join('；');

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

    // 保存健康档案到数据库
    console.log('[TCM/Analyze] 开始保存健康档案...');
    try {
      const memberIdForRecord = finalMemberId || user.id;
      console.log('[TCM/Analyze] 使用的 memberId:', memberIdForRecord);

      // 使用 RPC 函数保存健康档案
      const { data: recordData, error: recordError } = await supabase.rpc(
        'create_health_record_with_transaction',
        {
          p_member_id: memberIdForRecord,
          p_consultant_id: user.id,
          p_chief_complaint: finalSymptoms,
          p_history: finalHistory,
          p_past_history: medicalHistory,
          p_differentiation: analysis.differentiation,
          p_treatment_principle: analysis.treatmentPrinciple,
          p_health_plan: JSON.stringify(analysis.prescription),
          p_advice: analysis.advice
        }
      );

      console.log('[TCM/Analyze] RPC 返回结果:', { recordData, recordError });

      if (recordError) {
        console.error('[TCM/Analyze] 保存健康档案失败:', JSON.stringify(recordError, null, 2));
        // 继续返回分析结果，不阻断流程
      } else {
        console.log('[TCM/Analyze] 健康档案保存成功:', recordData);
        analysis.healthRecordId = recordData;
      }
    } catch (saveError: any) {
      console.error('[TCM/Analyze] 保存健康档案异常:', JSON.stringify(saveError, null, 2));
      // 继续返回分析结果，不阻断流程
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: analysis,
    });
  } catch (error: any) {
    console.error('[TCM/Analyze] Unexpected error:', JSON.stringify(error, null, 2));
    const errorMessage = error?.message || error?.error?.message || '服务器错误';
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: errorMessage,
      details: error?.toString(),
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
