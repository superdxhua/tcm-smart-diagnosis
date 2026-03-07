import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Network } from '@/network'

interface FormulaDetail {
  formula: string
  source: string
  chapter: string
  originalText: string
  keySymptoms: string[]
  mechanism: string
  treatmentMethod: string
  indications: string[]
  contraindications: string[]
  dosage: string
  instructions: string
}

export default function FormulaDetailPage() {
  const router = useRouter()
  const [formula, setFormula] = useState<FormulaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const formulaName = decodeURIComponent(router.params.name || '')

  const loadFormulaDetail = useCallback(async () => {
    setLoading(true)
    try {
      // 📡 步骤 1：前端发起 HTTP 请求
      console.log('[FormulaDetail] 开始查询方剂详情:', formulaName)
      console.log('[FormulaDetail] 请求 URL:', `/api/formula-management/formulas/${encodeURIComponent(formulaName)}`)
      console.log('[FormulaDetail] 请求方法:', 'GET')

      // 使用 Network.request 发起请求
      const res = await Network.request({
        url: `/api/formula-management/formulas/${encodeURIComponent(formulaName)}`,
        method: 'GET'
      })

      console.log('[FormulaDetail] 收到响应:', res.data)

      if (res.data.code === 200) {
        setFormula(res.data.data)
      } else {
        Taro.showToast({ title: res.data.msg || '加载失败', icon: 'none' })
      }
    } catch (error) {
      console.error('[FormulaDetail] 查询失败:', error)
      Taro.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [formulaName])

  useEffect(() => {
    loadFormulaDetail()
  }, [loadFormulaDetail])

  if (loading) {
    return (
      <View className="flex items-center justify-center h-full">
        <Text className="block text-gray-500">加载中...</Text>
      </View>
    )
  }

  if (!formula) {
    return (
      <View className="flex items-center justify-center h-full">
        <Text className="block text-gray-400">方剂未找到</Text>
      </View>
    )
  }

  return (
    <ScrollView className="h-full bg-gray-50">
      <View className="bg-white p-6">
        {/* 方剂名称 */}
        <Text className="block text-2xl font-bold text-gray-800 mb-4">
          {formula.formula}
        </Text>

        {/* 基本信息 */}
        <View className="mb-6">
          <Text className="block text-sm font-semibold text-gray-700 mb-2">基本信息</Text>
          <View className="flex flex-wrap gap-2">
            <Text className="block px-3 py-1 bg-red-100 text-red-600 text-sm rounded">
              治法：{formula.treatmentMethod}
            </Text>
            <Text className="block px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded">
              来源：{formula.source}
            </Text>
          </View>
          {formula.chapter && (
            <Text className="block text-sm text-gray-600 mt-2">
              章节：{formula.chapter}
            </Text>
          )}
        </View>

        {/* 原文 */}
        {formula.originalText && (
          <View className="mb-6">
            <Text className="block text-sm font-semibold text-gray-700 mb-2">经典原文</Text>
            <View className="bg-gray-50 p-4 rounded-lg">
              <Text className="block text-base text-gray-800 leading-relaxed">
                {formula.originalText}
              </Text>
            </View>
          </View>
        )}

        {/* 病机 */}
        {formula.mechanism && (
          <View className="mb-6">
            <Text className="block text-sm font-semibold text-gray-700 mb-2">病机</Text>
            <Text className="block text-base text-gray-800 leading-relaxed">
              {formula.mechanism}
            </Text>
          </View>
        )}

        {/* 主症 */}
        {formula.keySymptoms.length > 0 && (
          <View className="mb-6">
            <Text className="block text-sm font-semibold text-gray-700 mb-2">主症</Text>
            <View className="flex flex-wrap gap-2">
              {formula.keySymptoms.map((symptom, index) => (
                <Text key={index} className="block px-3 py-1 bg-green-100 text-green-600 text-sm rounded">
                  {symptom}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* 适应症 */}
        {formula.indications.length > 0 && (
          <View className="mb-6">
            <Text className="block text-sm font-semibold text-gray-700 mb-2">适应症</Text>
            <View className="flex flex-col gap-2">
              {formula.indications.map((indication, index) => (
                <Text key={index} className="block text-sm text-gray-700">
                  • {indication}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* 禁忌症 */}
        {formula.contraindications.length > 0 && (
          <View className="mb-6">
            <Text className="block text-sm font-semibold text-gray-700 mb-2">禁忌症</Text>
            <View className="flex flex-col gap-2">
              {formula.contraindications.map((contraindication, index) => (
                <Text key={index} className="block text-sm text-gray-700">
                  • {contraindication}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* 剂量 */}
        {formula.dosage && (
          <View className="mb-6">
            <Text className="block text-sm font-semibold text-gray-700 mb-2">剂量</Text>
            <Text className="block text-base text-gray-800">
              {formula.dosage}
            </Text>
          </View>
        )}

        {/* 煎服法 */}
        {formula.instructions && (
          <View className="mb-6">
            <Text className="block text-sm font-semibold text-gray-700 mb-2">煎服法</Text>
            <Text className="block text-base text-gray-800 leading-relaxed">
              {formula.instructions}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
