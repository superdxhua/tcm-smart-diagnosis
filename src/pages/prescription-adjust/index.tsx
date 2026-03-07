import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Network } from '@/network'

interface MedicalRecord {
  id: string
  patientId: string
  patientName: string
  visitDate: string
  chiefComplaint: string
  diagnosis: string
  prescription: {
    herbs: string[]
    dosage: string
    instructions: string
  }
  symptoms: string
  pulse: string
  tongue: string
  doctorName: string
  status: string
}

export default function PrescriptionAdjustPage() {
  const [recordId, setRecordId] = useState('')
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    originalHerbs: '',
    originalDosage: '',
    originalInstructions: '',
    adjustedHerbs: '',
    adjustedDosage: '',
    adjustedInstructions: '',
    adjustmentReason: '',
    adjustmentDate: new Date().toISOString()
  })

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.recordId) {
      setRecordId(params.recordId)
      loadRecord(params.recordId)
    }
  }, [])

  const loadRecord = async (id: string) => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: `/api/health-records/${id}`, // 使用正确的 API 路径
        method: 'GET'
      })
      
      if (res.statusCode === 200) {
        const recordData = res.data.data
        if (recordData) {
          setRecord(recordData)
          // 转换后端返回的下划线命名为前端使用的驼峰命名
          const prescriptionText = recordData.health_plan || '' // 使用 health_plan 而不是 prescription
          setFormData({
            originalHerbs: prescriptionText,
            originalDosage: '',
            originalInstructions: recordData.advice || '',
            adjustedHerbs: prescriptionText,
            adjustedDosage: '',
            adjustedInstructions: recordData.advice || '',
            adjustmentReason: '',
            adjustmentDate: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error('加载病历失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.adjustmentReason) {
      Taro.showToast({
        title: '请填写调整原因',
        icon: 'none'
      })
      return
    }

    try {
      setLoading(true)
      
      const data = {
        recordId,
        originalPrescription: {
          herbs: formData.originalHerbs.split('、').filter(h => h.trim()),
          dosage: formData.originalDosage,
          instructions: formData.originalInstructions
        },
        adjustedPrescription: {
          herbs: formData.adjustedHerbs.split('、').filter(h => h.trim()),
          dosage: formData.adjustedDosage,
          instructions: formData.adjustedInstructions
        },
        adjustmentReason: formData.adjustmentReason,
        adjustmentDate: formData.adjustmentDate,
        status: 'pending'
      }

      const res = await Network.request({
        url: '/api/prescription-adjustments',
        method: 'POST',
        data
      })

      if (res.statusCode === 200) {
        // 更新病历状态为调整中
        await Network.request({
          url: `/api/health-records/${recordId}`, // 使用正确的 API 路径
          method: 'PUT',
          data: { status: 'adjusting' }
        })
        
        Taro.showToast({
          title: '处方调整已提交',
          icon: 'success'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('提交失败:', error)
      Taro.showToast({
        title: '提交失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (record?.prescription) {
      setFormData({
        ...formData,
        adjustedHerbs: record.prescription.herbs?.join('、') || '',
        adjustedDosage: record.prescription.dosage || '',
        adjustedInstructions: record.prescription.instructions || ''
      })
    }
  }

  const handleChatWithAI = () => {
    if (!recordId) {
      Taro.showToast({
        title: '处方信息未加载',
        icon: 'none'
      })
      return
    }

    Taro.navigateTo({
      url: `/pages/ai-chat/index?recordId=${recordId}`
    })
  }

  if (loading) {
    return (
      <View className="flex items-center justify-center min-h-screen bg-gray-50">
        <Text className="block text-gray-500">加载中...</Text>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <View className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <View
              className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => Taro.navigateBack()}
            >
              <Text className="block text-lg text-gray-600">←</Text>
            </View>
            <Text className="block text-xl font-bold text-gray-800">调整处方</Text>
          </View>
        </View>
      </View>

      {/* 表单内容 */}
      <ScrollView scrollY className="flex-1 px-4 py-4">
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">原处方</Text>
          
          {/* 原处方组成 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">药物组成</Text>
            <Input
              className="w-full bg-blue-50 rounded-lg px-4 py-3"
              value={formData.originalHerbs}
              disabled
            />
          </View>

          {/* 原剂量 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">剂量</Text>
            <Input
              className="w-full bg-blue-50 rounded-lg px-4 py-3"
              value={formData.originalDosage}
              disabled
            />
          </View>

          {/* 原服用方法 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">服用方法</Text>
            <Input
              className="w-full bg-blue-50 rounded-lg px-4 py-3"
              value={formData.originalInstructions}
              disabled
            />
          </View>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">调整后处方</Text>
          
          {/* 调整后处方组成 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              药物组成 <Text className="block text-red-500">*</Text>
            </Text>
            <Input
              className="w-full bg-green-50 rounded-lg px-4 py-3"
              placeholder="请输入药物，用顿号分隔"
              value={formData.adjustedHerbs}
              onInput={(e) => setFormData({ ...formData, adjustedHerbs: e.detail.value })}
            />
          </View>

          {/* 调整后剂量 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              剂量 <Text className="block text-red-500">*</Text>
            </Text>
            <Input
              className="w-full bg-green-50 rounded-lg px-4 py-3"
              placeholder="请输入剂量"
              value={formData.adjustedDosage}
              onInput={(e) => setFormData({ ...formData, adjustedDosage: e.detail.value })}
            />
          </View>

          {/* 调整后服用方法 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              服用方法 <Text className="block text-red-500">*</Text>
            </Text>
            <Input
              className="w-full bg-green-50 rounded-lg px-4 py-3"
              placeholder="请输入服用方法"
              value={formData.adjustedInstructions}
              onInput={(e) => setFormData({ ...formData, adjustedInstructions: e.detail.value })}
            />
          </View>

          {/* 调整原因 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              调整原因 <Text className="block text-red-500">*</Text>
            </Text>
            <Input
              className="w-full bg-orange-50 rounded-lg px-4 py-3"
              placeholder="请详细说明调整原因（如：疗效不明显、出现副作用等）"
              value={formData.adjustmentReason}
              onInput={(e) => setFormData({ ...formData, adjustmentReason: e.detail.value })}
            />
          </View>

          {/* 调整日期 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">调整日期</Text>
            <Input
              className="w-full bg-gray-50 rounded-lg px-4 py-3"
              value={new Date(formData.adjustmentDate).toLocaleDateString()}
              disabled
            />
          </View>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={{ position: 'fixed', bottom: 50, left: 0, right: 0, display: 'flex', flexDirection: 'row', gap: '8px', padding: '12px', backgroundColor: '#fff', borderTop: '1px solid #e5e5e5', zIndex: 100 }}>
        <View style={{ flex: 1 }}>
          <Button
            className="w-full bg-gray-500 text-white rounded-lg py-3"
            onClick={handleReset}
          >
            重置
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            className="w-full bg-purple-500 text-white rounded-lg py-3"
            onClick={handleChatWithAI}
          >
            与AI讨论
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            className="w-full bg-blue-500 text-white rounded-lg py-3"
            onClick={handleSubmit}
          >
            提交调整
          </Button>
        </View>
      </View>
    </View>
  )
}
