#!/bin/bash

# 敏感词批量修复脚本
# 将所有敏感词汇替换为合规术语

# 定义替换规则
REPLACE_RULES=(
  "s/patient_id/member_id/g"
  "s/patient/member/g"
  "s/Patient/Member/g"
  "s/PATIENT/MEMBER/g"
  "s/medical_history/health_history/g"
  "s/medicalHistory/healthHistory/g"
  "s/MEDICAL_HISTORY/HEALTH_HISTORY/g"
  "s/MedicalHistory/HealthHistory/g"
  "s/medical_record/health_record/g"
  "s/MedicalRecord/HealthRecord/g"
  "s/MEDICAL_RECORD/HEALTH_RECORD/g"
  "s/prescription/health_plan/g"
  "s/Prescription/HealthPlan/g"
  "s/PRESCRIPTION/HEALTH_PLAN/g"
  "s/prescriptionAdjustment/planAdjustment/g"
  "s/PrescriptionAdjustment/PlanAdjustment/g"
  "s/PRESCRIPTION_ADJUSTMENT/PLAN_ADJUSTMENT/g"
  "s/doctor_id/consultant_id/g"
  "s/doctorId/consultantId/g"
  "s/DoctorId/ConsultantId/g"
  "s/doctor/consultant/g"
  "s/Doctor/Consultant/g"
  "s/DOCTOR/CONSULTANT/g"
  "s/diagnosis/analysis_result/g"
  "s/Diagnosis/AnalysisResult/g"
  "s/DIAGNOSIS/ANALYSIS_RESULT/g"
  "s/abuse_detection/risk_monitoring/g"
  "s/AbuseDetection/RiskMonitoring/g"
  "s/ABUSE_DETECTION/RISK_MONITORING/g"
)

# 修复前端文件
find src/pages -name "*.tsx" -type f -exec sed -i '' "${REPLACE_RULES[@]}" {} \;

# 修复后端文件
find server/src -name "*.ts" -type f -exec sed -i '' "${REPLACE_RULES[@]}" {} \;

# 修复文档文件
find . -maxdepth 1 -name "*.md" -type f -exec sed -i '' "${REPLACE_RULES[@]}" {} \;
find docs -name "*.md" -type f -exec sed -i '' "${REPLACE_RULES[@]}" {} \;

echo "批量修复完成！"
