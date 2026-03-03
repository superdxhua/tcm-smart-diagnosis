import { View, Text, ScrollView } from '@tarojs/components'
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
    isPending: boolean // 是否待开方
  }
  symptoms: string
  pulse: string
  tongue: string
  doctorName: string
  status: string
}

export default function RecordsListPage() {
  const [patientId, setPatientId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    // 支持两种参数名：memberId 和 patientId（兼容性）
    const pid = params?.patientId || params?.memberId
    const pName = params?.patientName || params?.memberName

    if (pid) {
      setPatientId(pid)
    }
    if (pName) {
      setPatientName(decodeURIComponent(pName))
    }
    if (pid) {
      loadRecords(pid)
    }
  }, [])

  const loadRecords = async (pid: string) => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: `/api/health-records/member/${pid}`,
        method: 'GET'
      })

      console.log('加载病历列表响应:', res.data)

      if (res.statusCode === 200 && res.data.data) {
        // 转换后端返回的下划线命名为前端使用的驼峰命名
        const convertedRecords = (res.data.data || []).map((record: any) => {
          // 判断是否为"待开方"
          const isPendingPrescription = record.health_plan === '待开方' || !record.health_plan || record.health_plan.trim() === ''

          return {
            id: record.id,
            patientId: record.member_id,  // 注意：后端使用 member_id
            patientName: '',
            visitDate: record.created_at,
            chiefComplaint: record.chief_complaint || '',
            diagnosis: record.analysis_result || record.differentiation || '',  // 使用分析结果或辨证
            prescription: {
              herbs: [],  // 后端的 health_plan 是完整的方剂说明，不是草药列表
              dosage: '',
              instructions: record.advice || '',
              isPending: isPendingPrescription
            },
            symptoms: record.history || '',
            pulse: '',
            tongue: '',
            doctorName: record.consultant_id || '',
            status: record.status || '进行中'
          }
        })
        console.log('转换后的病历数据:', convertedRecords)
        setRecords(convertedRecords)
      }
    } catch (error) {
      console.error('加载病历列表失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRecordClick = (recordId: string) => {
    Taro.navigateTo({
      url: `/pages/record-detail/index?id=${recordId}`
    })
  }

  const handleAddRecord = () => {
    if (!patientId) {
      Taro.showToast({
        title: '请先选择用户',
        icon: 'none'
      })
      return
    }
    // 统一使用 memberId 和 memberName（与后端 members 表一致）
    Taro.navigateTo({
      url: `/pages/record-detail/index?memberId=${patientId}&memberName=${encodeURIComponent(patientName)}`
    })
  }

  // 处理"待开方"按钮点击
  const handlePendingPrescription = (record: MedicalRecord) => {
    console.log('待开方按钮点击，病历ID:', record.id)
    console.log('用户信息:', patientId, patientName)
    console.log('主诉:', record.chiefComplaint)
    console.log('症状:', record.symptoms)

    // 跳转到首页，自动启动智能诊疗
    // 统一使用 memberId 和 memberName（与后端 members 表一致）
    Taro.reLaunch({
      url: `/pages/index/index?memberId=${patientId}&memberName=${encodeURIComponent(patientName || '')}&autoStart=true&chiefComplaint=${encodeURIComponent(record.chiefComplaint)}&symptoms=${encodeURIComponent(record.symptoms || '')}`
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
            <View>
              <Text className="block text-lg font-bold text-gray-800">
                {patientName || '病历列表'}
              </Text>
              {records.length > 0 && (
                <Text className="block text-sm text-gray-500">
                  共 {records.length} 条就诊记录
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* 添加按钮 */}
      <View className="px-4 py-3">
        <View
          className="bg-blue-500 text-white text-center py-3 rounded-lg"
          onClick={handleAddRecord}
        >
          <Text className="block font-semibold">+ 新增病历</Text>
        </View>
      </View>

      {/* 病历列表 */}
      {records.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-20">
          <Text className="block text-gray-400 text-lg">暂无病历记录</Text>
          <Text className="block text-gray-400 text-sm mt-2">点击上方按钮添加病历</Text>
        </View>
      ) : (
        <ScrollView scrollY className="flex-1 px-4 pb-4">
          {records.map((record) => (
            <View
              key={record.id}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm"
              onClick={() => handleRecordClick(record.id)}
            >
              {/* 日期和状态 */}
              <View className="flex items-center justify-between mb-2">
                <Text className="block text-lg font-semibold text-gray-800">
                  {new Date(record.visitDate).toLocaleDateString()}
                </Text>
                <View
                  className={`px-2 py-1 rounded text-xs ${
                    record.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : record.status === 'adjusting'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Text className="block">
                    {record.status === 'completed'
                      ? '已完成'
                      : record.status === 'adjusting'
                      ? '调整中'
                      : '进行中'}
                  </Text>
                </View>
              </View>

              {/* 医师 */}
              <View className="flex items-center gap-2 mb-2">
                <Text className="block text-sm text-gray-500">
                  接诊医师：{record.doctorName}
                </Text>
              </View>

              {/* 主诉 */}
              {record.chiefComplaint && (
                <View className="bg-blue-50 rounded-lg p-3 mb-2">
                  <Text className="block text-sm text-gray-700">
                    主诉：{record.chiefComplaint}
                  </Text>
                </View>
              )}

              {/* 诊断 */}
              {record.diagnosis && (
                <View className="bg-purple-50 rounded-lg p-3 mb-2">
                  <Text className="block text-sm text-gray-700">
                    诊断：{record.diagnosis}
                  </Text>
                </View>
              )}

              {/* 脉象和舌象 */}
              {(record.pulse || record.tongue) && (
                <View className="flex gap-2 mb-2">
                  {record.pulse && (
                    <View className="flex-1 bg-gray-50 rounded-lg p-2">
                      <Text className="block text-xs text-gray-500">脉象</Text>
                      <Text className="block text-sm text-gray-800">{record.pulse}</Text>
                    </View>
                  )}
                  {record.tongue && (
                    <View className="flex-1 bg-gray-50 rounded-lg p-2">
                      <Text className="block text-xs text-gray-500">舌象</Text>
                      <Text className="block text-sm text-gray-800">{record.tongue}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* 处方预览 */}
              {record.prescription.isPending ? (
                <View
                  className="bg-orange-500 rounded-lg p-3 mb-2"
                  onClick={(e) => {
                    e.stopPropagation() // 阻止冒泡，避免触发病历卡片点击
                    handlePendingPrescription(record)
                  }}
                >
                  <Text className="block text-white text-center font-semibold">
                    待开方 - 点击生成处方
                  </Text>
                </View>
              ) : record.prescription.herbs.length > 0 ? (
                <View className="bg-green-50 rounded-lg p-3 mb-2">
                  <Text className="block text-xs text-gray-500 mb-1">处方组成</Text>
                  <Text className="block text-sm text-gray-800">
                    {record.prescription.herbs.join('、')} ({record.prescription.dosage})
                  </Text>
                </View>
              ) : null}

              {/* 症状 */}
              {record.symptoms && (
                <View className="bg-orange-50 rounded-lg p-3">
                  <Text className="block text-xs text-orange-600 mb-1">症状表现</Text>
                  <Text className="block text-sm text-orange-800">{record.symptoms}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
