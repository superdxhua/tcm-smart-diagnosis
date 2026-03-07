import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import './index.css'

interface SignInStats {
  totalDays: number
  currentConsecutiveDays: number
  maxConsecutiveDays: number
  totalPointsEarned: number
  todaySignedIn: boolean
}

interface SignInRecord {
  id: string
  signInDate: string
  pointsAwarded: number
  consecutiveDays: number
  isBonusDay: boolean
  bonusPoints: number
}

const SignInPage = () => {
  const [stats, setStats] = useState<SignInStats | null>(null)
  const [signInLoading, setSignInLoading] = useState(false)
  const [history, setHistory] = useState<SignInRecord[]>([])

  // 加载签到统计
  const loadSignInStats = async () => {
    try {
      const response = await Network.request({
        url: '/api/sign-in/stats',
        method: 'GET',
      })

      if (response.data.code === 200) {
        setStats(response.data.data)
      }
    } catch (error: any) {
      console.error('加载签到统计失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      })
    }
  }

  // 加载签到历史
  const loadSignInHistory = async () => {
    try {
      const response = await Network.request({
        url: '/api/sign-in/history',
        method: 'GET',
        data: { page: 1, pageSize: 30 },
      })

      if (response.data.code === 200) {
        setHistory(response.data.data.records)
      }
    } catch (error: any) {
      console.error('加载签到历史失败:', error)
    }
  }

  // 执行签到
  const handleSignIn = async () => {
    setSignInLoading(true)
    try {
      const response = await Network.request({
        url: '/api/sign-in',
        method: 'POST',
      })

      if (response.data.code === 200) {
        const data = response.data.data

        let message = `签到成功！获得 ${data.pointsAwarded} 积分`
        if (data.isBonusDay) {
          message += `\n连续签到 ${data.consecutiveDays} 天，额外奖励 ${data.bonusPoints} 积分！🎉`
        }

        Taro.showModal({
          title: '签到成功',
          content: message,
          showCancel: false,
          success: () => {
            loadSignInStats()
            loadSignInHistory()
          }
        })
      }
    } catch (error: any) {
      console.error('签到失败:', error)
      const errorMsg = error.data?.msg || error.message || '签到失败'
      Taro.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 3000,
      })
    } finally {
      setSignInLoading(false)
    }
  }

  // 页面加载时获取数据
  useEffect(() => {
    loadSignInStats()
    loadSignInHistory()
  }, [])

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <View className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
        <View className="text-center mb-4">
          <Text className="block text-2xl font-bold mb-1">每日签到</Text>
          <Text className="block text-sm opacity-90">坚持签到，获得更多积分</Text>
        </View>

        {/* 积分余额 */}
        <View className="bg-white/20 backdrop-blur rounded-2xl p-4 mt-4">
          <View className="flex justify-around text-center">
            <View>
              <Text className="block text-3xl font-bold">{stats?.totalPointsEarned || 0}</Text>
              <Text className="block text-xs opacity-90 mt-1">累计获得积分</Text>
            </View>
            <View>
              <Text className="block text-3xl font-bold">{stats?.currentConsecutiveDays || 0}</Text>
              <Text className="block text-xs opacity-90 mt-1">连续签到天数</Text>
            </View>
            <View>
              <Text className="block text-3xl font-bold">{stats?.maxConsecutiveDays || 0}</Text>
              <Text className="block text-xs opacity-90 mt-1">最长连续签到</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 签到按钮区域 */}
      <View className="p-4">
        <View className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <Text className="block text-lg font-semibold text-gray-900 mb-4 text-center">
            {stats?.todaySignedIn ? '今日已签到 ✅' : '点击签到领取积分'}
          </Text>

          {!stats?.todaySignedIn ? (
            <View
              className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl py-4"
              onClick={handleSignIn}
            >
              <Text className="block text-xl font-bold text-white text-center">
                {signInLoading ? '签到中...' : '立即签到'}
              </Text>
            </View>
          ) : (
            <View className="bg-gray-100 rounded-xl py-4">
              <Text className="block text-xl font-bold text-gray-500 text-center">
                明天再来吧
              </Text>
            </View>
          )}

          {/* 签到奖励说明 */}
          <View className="mt-6 space-y-2">
            <Text className="block text-sm text-gray-600 text-center">
              📅 每日签到奖励：10 积分
            </Text>
            <Text className="block text-sm text-gray-600 text-center">
              🎁 连续签到 7 天：额外奖励 20 积分
            </Text>
            <Text className="block text-sm text-gray-600 text-center">
              🎁 连续签到 30 天：额外奖励 100 积分
            </Text>
          </View>
        </View>

        {/* 签到历史 */}
        <View className="bg-white rounded-2xl shadow-sm p-6">
          <Text className="block text-lg font-semibold text-gray-900 mb-4">
            签到历史
          </Text>

          {history.length === 0 ? (
            <View className="text-center py-8">
              <Text className="block text-sm text-gray-500">
                暂无签到记录
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {history.map((record) => (
                <View
                  key={record.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <View>
                    <Text className="block text-base font-medium text-gray-900">
                      {formatDate(record.signInDate)}
                    </Text>
                    <Text className="block text-sm text-gray-500">
                      连续签到 {record.consecutiveDays} 天
                    </Text>
                  </View>
                  <View className="text-right">
                    <Text className="block text-base font-bold text-blue-600">
                      +{record.pointsAwarded} 积分
                    </Text>
                    {record.isBonusDay && record.bonusPoints > 0 && (
                      <Text className="block text-xs text-orange-500">
                        额外奖励 +{record.bonusPoints} 积分 🎁
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default SignInPage
