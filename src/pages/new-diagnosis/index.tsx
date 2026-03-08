import { View, Text, Input, Textarea, Button, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import './index.css'

// 患者类型
interface Patient {
  id: string
  name: string
  phone?: string
  createdAt?: string
}

// 诊疗步骤
type Step = 'select-patient' | 'chief-complaint' | 'supplement' | 'ai-inquiry' | 'result'

const NewDiagnosisPage = () => {
  const [currentStep, setCurrentStep] = useState<Step>('select-patient')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 患者列表
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')

  // 主诉信息
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [symptomDuration, setSymptomDuration] = useState('')
  const [symptomDescription, setSymptomDescription] = useState('')
  const [concurrentSymptoms, setConcurrentSymptoms] = useState('')
  const [possibleCause, setPossibleCause] = useState('')

  // 补充信息
  const [medicalHistory, setMedicalHistory] = useState('')
  const [allergyHistory, setAllergyHistory] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [familyHistory, setFamilyHistory] = useState('')

  // AI问询
  const [aiQuestions, setAiQuestions] = useState<string[]>([])
  const [aiAnswers, setAiAnswers] = useState<Record<number, string>>({})
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)

  // 结果
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // 步骤顺序
  const steps: { key: Step; title: string; icon: string }[] = [
    { key: 'select-patient', title: '选择患者', icon: '👤' },
    { key: 'chief-complaint', title: '主诉', icon: '📝' },
    { key: 'supplement', title: '补充信息', icon: '📋' },
    { key: 'ai-inquiry', title: 'AI问询', icon: '🤖' },
    { key: 'result', title: '方案', icon: '💊' }
  ]

  // 获取患者列表 - 使用 Network 模块自动处理认证
  const fetchPatients = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/patients',
        method: 'GET'
      })

      if (res.data && res.data.code === 200) {
        setPatients(res.data.data || [])
      } else {
        setError(res.data?.message || '获取患者列表失败')
      }
    } catch (err) {
      console.error('获取患者列表失败:', err)
      setError('获取患者列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始化加载
  useEffect(() => {
    fetchPatients()
  }, [])

  // 选择患者
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setCurrentStep('chief-complaint')
  }

  // 创建新患者 - 使用 Network 模块自动处理认证
  const handleCreatePatient = async () => {
    if (!newPatientName.trim()) {
      Taro.showToast({ title: '请输入患者姓名', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/patients',
        method: 'POST',
        data: {
          name: newPatientName,
          phone: newPatientPhone
        }
      })

      if (res.data && res.data.code === 200) {
        const newPatient = res.data.data
        setSelectedPatient(newPatient)
        Taro.showToast({ title: '创建成功', icon: 'success' })
        setShowNewPatient(false)
        setCurrentStep('chief-complaint')
      } else {
        Taro.showToast({ title: res.data?.message || '创建失败', icon: 'none' })
      }
    } catch (err) {
      console.error('创建患者失败:', err)
      Taro.showToast({ title: '创建失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 生成AI问题 - 使用 Network 模块自动处理认证
  const handleGenerateQuestions = async () => {
    if (!chiefComplaint.trim()) {
      Taro.showToast({ title: '请输入主诉内容', icon: 'none' })
      return
    }

    setIsGeneratingQuestions(true)
    try {
      const res = await Network.request({
        url: '/api/medical-ai/chat',
        method: 'POST',
        data: {
          message: `根据以下主诉生成5个针对性的问诊问题：${chiefComplaint}。请只返回问题，不要其他内容。`,
          patientId: selectedPatient?.id,
          context: {
            chiefComplaint,
            symptomDuration,
            symptomDescription,
            concurrentSymptoms,
            possibleCause,
            medicalHistory,
            allergyHistory,
            currentMedications,
            familyHistory
          }
        }
      })

      if (res.data && res.data.code === 200) {
        const content = res.data.data?.content || ''
        const questions = content.split('\n').filter((q: string) => q.trim().length > 5)
        setAiQuestions(questions.slice(0, 5))
        setCurrentStep('ai-inquiry')
      }
    } catch (err) {
      console.error('生成问题失败:', err)
      Taro.showToast({ title: '生成问题失败', icon: 'none' })
      // 即使失败也继续进入下一阶段
      setAiQuestions([
        '请描述您的症状具体感觉？',
        '症状持续多长时间了？',
        '有什么加重或缓解的因素？',
        '还有其他不适吗？',
        '既往有什么病史吗？'
      ])
      setCurrentStep('ai-inquiry')
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  // 提交诊疗分析 - 使用 Network 模块自动处理认证
  const handleSubmitAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const diagnosisData = {
        patientId: selectedPatient?.id,
        patientName: selectedPatient?.name,
        chiefComplaint,
        symptomDuration,
        symptomDescription,
        concurrentSymptoms,
        possibleCause,
        medicalHistory,
        allergyHistory,
        currentMedications,
        familyHistory,
        aiQuestions,
        aiAnswers,
        timestamp: new Date().toISOString()
      }

      const res = await Network.request({
        url: '/api/tcm/analyze',
        method: 'POST',
        data: diagnosisData
      })

      if (res.data && res.data.code === 200) {
        setDiagnosisResult(res.data.data)
        setCurrentStep('result')
        Taro.showToast({ title: '分析完成', icon: 'success' })
      } else {
        Taro.showToast({ title: res.data?.message || '分析失败', icon: 'none' })
      }
    } catch (err) {
      console.error('提交分析失败:', err)
      Taro.showToast({ title: '分析失败', icon: 'none' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 渲染步骤指示器
  const renderStepIndicator = () => (
    <View className="step-indicator">
      {steps.map((step, index) => {
        const stepIndex = steps.findIndex(s => s.key === currentStep)
        const isActive = step.key === currentStep
        const isCompleted = index < stepIndex

        return (
          <View
            key={step.key}
            className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => {
              if (isCompleted) {
                setCurrentStep(step.key)
              }
            }}
          >
            <View className="step-icon">{step.icon}</View>
            <View className="step-title">{step.title}</View>
          </View>
        )
      })}
    </View>
  )

  // 渲染选择患者步骤
  const renderSelectPatient = () => (
    <View className="step-content">
      <View className="section-title">选择患者</View>

      {loading ? (
        <View className="loading">加载中...</View>
      ) : (
        <>
          <View className="patient-list">
            {patients.map(patient => (
              <View
                key={patient.id}
                className="patient-item"
                onClick={() => handleSelectPatient(patient)}
              >
                <Text className="patient-name">{patient.name}</Text>
                {patient.phone && <Text className="patient-phone">{patient.phone}</Text>}
              </View>
            ))}
          </View>

          <View className="add-patient-btn" onClick={() => setShowNewPatient(true)}>
            <Text>+ 添加新患者</Text>
          </View>

          {showNewPatient && (
            <View className="new-patient-form">
              <View className="form-item">
                <Text className="label">姓名 *</Text>
                <Input
                  className="input"
                  value={newPatientName}
                  onInput={(e) => setNewPatientName(e.detail.value)}
                  placeholder="请输入患者姓名"
                />
              </View>
              <View className="form-item">
                <Text className="label">电话</Text>
                <Input
                  className="input"
                  value={newPatientPhone}
                  onInput={(e) => setNewPatientPhone(e.detail.value)}
                  placeholder="请输入联系电话（可选）"
                />
              </View>
              <View className="form-actions">
                <Button className="btn-cancel" onClick={() => setShowNewPatient(false)}>取消</Button>
                <Button className="btn-confirm" onClick={handleCreatePatient}>创建</Button>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  )

  // 渲染主诉步骤
  const renderChiefComplaint = () => (
    <View className="step-content">
      <View className="section-title">主诉</View>
      <View className="section-desc">请详细描述患者的主要症状和情况</View>

      <View className="form-item">
        <Text className="label">主要症状 *</Text>
        <Textarea
          className="textarea"
          value={chiefComplaint}
          onInput={(e) => setChiefComplaint(e.detail.value)}
          placeholder="例如：头痛、咳嗽、腹泻等"
          autoHeight
        />
      </View>

      <View className="form-item">
        <Text className="label">发病时间</Text>
        <Input
          className="input"
          value={symptomDuration}
          onInput={(e) => setSymptomDuration(e.detail.value)}
          placeholder="例如：3天、一周、一个月"
        />
      </View>

      <View className="form-item">
        <Text className="label">症状描述</Text>
        <Textarea
          className="textarea"
          value={symptomDescription}
          onInput={(e) => setSymptomDescription(e.detail.value)}
          placeholder="详细描述症状的具体表现"
          autoHeight
        />
      </View>

      <View className="form-item">
        <Text className="label">伴随症状</Text>
        <Textarea
          className="textarea"
          value={concurrentSymptoms}
          onInput={(e) => setConcurrentSymptoms(e.detail.value)}
          placeholder="是否有其他不适？"
          autoHeight
        />
      </View>

      <View className="form-item">
        <Text className="label">可能诱因</Text>
        <Input
          className="input"
          value={possibleCause}
          onInput={(e) => setPossibleCause(e.detail.value)}
          placeholder="如：受凉、饮食不当、劳累等"
        />
      </View>

      <View className="btn-group">
        <Button className="btn-prev" onClick={() => setCurrentStep('select-patient')}>上一步</Button>
        <Button className="btn-next" onClick={() => setCurrentStep('supplement')}>下一步</Button>
      </View>
    </View>
  )

  // 渲染补充信息步骤
  const renderSupplement = () => (
    <View className="step-content">
      <View className="section-title">补充信息</View>
      <View className="section-desc">以下信息有助于更准确的诊断（选填）</View>

      <View className="form-item">
        <Text className="label">既往病史</Text>
        <Textarea
          className="textarea"
          value={medicalHistory}
          onInput={(e) => setMedicalHistory(e.detail.value)}
          placeholder="如：高血压、糖尿病等"
          autoHeight
        />
      </View>

      <View className="form-item">
        <Text className="label">过敏史</Text>
        <Input
          className="input"
          value={allergyHistory}
          onInput={(e) => setAllergyHistory(e.detail.value)}
          placeholder="如：青霉素过敏"
        />
      </View>

      <View className="form-item">
        <Text className="label">当前用药</Text>
        <Textarea
          className="textarea"
          value={currentMedications}
          onInput={(e) => setCurrentMedications(e.detail.value)}
          placeholder="当前正在服用的药物"
          autoHeight
        />
      </View>

      <View className="form-item">
        <Text className="label">家族史</Text>
        <Textarea
          className="textarea"
          value={familyHistory}
          onInput={(e) => setFamilyHistory(e.detail.value)}
          placeholder="家族中是否有类似病史"
          autoHeight
        />
      </View>

      <View className="btn-group">
        <Button className="btn-prev" onClick={() => setCurrentStep('chief-complaint')}>上一步</Button>
        <Button className="btn-next" onClick={handleGenerateQuestions}>
          {isGeneratingQuestions ? '生成中...' : '生成AI问询'}
        </Button>
      </View>
    </View>
  )

  // 渲染AI问询步骤
  const renderAIInquiry = () => (
    <View className="step-content">
      <View className="section-title">AI智能问询</View>
      <View className="section-desc">请回答以下问题以帮助AI更准确地进行辨证论治</View>

      <View className="questions-list">
        {aiQuestions.map((question, index) => (
          <View key={index} className="question-item">
            <View className="question-text">Q{index + 1}: {question}</View>
            <Textarea
              className="answer-textarea"
              value={aiAnswers[index] || ''}
              onInput={(e) => setAiAnswers({ ...aiAnswers, [index]: e.detail.value })}
              placeholder="请输入您的回答..."
              autoHeight
            />
          </View>
        ))}
      </View>

      <View className="btn-group">
        <Button className="btn-prev" onClick={() => setCurrentStep('supplement')}>上一步</Button>
        <Button className="btn-submit" onClick={handleSubmitAnalysis}>
          {isAnalyzing ? '分析中...' : '提交分析'}
        </Button>
      </View>
    </View>
  )

  // 渲染结果步骤
  const renderResult = () => (
    <View className="step-content">
      <View className="section-title">辨证论治方案</View>

      {diagnosisResult ? (
        <ScrollView className="result-scroll" scrollY>
          <View className="diagnosis-result">
            <View className="result-section">
              <Text className="result-label">诊断：</Text>
              <Text className="result-value">{diagnosisResult.diagnosis || diagnosisResult.differentiation || '待生成'}</Text>
            </View>

            <View className="result-section">
              <Text className="result-label">辨证：</Text>
              <Text className="result-value">{diagnosisResult.differentiation || '待生成'}</Text>
            </View>

            <View className="result-section">
              <Text className="result-label">治则：</Text>
              <Text className="result-value">{diagnosisResult.treatmentPrinciple || '待生成'}</Text>
            </View>

            {diagnosisResult.prescription && (
              <View className="result-section">
                <Text className="result-label">方剂：</Text>
                <Text className="result-value">{diagnosisResult.prescription.formulaName || '待生成'}</Text>
                {diagnosisResult.prescription.ingredients && (
                  <View className="ingredients-list">
                    {diagnosisResult.prescription.ingredients.map((ing: any, idx: number) => (
                      <Text key={idx} className="ingredient-item">
                        {ing.name} {ing.dosage}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View className="result-section">
              <Text className="result-label">医嘱：</Text>
              <Text className="result-value">{diagnosisResult.advice || diagnosisResult.explanation || '待生成'}</Text>
            </View>
          </View>

          <View className="action-buttons">
            <Button className="btn-save" onClick={async () => {
              console.log('=== [DEBUG] 1. 按钮点击事件触发 ===')
              console.log('=== [DEBUG] selectedPatient:', selectedPatient)
              console.log('=== [DEBUG] chiefComplaint:', chiefComplaint)

              if (!diagnosisResult) {
                console.log('=== [DEBUG] 2. diagnosisResult 为空，退出 ===')
                Taro.showToast({ title: '没有可保存的内容', icon: 'none' })
                return
              }

              console.log('=== [DEBUG] 3. 开始组装数据 ===')
              const dataToSave = {
                memberId: selectedPatient?.id,
                chiefComplaint: chiefComplaint,
                history: JSON.stringify({
                  symptomDuration,
                  symptomDescription,
                  concurrentSymptoms,
                  possibleCause,
                  medicalHistory,
                  allergyHistory,
                  currentMedications,
                  familyHistory,
                  aiQuestions,
                  aiAnswers
                }),
                analysisResult: JSON.stringify(diagnosisResult),
                differentiation: diagnosisResult.differentiation,
                treatmentPrinciple: diagnosisResult.treatmentPrinciple,
                healthPlan: JSON.stringify(diagnosisResult.prescription),
                advice: diagnosisResult.advice
              }
              console.log('=== [DEBUG] 4. 准备发送的数据:', JSON.stringify(dataToSave))

              Taro.showLoading({ title: '保存中...' })

              try {
                console.log('=== [DEBUG] 5. 开始调用 API ===')
                const apiUrl = '/api/health-records'
                console.log('=== [DEBUG] 6. 请求地址:', apiUrl)

                const res = await Network.request({
                  url: apiUrl,
                  method: 'POST',
                  data: dataToSave
                })

                console.log('=== [DEBUG] 7. API 返回结果:', res)
                console.log('=== [DEBUG] 8. 状态码:', res.statusCode)

                Taro.hideLoading()

                if (res.data && res.data.code === 200) {
                  console.log('=== [DEBUG] 9. 保存成功 ===')
                  Taro.showToast({ title: '保存成功', icon: 'success' })
                } else {
                  console.log('=== [DEBUG] 10. 保存失败，错误信息:', res.data?.message)
                  Taro.showToast({ title: res.data?.message || '保存失败', icon: 'none' })
                }
              } catch (err: any) {
                Taro.hideLoading()

                // ========== 详细错误调试开始 ==========
                console.error('========================================');
                console.error('=== [病历保存失败 - 详细调试信息] ===');
                console.error('========================================');

                // 1. 打印完整的错误对象
                console.error('完整错误对象:', err);
                console.error('错误JSON:', JSON.stringify(err, null, 2));

                // 2. 打印错误类型
                console.error('错误类型:', err.constructor.name);
                console.error('错误消息:', err.message);

                // 3. 如果有响应对象，打印响应详情
                if (err.response) {
                  console.error('--- 响应对象 ---');
                  console.error('响应状态:', err.response.status);
                  console.error('响应状态文本:', err.response.statusText);
                  console.error('响应头:', err.response.headers);
                  console.error('响应数据:', err.response.data);
                  console.error('响应数据JSON:', JSON.stringify(err.response.data, null, 2));

                  // 尝试解析后端返回的错误信息
                  try {
                    const errorData = typeof err.response.data === 'string'
                      ? JSON.parse(err.response.data)
                      : err.response.data;
                    console.error('解析后的错误数据:', errorData);
                    console.error('解析后的错误数据JSON:', JSON.stringify(errorData, null, 2));

                    // 弹窗显示后端返回的错误信息
                    const errorMsg = errorData?.msg || errorData?.error || errorData?.message || errorData?.fullError || JSON.stringify(errorData);
                    Taro.showModal({
                      title: '保存失败',
                      content: `后端错误: ${errorMsg}`,
                      showCancel: false
                    });
                  } catch (parseErr) {
                    console.error('解析响应数据失败:', parseErr);
                    Taro.showModal({
                      title: '保存失败',
                      content: `错误: ${err.message}\n响应: ${err.response.data}`,
                      showCancel: false
                    });
                  }
                } else if (err.request) {
                  // 4. 如果有请求对象但没有响应（网络错误）
                  console.error('--- 请求对象（无响应）---');
                  console.error('请求信息:', err.request);
                  console.error('请求信息JSON:', JSON.stringify(err.request, null, 2));
                  console.error('这通常意味着网络请求没有到达服务器');

                  Taro.showModal({
                    title: '保存失败',
                    content: `网络错误: 请求已发出但没有收到响应\n错误: ${err.message}`,
                    showCancel: false
                  });
                } else {
                  // 5. 其他错误
                  console.error('--- 其他错误 ---');
                  console.error('其他错误JSON:', JSON.stringify(err, null, 2));
                  Taro.showModal({
                    title: '保存失败',
                    content: `错误: ${err.message || JSON.stringify(err)}`,
                    showCancel: false
                  });
                }

                // 6. 打印堆栈信息
                if (err.stack) {
                  console.error('错误堆栈:', err.stack);
                }

                console.error('========================================');
                console.error('=== [调试信息结束] ===');
                console.error('========================================');
                // ========== 详细错误调试结束 ==========
              }
            }}>保存到病历</Button>
            <Button className="btn-restart" onClick={() => {
              setCurrentStep('select-patient')
              setSelectedPatient(null)
              setChiefComplaint('')
              setDiagnosisResult(null)
            }}>重新诊疗</Button>
          </View>
        </ScrollView>
      ) : (
        <View className="no-result">暂无分析结果</View>
      )}
    </View>
  )

  return (
    <View className="new-diagnosis-page">
      {renderStepIndicator()}

      {currentStep === 'select-patient' && renderSelectPatient()}
      {currentStep === 'chief-complaint' && renderChiefComplaint()}
      {currentStep === 'supplement' && renderSupplement()}
      {currentStep === 'ai-inquiry' && renderAIInquiry()}
      {currentStep === 'result' && renderResult()}

      {error && <View className="error-msg">{error}</View>}
    </View>
  )
}

export default NewDiagnosisPage
