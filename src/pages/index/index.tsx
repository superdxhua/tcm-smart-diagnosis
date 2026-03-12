import { View, Text, Textarea, Input, ScrollView } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import {
  generateCompleteRiskWarning,
  type ToxicHerb,
  type IncompatibilityResult,
  type PregnancyContraindicationResult
} from '@/utils/toxic-herb-control'
import ToxicHerbWarning from '@/components/ToxicHerbWarning'
import { ResponsiveContainer, DesktopOnly } from '@/components/ResponsiveLayout'
import { useDevice } from '@/utils/device'
import './index.css'

interface Ingredient {
  name: string
  dosage: string
  special: string
}

interface ReferenceCase {
  id: string
  doctorName: string
  doctorEra: string
  prescriptionName: string
  diagnosis: string
  differentiation: string
  effectivenessScore: number
  matchScore: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TreatmentPlan {
  diagnosis: string
  differentiation: string
  treatmentPrinciple: string
  symptomAnalysis?: string
  prescription: {
    formulaName: string
    ingredients: Ingredient[]
    decoctionMethod: string
    dosageMethod: string
    precautions: string
    source?: string
    explanation?: string
    advice?: string
    highRiskInfo?: {
      isHighRisk: boolean
      reason: string
      ingredients: string[]
    }
  }
  explanation: string
  advice: string
  warnings?: string[] // 警告信息（审核状态、特殊人群等）
  referenceCases?: ReferenceCase[]
  prescriptionSource?: string
  prescriptionDecision?: {
    primarySource: string
    decisionReason: string
    topMatchScore: number
    hasConflict: boolean
    conflictDetails?: string
  }
}

const IndexPage = () => {
  // 🔴 域名检测：仅在访问主域名（不带 www）时才显示官网页面
  // 注意：www.zhongyihskhealth.com 是子域名，应该正常显示系统功能
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  console.log('=== 域名检测 ===');
  console.log('hostname:', hostname);
  console.log('hostname类型:', typeof hostname);
  console.log('window.location:', typeof window !== 'undefined' ? JSON.stringify({ hostname: window.location.hostname, href: window.location.href }) : 'undefined');

  // 设备检测
  const { isMobile, isDesktop } = useDevice()

  // UI 状态
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TreatmentPlan | null>(null)

  // 表单状态
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [history, setHistory] = useState('')
  const [pastHistory, setPastHistory] = useState('')

  // 用户选择状态
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  // 处方编辑状态
  const [editMode, setEditMode] = useState(false)
  const [editedIngredients, setEditedIngredients] = useState<Ingredient[]>([])
  const [highRiskInfo, setHighRiskInfo] = useState<any>(null)

  // 风控相关状态
  const [toxicHerbs, setToxicHerbs] = useState<Array<ToxicHerb & { currentDosage: string; dosageExceeded: boolean }>>([])
  const [riskWarning, setRiskWarning] = useState<any>(null)
  const [incompatibilities, setIncompatibilities] = useState<IncompatibilityResult | undefined>(undefined)
  const [pregnancyContraindications, setPregnancyContraindications] = useState<PregnancyContraindicationResult | undefined>(undefined)
  const [showToxicWarning, setShowToxicWarning] = useState(false)
  const [hasConfirmedToxicWarning, setHasConfirmedToxicWarning] = useState(false)

  // 复诊分析状态
  const [followUpAnalysis, setFollowUpAnalysis] = useState<any>(null)
  const [showFollowUpAnalysis, setShowFollowUpAnalysis] = useState(false)

  // 新增药物
  const [newDrugName, setNewDrugName] = useState('')
  const [newDrugDosage, setNewDrugDosage] = useState('')
  const [newDrugSpecial, setNewDrugSpecial] = useState('')

  // 购买服务相关状态
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [packages, setPackages] = useState<any[]>([])

  // 附件上传相关状态
  const [attachments, setAttachments] = useState<Array<{
    id: string
    url: string
    type: string
    name: string
  }>>([])
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('wechat')
  const [orderLoading, setOrderLoading] = useState(false)
  const [isSelectingPackage, setIsSelectingPackage] = useState(false) // 添加套餐选择确认状态

  // 五步健康咨询流程相关状态
  const [currentStep, setCurrentStep] = useState(1) // 当前步骤：1-5
  const [aiInquiryMessages, setAiInquiryMessages] = useState<Array<{ role: string; content: string }>>([]) // AI问询对话历史
  const [isAiInquiring, setIsAiInquiring] = useState(false) // AI问询中状态
  const [inquiryInput, setInquiryInput] = useState('') // 用户输入的回答

  // 获取套餐列表
  const fetchPackages = useCallback(async () => {
    try {
      console.log('=== 开始获取套餐列表 ===')

      const res = await Network.request({
        url: '/api/packages/active',
        method: 'GET'
      })

      console.log('=== 套餐列表完整响应 ===', res)
      console.log('statusCode:', res.statusCode)
      console.log('res.data:', res.data)
      console.log('res.data type:', typeof res.data)

      // 检查响应结构
      if (!res || !res.data) {
        console.error('响应为空')
        setPackages([])
        return
      }

      // 尝试解析响应
      let responseData = res.data

      // 如果 res.data 是字符串，尝试解析
      if (typeof res.data === 'string') {
        try {
          responseData = JSON.parse(res.data)
          console.log('解析后的数据:', responseData)
        } catch (e) {
          console.error('JSON 解析失败:', e)
          setPackages([])
          return
        }
      }

      // 检查 code 字段
      if (responseData.code === 200) {
        const packageList = responseData.data || []
        console.log('=== 设置套餐列表 ===', packageList)
        setPackages(packageList)
      } else {
        console.error('=== 获取套餐列表失败 ===', '响应格式错误，code:', responseData.code)
        Taro.showToast({
          title: '获取套餐列表失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('=== 获取套餐列表异常 ===', err)
      Taro.showToast({
        title: '获取套餐列表失败',
        icon: 'none'
      })
    }
  }, [])

  // 复诊分析函数
  const analyzeFollowUp = useCallback(async (patient: any) => {
    try {
      console.log('开始复诊分析，用户ID:', patient.id)

      // 检查用户是否复诊（visit_count > 1）
      if (patient.visit_count <= 1) {
        console.log('用户初次就诊，跳过复诊分析')
        setFollowUpAnalysis(null)
        setShowFollowUpAnalysis(false)
        return
      }

      setLoading(true)

      const res = await Network.request({
        url: '/api/health-records/analyze-followup', // 使用正确的 API 路径
        method: 'POST',
        data: {
          memberId: patient.id, // 统一使用 memberId（与后端 members 表一致）
          currentSymptoms: chiefComplaint || history || '用户复诊，查看既往治疗效果'
        }
      })

      console.log('复诊分析结果:', res.data)

      if (res.statusCode === 200 && res.data.data) {
        setFollowUpAnalysis(res.data.data)

        // 如果存在未解决问题，显示复诊分析
        if (res.data.data.unresolvedIssues && res.data.data.unresolvedIssues.length > 0) {
          setShowFollowUpAnalysis(true)
          Taro.showModal({
            title: '复诊分析',
            content: `检测到${res.data.data.unresolvedIssues.length}个未解决问题，已为您生成优化方案`,
            showCancel: false
          })
        } else {
          setShowFollowUpAnalysis(false)
        }
      } else {
        console.log('复诊分析失败或无数据')
        setFollowUpAnalysis(null)
        setShowFollowUpAnalysis(false)
      }
    } catch (err) {
      console.error('复诊分析失败:', err)
      // 复诊分析失败不影响正常流程，静默处理
      setFollowUpAnalysis(null)
      setShowFollowUpAnalysis(false)
    } finally {
      setLoading(false)
    }
  }, [chiefComplaint, history])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // 🔴 域名检测：仅在访问主域名（不带 www）时才跳转到官网页面
    // www.zhongyihskhealth.com 和其他子域名应正常显示系统功能
    console.log('=== 域名检测（useEffect） ===');
    console.log('hostname:', hostname);

    // 仅在主域名（zhongyihskhealth.com，不带 www）时跳转到官网页面
    if (hostname === 'zhongyihskhealth.com') {
      console.log('✅ 检测到主域名（zhongyihskhealth.com），跳转到官网页面');
      Taro.reLaunch({
        url: '/pages/official/index'
      })
      return
    }

    console.log('✅ 检测到子域名或本地环境，正常显示系统功能');
    console.log('✅ 当前域名:', hostname);

    const token = Taro.getStorageSync('token')
    const savedUser = Taro.getStorageSync('user')

    if (token && savedUser) {
      setUser(savedUser)
      setIsAuthenticated(true)

      // 检查用户权限是否过期（仅普通用户）
      if (savedUser.role !== 'admin' && savedUser.expiresAt) {
        const now = new Date()
        const expiresAt = new Date(savedUser.expiresAt)

        if (now > expiresAt) {
          console.log('用户权限已过期')
          // 显示过期提示，但不跳转登录页
          Taro.showModal({
            title: '授权已过期',
            content: '您的账户授权已过期，请充值后继续使用',
            confirmText: '立即购买',
            cancelText: '稍后再说',
            success: (res) => {
              if (res.confirm) {
                // 打开套餐选择弹窗
                setTimeout(() => {
                  handleOpenPackageModal()
                }, 500)
              }
            }
          })
          return
        }
      }
    } else {
      // 跳转到登录页
      Taro.redirectTo({
        url: '/pages/login/index',
      })
      return
    }

    // 检查是否从病历页面跳转过来，需要自动启动健康咨询
    const params = Taro.getCurrentInstance().router?.params
    if (params?.autoStart === 'true') {
      console.log('=== 自动启动健康咨询模式 ===')
      console.log('参数:', params)

      const loadPatientAndStartDiagnosis = async () => {
        try {
          setLoading(true)
          setError('')

          // 根据 memberId 加载用户信息（统一使用 memberId，兼容 patientId）
          const memberId = params.memberId || params.patientId

          if (memberId) {
            const res = await Network.request({
              url: `/api/members/${memberId}`,
              method: 'GET'
            })

            if (res.statusCode === 200 && res.data.data) {
              setSelectedPatient(res.data.data)
              console.log('用户信息已加载:', res.data.data)
            }
          }

          // 自动填写主诉和症状
          if (params.chiefComplaint) {
            setChiefComplaint(decodeURIComponent(params.chiefComplaint))
          }
          if (params.symptoms) {
            setHistory(decodeURIComponent(params.symptoms))
          }

          // 等待状态更新后自动触发生成健康方案
          setTimeout(() => {
            // 滚动到生成按钮位置
            // 自动调用生成健康方案（但需要用户手动点击确认，避免误操作）
            Taro.showToast({
              title: '已自动填写信息，请点击获取健康方案',
              icon: 'success',
              duration: 2500
            })
            setLoading(false)
          }, 1000)
        } catch (loadError) {
          console.error('加载用户信息失败:', loadError)
          setError('加载用户信息失败')
          Taro.showToast({
            title: '加载失败',
            icon: 'none'
          })
          setLoading(false)
        }
      }

      loadPatientAndStartDiagnosis()
    }

    // 监听用户选择事件
    const handlePatientSelected = (patient: any) => {
      console.log('用户被选择:', patient)
      setSelectedPatient(patient)
      // 复诊分析
      analyzeFollowUp(patient)
    }

    // 监听用户创建事件
    const handlePatientCreated = (patient: any) => {
      console.log('用户被创建:', patient)
      setSelectedPatient(patient)
      // 新用户不需要复诊分析
      setFollowUpAnalysis(null)
      setShowFollowUpAnalysis(false)
    }

    Taro.eventCenter.on('patientSelected', handlePatientSelected)
    Taro.eventCenter.on('patientCreated', handlePatientCreated)

    // 清理事件监听器
    return () => {
      Taro.eventCenter.off('patientSelected', handlePatientSelected)
      Taro.eventCenter.off('patientCreated', handlePatientCreated)
    }
  }, [analyzeFollowUp]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('user')
    Taro.redirectTo({
      url: '/pages/login/index',
    })
  }

  // 显示 PWA 安装指南
  const handleShowPWAInstallGuide = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)

    let title = '添加到主屏幕'
    let content = ''

    if (isIOS) {
      title = 'iOS 用户安装指南'
      content = '1. 点击底部的"分享"按钮（方框向上箭头）\n2. 向下滚动，找到"添加到主屏幕"\n3. 点击"添加"按钮\n\n添加后可以像小程序一样使用！'
    } else if (isAndroid) {
      title = 'Android 用户安装指南'
      content = '1. 点击右上角的菜单按钮（三个点）\n2. 选择"添加到主屏幕"或"安装应用"\n3. 点击"添加"或"安装"按钮\n\n添加后可以像小程序一样使用！'
    } else {
      title = '添加到主屏幕'
      content = '1. 点击地址栏右侧的"安装应用"图标\n2. 点击"安装"按钮\n\n添加后可以像小程序一样使用！'
    }

    Taro.showModal({
      title,
      content,
      confirmText: '我知道了',
      showCancel: false,
    })
  }

