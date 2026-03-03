import { View, Text, Input, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import './index.css'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  // 页面加载时检查是否有保存的账号密码
  useEffect(() => {
    const savedUsername = Taro.getStorageSync('savedUsername')
    const savedPassword = Taro.getStorageSync('savedPassword')

    if (savedUsername && savedPassword) {
      setUsername(savedUsername)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [])

  // 切换记住密码选项
  const handleToggleRememberMe = () => {
    const newValue = !rememberMe
    setRememberMe(newValue)

    if (!newValue) {
      Taro.removeStorageSync('savedUsername')
      Taro.removeStorageSync('savedPassword')
    }
  }

  const handleWechatLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const { code } = await Taro.login()
      console.log('微信登录 code:', code)

      const response = await Network.request({
        url: '/api/auth/wechat-login',
        method: 'POST',
        data: { code },
      })

      console.log('微信登录响应:', response.data)

      if (response.data.code === 200) {
        const { token, user } = response.data.data

        Taro.setStorageSync('token', token)
        Taro.setStorageSync('user', user)

        Taro.showToast({
          title: '登录成功',
          icon: 'success',
        })

        setTimeout(() => {
          Taro.reLaunch({
            url: '/pages/index/index',
          })
        }, 1000)
      } else {
        setError(response.data.msg || '微信登录失败')
      }
    } catch (err: any) {
      console.error('微信登录失败:', err)
      setError('微信登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    console.log('[Login] 开始登录流程')

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await Network.request({
        url: '/api/auth/login',
        method: 'POST',
        data: { username, password },
      })

      if (!response.data) {
        setError(`响应数据为空（状态码：${response.statusCode}），请检查网络连接或联系管理员`)
        return
      }

      if (response.statusCode !== 200) {
        setError(`服务器返回错误（状态码：${response.statusCode}）：${response.data?.error || '未知错误'}`)
        return
      }

      if (response.data.code === 200) {
        const { token, user } = response.data.data

        console.log('[Login] 登录成功')

        Taro.setStorageSync('token', token)
        Taro.setStorageSync('user', user)

        if (rememberMe) {
          Taro.setStorageSync('savedUsername', username)
          Taro.setStorageSync('savedPassword', password)
        } else {
          Taro.removeStorageSync('savedUsername')
          Taro.removeStorageSync('savedPassword')
        }

        Taro.showToast({
          title: '登录成功',
          icon: 'success',
        })

        setTimeout(() => {
          Taro.reLaunch({
            url: '/pages/index/index',
          })
        }, 1000)
      } else {
        const errorMsg = response.data.msg || '登录失败'
        console.log('[Login] 登录失败:', errorMsg)

        if (errorMsg.includes('已在其他设备') || errorMsg.includes('IP:')) {
          Taro.showModal({
            title: '登录失败',
            content: errorMsg,
            confirmText: '知道了',
            showCancel: false,
          })
        } else {
          setError(errorMsg)
        }
      }
    } catch (err: any) {
      console.error('[Login] 登录失败（异常）:', err)
      const errorMsg = err.message || '网络请求失败'

      if (errorMsg.includes('已在其他设备') || errorMsg.includes('IP:')) {
        Taro.showModal({
          title: '登录失败',
          content: errorMsg,
          confirmText: '知道了',
          showCancel: false,
        })
      } else {
        setError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  // 桌面端横屏布局：使用 Tailwind lg: 断点 (>= 1024px)
  return (
    // 外层容器 - 桌面端使用深色背景，移动端使用浅色背景
    <View className="min-h-screen lg:bg-gradient-to-br lg:from-slate-900 lg:via-blue-900 lg:to-slate-900 from-blue-50 to-indigo-100">
      <ScrollView scrollY className="min-h-screen">
        {/* 桌面端背景装饰 */}
        <View className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
          <View className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-500/20 to-transparent"></View>
          <View className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-indigo-500/20 to-transparent"></View>
          <View className="absolute top-20 right-40 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></View>
          <View className="absolute bottom-40 left-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></View>
        </View>

        {/* 主容器：桌面端 flex 行布局，移动端块布局 */}
        <View className="relative z-10 lg:flex lg:min-h-screen p-4">
          {/* 桌面端：左侧品牌介绍 */}
          <View className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-center px-12 xl:px-20">
            <View className="mb-8">
              <Text className="text-5xl xl:text-6xl font-bold text-white mb-4">中医智能</Text>
              <Text className="text-5xl xl:text-6xl font-bold text-blue-400 mb-6">好帮手</Text>
            </View>
            <Text className="text-xl xl:text-2xl text-blue-200 mb-8">传承千年中医智慧，结合现代人工智能</Text>
            <View className="space-y-4">
              <View className="flex items-center text-white/80">
                <Text className="text-2xl mr-4">📚</Text>
                <Text className="text-lg">基于张仲景经方和历代名医医案</Text>
              </View>
              <View className="flex items-center text-white/80">
                <Text className="text-2xl mr-4">🤖</Text>
                <Text className="text-lg">AI 智能辨证论治</Text>
              </View>
              <View className="flex items-center text-white/80">
                <Text className="text-2xl mr-4">💊</Text>
                <Text className="text-lg">个性化健康方案</Text>
              </View>
            </View>
            <View className="mt-12 pt-8 border-t border-white/10">
              <Text className="text-blue-300/60 text-sm">专业 · 便捷 · 可靠</Text>
            </View>
          </View>

          {/* 右侧登录表单 */}
          <View className="w-full lg:w-1/2 xl:w-7/12 lg:flex lg:items-center lg:justify-center p-4 lg:p-8">
            <View className="w-full max-w-md">
              {/* 移动端标题 */}
              <View className="lg:hidden mb-6 text-center">
                <Text className="text-3xl font-bold text-gray-800">中医智能好帮手</Text>
              </View>

              {/* 登录卡片 */}
              <View className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden">
                {/* 头部 */}
                <View className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 lg:p-8 text-center">
                  <Text className="font-bold text-2xl lg:text-3xl text-white">欢迎登录</Text>
                  <Text className="text-blue-100 text-base lg:text-lg mt-2">登录后开始您的健康之旅</Text>
                </View>

                {/* 表单 */}
                <View className="p-4 lg:p-8 space-y-4 lg:space-y-6">
                  {/* 用户名 */}
                  <View>
                    <Text className="block font-medium text-gray-700 mb-2 text-sm lg:text-base">用户名</Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-3 lg:py-4">
                      <Input
                        className="bg-transparent text-base"
                        placeholder="请输入用户名"
                        value={username}
                        onInput={(e) => setUsername(e.detail.value)}
                      />
                    </View>
                  </View>

                  {/* 密码 */}
                  <View>
                    <Text className="block font-medium text-gray-700 mb-2 text-sm lg:text-base">密码</Text>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1 }} className="bg-gray-50 rounded-xl px-4 py-3 lg:py-4">
                        <Input
                          className="bg-transparent text-base"
                          placeholder="请输入密码"
                          password={!showPassword}
                          value={password}
                          onInput={(e) => setPassword(e.detail.value)}
                        />
                      </View>
                      <View
                        className={`ml-2 lg:ml-3 px-3 py-3 lg:px-4 lg:py-4 bg-gray-100 rounded-xl cursor-pointer ${showPassword ? 'bg-blue-100' : ''}`}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Text className={`text-lg lg:text-xl ${showPassword ? 'text-blue-600' : 'text-gray-500'}`}>
                          {showPassword ? '👁' : '🙈'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 记住密码 */}
                  <View className="flex items-center cursor-pointer" onClick={handleToggleRememberMe}>
                    <View className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-2 ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                      {rememberMe && <Text className="text-white text-sm">✓</Text>}
                    </View>
                    <Text className="text-gray-700 text-sm lg:text-base">记住密码</Text>
                  </View>

                  {/* 错误信息 */}
                  {error && (
                    <View className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <Text className="text-red-600 text-sm">{error}</Text>
                    </View>
                  )}

                  {/* 登录按钮 */}
                  <View
                    className="bg-blue-600 rounded-xl lg:rounded-2xl p-4 lg:p-5 cursor-pointer"
                    onClick={handleLogin}
                  >
                    <Text className="text-white font-medium text-center text-base lg:text-lg">
                      {loading ? '登录中...' : '账号密码登录'}
                    </Text>
                  </View>

                  {/* 分割线 */}
                  <View className="flex items-center my-3 lg:my-4">
                    <View className="flex-1 h-px bg-gray-200"></View>
                    <Text className="px-3 lg:px-4 text-gray-400 text-sm">或</Text>
                    <View className="flex-1 h-px bg-gray-200"></View>
                  </View>

                  {/* 微信登录 */}
                  <View
                    className="bg-green-500 rounded-xl lg:rounded-2xl p-4 lg:p-5 cursor-pointer"
                    onClick={handleWechatLogin}
                  >
                    <Text className="text-white font-medium text-center text-base lg:text-lg">
                      📱 微信一键登录
                    </Text>
                  </View>
                  <Text className="text-center text-gray-500 text-xs lg:text-sm">
                    点击上方按钮，快速登录
                  </Text>

                  {/* 注册提示 */}
                  <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl lg:rounded-2xl p-4">
                    <View className="flex items-center mb-2">
                      <Text className="font-semibold text-blue-900 text-base lg:text-lg">🎁 新用户注册享福利</Text>
                    </View>
                    <Text className="text-gray-600 mb-3 text-sm lg:text-base">注册即可获得 3 天免费使用期限</Text>
                    <View
                      className="bg-blue-600 rounded-lg lg:rounded-xl px-4 py-2 lg:py-3 cursor-pointer text-center"
                      onClick={() => setShowDisclaimer(true)}
                    >
                      <Text className="text-white font-medium text-sm lg:text-base">新用户注册</Text>
                    </View>
                  </View>
                </View>

                {/* 底部 */}
                <View className="bg-gray-50 p-3 lg:p-4 text-center">
                  <Text className="text-gray-500 text-xs lg:text-sm">如未授权使用，请联系管理员</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 免责声明弹窗 */}
      {showDisclaimer && (
        <View className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <View className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <View className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <Text className="text-white text-xl font-bold">温馨提示</Text>
            </View>
            <ScrollView scrollY className="p-6" style={{ maxHeight: '60vh' }}>
              <View className="space-y-4">
                <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <Text className="font-bold text-blue-900 mb-2">👋 欢迎使用中医智能好帮手</Text>
                  <Text className="text-gray-700 text-sm">本系统基于张仲景经方和历代名医医案，结合人工智能技术为您提供智能健康建议。</Text>
                </View>
                <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <Text className="font-bold text-purple-900 mb-2">👥 账户类别说明</Text>
                  <Text className="text-gray-700 text-sm"><Text className="font-bold">机构账户</Text>：需上传资质证明，经管理员审核后获得全权限。</Text>
                  <Text className="text-gray-700 text-sm mt-1"><Text className="font-bold">个人账户</Text>：直接注册使用，功能受限。</Text>
                </View>
                <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <Text className="font-bold text-yellow-900 mb-2">⚠️ 免责声明</Text>
                  <Text className="text-gray-700 text-sm">1. 本系统健康建议仅供参考，不构成医疗诊断</Text>
                  <Text className="text-gray-700 text-sm">2. 如有严重疾病，请及时前往正规医院就诊</Text>
                  <Text className="text-gray-700 text-sm">3. 孕妇、儿童、危重病用户请在医生指导下使用</Text>
                </View>
              </View>
            </ScrollView>
            <View className="p-4 border-t border-gray-200 flex gap-3">
              <View className="flex-1 bg-gray-100 rounded-lg px-4 py-3 cursor-pointer text-center" onClick={() => setShowDisclaimer(false)}>
                <Text className="text-gray-700 font-medium">取消</Text>
              </View>
              <View className="flex-1 bg-blue-600 rounded-lg px-4 py-3 cursor-pointer text-center" onClick={() => { setShowDisclaimer(false); Taro.navigateTo({ url: '/pages/register/index' }) }}>
                <Text className="text-white font-medium">我已阅读并同意</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default LoginPage
