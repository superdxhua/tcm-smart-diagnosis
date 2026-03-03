import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Network } from '@/network'

interface LearningSummary {
  stats: {
    total: number
    effective: number
    ineffective: number
    averageSatisfaction: number
  }
  summary: {
    successPatterns: string[]
    failurePatterns: string[]
    keyInsights: string[]
    recommendations: string[]
    topEffectivePrescriptions: Array<{
      diagnosis: string
      prescription: string
      effectiveness: string
    }>
  }
  timestamp: string
}

export default function LearningCenterPage() {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<LearningSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadLearningSummary()
  }, [])

  const loadLearningSummary = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await Network.request({
        url: '/api/medication-feedback/learning-summary',
        method: 'GET'
      })

      if (res.statusCode === 200) {
        setSummary(res.data.data)
      } else {
        setError(res.data.msg || '加载失败')
      }
    } catch (err: any) {
      console.error('加载学习总结失败:', err)
      setError(err.message || '网络请求失败')
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
              className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg"
              onClick={() => Taro.navigateBack()}
            >
              <Text className="block text-lg text-gray-600">←</Text>
            </View>
            <Text className="block text-xl font-bold text-gray-800">学习中心</Text>
          </View>
          <View
            className="bg-blue-500 px-3 py-2 rounded-lg"
            onClick={loadLearningSummary}
          >
            <Text className="block text-xs text-white">刷新</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className="flex-1 px-4 py-4">
        {/* 快捷入口 */}
        <View className="bg-white rounded-xl p-6 shadow-md mb-4">
          <View className="flex items-center mb-4">
            <View className="w-1 h-6 bg-orange-600 rounded mr-3"></View>
            <Text className="block text-xl font-bold text-gray-900">快捷入口</Text>
          </View>

          <View className="grid grid-cols-2 gap-4">
            <View
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-orange-200"
              onClick={() => Taro.navigateTo({ url: '/pages/medical-cases/index' })}
            >
              <Text className="block text-3xl mb-2">📚</Text>
              <Text className="block text-base font-semibold text-gray-900 mb-1">
                经典医案
              </Text>
              <Text className="block text-xs text-gray-600">
                历代名医经验
              </Text>
            </View>

            <View
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200"
              onClick={() => Taro.navigateTo({ url: '/pages/records-list/index' })}
            >
              <Text className="block text-3xl mb-2">📋</Text>
              <Text className="block text-base font-semibold text-gray-900 mb-1">
                我的病历
              </Text>
              <Text className="block text-xs text-gray-600">
                查看诊疗记录
              </Text>
            </View>
          </View>
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <Text className="block text-red-700 text-sm">{error}</Text>
          </View>
        )}

        {summary && (
          <>
            {/* 统计数据 */}
            <View className="bg-white rounded-xl p-6 shadow-md mb-4">
              <View className="flex items-center mb-4">
                <View className="w-1 h-6 bg-blue-600 rounded mr-3"></View>
                <Text className="block text-xl font-bold text-gray-900">学习统计</Text>
              </View>

              <View className="grid grid-cols-2 gap-4">
                <View className="bg-blue-50 rounded-lg p-4 text-center">
                  <Text className="block text-3xl font-bold text-blue-600 mb-1">
                    {summary.stats.total}
                  </Text>
                  <Text className="block text-sm text-gray-600">总反馈数</Text>
                </View>

                <View className="bg-green-50 rounded-lg p-4 text-center">
                  <Text className="block text-3xl font-bold text-green-600 mb-1">
                    {summary.stats.effective}
                  </Text>
                  <Text className="block text-sm text-gray-600">有效案例</Text>
                </View>

                <View className="bg-red-50 rounded-lg p-4 text-center">
                  <Text className="block text-3xl font-bold text-red-600 mb-1">
                    {summary.stats.ineffective}
                  </Text>
                  <Text className="block text-sm text-gray-600">无效案例</Text>
                </View>

                <View className="bg-purple-50 rounded-lg p-4 text-center">
                  <Text className="block text-3xl font-bold text-purple-600 mb-1">
                    {summary.stats.averageSatisfaction}
                  </Text>
                  <Text className="block text-sm text-gray-600">平均满意度</Text>
                </View>
              </View>
            </View>

            {/* 成功模式 */}
            <View className="bg-white rounded-xl p-6 shadow-md mb-4">
              <View className="flex items-center mb-4">
                <View className="w-1 h-6 bg-green-600 rounded mr-3"></View>
                <Text className="block text-xl font-bold text-gray-900">成功模式</Text>
              </View>

              {summary.summary.successPatterns.length > 0 ? (
                <View className="space-y-2">
                  {summary.summary.successPatterns.map((pattern, index) => (
                    <View key={index} className="bg-green-50 rounded-lg p-3 border-l-4 border-green-600">
                      <Text className="block text-sm text-green-800 leading-relaxed">
                        {index + 1}. {pattern}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="block text-sm text-gray-500">暂无足够数据</Text>
              )}
            </View>

            {/* 失败模式 */}
            <View className="bg-white rounded-xl p-6 shadow-md mb-4">
              <View className="flex items-center mb-4">
                <View className="w-1 h-6 bg-red-600 rounded mr-3"></View>
                <Text className="block text-xl font-bold text-gray-900">失败模式</Text>
              </View>

              {summary.summary.failurePatterns.length > 0 ? (
                <View className="space-y-2">
                  {summary.summary.failurePatterns.map((pattern, index) => (
                    <View key={index} className="bg-red-50 rounded-lg p-3 border-l-4 border-red-600">
                      <Text className="block text-sm text-red-800 leading-relaxed">
                        {index + 1}. {pattern}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="block text-sm text-gray-500">暂无足够数据</Text>
              )}
            </View>

            {/* 关键洞察 */}
            <View className="bg-white rounded-xl p-6 shadow-md mb-4">
              <View className="flex items-center mb-4">
                <View className="w-1 h-6 bg-purple-600 rounded mr-3"></View>
                <Text className="block text-xl font-bold text-gray-900">关键洞察</Text>
              </View>

              {summary.summary.keyInsights.length > 0 ? (
                <View className="space-y-2">
                  {summary.summary.keyInsights.map((insight, index) => (
                    <View key={index} className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-600">
                      <Text className="block text-sm text-purple-800 leading-relaxed">
                        💡 {insight}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="block text-sm text-gray-500">暂无足够数据</Text>
              )}
            </View>

            {/* 改进建议 */}
            <View className="bg-white rounded-xl p-6 shadow-md mb-4">
              <View className="flex items-center mb-4">
                <View className="w-1 h-6 bg-blue-600 rounded mr-3"></View>
                <Text className="block text-xl font-bold text-gray-900">改进建议</Text>
              </View>

              {summary.summary.recommendations.length > 0 ? (
                <View className="space-y-2">
                  {summary.summary.recommendations.map((recommendation, index) => (
                    <View key={index} className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-600">
                      <Text className="block text-sm text-blue-800 leading-relaxed">
                        ✓ {recommendation}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="block text-sm text-gray-500">暂无足够数据</Text>
              )}
            </View>

            {/* 最有效的处方 */}
            {summary.summary.topEffectivePrescriptions.length > 0 && (
              <View className="bg-white rounded-xl p-6 shadow-md mb-4">
                <View className="flex items-center mb-4">
                  <View className="w-1 h-6 bg-amber-600 rounded mr-3"></View>
                  <Text className="block text-xl font-bold text-gray-900">最有效的处方</Text>
                </View>

                <View className="space-y-3">
                  {summary.summary.topEffectivePrescriptions.map((item, index) => (
                    <View key={index} className="bg-amber-50 rounded-lg p-4">
                      <Text className="block text-base font-semibold text-gray-900 mb-2">
                        {index + 1}. {item.diagnosis}
                      </Text>
                      <Text className="block text-sm text-gray-700 mb-2">
                        {item.prescription}
                      </Text>
                      <View className="bg-green-100 px-2 py-1 rounded inline-block">
                        <Text className="block text-xs text-green-800">
                          疗效：{item.effectiveness}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {!summary && !loading && (
          <View className="bg-white rounded-xl p-8 text-center">
            <Text className="block text-4xl mb-4">📊</Text>
            <Text className="block text-lg font-semibold text-gray-900 mb-2">
              暂无学习数据
            </Text>
            <Text className="block text-sm text-gray-600 mb-4">
              收集更多用户反馈后，系统将自动生成学习总结
            </Text>
            <Button
              className="bg-blue-500 text-white"
              onClick={() => Taro.navigateTo({ url: '/pages/records-list/index' })}
            >
              查看病历列表
            </Button>
          </View>
        )}

        <View className="mt-8 mb-6">
          <Text className="block text-sm text-gray-400 text-center">
            学习数据基于真实用户反馈，持续优化中
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