  const handleGoToAdmin = () => {
    Taro.navigateTo({
      url: '/pages/admin/index',
    })
  }

  // 选择并上传图片
  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        const tempFilePath = res.tempFilePaths[0]
        await handleUploadImage(tempFilePath)
      }
    } catch (err) {
      console.error('选择图片失败:', err)
      Taro.showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  }

  // 上传图片到后端
  const handleUploadImage = async (filePath: string) => {
    setIsUploading(true)
    setError('')

    try {
      // 使用 Network.uploadFile 上传图片
      const uploadRes = await Network.uploadFile({
        url: '/api/medical-ai/upload-attachment',
        filePath: filePath,
        name: 'file',
        header: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('上传响应:', uploadRes)

      if (uploadRes.statusCode === 200 && uploadRes.data) {
        const data = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data

        if (data.code === 200) {
          // 上传成功，添加到附件列表
          const newAttachment = {
            id: Date.now().toString(),
            url: data.data.url,
            type: data.data.type || 'image',
            name: data.data.name || '未命名附件'
          }
          setAttachments([...attachments, newAttachment])

          // 立即分析附件
          await handleAnalyzeAttachment(data.data.url)

          Taro.showToast({
            title: '上传成功',
            icon: 'success'
          })
        } else {
          throw new Error(data.msg || '上传失败')
        }
      } else {
        throw new Error('上传失败')
      }
    } catch (err: any) {
      console.error('上传图片失败:', err)
      setError(err.message || '上传失败')
      Taro.showToast({
        title: err.message || '上传失败',
        icon: 'none'
      })
    } finally {
      setIsUploading(false)
    }
  }

  // 分析附件内容
  const handleAnalyzeAttachment = async (imageUrl: string) => {
    setIsAnalyzing(true)
    setError('')

    try {
      const res = await Network.request({
        url: '/api/medical-ai/analyze-attachment',
        method: 'POST',
        data: {
          imageUrl: imageUrl
        }
      })

      console.log('分析响应:', res)

      if (res.statusCode === 200 && res.data && res.data.data) {
        // 将分析结果作为补充信息
        const extractedInfo = res.data.data.extractedInfo || res.data.data.summary || res.data.data.content
        if (extractedInfo) {
          setAdditionalInfo(extractedInfo)
          Taro.showToast({
            title: '分析完成',
            icon: 'success'
          })
        }
      } else {
        throw new Error('分析失败')
      }
    } catch (err: any) {
      console.error('分析附件失败:', err)
      setError(err.message || '分析失败')
      Taro.showToast({
        title: err.message || '分析失败',
        icon: 'none'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 删除附件
  const handleRemoveAttachment = (attachmentId: string) => {
    const newAttachments = attachments.filter(a => a.id !== attachmentId)
    setAttachments(newAttachments)

    // 如果删除了所有附件，清空补充信息
    if (newAttachments.length === 0) {
      setAdditionalInfo('')
    }
  }

  const handleSelectPatient = () => {
    Taro.navigateTo({
      url: '/pages/patients-list/index?selectMode=true'
    })
  }

  const handleAddPatient = () => {
    Taro.navigateTo({
      url: '/pages/patient-detail/index'
    })
  }

  const handleChangePatient = () => {
    setSelectedPatient(null)
  }

  const handleGoBack = () => {
    // 清除结果，返回到填写表单的状态
    setResult(null)
    setEditMode(false)
    setEditedIngredients([])
    setNewDrugName('')
    setNewDrugDosage('')
    setNewDrugSpecial('')
    setHighRiskInfo(null)
  }

  if (!isAuthenticated) {
    return (
      <View className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <View className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
          <View className="flex flex-col items-center justify-center mb-4">
            <Text className="text-6xl mb-4">🏥</Text>
            <Text className="block text-2xl font-bold text-teal-600 mb-2">
              中医智能好帮手
            </Text>
            <Text className="block text-gray-500 text-center">
              正在为您加载个性化服务...
            </Text>
          </View>
          <View className="mt-6 flex justify-center">
            <View className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></View>
          </View>
        </View>
      </View>
    )
  }


  const handleEditToggle = () => {
    setEditMode(!editMode)
    if (!editMode && result) {
      setEditedIngredients([...result.prescription.ingredients])
    }
  }

  const handleAddDrug = () => {
    if (!newDrugName.trim()) {
      setError('请输入药物名称')
      return
    }
    if (!newDrugDosage.trim()) {
      setError('请输入剂量')
      return
    }

    setEditedIngredients([
      ...editedIngredients,
      {
        name: newDrugName,
        dosage: newDrugDosage,
        special: newDrugSpecial
      }
    ])

    setNewDrugName('')
    setNewDrugDosage('')
    setNewDrugSpecial('')
    setError('')
  }

  const handleDeleteDrug = (index: number) => {
    const newIngredients = [...editedIngredients]
    newIngredients.splice(index, 1)
    setEditedIngredients(newIngredients)
  }

  const handleSaveEdit = () => {
    if (!result) return

    // 更新处方
    const updatedResult = {
      ...result,
      prescription: {
        ...result.prescription,
        ingredients: editedIngredients
      }
    }

    setResult(updatedResult)

    // 重新检测风控（包含有毒有害中药材、配伍禁忌和妊娠禁忌）
    console.log('重新检测风控...')
    const comprehensiveResult = generateCompleteRiskWarning(editedIngredients, {
      age: selectedPatient?.age,
      gender: selectedPatient?.gender,
      isPregnant: selectedPatient?.isPregnant,
      healthCondition: selectedPatient?.healthCondition
    })
    console.log('更新后的风控检测结果:', comprehensiveResult)

    setToxicHerbs(comprehensiveResult.toxicHerbs)
    setIncompatibilities(comprehensiveResult.incompatibilities)
    setPregnancyContraindications(comprehensiveResult.pregnancyContraindications)
    setRiskWarning({
      riskLevel: comprehensiveResult.riskLevel,
      warningMessage: comprehensiveResult.warningMessage
    })

    // 如果检测到新的风险，显示风控提醒
    const hasRisk = comprehensiveResult.toxicHerbs.length > 0
      || comprehensiveResult.incompatibilities.hasIncompatibility
      || comprehensiveResult.pregnancyContraindications.hasContraindication

    if (hasRisk) {
      setShowToxicWarning(true)
      setHasConfirmedToxicWarning(false)

      if (comprehensiveResult.riskLevel === 'severe' || comprehensiveResult.riskLevel === 'high') {
        Taro.showModal({
          title: '健康建议修改后检测到风险',
          content: comprehensiveResult.warningMessage,
          confirmText: '我已了解',
          showCancel: false
        })
      }
    } else {
      setShowToxicWarning(false)
      setHasConfirmedToxicWarning(true)
    }

    setEditMode(false)
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    if (result) {
      setEditedIngredients([...result.prescription.ingredients])
    }
  }

  const handleReturnHome = () => {
    Taro.reLaunch({
      url: '/pages/index/index'
    })
  }

  // 五步健康咨询流程：步骤导航
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 第四步：开始 AI 智能问询
  const handleStartAiInquiry = async () => {
    setIsAiInquiring(true)
    setAiInquiryMessages([]) // 清空对话历史

    try {
      // 查询医案参考信息
      let caseReference = ''
      try {
        const caseRes = await Network.request({
          url: '/api/medical-cases/inquiry-reference',
          method: 'POST',
          data: {
            symptoms: chiefComplaint,
            limit: 3
          }
        })

        if (caseRes.statusCode === 200 && caseRes.data.data?.cases?.length > 0) {
          const cases = caseRes.data.data.cases
          caseReference = `
【经典医案参考】：
${cases.map((c: any, i: number) => `
${i + 1}. ${c.doctorName}（${c.doctorEra}）- 匹配度 ${(c.similarity * 100).toFixed(0)}%
   主诉：${c.mainSymptoms}
   诊断：${c.diagnosis}
   辨证：${c.differentiation || '未记录'}
   治则：${c.treatmentPrinciple || '未记录'}
   相似原因：${c.reason || '基于关键词匹配'}
`).join('\n')}

提示：参考这些经典医案的问询思路，提出更有针对性的问题。
`
        }
      } catch (err) {
        console.error('查询医案参考失败', err)
        // 医案查询失败不影响问询流程
      }

      // 构建 system 消息，设置 AI 的角色、用户信息和问询策略
      const systemMessage = `你是一位经验丰富的中医专家，正在为用户进行问询。

【用户基本信息】：
- 姓名：${selectedPatient?.name || '未知'}
- 性别：${selectedPatient?.gender || '未知'}
- 年龄：${selectedPatient?.age || '未知'}岁

【主诉】：
${chiefComplaint}

【既往史】：
${pastHistory || '无'}

${additionalInfo ? `【补充信息（来自上传的文档）】：
${additionalInfo}` : ''}

${caseReference}

【问询目标】：
通过问询收集足够的信息，为用户提供准确的中医辨证和调理方案。问询是为了明确调理方案的路径，而不是机械地问完预设的问题。

【需要收集的关键信息】：
1. 症状特点：疼痛性质（刺痛、胀痛、隐痛）、部位、程度、发作时间、持续时间
2. 发病诱因：受凉、劳累、情志、饮食、外感等因素
3. 伴随症状：发热、汗出、口渴、口苦、二便情况、睡眠、食欲等
4. 舌象脉象：舌质颜色、舌苔情况、脉象特征
5. 既往调理情况：是否用过药物、调理效果如何

【问询规则】（必须严格遵守）：
1. **逐个问询**：每次只提出一个问题，等待用户回答
2. **🚨 禁止重复**：记住已经问过的问题，严格禁止重复询问相同或相似的问题
3. **根据回答调整**：根据用户的回答，决定下一个问什么问题，不要按固定顺序
4. **问询上限**：最多问 10 个问题，不要无限制问询
5. **及时结束**：当收集到足够的信息能够辨证时，立即结束问询

【🚨 防止重复问询的关键策略】：
- 在提问前，先回顾之前的对话历史，确认是否已经问过类似问题
- 如果之前已经询问过"疼痛部位"，不要再问"哪里不舒服"
- 如果之前已经询问过"诱因"，不要再问"什么原因引起的"
- 每次提问前，先思考："这个问题我之前问过吗？"

【结束条件】（满足任一条件即可结束）：
- 已问了至少 3 个问题，且收集了症状特点、诱因、伴随症状中的至少两类信息
- 用户明确表示没有更多信息或无法提供更多信息
- 已问了 10 个问题（达到上限）

【结束方式】：
当满足结束条件时，请明确说明："信息已收集完毕，可以进入下一步"

【重要提醒】：
- 问询是为了明确调理方案的路径，不是为了问询而问询
- 如果用户已经提供了足够的信息，即使没有问满 3 个问题，也可以结束
- 避免问一些无关紧要的问题，专注于辨证所需的关键信息
- 用口语化的方式提问，让用户容易理解
- 参考上述经典医案的问询思路，结合用户具体情况提出问题
${additionalInfo ? '- 特别注意：已从上传的文档中提取了补充信息，请结合这些信息提出更有针对性的问题' : ''}`

      // 构建 user 消息，请求 AI 开始问询
      const userMessage = `请开始问询，提出第一个关键问题：`

      // 调用 LLM 进行初步问询
      const res = await Network.request({
        url: '/api/medical-ai/chat',
        method: 'POST',
        data: {
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ]
        }
      })

      if (res.statusCode === 200 && res.data.data) {
        const aiResponse = res.data.data.content || res.data.data
        // 保存完整的消息历史（包括 system 消息）
        setAiInquiryMessages([
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
          { role: 'assistant', content: aiResponse }
        ])
      } else {
        throw new Error('AI 问询失败')
      }
    } catch (err) {
      console.error('AI 问询错误:', err)
      Taro.showToast({
        title: 'AI 问询失败，请重试',
        icon: 'none'
      })
    } finally {
      setIsAiInquiring(false)
    }
  }

  // 发送用户的回答并继续问询
  const handleSendInquiryAnswer = async () => {
    if (!inquiryInput.trim()) return

    const userAnswer = inquiryInput.trim()
    setInquiryInput('')

    // 添加用户的回答到对话历史（保持完整的上下文）
    const newMessages = [...aiInquiryMessages, { role: 'user', content: userAnswer }]
    setAiInquiryMessages(newMessages)
    setIsAiInquiring(true)

    try {
      // 🚨 修复：发送完整的对话历史，避免消息丢失导致重复提问
      // 逻辑：直接发送最后 10 条消息，确保包含 system 消息和完整的对话上下文
      // 注意：newMessages[0] 通常是 system 消息，所以 slice(-10) 会自动保留 system 消息（如果总消息数 ≤ 10）
      // 如果总消息数 > 10，slice(-10) 会保留最近的 10 条，这样可以避免消息过长
      const optimizedMessages = newMessages.slice(-10)

      console.log('=== 发送对话历史 ===');
      console.log('总消息数:', newMessages.length);
      console.log('发送消息数:', optimizedMessages.length);
      console.log('发送的消息:', optimizedMessages.map((m, i) => `${i + 1}. [${m.role}] ${m.content.substring(0, 30)}...`).join('\n'));
      console.log('已问问题数:', optimizedMessages.filter(m => m.role === 'assistant').length);

      // 调用 LLM 继续问询
      const res = await Network.request({
        url: '/api/medical-ai/chat',
        method: 'POST',
        data: {
          messages: optimizedMessages
        }
      })

      if (res.statusCode === 200 && res.data.data) {
        const aiResponse = res.data.data.content || res.data.data

        // 🚨 CRITICAL: 检测 AI 是否说了"信息已收集完毕"
        const isInquiryEnded = aiResponse.includes('信息已收集完毕') || aiResponse.includes('可以进入下一步')

        if (isInquiryEnded) {
          // 更新对话历史（包含结束宣告）
          setAiInquiryMessages([
            ...optimizedMessages,
            { role: 'assistant', content: aiResponse }
          ])

          // 提示用户问询已结束，并自动进入下一步
          Taro.showModal({
            title: '问询完成',
            content: 'AI 智能问询已完成，信息已收集完毕。是否继续生成健康方案？',
            confirmText: '继续',
            cancelText: '查看问询记录',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 进入第五步：获取健康方案
                setCurrentStep(5)
                // 自动生成健康方案
                setTimeout(() => {
                  handleGenerateTreatmentPlan()
                }, 500)
              }
            }
          })
        } else {
          // 更新对话历史（继续问询）
          setAiInquiryMessages([
            ...optimizedMessages,
            { role: 'assistant', content: aiResponse }
          ])
        }
      } else {
        throw new Error('AI 问询失败')
      }
    } catch (err) {
      console.error('AI 问询错误:', err)
      Taro.showToast({
        title: 'AI 问询失败，请重试',
        icon: 'none'
      })
    } finally {
      setIsAiInquiring(false)
    }
  }

  // 结束 AI 问询，进入下一步
  const handleEndInquiry = () => {
    Taro.showModal({
      title: '结束问询',
      content: '确定要结束问询并进入下一步吗？',
      success: (res) => {
        if (res.confirm) {
          // 进入第五步：获取健康方案
          setCurrentStep(5)
        }
      }
    })
  }

  // 第五步：自动获取健康方案（基于问询结果）
  const handleGenerateTreatmentPlan = async () => {
    // 检查用户权限是否过期
    if (user?.role !== 'admin' && user?.isExpired) {
      Taro.showModal({
        title: '授权已过期',
        content: '您的账户授权已过期，请充值后继续使用',
        confirmText: '立即购买',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            setTimeout(() => {
              handleOpenPackageModal()
            }, 500)
          }
        }
      })
      return
    }

    // 检查高危病重
    if (highRiskInfo && highRiskInfo.isHighRisk) {
      Taro.showModal({
        title: '危险警示',
        content: '检测到用户可能属于高危病重人群，系统已拒绝生成健康建议，请立即建议用户前往专业机构就医。',
        showCancel: false
      })
      return
    }

    setLoading(true)
    setError('')

    try {
      // 构建完整的健康信息，包含 AI 问询记录（过滤掉 system 消息）
      const inquirySummary = aiInquiryMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => `${msg.role === 'assistant' ? 'AI' : '用户'}: ${msg.content}`)
        .join('\n\n')

      const res = await Network.request({
        url: '/api/tcm/analyze',
        method: 'POST',
        data: {
          patientId: selectedPatient?.id,
          chiefComplaint: chiefComplaint,
          history: history, // 现病史
          pastHistory: pastHistory,
          additionalInfo: additionalInfo || '', // 补充信息（来自上传的文档）
          aiInquiry: inquirySummary, // 包含 AI 问询记录
          isFollowUp: followUpAnalysis !== null
        }
      })

      console.log('健康分析响应:', res)

      if (res.statusCode === 200 && res.data.data) {
        setResult(res.data.data)

        // 检测高危病重
        if (res.data.data.highRiskInfo && res.data.data.highRiskInfo.isHighRisk) {
          setHighRiskInfo(res.data.data.highRiskInfo)
        }

        // 健康建议风控检测
        if (res.data.data.prescription && res.data.data.prescription.ingredients) {
          const warning = generateCompleteRiskWarning(
            res.data.data.prescription.ingredients,
            selectedPatient
          )
          setRiskWarning(warning)
          setToxicHerbs(warning.toxicHerbs)
          setIncompatibilities(warning.incompatibilities)
          setPregnancyContraindications(warning.pregnancyContraindications)

          if (warning.riskLevel !== 'low') {
            setShowToxicWarning(true)
          }
        }

        // 自动保存健康档案
        if (res.data.data.prescription) {
          await saveMedicalRecord(res.data.data)
        }

        Taro.showToast({
          title: '健康方案生成成功',
          icon: 'success',
          duration: 2000
        })
      } else {
        throw new Error('获取健康方案失败')
      }
    } catch (err) {
      console.error('生成健康方案错误:', err)
      setError('生成健康方案失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 打开套餐选择弹窗
  const handleOpenPackageModal = () => {
    console.log('=== handleOpenPackageModal 被调用 ===')
    console.log('当前 isAuthenticated:', isAuthenticated)
    console.log('当前 showPackageModal:', showPackageModal)
    console.log('当前 packages:', packages)
    console.log('packages.length:', packages.length)

    setShowPackageModal(true)

    console.log('=== 开始调用 fetchPackages ===')
    fetchPackages().then(() => {
      console.log('=== fetchPackages 完成，packages 状态已更新 ===')
      console.log('更新后的 packages:', packages)
    }).catch(err => {
      console.error('=== fetchPackages 出错 ===', err)
    })
  }

  // 选择套餐（只选中，不触发支付）
  const handleSelectPackage = (pkg: any) => {
    console.log('=== 选中套餐 ===', pkg)
    setSelectedPackage(pkg)
    setIsSelectingPackage(true)
  }

  // 确认选择套餐并进入支付
  const handleConfirmSelectPackage = () => {
    if (!selectedPackage) return
    console.log('=== 确认选择套餐，进入支付 ===')
    setIsSelectingPackage(false)
    setShowPackageModal(false)
    setShowPaymentModal(true)
  }

  // 创建订单并支付
  const handleCreateOrder = async () => {
    if (!selectedPackage) return

    setOrderLoading(true)

    try {
      console.log('=== 开始创建订单 ===')
      console.log('套餐信息:', selectedPackage)
      console.log('用户信息:', user)

      // 显示加载提示
      Taro.showLoading({
        title: '正在创建订单...'
      })

      const res = await Network.request({
        url: '/api/payment/create-package-order',
        method: 'POST',
        data: {
          userId: user?.id,
          packageId: selectedPackage.id,
          paymentMethod: selectedPaymentMethod
        }
      })

      console.log('=== 创建订单响应 ===', res)

      Taro.hideLoading()

      if (res.data.code === 200 && res.data.data) {
        const orderData = res.data.data
        console.log('订单数据:', orderData)

        // 显示订单确认弹窗
        Taro.showModal({
          title: '确认订单',
          content: `订单号：${orderData.orderNo}\n套餐：${orderData.packageName}\n金额：¥${orderData.amount}\n\n确认支付？`,
          confirmText: '确认支付',
          cancelText: '取消',
          success: async (modalRes) => {
            if (modalRes.confirm) {
              console.log('=== 用户确认支付 ===')

              // 再次显示加载
              Taro.showLoading({
                title: '支付处理中...'
              })

              try {
                // 模拟支付处理
                await new Promise(resolve => setTimeout(resolve, 1000))

                Taro.hideLoading()

                // 显示支付成功
                Taro.showToast({
                  title: '支付成功',
                  icon: 'success',
                  duration: 2000
                })

                // 关闭所有弹窗
                setShowPaymentModal(false)
                setShowPackageModal(false)
                setIsSelectingPackage(false)
                setSelectedPackage(null)

                // 不刷新用户信息（后端没有提供 /api/auth/me 接口）
                // 用户下次登录时会自动获取最新信息
              } catch (payError) {
                console.error('=== 支付失败 ===', payError)
                Taro.hideLoading()
                Taro.showToast({
                  title: '支付失败，请重试',
                  icon: 'none'
                })
              }
            }
          }
        })
      } else {
        console.error('=== 创建订单失败 ===', res)
        throw new Error(res.data?.msg || '创建订单失败')
      }
    } catch (err) {
      console.error('=== 创建订单异常 ===', err)
      Taro.hideLoading()
      Taro.showToast({
        title: '创建订单失败，请重试',
        icon: 'none'
      })
    } finally {
      setOrderLoading(false)
    }
  }

  // TODO: 这个函数暂时未使用，因为系统已实现自动保存健康档案功能
  // 如需恢复手动保存功能，可以取消注释
  /*
  const handleSaveRecord = async () => {
    if (!result || !selectedPatient) {
      Taro.showToast({
        title: '请先生成健康方案',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    setError('')

    try {
      // 构建处方字符串
      const prescriptionText = result.prescription.ingredients
        .map(ing => `${ing.name} ${ing.dosage}${ing.special ? ` (${ing.special})` : ''}`)
        .join('、')

      // 构建完整处方信息
      const fullPrescription = `
方名：${result.prescription.formulaName}
组成：${prescriptionText}
煎法：${result.prescription.decoctionMethod}
服法：${result.prescription.dosageMethod}
注意：${result.prescription.precautions}
      `.trim()

      const response = await Network.request({
        url: '/api/health-records', // 使用正确的 API 路径
        method: 'POST',
        data: {
          memberId: selectedPatient.id, // 统一使用 memberId（与后端 members 表一致）
          consultantId: 'default-consultant', // 使用 consultantId 而不是 doctorId
          visitNumber: 1, // 可以根据实际需求动态生成
          chiefComplaint,
          history,
          pastHistory,
          analysisResult: result.diagnosis, // 使用 analysisResult 而不是 diagnosis
          differentiation: result.differentiation,
          treatmentPrinciple: result.treatmentPrinciple,
          healthPlan: fullPrescription, // 使用 healthPlan 而不是 prescription
          advice: result.advice,
          status: 'active'
        },
        header: {
          'Content-Type': 'application/json'
        }
      })

      console.log('保存健康档案响应:', response.data)

      if (response.statusCode === 200 && response.data.code === 200) {
        Taro.showToast({
          title: '健康档案保存成功',
          icon: 'success'
        })

        // 询问是否查看健康档案
        setTimeout(() => {
          Taro.showModal({
            title: '健康档案已保存',
            content: '是否跳转到健康档案列表查看？',
            success: (res) => {
              if (res.confirm) {
                // 统一使用 memberId 和 memberName（与后端 members 表一致）
                Taro.navigateTo({
                  url: `/pages/records-list/index?memberId=${selectedPatient.id}&memberName=${encodeURIComponent(selectedPatient.name)}`
                })
              }
            }
          })
        }, 1500)
      } else {
        setError(response.data.msg || '健康档案保存失败')
      }
    } catch (err: any) {
      console.error('保存健康档案失败:', err)
      setError(err.message || '健康档案保存失败')
    } finally {
      setLoading(false)
    }
  }
  */

  // 自动保存健康档案函数
  const saveMedicalRecord = async (treatmentData: any) => {
    if (!selectedPatient || !treatmentData.prescription) {
      return
    }

    try {
      // 构建处方字符串
      const prescriptionText = treatmentData.prescription.ingredients
        .map(ing => `${ing.name} ${ing.dosage}${ing.special ? ` (${ing.special})` : ''}`)
        .join('、')

      // 构建完整处方信息
      const fullPrescription = `
方名：${treatmentData.prescription.formulaName}
组成：${prescriptionText}
煎法：${treatmentData.prescription.decoctionMethod}
服法：${treatmentData.prescription.dosageMethod}
注意：${treatmentData.prescription.precautions}
      `.trim()

      // 构建 AI 问询摘要（过滤掉 system 消息）
      const inquirySummary = aiInquiryMessages.length > 0
        ? aiInquiryMessages
          .filter(msg => msg.role !== 'system')
          .map(msg => `${msg.role === 'assistant' ? 'AI' : '用户'}: ${msg.content}`)
          .join('\n\n')
        : ''

      const response = await Network.request({
        url: '/api/health-records', // 使用正确的 API 路径
        method: 'POST',
        data: {
          memberId: selectedPatient.id, // 统一使用 memberId（与后端 members 表一致）
          consultantId: 'default-consultant', // 使用 consultantId 而不是 doctorId
          visitNumber: 1,
          chiefComplaint: chiefComplaint,
          history: '', // 现病史已合并到主诉
          pastHistory: pastHistory,
          analysisResult: treatmentData.diagnosis, // 使用 analysisResult 而不是 diagnosis
          differentiation: treatmentData.differentiation,
          treatmentPrinciple: treatmentData.treatmentPrinciple,
          healthPlan: fullPrescription, // 使用 healthPlan 而不是 prescription
          advice: treatmentData.advice,
          status: 'active',
          aiInquiry: inquirySummary // 包含 AI 问询记录
        },
        header: {
          'Content-Type': 'application/json'
        }
      })

      console.log('健康档案保存响应:', response.data)

      if (response.statusCode === 200 && response.data.code === 200) {
        console.log('健康档案自动保存成功')
      } else {
        console.warn('健康档案保存失败:', response.data.msg)
      }
    } catch (err: any) {
      console.error('自动保存健康档案失败:', err)
    }
  }

  const handleIngredientChange = (
    index: number,
    field: 'name' | 'dosage' | 'special',
    value: string
  ) => {
    const newIngredients = [...editedIngredients]
    newIngredients[index][field] = value
    setEditedIngredients(newIngredients)
  }

  console.log('❌ 显示应用页面');

  return (
    <View className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ResponsiveContainer width={isDesktop ? 'wide' : 'full'}>
        {/* PC 端背景装饰 */}
        <DesktopOnly>
          <View className="absolute inset-0 overflow-hidden pointer-events-none">
            <View className="absolute top-20 -right-20 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></View>
            <View className="absolute bottom-20 -left-20 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl"></View>
          </View>
        </DesktopOnly>

        {/* 主内容容器 */}
        <View className={`relative z-10 ${isMobile ? 'w-full px-4 py-4' : 'w-full px-6 py-6'}`}>
          {/* 顶部导航栏 - 完全响应式设计 */}
          <View className="bg-white px-4 sm:px-6 py-4 shadow-sm sticky top-0 z-10 rounded-xl mb-6">
            <View className="flex items-center justify-between gap-4">
              {/* 左侧：Logo/标题 */}
              <View className="flex items-center flex-shrink-0">
                <Text className="text-4xl mr-3">🏥</Text>
                <View>
                  <Text className={`font-bold text-teal-600 block ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    中医智能好帮手
                  </Text>
                  <Text className="block text-xs sm:text-sm text-gray-500">
                    AI 辨证 · 智能调理
                  </Text>
                </View>
              </View>

              {/* PC 端：中间功能导航 */}
              <View className="hidden lg:flex items-center gap-2 flex-1 justify-center">
                <View
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => Taro.navigateTo({ url: '/pages/formula-management/index' })}
                >
                  <Text className="block text-sm font-medium">方剂管理</Text>
                </View>
                <View
                  className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => Taro.navigateTo({ url: '/pages/patients-list/index' })}
                >
                  <Text className="block text-sm font-medium">👥 用户</Text>
                </View>
                <View
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
                >
                  <Text className="block text-sm font-medium">🔍 搜索</Text>
                </View>
                <View
                  className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg cursor-pointer hover:bg-teal-100 transition-colors"
                  onClick={() => Taro.navigateTo({ url: '/pages/learning-center/index' })}
                >
                  <Text className="block text-sm font-medium">📊 学习</Text>
                </View>
                <View
                  className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                  onClick={() => Taro.navigateTo({ url: '/pages/new-diagnosis/index' })}
                >
                  <Text className="block text-sm font-medium">🩺 新诊疗</Text>
                </View>
                {/* PWA 按钮 - 仅在 H5 显示 */}
                {Taro.getEnv() === Taro.ENV_TYPE.WEB && typeof window !== 'undefined' && !window.matchMedia('(display-mode: standalone)').matches && (
                  <View
                    className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={handleShowPWAInstallGuide}
                  >
                    <Text className="block text-sm font-medium">📱 安装</Text>
                  </View>
                )}
              </View>

              {/* 右侧：用户操作按钮 */}
              <View className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <View className="hidden sm:flex items-center px-3 py-1.5 bg-gray-100 rounded-lg">
                  <Text className="block text-sm text-gray-700 mr-2">
                    👤 {user?.username || '用户'}
                  </Text>
                  {user?.role !== 'admin' && user?.expiresAt && (() => {
                    const now = new Date();
                    const expiresAt = new Date(user.expiresAt);
                    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <Text
                        className={`block text-xs font-medium px-2 py-0.5 rounded ${
                          daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                          daysLeft <= 7 ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}
                      >
                        {daysLeft}天
                      </Text>
                    );
                  })()}
                </View>
                <View
                  className="px-3 py-1.5 bg-purple-500 text-white rounded-lg cursor-pointer hover:bg-purple-600 transition-colors"
                  onClick={() => Taro.navigateTo({ url: '/pages/customer-service/index' })}
                >
                  <Text className="block text-xs sm:text-sm font-medium">📞</Text>
                </View>
                {user?.role === 'admin' && (
                  <View
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                    onClick={handleGoToAdmin}
                  >
                    <Text className="block text-xs sm:text-sm font-medium">管理</Text>
                  </View>
                )}
                <View
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 transition-colors"
                  onClick={handleLogout}
                >
                  <Text className="block text-xs sm:text-sm font-medium">退出</Text>
                </View>
              </View>
            </View>

            {/* 移动端功能导航菜单 - 横向滚动 */}
            <View className="flex lg:hidden gap-2 overflow-x-auto pb-2 mt-4 -mx-2 px-2">
              <View
                className="flex-shrink-0 bg-green-500 px-4 py-2 rounded-full"
                onClick={() => Taro.navigateTo({ url: '/pages/patients-list/index' })}
              >
                <Text className="block text-sm text-white font-medium">👥 用户管理</Text>
              </View>
              <View
                className="flex-shrink-0 bg-indigo-500 px-4 py-2 rounded-full"
                onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
              >
                <Text className="block text-sm text-white font-medium">🔍 联网搜索</Text>
              </View>
              <View
                className="flex-shrink-0 bg-teal-500 px-4 py-2 rounded-full"
                onClick={() => Taro.navigateTo({ url: '/pages/learning-center/index' })}
              >
                <Text className="block text-sm text-white font-medium">📊 学习中心</Text>
              </View>
              <View
                className="flex-shrink-0 bg-pink-500 px-4 py-2 rounded-full"
                onClick={() => Taro.navigateTo({ url: '/pages/sign-in/index' })}
              >
                <Text className="block text-sm text-white font-medium">🎁 每日签到</Text>
              </View>
              {Taro.getEnv() === Taro.ENV_TYPE.WEB && typeof window !== 'undefined' && !window.matchMedia('(display-mode: standalone)').matches && (
                <View
                  className="flex-shrink-0 bg-purple-500 px-4 py-2 rounded-full"
                  onClick={handleShowPWAInstallGuide}
                >
                  <Text className="block text-sm text-white font-medium">📱 安装应用</Text>
                </View>
              )}
            </View>
          </View>
        </View>

      {/* 主内容区域 - 完全响应式布局 */}
      <View className="flex flex-col xl:flex-row gap-6 px-4 sm:px-6 pb-6">
        {/* 左侧主要内容 */}
        <ScrollView scrollY className="flex-1 scroll-view-container" style={{ minHeight: 'calc(100vh - 320px)' }}>

      {/* 欢迎横幅 */}
      <View className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-4 sm:p-6 mb-6 text-white shadow-lg">
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-xl sm:text-2xl font-bold mb-1">
              👋 欢迎回来，{user?.username || '用户'}！
            </Text>
            <Text className="block text-sm sm:text-base text-teal-50 opacity-90">
              今天也要注意身体健康哦~
            </Text>
          </View>
          <Text className="text-4xl sm:text-5xl opacity-80">💊</Text>
        </View>
      </View>

      {/* 剩余天数提示（仅普通用户显示） */}
      {user?.role !== 'admin' && user?.expiresAt && (() => {
        const now = new Date();
        const expiresAt = new Date(user.expiresAt);
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isExpired = now > expiresAt;

        if (isExpired) {
          // 已过期用户显示特殊提示
          return (
            <View className="mb-6 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 shadow-sm">
              <View className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <View className="flex items-center flex-1">
                  <Text className="text-3xl mr-3">⚠️</Text>
                  <View className="flex-1">
                    <Text className="block text-base sm:text-lg font-bold text-red-800 mb-1">
                      授权已过期
                    </Text>
                    <Text className="block text-sm text-red-600">
                      过期时间：{expiresAt.toLocaleDateString('zh-CN')}，请充值后继续使用
                    </Text>
                  </View>
                </View>
                {/* 一键续费按钮 */}
                <View
                  className="flex-shrink-0 w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shadow-md"
                  onClick={handleOpenPackageModal}
                >
                  <Text className="block text-sm text-white font-bold text-center">
                    立即续费
                  </Text>
                </View>
              </View>
            </View>
          );
        }

        // 未过期用户显示剩余天数
        return (
          <View
            className={`mb-6 p-4 sm:p-5 rounded-xl border-2 shadow-sm ${
              daysLeft <= 3 ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300' :
              daysLeft <= 7 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300' :
              'bg-gradient-to-r from-green-50 to-green-100 border-green-300'
            }`}
          >
            <View className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <View className="flex items-center flex-1">
                <Text className="text-3xl mr-3">
                  {daysLeft <= 3 ? '⚠️' : daysLeft <= 7 ? '📅' : '✅'}
                </Text>
                <View className="flex-1">
                  <Text
                    className={`block text-base sm:text-lg font-bold ${
                      daysLeft <= 3 ? 'text-red-800' :
                      daysLeft <= 7 ? 'text-orange-800' :
                      'text-green-800'
                    } mb-1`}
                  >
                    剩余有效期：{daysLeft} 天
                  </Text>
                  <Text
                    className={`block text-sm ${
                      daysLeft <= 3 ? 'text-red-600' :
                      daysLeft <= 7 ? 'text-orange-600' :
                      'text-green-600'
                    }`}
                  >
                    {daysLeft <= 3 ? '您的授权即将到期，请及时续费' :
                     daysLeft <= 7 ? '您的授权即将到期，请尽快续费' :
                     `有效期至：${expiresAt.toLocaleDateString('zh-CN')}`}
                  </Text>
                </View>
              </View>
              {/* 一键续费按钮 */}
              <View
                className={`flex-shrink-0 w-full sm:w-auto px-6 py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-md ${
                  daysLeft <= 3 ? 'bg-red-600' :
                  daysLeft <= 7 ? 'bg-orange-600' :
                  'bg-green-600'
                }`}
                onClick={handleOpenPackageModal}
              >
                <Text className="block text-sm text-white font-bold text-center">
                  立即续费
                </Text>
              </View>
            </View>
          </View>
        );
      })()}

      {/* 步骤指示器 - 完全响应式设计 */}
      <View className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 sm:p-5 mb-6 border-2 border-teal-200 shadow-sm">
        <View className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <View key={step} className="flex items-center flex-1">
              {/* 步骤圆圈 */}
              <View
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md ${
                  currentStep >= step
                    ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                <Text className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>
                  {currentStep > step ? '✓' : step}
                </Text>
              </View>
              {/* 步骤标签 */}
              <View className="ml-2 flex-1">
                <Text
                  className={`block text-xs sm:text-sm font-bold ${
                    currentStep >= step ? 'text-teal-700' : 'text-gray-500'
                  }`}
                >
                  {step === 1 && '用户信息'}
                  {step === 2 && '主诉'}
                  {step === 3 && '既往史'}
                  {step === 4 && 'AI问询'}
                  {step === 5 && '健康方案'}
                </Text>
              </View>
              {/* 步骤之间的连接线（除了最后一步） */}
              {step < 5 && (
                <View
                  className={`flex-1 h-0.5 sm:h-1 mx-2 ${
                    currentStep > step ? 'bg-gradient-to-r from-teal-500 to-blue-600' : 'bg-gray-200'
                  }`}
                ></View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 用户选择区域 - 第一步 */}
      {currentStep === 1 && (
        <View className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-lg border-2 border-amber-200">
          <View className="flex items-center justify-between mb-4">
            <View className="flex items-center">
              <View className="w-2 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mr-3"></View>
              <Text className="block text-lg sm:text-xl font-bold text-gray-900">
                第一步：用户信息
              </Text>
            </View>
            {selectedPatient && (
              <View
                className="bg-gray-100 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={handleChangePatient}
              >
                <Text className="block text-sm text-gray-600">更换用户</Text>
              </View>
            )}
          </View>

          {!selectedPatient ? (
            <View>
              <Text className="block text-sm sm:text-base text-gray-500 mb-4">
                请先选择或添加用户，再进行下一步
              </Text>
              <View className="flex flex-col sm:flex-row gap-3">
                <View
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 py-4 sm:py-5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer shadow-md"
                  onClick={handleAddPatient}
                >
                  <Text className="block text-lg font-bold text-white text-center">
                    ➕ 添加用户
                  </Text>
                </View>
                <View
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 py-4 sm:py-5 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all cursor-pointer shadow-md"
                  onClick={handleSelectPatient}
                >
                  <Text className="block text-lg font-bold text-white text-center">
                    👤 选择用户
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
              <View className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="block text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {selectedPatient.name}
                  </Text>
                  <View className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <View className="px-2 py-1 bg-white rounded text-sm text-gray-700">
                      {selectedPatient.gender}
                    </View>
                    <Text className="text-gray-300">|</Text>
                    <View className="px-2 py-1 bg-white rounded text-sm text-gray-700">
                      {selectedPatient.age}岁
                    </View>
                    {selectedPatient.phone && (
                      <>
                        <Text className="text-gray-300">|</Text>
                        <View className="px-2 py-1 bg-white rounded text-sm text-gray-700">
                          {selectedPatient.phone}
                        </View>
                      </>
                    )}
                  </View>
                </View>
                <View className="flex-shrink-0 w-full sm:w-auto">
                  <View className="bg-green-500 px-6 py-2.5 rounded-full shadow-md">
                    <Text className="block text-sm text-white font-bold text-center">
                      ✓ 已选择
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* 复诊分析结果 - 第一步 */}
      {currentStep === 1 && showFollowUpAnalysis && followUpAnalysis && (
        <View className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-6 border-2 border-orange-300">
          <View className="flex items-center justify-between mb-4">
            <View className="flex items-center">
              <Text className="block text-2xl mr-2">📊</Text>
              <Text className="block text-lg font-bold text-orange-800">
                复诊分析报告
              </Text>
            </View>
            <View
              className="bg-white bg-opacity-50 px-3 py-1 rounded-full"
              onClick={() => setShowFollowUpAnalysis(false)}
            >
              <Text className="block text-xs text-orange-700">收起</Text>
            </View>
          </View>

          {/* 用户病史摘要 */}
          {followUpAnalysis.analysis?.patientHistorySummary && (
            <View className="bg-white rounded-lg p-4 mb-3">
              <Text className="block text-sm font-medium text-gray-900 mb-2">
                📋 病史摘要
              </Text>
              <Text className="block text-sm text-gray-700 leading-relaxed">
                {followUpAnalysis.analysis.patientHistorySummary}
              </Text>
            </View>
          )}

          {/* 未解决的问题 */}
          {followUpAnalysis.unresolvedIssues && followUpAnalysis.unresolvedIssues.length > 0 && (
            <View className="bg-white rounded-lg p-4 mb-3">
              <Text className="block text-sm font-medium text-gray-900 mb-2">
                ⚠️ 未解决问题 ({followUpAnalysis.unresolvedIssues.length})
              </Text>
              {followUpAnalysis.unresolvedIssues.map((issue: any, index: number) => (
                <View key={index} className="mb-2 last:mb-0">
                  <Text className="block text-sm text-gray-700">
                    • {issue.chiefComplaint}
                  </Text>
                  {issue.feedback && (
                    <Text className="block text-xs text-gray-500 mt-1">
                      疗效: {issue.feedback.effectiveness} | 满意度: {issue.feedback.satisfaction}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* 当前症状分析 */}
          {followUpAnalysis.analysis?.currentSymptomsAnalysis && (
            <View className="bg-white rounded-lg p-4 mb-3">
              <Text className="block text-sm font-medium text-gray-900 mb-2">
                🔍 当前症状分析
              </Text>
              <Text className="block text-sm text-gray-700 leading-relaxed">
                {followUpAnalysis.analysis.currentSymptomsAnalysis}
              </Text>
            </View>
          )}

          {/* 优化策略 */}
          {followUpAnalysis.analysis?.optimizationStrategy && (
            <View className="bg-white rounded-lg p-4 mb-3">
              <Text className="block text-sm font-medium text-gray-900 mb-2">
                💡 优化策略
              </Text>
              <Text className="block text-sm text-gray-700 leading-relaxed">
                {followUpAnalysis.analysis.optimizationStrategy}
              </Text>
            </View>
          )}

          {/* 推荐处方 */}
          {followUpAnalysis.analysis?.recommendedPrescription && (
            <View className="bg-white rounded-lg p-4 mb-3">
              <Text className="block text-sm font-medium text-gray-900 mb-2">
                💊 推荐处方
              </Text>
              <Text className="block text-sm text-gray-700 leading-relaxed">
                {followUpAnalysis.analysis.recommendedPrescription}
              </Text>
            </View>
          )}

          {/* 剂量调整建议 */}
          {followUpAnalysis.analysis?.dosageAdjustments && followUpAnalysis.analysis.dosageAdjustments.length > 0 && (
            <View className="bg-white rounded-lg p-4 mb-3">
              <Text className="block text-sm font-medium text-gray-900 mb-2">
                ⚗️ 剂量调整建议
              </Text>
              {followUpAnalysis.analysis.dosageAdjustments.map((adjustment: any, index: number) => (
                <Text key={index} className="block text-sm text-gray-700">
                  • {adjustment}
                </Text>
              ))}
            </View>
          )}

          {/* 注意事项 */}
          {followUpAnalysis.analysis?.precautions && followUpAnalysis.analysis.precautions.length > 0 && (
            <View className="bg-white rounded-lg p-4 mb-3">
              <Text className="block text-sm font-medium text-gray-900 mb-2">
                ⚠️ 注意事项
              </Text>
              {followUpAnalysis.analysis.precautions.map((precaution: any, index: number) => (
                <Text key={index} className="block text-sm text-gray-700">
                  • {precaution}
                </Text>
              ))}
            </View>
          )}

          {/* 随访计划 */}
          {followUpAnalysis.analysis?.followUpPlan && (
            <View className="bg-white rounded-lg p-4">
              <Text className="block text-sm font-medium text-gray-900 mb-2">
                📅 随访计划
              </Text>
              <Text className="block text-sm text-gray-700 leading-relaxed">
                {followUpAnalysis.analysis.followUpPlan}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 主诉输入框 - 第二步 */}
      {currentStep === 2 && (
        <View className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-lg border-2 border-blue-200">
          <View className="flex items-start gap-3 mb-4">
            <View className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full flex-shrink-0"></View>
            <View className="flex-1">
              <Text className="block text-lg sm:text-xl font-bold text-gray-900 mb-2">
                第二步：主诉 <Text className="text-red-500">*</Text>
              </Text>
              <Text className="block text-sm text-gray-500">
                请详细描述您的主要症状（包含症状的发生、发展、变化过程）
              </Text>
            </View>
          </View>
          <View className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl px-4 sm:px-6 py-4 sm:py-5 border-2 border-blue-200 shadow-sm">
            <Textarea
              className="w-full bg-transparent text-base sm:text-lg min-h-[140px] sm:min-h-[160px]"
              placeholder="例如：头痛三天，伴有恶心、呕吐。三天前受凉后出现头痛，呈持续性胀痛，伴有畏寒、发热..."
              value={chiefComplaint}
              onInput={(e) => setChiefComplaint(e.detail.value)}
              maxlength={500}
            />
          </View>
          <View className="mt-3 flex justify-between items-center">
            <Text className="block text-xs text-gray-500">
              {chiefComplaint.length}/500 字
            </Text>
          </View>
        </View>
      )}

      {/* 既往史输入框 - 第三步 */}
      {currentStep === 3 && (
        <View className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-lg border-2 border-orange-200">
          <View className="flex items-start gap-3 mb-4">
            <View className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full flex-shrink-0"></View>
            <View className="flex-1">
              <Text className="block text-lg sm:text-xl font-bold text-gray-900 mb-2">
                第三步：既往史 <Text className="text-gray-400">（选填）</Text>
              </Text>
              <Text className="block text-sm text-gray-500">
                以往的疾病史、过敏史等（可跳过）
              </Text>
            </View>
          </View>
          <View className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl px-4 sm:px-6 py-4 sm:py-5 border-2 border-orange-200 shadow-sm mb-6">
            <Textarea
              className="w-full bg-transparent text-base sm:text-lg min-h-[100px] sm:min-h-[120px]"
              placeholder="例如：既往有高血压病史5年，对青霉素过敏..."
              value={pastHistory}
              onInput={(e) => setPastHistory(e.detail.value)}
              maxlength={500}
            />
          </View>

          {/* 上传附件部分（可选） */}
          <View className="mt-6">
            <View className="flex items-start gap-3 mb-4">
              <Text className="text-2xl">📎</Text>
              <View>
                <Text className="block text-base font-bold text-gray-900">
                  上传附件（可选）
                </Text>
                <Text className="block text-xs text-gray-500 mt-1">
                  化验单、CT报告、历史处方等
                </Text>
              </View>
            </View>

            {/* 已上传附件列表 */}
            {attachments.length > 0 && (
              <View className="mb-4">
                {attachments.map((attachment) => (
                  <View key={attachment.id} className="bg-gray-50 rounded-lg px-4 py-3 mb-2 flex items-center justify-between border border-gray-200">
                    <View className="flex-1">
                      <Text className="block text-sm text-gray-900 font-medium">
                        📄 {attachment.name}
                      </Text>
                    </View>
                    <View
                      className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <Text className="block text-xs text-white font-medium">删除</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 上传按钮 */}
            <View className="flex gap-3">
              <View
                className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl px-4 py-4 flex items-center justify-center hover:from-blue-100 hover:to-blue-200 transition-colors cursor-pointer"
                onClick={handleChooseImage}
              >
                <Text className="block text-sm text-blue-600 font-medium text-center">
                  📷 拍照/选择图片
                </Text>
              </View>
            </View>

            {/* 补充信息展示（已分析） */}
            {additionalInfo && (
              <View className="mt-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                <View className="flex items-center mb-2">
                  <Text className="text-xl mr-2">✅</Text>
                  <Text className="block text-base font-bold text-green-800">
                    文档分析结果
                  </Text>
                </View>
                <Text className="block text-sm text-gray-700 leading-relaxed">
                  {additionalInfo}
                </Text>
              </View>
            )}

            {/* 上传中状态 */}
            {isUploading && (
              <View className="mt-3 bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
                <Text className="block text-sm text-yellow-700 font-medium">
                  ⏳ 正在上传附件...
                </Text>
              </View>
            )}

            {/* 分析中状态 */}
            {isAnalyzing && (
              <View className="mt-3 bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                <Text className="block text-sm text-purple-700 font-medium">
                  🤖 正在分析文档...
                </Text>
              </View>
            )}
          </View>
        </View>
          )}

      {/* 步骤导航按钮（第1、2、3步通用） */}
      {currentStep < 4 && !result && (
        <View className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          {/* 上一步按钮 */}
          {currentStep > 1 && (
            <View
              className="flex-1 bg-gray-200 hover:bg-gray-300 rounded-xl py-4 sm:py-5 transition-colors cursor-pointer shadow-sm"
              onClick={handlePrevStep}
            >
              <Text className="block text-base sm:text-lg font-bold text-gray-700 text-center">
                ← 上一步
              </Text>
            </View>
          )}

          {/* 下一步按钮 */}
          <View
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl py-4 sm:py-5 transition-all cursor-pointer shadow-md"
            onClick={handleNextStep}
            style={{
              opacity:
                (currentStep === 1 && !selectedPatient) ||
                (currentStep === 2 && !chiefComplaint.trim())
                  ? 0.5
                  : 1
            }}
          >
            <Text className="block text-base sm:text-lg font-bold text-white text-center">
              下一步 →
            </Text>
          </View>
        </View>
      )}


      {/* 第四步：AI 智能问询（全新改版，移除旧版） */}
      {currentStep === 4 && (
        <View className="bg-white rounded-xl p-6 mb-6 shadow-lg border-2 border-green-200">
          {/* 标题 */}
          <View className="mb-6 text-center">
            <Text className="block text-2xl font-bold text-gray-900 mb-2">
              第四步：AI 智能问询
            </Text>
            <Text className="block text-sm text-gray-500">
              基于经方决策树，开启精准辨证
            </Text>
          </View>

          {/* 核心入口：经方 AI */}
          <View 
            className="p-8 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 rounded-2xl border-2 border-green-300 shadow-md cursor-pointer hover:shadow-xl transition-all active:scale-98"
            onClick={() => {
              const params = {
                patientId: selectedPatient?.id || '',
                name: selectedPatient?.name || '',
                age: selectedPatient?.age || '',
                gender: selectedPatient?.gender || '',
                chiefComplaint: chiefComplaint || '',
                pastHistory: pastHistory || '',
                additionalInfo: additionalInfo || ''
              };
              const queryString = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
              Taro.navigateTo({ url: `/pages/ai-tcm/index?${queryString}` });
            }}
          >
            <View className="flex flex-col items-center">
              {/* 图标 */}
              <View className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Text className="text-4xl">🚀</Text>
              </View>
              
              {/* 标题 */}
              <Text className="block text-2xl font-bold text-green-800 mb-3">
                经方 AI 智能诊疗
              </Text>
              
              {/* 描述 */}
              <Text className="block text-base text-green-600 text-center leading-relaxed mb-6">
                系统已读取您的信息，将由 AI 专家主导问诊。
              </Text>

              {/* 按钮 */}
              <View className="px-10 py-4 bg-green-600 rounded-xl shadow-md">
                <Text className="block text-xl font-bold text-white">
                  立即开始 →
                </Text>
              </View>
            </View>
          </View>

          {/* 提示信息 */}
          <View className="mt-6 px-4">
            <View className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <Text className="text-xl">💡</Text>
              <View className="flex-1">
                <Text className="block text-sm text-blue-800 leading-relaxed">
                  新版问诊采用《伤寒论》条文推理引擎，问询过程由 AI 动态决策，更精准、更高效。
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 第五步：获取健康方案按钮 */}
      {currentStep === 5 && !result && (
        <View
          className={`bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 rounded-xl py-6 sm:py-8 mb-6 shadow-lg transition-all ${loading ? 'opacity-50' : 'cursor-pointer'}`}
          onClick={!loading ? handleGenerateTreatmentPlan : undefined}
        >
          <Text className="block text-xl sm:text-2xl font-bold text-white text-center mb-2">
            {loading ? '🤖 AI 正在为您分析...' : '💊 获取健康方案'}
          </Text>
          {!loading && (
            <Text className="block text-sm text-teal-100 text-center">
              点击让中医专家为您辨证论治
            </Text>
          )}
        </View>
      )}

      {/* 加载提示 */}
      {loading && (
        <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 mb-6 border-2 border-blue-200 shadow-md">
          <View className="flex items-center justify-center mb-6">
            <View className="flex space-x-3">
              <View className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></View>
              <View className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></View>
              <View className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></View>
            </View>
          </View>
          <View className="space-y-3">
            <Text className="block text-lg font-bold text-blue-800 text-center">
              正在分析您的症状...
            </Text>
            <Text className="block text-sm text-blue-600 text-center">
              中医专家正在为您辨证论治，请稍候
            </Text>
            <View className="mt-4 bg-white rounded-lg p-3 border border-blue-200">
              <Text className="block text-xs text-gray-500 text-center">
                💡 提示：这是基于中医理论的智能分析，仅供参考
              </Text>
            </View>
          </View>
        </View>
      )}

      {result && (
        <View className="mt-6 space-y-6">
          {/* 返回上一步按钮 */}
          <View className="bg-gray-100 rounded-xl py-4">
            <Text
              className="block text-lg font-medium text-gray-700 text-center"
              onClick={handleGoBack}
            >
              ← 返回上一步
            </Text>
          </View>

          {/* 高危病重警告 */}
          {highRiskInfo && highRiskInfo.isHighRisk && (
            <View className="bg-red-50 rounded-xl p-6 border-2 border-red-600">
              <View className="flex items-start gap-3 mb-4">
                <Text className="text-4xl">⚠️</Text>
                <View className="flex-1">
                  <Text className="block text-2xl font-bold text-red-700 mb-2">
                    危险警示
                  </Text>
                  <Text className="block text-base text-red-600 mb-3">
                    检测到用户可能属于高危病重人群，请立即采取以下措施：
                  </Text>
                </View>
              </View>

              <View className="bg-white rounded-lg p-4 mb-4">
                <View className="flex items-center gap-2 mb-2">
                  <Text className="text-lg">🚨</Text>
                  <Text className="block text-base font-bold text-red-700">
                    {highRiskInfo.riskType}
                  </Text>
                </View>
                <Text className="block text-sm text-gray-700 mb-2">
                  原因：{highRiskInfo.riskReason}
                </Text>
                <Text className="block text-sm text-gray-700">
                  建议：{highRiskInfo.recommendation}
                </Text>
              </View>

              <View className="bg-red-100 rounded-lg p-4">
                <View className="flex items-start gap-2">
                  <Text className="text-xl">📋</Text>
                  <View className="flex-1">
                    <Text className="block text-base font-semibold text-red-800 mb-2">
                      重要提示
                    </Text>
                    <Text className="block text-sm text-red-700 leading-relaxed">
                      1. 本系统已拒绝为该用户生成健康建议{'\n'}
                      2. 请立即建议用户前往具有急诊救治能力的专业机构就医{'\n'}
                      3. 可选择：三级医院、急诊科、专科门诊{'\n'}
                      4. 如用户出现意识模糊、呼吸困难、胸痛等症状，请立即拨打 120 急救电话
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* 有毒有害中药材风控提醒 */}
          {result && !highRiskInfo && showToxicWarning && riskWarning && (
            <ToxicHerbWarning
              toxicHerbs={toxicHerbs}
              riskLevel={riskWarning.riskLevel}
              warningMessage={riskWarning.warningMessage}
              incompatibilities={incompatibilities}
              pregnancyContraindications={pregnancyContraindications}
              patientInfo={{
                age: selectedPatient?.age,
                gender: selectedPatient?.gender,
                isPregnant: selectedPatient?.isPregnant,
                healthCondition: selectedPatient?.healthCondition
              }}
              onConfirm={() => {
                setHasConfirmedToxicWarning(true)
                Taro.showToast({
                  title: '已确认风险提示',
                  icon: 'success',
                  duration: 2000
                })
              }}
            />
          )}

          {/* 诊断信息 */}
          {result && !highRiskInfo && (
            hasConfirmedToxicWarning ||
            (!showToxicWarning &&
             toxicHerbs.length === 0 &&
             (!incompatibilities || !incompatibilities.hasIncompatibility) &&
             (!pregnancyContraindications || !pregnancyContraindications.hasContraindication))
          ) && (
            <View className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
              <View className="flex items-center mb-4">
                <View className="w-1 h-6 bg-blue-600 rounded mr-3"></View>
                <Text className="block text-xl font-bold text-gray-900">
                  健康状况信息
                </Text>
              </View>

              <View className="mb-4">
                <Text className="block text-sm text-gray-500 mb-2">中医健康状况分析</Text>
                <Text className="block text-lg font-semibold text-gray-900">
                  {result.diagnosis}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="block text-sm text-gray-500 mb-2">辨证分型</Text>
                <Text className="block text-lg font-semibold text-gray-900">
                  {result.differentiation}
                </Text>
              </View>

              <View>
                <Text className="block text-sm text-gray-500 mb-2">调理原则</Text>
                <Text className="block text-lg font-semibold text-gray-900">
                  {result.treatmentPrinciple}
                </Text>
              </View>
            </View>
          )}

          {/* 标准中医处方 */}
          {result && !highRiskInfo && (
            <View className="bg-white rounded-xl p-8 border-2 border-red-600 shadow-md">
              {/* 健康建议方案头部信息 */}
              <View className="border-b-2 border-red-600 pb-4 mb-4">
                <View className="flex items-center justify-between mb-3">
                <View className="flex items-center flex-1">
                  <View className="w-1 h-6 bg-red-600 rounded mr-3"></View>
                  <Text className="block text-xl font-bold text-gray-900">
                    健康建议方案
                  </Text>
                </View>
                <View className="flex items-center gap-2">
                  <View className="bg-red-600 px-3 py-1 rounded">
                    <Text className="block text-xs text-white font-medium">建议</Text>
                  </View>
                  <View className="bg-green-600 px-3 py-1 rounded">
                    <Text className="block text-xs text-white font-medium">已保存</Text>
                  </View>
                  {editMode ? (
                    <View className="flex gap-2">
                      <View className="bg-blue-600 px-3 py-1 rounded">
                        <Text
                          className="block text-xs text-white"
                          onClick={handleSaveEdit}
                        >
                          保存
                        </Text>
                      </View>
                      <View className="bg-gray-500 px-3 py-1 rounded">
                        <Text
                          className="block text-xs text-white"
                          onClick={handleCancelEdit}
                        >
                          取消
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View className="flex gap-2">
                      <View className="bg-purple-600 px-3 py-1 rounded">
                        <Text
                          className="block text-xs text-white"
                          onClick={handleEditToggle}
                        >
                          编辑建议
                        </Text>
                      </View>
                      <View
                        className="bg-blue-600 px-3 py-1 rounded"
                        onClick={() => {
                          // 统一使用 memberId 和 memberName（与后端 members 表一致）
                          Taro.navigateTo({
                            url: `/pages/records-list/index?memberId=${selectedPatient.id}&memberName=${encodeURIComponent(selectedPatient.name)}`
                          })
                        }}
                      >
                        <Text className="block text-xs text-white font-medium">
                          查看档案
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* 用户基本信息栏 */}
              <View className="bg-gray-50 rounded-lg p-4">
                <View className="grid grid-cols-3 gap-4 mb-3">
                  <View>
                    <Text className="block text-xs text-gray-500 mb-1">用户姓名</Text>
                    <Text className="block text-base font-semibold text-gray-900">
                      {selectedPatient?.name || '未选择'}
                    </Text>
                  </View>
                  <View>
                    <Text className="block text-xs text-gray-500 mb-1">性别</Text>
                    <Text className="block text-base font-semibold text-gray-900">
                      {selectedPatient?.gender || '-'}
                    </Text>
                  </View>
                  <View>
                    <Text className="block text-xs text-gray-500 mb-1">年龄</Text>
                    <Text className="block text-base font-semibold text-gray-900">
                      {selectedPatient?.age ? `${selectedPatient.age}岁` : '-'}
                    </Text>
                  </View>
                </View>
                <View className="grid grid-cols-3 gap-4 mb-3">
                  <View>
                    <Text className="block text-xs text-gray-500 mb-1">身高</Text>
                    <Text className="block text-sm text-gray-700">
                      {selectedPatient?.height ? `${selectedPatient.height}cm` : '-'}
                    </Text>
                  </View>
                  <View>
                    <Text className="block text-xs text-gray-500 mb-1">体重</Text>
                    <Text className="block text-sm text-gray-700">
                      {selectedPatient?.weight ? `${selectedPatient.weight}kg` : '-'}
                    </Text>
                  </View>
                  <View>
                    <Text className="block text-xs text-gray-500 mb-1">咨询日期</Text>
                    <Text className="block text-sm text-gray-700">
                      {new Date().toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 身体状况评估 */}
            <View className="mb-4">
              <View className="flex items-center mb-2">
                <View className="w-1 h-4 bg-blue-600 rounded mr-2"></View>
                <Text className="block text-base font-bold text-gray-900">身体状况评估</Text>
              </View>
              <View className="bg-blue-50 rounded-lg p-3 mb-2">
                <Text className="block text-xs text-blue-600 mb-1">中医健康状况分析</Text>
                <Text className="block text-base font-semibold text-blue-800">
                  {result.diagnosis}
                </Text>
              </View>
              <View className="bg-purple-50 rounded-lg p-3">
                <Text className="block text-xs text-purple-600 mb-1">辨证论治</Text>
                <Text className="block text-sm text-purple-800 leading-relaxed">
                  {result.differentiation}
                </Text>
              </View>
            </View>

            {/* 医案参考信息 */}
            {result.referenceCases && result.referenceCases.length > 0 && (
              <View className="mb-4">
                <View className="flex items-center justify-between mb-3">
                  <View className="flex items-center">
                    <View className="w-1 h-4 bg-amber-500 rounded mr-2"></View>
                    <Text className="block text-base font-bold text-gray-900">经典医案参考</Text>
                  </View>
                  <View className="bg-amber-500 px-3 py-1 rounded-full">
                    <Text className="block text-xs text-white font-medium">
                      {result.referenceCases.length} 条相似医案
                    </Text>
                  </View>
                </View>

                <ScrollView scrollY className="max-h-[400px]">
                  <View className="space-y-3">
                    {result.referenceCases.map((refCase) => (
                      <View
                        key={refCase.id}
                        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border-l-4 border-amber-500 shadow-sm"
                      >
                        {/* 医案头部 */}
                        <View className="flex items-center justify-between mb-3">
                          <View className="flex items-center gap-2">
                            <Text className="block text-xl">📜</Text>
                            <Text className="block text-base font-bold text-gray-900">
                              {refCase.doctorName}（{refCase.doctorEra}）
                            </Text>
                          </View>
                          <View
                            className={`px-3 py-1 rounded-full ${
                              refCase.matchScore >= 0.8
                                ? 'bg-green-500'
                                : refCase.matchScore >= 0.6
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                            }`}
                          >
                            <Text className="block text-xs text-white font-medium">
                              匹配度 {(refCase.matchScore * 100).toFixed(0)}%
                            </Text>
                          </View>
                        </View>

                        {/* 方剂信息 */}
                        <View className="bg-white rounded-lg p-3 mb-2">
                          <View className="flex items-center gap-2 mb-2">
                            <Text className="text-lg">💊</Text>
                            <Text className="block text-sm text-gray-500">参考方剂</Text>
                          </View>
                          <Text className="block text-base font-semibold text-gray-900 mb-2">
                            {refCase.prescriptionName}
                          </Text>
                          <View className="grid grid-cols-2 gap-2">
                            <View>
                              <Text className="block text-xs text-gray-500 mb-1">诊断</Text>
                              <Text className="block text-sm text-gray-900">
                                {refCase.diagnosis}
                              </Text>
                            </View>
                            <View>
                              <Text className="block text-xs text-gray-500 mb-1">辨证</Text>
                              <Text className="block text-sm text-gray-900">
                                {refCase.differentiation}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* 有效率 */}
                        <View className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                          <View className="flex items-center gap-2">
                            <Text className="text-base">✅</Text>
                            <Text className="block text-xs text-gray-600">历史有效率</Text>
                          </View>
                          <Text
                            className={`block text-sm font-bold ${
                              refCase.effectivenessScore >= 0.9
                                ? 'text-green-600'
                                : refCase.effectivenessScore >= 0.8
                                ? 'text-blue-600'
                                : 'text-yellow-600'
                            }`}
                          >
                            {(refCase.effectivenessScore * 100).toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                {/* 处方来源提示 */}
                {result.prescriptionSource && (
                  <View className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <View className="flex items-start gap-2">
                      <Text className="text-lg">🤖</Text>
                      <View className="flex-1">
                        <Text className="block text-xs text-blue-600 mb-1">AI 分析说明</Text>
                        <Text className="block text-sm text-blue-800 leading-relaxed">
                          {result.prescriptionSource}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* 冲突检测提示 */}
                {result.prescriptionDecision && (
                  <>
                    {/* 处方决策信息 */}
                    <View className="mt-3 bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <View className="flex items-start gap-2">
                        <Text className="text-lg">⚖️</Text>
                        <View className="flex-1">
                          <Text className="block text-xs text-purple-600 mb-1">处方决策</Text>
                          <Text className="block text-sm text-purple-800 font-semibold mb-1">
                            主要来源：{result.prescriptionDecision.primarySource}
                          </Text>
                          <Text className="block text-sm text-purple-800 leading-relaxed">
                            {result.prescriptionDecision.decisionReason}
                          </Text>
                          {result.prescriptionDecision.topMatchScore > 0 && (
                            <Text className="block text-xs text-purple-600 mt-2">
                              最高匹配度：{(result.prescriptionDecision.topMatchScore * 100).toFixed(0)}%
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* 冲突警告 */}
                    {result.prescriptionDecision.hasConflict && (
                      <View className="mt-2 bg-red-50 rounded-lg p-3 border border-red-200">
                        <View className="flex items-start gap-2">
                          <Text className="text-lg">⚠️</Text>
                          <View className="flex-1">
                            <Text className="block text-xs text-red-600 mb-1">冲突提示</Text>
                            <Text className="block text-sm text-red-800 leading-relaxed">
                              {result.prescriptionDecision.conflictDetails}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Rp 标志 */}
            <View className="mb-3">
              <Text className="block text-lg font-bold text-gray-900">
                Rp
              </Text>
            </View>

            {/* 方名 */}
            <View className="bg-red-50 rounded-lg p-3 mb-3 border-l-4 border-red-600">
              <Text className="block text-xs text-red-600 mb-1">方名</Text>
              <Text className="block text-xl font-bold text-red-700">
                {result.prescription.formulaName}
              </Text>
              {/* 高风险提示 */}
              {result.prescription.highRiskInfo?.isHighRisk && (
                <View className="mt-2 pt-2 border-t border-red-200">
                  <View className="flex items-start gap-2">
                    <Text className="text-base">⚠️</Text>
                    <View className="flex-1">
                      <Text className="block text-xs text-red-600 font-medium mb-1">高风险处方</Text>
                      <Text className="block text-sm text-red-700 leading-relaxed">
                        {result.prescription.highRiskInfo.reason}
                      </Text>
                      {result.prescription.highRiskInfo.ingredients.length > 0 && (
                        <Text className="block text-xs text-red-600 mt-1">
                          含高风险药材：{result.prescription.highRiskInfo.ingredients.join('、')}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* 药物组成 */}
            <View className="mb-4">
              <View className="flex items-center mb-2">
                <View className="w-1 h-4 bg-green-600 rounded mr-2"></View>
                <Text className="block text-base font-bold text-gray-900">药物组成</Text>
              </View>
              <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {editMode ? (
                  <>
                    {editedIngredients.map((ingredient, index) => (
                      <View
                        key={index}
                        className="flex items-center gap-2 mb-2 p-3 bg-white rounded border border-gray-300 shadow-sm"
                      >
                        <View className="flex-1">
                          <View className="bg-gray-50 rounded px-3 py-2 mb-2">
                            <Input
                              className="w-full bg-transparent text-base"
                              placeholder="药名"
                              value={ingredient.name}
                              onInput={(e) =>
                                handleIngredientChange(index, 'name', e.detail.value)
                              }
                            />
                          </View>
                          <View className="flex gap-2">
                            <View className="bg-gray-50 rounded px-3 py-2 flex-1">
                              <Input
                                className="w-full bg-transparent text-base"
                                placeholder="剂量"
                                value={ingredient.dosage}
                                onInput={(e) =>
                                  handleIngredientChange(index, 'dosage', e.detail.value)
                                }
                              />
                            </View>
                            <View className="bg-gray-50 rounded px-3 py-2 flex-1">
                              <Input
                                className="w-full bg-transparent text-base"
                                placeholder="特殊用法"
                                value={ingredient.special}
                                onInput={(e) =>
                                  handleIngredientChange(index, 'special', e.detail.value)
                                }
                              />
                            </View>
                          </View>
                        </View>
                        <View className="bg-red-600 px-3 py-2 rounded">
                          <Text
                            className="block text-xs text-white"
                            onClick={() => handleDeleteDrug(index)}
                          >
                            删除
                          </Text>
                        </View>
                      </View>
                    ))}
                    {/* 添加新药物 */}
                    <View className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded border-2 border-dashed border-blue-400">
                      <View className="flex-1">
                        <View className="bg-white rounded px-3 py-2 mb-2">
                          <Input
                            className="w-full bg-transparent text-base"
                            placeholder="新药名"
                            value={newDrugName}
                            onInput={(e) => setNewDrugName(e.detail.value)}
                          />
                        </View>
                        <View className="flex gap-2">
                          <View className="bg-white rounded px-3 py-2 flex-1">
                            <Input
                              className="w-full bg-transparent text-base"
                              placeholder="剂量"
                              value={newDrugDosage}
                              onInput={(e) => setNewDrugDosage(e.detail.value)}
                            />
                          </View>
                          <View className="bg-white rounded px-3 py-2 flex-1">
                            <Input
                              className="w-full bg-transparent text-base"
                              placeholder="特殊用法"
                              value={newDrugSpecial}
                              onInput={(e) => setNewDrugSpecial(e.detail.value)}
                            />
                          </View>
                        </View>
                      </View>
                      <View className="bg-blue-600 px-4 py-2 rounded">
                        <Text
                          className="block text-sm text-white font-medium"
                          onClick={handleAddDrug}
                        >
                          添加
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <View className="space-y-2">
                    {result.prescription.ingredients.map((ingredient, index) => (
                      <View
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 shadow-sm"
                      >
                        <View className="flex-1">
                          <Text className="block text-base font-semibold text-gray-900 mb-1">
                            {ingredient.name}
                          </Text>
                          <Text className="block text-sm text-gray-600">
                            {ingredient.dosage}
                          </Text>
                        </View>
                        {ingredient.special && (
                          <View className="bg-orange-100 px-3 py-1 rounded ml-3">
                            <Text className="block text-xs text-orange-700 font-medium">
                              {ingredient.special}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* 煎煮方法与服用方法 */}
            <View className="grid grid-cols-2 gap-4 mb-4">
              <View>
                <View className="flex items-center mb-2">
                  <View className="w-1 h-4 bg-orange-600 rounded mr-2"></View>
                  <Text className="block text-base font-bold text-gray-900">煎煮方法</Text>
                </View>
                <View className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-600">
                  <Text className="block text-sm text-orange-800 leading-relaxed whitespace-pre-line">
                    {result.prescription.decoctionMethod}
                  </Text>
                </View>
              </View>
              <View>
                <View className="flex items-center mb-2">
                  <View className="w-1 h-4 bg-green-600 rounded mr-2"></View>
                  <Text className="block text-base font-bold text-gray-900">服用方法</Text>
                </View>
                <View className="bg-green-50 rounded-lg p-3 border-l-4 border-green-600">
                  <Text className="block text-sm text-green-800 leading-relaxed whitespace-pre-line">
                    {result.prescription.dosageMethod}
                  </Text>
                </View>
              </View>
            </View>

            {/* 治法与注意事项 */}
            <View className="grid grid-cols-2 gap-4 mb-4">
              <View>
                <View className="flex items-center mb-2">
                  <View className="w-1 h-4 bg-indigo-600 rounded mr-2"></View>
                  <Text className="block text-base font-bold text-gray-900">调理原则</Text>
                </View>
                <View className="bg-indigo-50 rounded-lg p-3 border-l-4 border-indigo-600">
                  <Text className="block text-sm text-indigo-800 leading-relaxed">
                    {result.treatmentPrinciple}
                  </Text>
                </View>
              </View>
              <View>
                <View className="flex items-center mb-2">
                  <View className="w-1 h-4 bg-yellow-600 rounded mr-2"></View>
                  <Text className="block text-base font-bold text-gray-900">注意事项</Text>
                </View>
                <View className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-600">
                  <Text className="block text-sm text-yellow-800 leading-relaxed whitespace-pre-line">
                    {result.prescription.precautions}
                  </Text>
                </View>
              </View>
            </View>

            {/* 特殊人群警示信息 */}
            {result.warnings && result.warnings.length > 0 && (
              <View className="mb-4">
                <View className="flex items-center mb-2">
                  <View className="w-1 h-4 bg-red-600 rounded mr-2"></View>
                  <Text className="block text-base font-bold text-gray-900">特殊人群警示</Text>
                </View>
                <View className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600">
                  <View className="space-y-2">
                    {result.warnings.map((warning, index) => (
                      <View key={index} className="flex items-start gap-2">
                        <Text className="text-base">⚠️</Text>
                        <Text className="block text-sm text-red-800 leading-relaxed">
                          {warning}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            </View>
          )}

            {/* 方解 */}
          {result && !highRiskInfo && (
            <View className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
              <View className="flex items-center mb-4">
                <View className="w-1 h-6 bg-purple-600 rounded mr-3"></View>
                <Text className="block text-xl font-bold text-gray-900">
                  方解
                </Text>
              </View>
              <Text className="block text-base text-gray-800 leading-relaxed whitespace-pre-line">
                {result.explanation}
              </Text>
            </View>
          )}

            {/* 调护建议 */}
          {result && !highRiskInfo && (
            <View className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-teal-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                调护建议
              </Text>
            </View>
            <Text className="block text-base text-gray-800 leading-relaxed whitespace-pre-line">
              {result.advice}
            </Text>
          </View>
          )}

          {/* 返回首页按钮 */}
          {result && !highRiskInfo && (
            <View className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <View
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 py-4 rounded-xl"
                onClick={handleReturnHome}
              >
                <Text className="block text-lg font-semibold text-white text-center">
                  🏠 返回首页
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* 重要免责声明 */}
      <View className="mt-8 mb-6 px-4">
        <View className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <View className="flex items-start gap-3 mb-3">
            <Text className="text-2xl">⚠️</Text>
            <View className="flex-1">
              <Text className="block text-lg font-bold text-red-700 mb-2">
                重要提示
              </Text>
              <Text className="block text-sm text-red-800 leading-relaxed">
                本建议方案必须找线下医疗机构执业中医师确认才能生效。AI 生成的健康建议仅供参考，不能替代专业医师的诊断和治疗。请务必在专业中医师指导下使用本方案。
              </Text>
            </View>
          </View>
          <View className="mt-3 pt-3 border-t border-red-200">
            <Text className="block text-xs text-red-600 text-center">
              本系统不承担因直接使用本方案而产生的任何责任
            </Text>
          </View>
        </View>
      </View>
      </ScrollView>
      </View>

      {/* 底部充值按钮（缩小版） */}
      {isAuthenticated && user?.role !== 'admin' && (
        <View style={{
          position: 'fixed',
          bottom: 50,
          left: 0,
          right: 0,
          padding: '8px 16px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e5e5e5',
          zIndex: 100
        }}
        >
          <View
            style={{
              background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)',
              borderRadius: '8px',
              padding: '8px'
            }}
            onClick={() => {
              Taro.navigateTo({
                url: '/pages/recharge/index',
              })
            }}
          >
            <Text className="block text-sm font-medium text-white text-center">
              💰 账户充值
            </Text>
          </View>
        </View>
      )}

      {/* 套餐选择弹窗 */}
      {showPackageModal && (
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}
        >
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '20px'
          }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Text className="block text-xl font-bold text-gray-900">
                选择服务套餐
              </Text>
              <View
                style={{ width: '32px', height: '32px', backgroundColor: '#f3f4f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowPackageModal(false)}
              >
                <Text className="block text-lg text-gray-600">×</Text>
              </View>
            </View>

            {packages.length === 0 ? (
              <View style={{ padding: '40px 0', textAlign: 'center' }}>
                <Text className="block text-gray-500 mb-2">暂无可用套餐</Text>
                <Text className="block text-sm text-gray-400">请联系管理员添加套餐</Text>
              </View>
            ) : (
              <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {packages.map((pkg) => (
                  <View
                    key={pkg.id}
                    style={{
                      border: pkg.id === selectedPackage?.id ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '16px',
                      backgroundColor: pkg.id === selectedPackage?.id ? '#fffbeb' : '#ffffff'
                    }}
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Text className="block text-lg font-bold text-gray-900">
                        {pkg.name}
                      </Text>
                      <Text className="block text-2xl font-bold text-amber-600">
                        ¥{pkg.price}
                      </Text>
                    </View>
                    <View style={{ marginBottom: '8px' }}>
                      <Text className="block text-sm text-gray-600">
                        有效期：{pkg.duration} 天
                      </Text>
                    </View>
                    {pkg.description && (
                      <View>
                        <Text className="block text-sm text-gray-500">
                          {pkg.description}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* 确认选择按钮 */}
            {isSelectingPackage && selectedPackage && (
              <View style={{ marginTop: '16px' }}>
                <View
                  style={{
                    background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)',
                    borderRadius: '12px',
                    padding: '14px'
                  }}
                  onClick={handleConfirmSelectPackage}
                >
                  <Text className="block text-lg font-semibold text-white text-center">
                    确认选择
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 支付方式选择弹窗 */}
      {showPaymentModal && selectedPackage && (
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}
        >
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            padding: '20px'
          }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Text className="block text-xl font-bold text-gray-900">
                确认订单
              </Text>
              <View
                style={{ width: '32px', height: '32px', backgroundColor: '#f3f4f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowPaymentModal(false)}
              >
                <Text className="block text-lg text-gray-600">×</Text>
              </View>
            </View>

            <View style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <View style={{ marginBottom: '8px' }}>
                <Text className="block text-sm text-gray-500">套餐名称</Text>
                <Text className="block text-lg font-bold text-gray-900">{selectedPackage.name}</Text>
              </View>
              <View style={{ marginBottom: '8px' }}>
                <Text className="block text-sm text-gray-500">有效期</Text>
                <Text className="block text-base text-gray-900">{selectedPackage.duration} 天</Text>
              </View>
              <View>
                <Text className="block text-sm text-gray-500">支付金额</Text>
                <Text className="block text-2xl font-bold text-amber-600">¥{selectedPackage.price}</Text>
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text className="block text-base font-semibold text-gray-900 mb-3">
                选择支付方式
              </Text>
              <View style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <View
                  style={{
                    border: selectedPaymentMethod === 'wechat' ? '2px solid #07c160' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: selectedPaymentMethod === 'wechat' ? '#f0fdf4' : '#ffffff'
                  }}
                  onClick={() => setSelectedPaymentMethod('wechat')}
                >
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text className="block text-2xl">💚</Text>
                    <Text className="block text-base font-medium text-gray-900">微信支付</Text>
                  </View>
                  {selectedPaymentMethod === 'wechat' && (
                    <Text className="block text-green-600">✓</Text>
                  )}
                </View>

                <View
                  style={{
                    border: selectedPaymentMethod === 'alipay' ? '2px solid #1677ff' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: selectedPaymentMethod === 'alipay' ? '#eff6ff' : '#ffffff'
                  }}
                  onClick={() => setSelectedPaymentMethod('alipay')}
                >
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text className="block text-2xl">💙</Text>
                    <Text className="block text-base font-medium text-gray-900">支付宝</Text>
                  </View>
                  {selectedPaymentMethod === 'alipay' && (
                    <Text className="block text-blue-600">✓</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={{ display: 'flex', gap: '8px' }}>
              <View
                style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '12px' }}
                onClick={() => setShowPaymentModal(false)}
              >
                <Text className="block text-base font-medium text-gray-700 text-center">取消</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)',
                  borderRadius: '8px',
                  padding: '12px',
                  opacity: orderLoading ? 0.6 : 1
                }}
                onClick={handleCreateOrder}
              >
                <Text className="block text-base font-semibold text-white text-center">
                  {orderLoading ? '创建中...' : '确认支付'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 免责声明 - 固定在页面底部 */}
      <View
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fffbeb',
          borderTop: '2px solid #f59e0b',
          padding: '12px 16px',
          zIndex: 50
        }}
      >
        <View style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Text className="block text-xl" style={{ marginTop: '2px' }}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text className="block text-sm font-bold text-amber-900 mb-1">
              免责声明
            </Text>
            <Text className="block text-xs text-amber-800 leading-relaxed">
              本平台提供的中医健康管理建议仅供参考，不构成任何医疗诊断、治疗方案或用药建议。如遇身体不适，请及时前往正规医疗机构就诊。
            </Text>
          </View>
        </View>
      </View>
        </ResponsiveContainer>
    </View>
  )
}

export default IndexPage
