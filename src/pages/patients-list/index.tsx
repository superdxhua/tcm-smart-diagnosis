import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Network } from '@/network'

interface Member {
  id: string
  name: string
  gender: string
  age: number
  birthYear?: number
  height?: number
  weight?: number
  phone: string
  contactInfo?: string
  address: string
  visitCount: number
  lastVisitAt: string
  healthHistory: string
  allergies: string
  tongueCondition?: string
  sleepCondition?: string
  digestionCondition?: string
  isPregnant?: boolean
  isChild?: boolean
}

export default function MembersListPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [selectMode, setSelectMode] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadMembers()
    loadUserInfo()

    // 检查是否是选择模式
    const params = Taro.getCurrentInstance().router?.params
    if (params?.selectMode === 'true') {
      setSelectMode(true)
    }
  }, [])

  const loadUserInfo = () => {
    const userInfo = Taro.getStorageSync('user')
    setUser(userInfo)
  }

  const loadMembers = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/members',
        method: 'GET'
      })

      if (res.statusCode === 200) {
        setMembers(res.data.data || [])
      }
    } catch (error) {
      console.error('加载用户列表失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = () => {
    // 检查是否为个人用户
    if (user?.role === 'individual') {
      const maxMembers = 4
      const remaining = maxMembers - members.length

      if (remaining > 0) {
        // 还有剩余名额，正常添加
        Taro.navigateTo({
          url: `/pages/patient-detail/index?remaining=${remaining}`
        })
      } else {
        // 已达到上限
        Taro.showModal({
          title: '提示',
          content: `个人账户最多只能添加 ${maxMembers} 位用户，您已达到上限。如需添加更多用户，请联系管理员申请机构资质认证。`,
          showCancel: false,
          confirmText: '知道了'
        })
      }
    } else {
      // 非个人用户（机构用户、管理员），直接添加
      Taro.navigateTo({
        url: '/pages/patient-detail/index'
      })
    }
  }

  const handleMemberClick = (memberId: string) => {
    Taro.navigateTo({
      url: `/pages/patient-detail/index?id=${memberId}`
    })
  }

  const handleViewRecords = (memberId: string, memberName: string) => {
    Taro.navigateTo({
      url: `/pages/records-list/index?memberId=${memberId}&memberName=${encodeURIComponent(memberName)}`
    })
  }

  const handleSelectMember = (member: Member) => {
    if (selectMode) {
      // 触发用户选择事件（统一使用 patientSelected）
      Taro.eventCenter.trigger('patientSelected', member)
      Taro.navigateBack()
    } else {
      // 正常模式，跳转到详情页
      Taro.navigateTo({
        url: `/pages/patient-detail/index?id=${member.id}`
      })
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
    <View className="min-h-screen bg-gray-100">
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
            <Text className="block text-xl font-bold text-gray-800">
              {selectMode ? '选择对象' : '对象管理'}
            </Text>
          </View>
          <Text className="block text-sm text-gray-500">共 {members.length} 位对象</Text>
        </View>
      </View>

      {/* 个人对象数量提示 */}
      {user?.role === 'individual' && (
        <View className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-2">
              <Text className="block text-lg">👥</Text>
              <Text className="block text-sm text-blue-800">
                已添加 {members.length} 位用户
              </Text>
            </View>
            <Text className="block text-sm text-blue-600 font-medium">
              剩余 {Math.max(0, 4 - members.length)} 位
            </Text>
          </View>
          {members.length >= 4 && (
            <View className="mt-2 bg-orange-100 rounded-lg p-2">
              <Text className="block text-xs text-orange-700 text-center">
                ⚠️ 已达到个人用户数量上限
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 添加按钮 */}
      <View className="px-4 py-3">
        <View
          className="bg-green-500 text-white text-center py-3 rounded-lg shadow-sm"
          onClick={handleAddMember}
        >
          <Text className="block font-semibold text-base">+ 添加用户</Text>
        </View>
      </View>

      {/* 用户列表 */}
      {members.length === 0 ? (
        <View className="flex flex-col items-center justify-center py-20">
          <Text className="block text-gray-400 text-lg">暂无用户记录</Text>
          <Text className="block text-gray-400 text-sm mt-2">点击上方按钮添加用户</Text>
        </View>
      ) : (
        <ScrollView scrollY className="flex-1 px-4 pb-4">
          {members.map((member, index) => (
            <View
              key={member.id}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm relative"
              onClick={() => selectMode ? handleSelectMember(member) : handleMemberClick(member.id)}
            >
              <View
                className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-md"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewRecords(member.id, member.name)
                }}
              >
                <Text className="block text-sm font-medium">📋 查看档案</Text>
              </View>

              {/* 序号和基本信息 */}
              <View className="flex items-start justify-between mb-3 pr-24">
                <View className="flex-1">
                  <View className="flex items-center gap-2 mb-2">
                    {/* 序号标签 */}
                    <View className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center">
                      <Text className="block text-sm font-semibold">
                        {index + 1}
                      </Text>
                    </View>

                    {/* 姓名 */}
                    <Text className="block text-lg font-semibold text-gray-800">
                      {member.name}
                    </Text>

                    {/* 特殊人群标识 */}
                    {member.isPregnant && (
                      <View className="bg-pink-100 px-2 py-1 rounded">
                        <Text className="block text-xs text-pink-600">孕妇</Text>
                      </View>
                    )}
                    {member.isChild && (
                      <View className="bg-blue-100 px-2 py-1 rounded">
                        <Text className="block text-xs text-blue-600">儿童</Text>
                      </View>
                    )}
                  </View>

                  {/* 基本信息 */}
                  <View className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <Text className="block">性别：{member.gender}</Text>
                    <Text className="block">年龄：{member.age}岁</Text>
                    {member.birthYear && (
                      <Text className="block">出生年份：{member.birthYear}</Text>
                    )}
                  </View>
                </View>

                {/* 右侧箭头 */}
                <View className="ml-2">
                  <Text className="block text-gray-400 text-lg">›</Text>
                </View>
              </View>

              {/* 身高体重和联系方式 */}
              <View className="bg-gray-50 rounded-lg p-3 mb-3">
                <View className="flex flex-wrap gap-4 text-sm">
                  {member.height && (
                    <View className="flex items-center gap-1">
                      <Text className="block text-gray-500">身高</Text>
                      <Text className="block text-gray-700">身高：{member.height}cm</Text>
                    </View>
                  )}
                  {member.weight && (
                    <View className="flex items-center gap-1">
                      <Text className="block text-gray-500">体重</Text>
                      <Text className="block text-gray-700">体重：{member.weight}kg</Text>
                    </View>
                  )}
                  {member.phone && (
                    <View className="flex items-center gap-1">
                      <Text className="block text-gray-500">电话</Text>
                      <Text className="block text-gray-700">{member.phone}</Text>
                    </View>
                  )}
                  {member.contactInfo && (
                    <View className="flex items-center gap-1">
                      <Text className="block text-gray-500">联系</Text>
                      <Text className="block text-gray-700">{member.contactInfo}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* 就诊信息 */}
              <View className="flex items-center justify-between mb-3 text-sm">
                <View className="flex items-center gap-1">
                  <Text className="block text-gray-600">
                    已咨询 {member.visitCount} 次
                  </Text>
                </View>
                {member.lastVisitAt && (
                  <Text className="block text-gray-400">
                    最后：{new Date(member.lastVisitAt).toLocaleDateString()}
                  </Text>
                )}
              </View>

              {/* 中医体征 */}
              <View className="mb-3">
                <Text className="block text-sm font-medium text-gray-700 mb-2">
                  中医体征
                </Text>
                <View className="flex flex-wrap gap-2">
                  {member.tongueCondition && (
                    <View className="bg-green-100 px-2 py-1 rounded">
                      <Text className="block text-xs text-green-700">舌象：{member.tongueCondition}</Text>
                    </View>
                  )}
                  {member.sleepCondition && (
                    <View className="bg-purple-100 px-2 py-1 rounded">
                      <Text className="block text-xs text-purple-700">睡眠：{member.sleepCondition}</Text>
                    </View>
                  )}
                  {member.digestionCondition && (
                    <View className="bg-blue-100 px-2 py-1 rounded">
                      <Text className="block text-xs text-blue-700">大小便：{member.digestionCondition}</Text>
                    </View>
                  )}
                  {!member.tongueCondition && !member.sleepCondition && !member.digestionCondition && (
                    <Text className="block text-xs text-gray-400">暂无记录</Text>
                  )}
                </View>
              </View>

              {/* 过敏史（如果有） */}
              {member.allergies && (
                <View className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 mb-3">
                  <View className="flex items-start gap-2">
                    <Text className="block text-red-500 text-lg">注意</Text>
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-orange-700 mb-1">
                        过敏史
                      </Text>
                      <Text className="block text-sm text-orange-600">
                        {member.allergies}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* 既往病史（如果有） */}
              {member.healthHistory && (
                <View className="bg-gray-50 rounded-lg p-3 mb-3">
                  <View className="flex items-start gap-2">
                    <Text className="block text-gray-500 text-lg">档案</Text>
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-gray-700 mb-1">
                        既往病史
                      </Text>
                      <Text className="block text-sm text-gray-600">
                        {member.healthHistory}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
