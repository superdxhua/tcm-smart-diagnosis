import { View, Text, Input, Button, Picker, ScrollView } from '@tarojs/components'
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

const satisfactionOptions = ['非常满意', '满意', '一般', '不满意', '非常不满意']
const effectivenessOptions = ['非常有效', '有效', '一般', '无效', '加重']

export default function MedicationFeedbackPage() {
  const [recordId, setRecordId] = useState('')
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    satisfaction: '满意',
    effectiveness: '有效',
    sideEffects: '',
    feedbackDate: new Date().toISOString(),
    notes: ''
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
      
      if (res.statusCode === 200 && res.data.data) {
        const recordData = res.data.data
        // 转换后端返回的下划线命名为前端使用的驼峰命名
        const prescriptionText = recordData.health_plan || '' // 使用 health_plan 而不是 prescription
        const convertedRecord = {
          id: recordData.id,
          patientId: recordData.member_id, // 使用 member_id 而不是 patient_id
          patientName: '',
          visitDate: recordData.created_at,
          chiefComplaint: recordData.chief_complaint,
          diagnosis: recordData.analysis_result, // 使用 analysis_result 而不是 diagnosis
          prescription: {
            herbs: prescriptionText.split('、').filter((h: string) => h.trim()),
            dosage: '',
            instructions: recordData.advice || ''
          },
          symptoms: recordData.history,
          pulse: '',
          tongue: '',
          doctorName: recordData.doctor_id,
          status: recordData.status
        }
        setRecord(convertedRecord)
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
    try {
      setLoading(true)
      
      const data = {
        recordId,
        patientId: record?.patientId,
        patientName: record?.patientName,
        prescription: record?.prescription,
        satisfaction: formData.satisfaction,
        effectiveness: formData.effectiveness,
        sideEffects: formData.sideEffects,
        feedbackDate: formData.feedbackDate,
        notes: formData.notes
      }

      const res = await Network.request({
        url: '/api/medication-feedback',
        method: 'POST',
        data
      })

      if (res.statusCode === 200) {
        // 更新病历状态为已完成
        await Network.request({
          url: `/api/health-records/${recordId}`, // 使用正确的 API 路径
          method: 'PUT',
          data: { status: 'completed' }
        })
        
        Taro.showToast({
          title: '反馈提交成功',
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
            <Text className="block text-xl font-bold text-gray-800">服药反馈</Text>
          </View>
        </View>
      </View>

      {/* 表单内容 */}
      <ScrollView scrollY className="flex-1 px-4 py-4">
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">当前处方</Text>
          
          {/* 用户信息 */}
          {record?.patientName && (
            <View className="mb-3 bg-blue-50 rounded-lg p-3">
              <Text className="block text-sm text-gray-600">用户：{record.patientName}</Text>
            </View>
          )}

          {/* 处方组成 */}
          {record?.prescription?.herbs && record.prescription.herbs.length > 0 && (
            <View className="mb-3">
              <Text className="block text-sm font-medium text-gray-700 mb-2">药物组成</Text>
              <Input
                className="w-full bg-green-50 rounded-lg px-4 py-3"
                value={record.prescription.herbs.join('、')}
                disabled
              />
            </View>
          )}

          {/* 剂量 */}
          {record?.prescription?.dosage && (
            <View className="mb-3">
              <Text className="block text-sm font-medium text-gray-700 mb-2">剂量</Text>
              <Input
                className="w-full bg-green-50 rounded-lg px-4 py-3"
                value={record.prescription.dosage}
                disabled
              />
            </View>
          )}

          {/* 服用方法 */}
          {record?.prescription?.instructions && (
            <View className="mb-3">
              <Text className="block text-sm font-medium text-gray-700 mb-2">服用方法</Text>
              <Input
                className="w-full bg-green-50 rounded-lg px-4 py-3"
                value={record.prescription.instructions}
                disabled
              />
            </View>
          )}
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="block text-lg font-semibold text-gray-800 mb-3">反馈信息</Text>
          
          {/* 满意度 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              整体满意度 <Text className="block text-red-500">*</Text>
            </Text>
            <Picker
              mode="selector"
              range={satisfactionOptions}
              value={satisfactionOptions.indexOf(formData.satisfaction)}
              onChange={(e) => setFormData({ ...formData, satisfaction: satisfactionOptions[e.detail.value] })}
            >
              <View className="w-full bg-gray-50 rounded-lg px-4 py-3">
                <Text className="block text-gray-800">{formData.satisfaction}</Text>
              </View>
            </Picker>
          </View>

          {/* 疗效 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              治疗效果 <Text className="block text-red-500">*</Text>
            </Text>
            <Picker
              mode="selector"
              range={effectivenessOptions}
              value={effectivenessOptions.indexOf(formData.effectiveness)}
              onChange={(e) => setFormData({ ...formData, effectiveness: effectivenessOptions[e.detail.value] })}
            >
              <View className="w-full bg-gray-50 rounded-lg px-4 py-3">
                <Text className="block text-gray-800">{formData.effectiveness}</Text>
              </View>
            </Picker>
          </View>

          {/* 副作用 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">副作用</Text>
            <Input
              className="w-full bg-orange-50 rounded-lg px-4 py-3"
              placeholder="如有副作用，请详细描述（如：胃部不适、皮疹等）"
              value={formData.sideEffects}
              onInput={(e) => setFormData({ ...formData, sideEffects: e.detail.value })}
            />
          </View>

          {/* 其他备注 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">其他备注</Text>
            <Input
              className="w-full bg-gray-50 rounded-lg px-4 py-3"
              placeholder="请输入其他需要说明的内容"
              value={formData.notes}
              onInput={(e) => setFormData({ ...formData, notes: e.detail.value })}
            />
          </View>

          {/* 反馈日期 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">反馈日期</Text>
            <Input
              className="w-full bg-gray-50 rounded-lg px-4 py-3"
              value={new Date(formData.feedbackDate).toLocaleDateString()}
              disabled
            />
          </View>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={{ position: 'fixed', bottom: 50, left: 0, right: 0, padding: '12px', backgroundColor: '#fff', borderTop: '1px solid #e5e5e5', zIndex: 100 }}>
        <Button
          className="w-full bg-blue-500 text-white rounded-lg py-3"
          onClick={handleSubmit}
        >
          提交反馈
        </Button>
      </View>
    </View>
  )
}
