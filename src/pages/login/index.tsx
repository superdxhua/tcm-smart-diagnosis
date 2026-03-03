import { View, Text, Input, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { ResponsiveContainer, DesktopOnly } from '@/components/ResponsiveLayout'
import { useDevice } from '@/utils/device'
import './index.css'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const { isMobile, isDesktop } = useDevice()

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
    console.log('[Login] 用户名:', username)
    console.log('[Login] 密码:', password ? '***' : '(空)')

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('[Login] 发送登录请求...')
      const response = await Network.request({
        url: '/api/auth/login',
        method: 'POST',
        data: { username, password },
      })

      console.log('[Login] 登录响应完整对象:', JSON.stringify(response, null, 2))

      if (!response.data) {
        console.error('[Login] 响应数据为空:', {
          statusCode: response.statusCode,
          data: response.data,
          header: response.header,
        })
        setError(`响应数据为空（状态码：${response.statusCode}），请检查网络连接或联系管理员`)
        return
      }

      if (response.statusCode !== 200) {
        console.error('[Login] 响应状态码异常:', {
          statusCode: response.statusCode,
          data: response.data,
        })
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

  // 桌面端/横屏模式：左右分栏布局
  if (isDesktop) {
    return (
      <View className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <ScrollView scrollY className="min-h-screen">
          {/* 背景装饰 - 桌面端 */}
          <View className="absolute inset-0 overflow-hidden pointer-events-none">
            <View className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-500/20 to-transparent"></View>
            <View className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-indigo-500/20 to-transparent"></View>
            {/* 装饰性圆形 */}
            <View className="absolute top-20 right-40 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></View>
            <View className="absolute bottom-40 left-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></View>
          </View>

          {/* 左右分栏布局 */}
          <View className="relative z-10 flex min-h-screen">
            {/* 左侧：品牌介绍 */}
            <View className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-center px-12 xl:px-20">
              <View className="mb-8">
                <Text className="text-5xl xl:text-6xl font-bold text-white mb-4">
                  中医智能
                </Text>
                <Text className="text-5xl xl:text-6xl font-bold text-blue-400 mb-6">
                  好帮手
                </Text>
              </View>

              <Text className="text-xl xl:text-2xl text-blue-200 mb-8">
                传承千年中医智慧，结合现代人工智能
              </Text>

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
                <Text className="text-blue-300/60 text-sm">
                  专业 · 便捷 · 可靠
                </Text>
              </View>
            </View>

            {/* 右侧：登录表单 */}
            <View className="w-full lg:w-1/2 xl:w-7/12 flex items-center justify-center p-8">
              <View className="w-full max-w-md">
                {/* 移动端标题（桌面端不显示） */}
                <View className="lg:hidden mb-8 text-center">
                  <Text className="text-3xl font-bold text-white">中医智能好帮手</Text>
                </View>

                {/* 登录卡片 */}
                <View className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
                  {/* 头部 */}
                  <View className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
                    <Text className="font-bold text-3xl text-white">
                      欢迎登录
                    </Text>
                    <Text className="text-blue-100 text-lg mt-2">
                      登录后开始您的健康之旅
                    </Text>
                  </View>

                  {/* 登录表单 */}
                  <View className="p-8 space-y-6">
                    {/* 用户名输入框 */}
                    <View>
                      <Text className="block font-medium text-gray-700 mb-2 text-base">
                        用户名
                      </Text>
                      <View className="bg-gray-50 rounded-xl px-4 py-4">
                        <Input
                          className="bg-transparent text-base"
                          placeholder="请输入用户名"
                          value={username}
                          onInput={(e) => setUsername(e.detail.value)}
                        />
                      </View>
                    </View>

                    {/* 密码输入框 */}
                    <View>
                      <Text className="block font-medium text-gray-700 mb-2 text-base">
                        密码
                      </Text>
                      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1 }} className="bg-gray-50 rounded-xl px-4 py-4">
                          <Input
                            className="bg-transparent text-base"
                            placeholder="请输入密码"
                            password={!showPassword}
                            value={password}
                            onInput={(e) => setPassword(e.detail.value)}
                          />
                        </View>
                        <View
                          className={`ml-3 px-4 py-4 bg-gray-100 rounded-xl cursor-pointer ${showPassword ? 'bg-blue-100' : ''}`}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <Text className={`text-xl ${showPassword ? 'text-blue-600' : 'text-gray-500'}`}>
                            {showPassword ? '👁' : '🙈'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* 记住密码 */}
                    <View
                      className="flex items-center cursor-pointer"
                      onClick={handleToggleRememberMe}
                    >
                      <View className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-2 ${
                        rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}
                      >
                        {rememberMe && <Text className="text-white text-sm">✓</Text>}
                      </View>
                      <Text className="text-gray-700 text-base">
                        记住密码
                      </Text>
                    </View>

                    {/* 错误信息 */}
                    {error && (
                      <View className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <Text className="text-red-600 text-sm">{error}</Text>
                      </View>
                    )}

                    {/* 登录按钮 */}
                    <View
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 cursor-pointer transition-colors"
                      onClick={handleLogin}
                    >
                      <Text className="text-white font-medium text-center text-lg">
                        {loading ? '登录中...' : '账号密码登录'}
                      </Text>
                    </View>

                    {/* 分割线 */}
                    <View className="flex items-center my-4">
                      <View className="flex-1 h-px bg-gray-200"></View>
                      <Text className="px-4 text-gray-400">或</Text>
                      <View className="flex-1 h-px bg-gray-200"></View>
                    </View>

                    {/* 微信登录按钮 */}
                    <View
                      className="bg-green-500 hover:bg-green-600 rounded-xl p-4 cursor-pointer transition-colors"
                      onClick={handleWechatLogin}
                    >
                      <Text className="text-white font-medium text-center text-lg">
                        📱 微信一键登录
                      </Text>
                    </View>
                    <Text className="text-center text-gray-500 text-sm">
                      点击上方按钮，快速登录（无需输入账号密码）
                    </Text>

                    {/* 新用户注册提示 */}
                    <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                      <View className="flex items-center mb-2">
                        <Text className="font-semibold text-blue-900 text-lg">
                          🎁 新用户注册享福利
                        </Text>
                      </View>
                      <Text className="text-gray-600 mb-3 text-base">
                        注册即可获得 3 天免费使用期限
                      </Text>
                      <View
                        className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 cursor-pointer text-center transition-colors"
                        onClick={() => setShowDisclaimer(true)}
                      >
                        <Text className="text-white font-medium">
                          新用户注册
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 底部提示 */}
                  <View className="bg-gray-50 p-4 text-center">
                    <Text className="text-gray-500 text-sm">
                      如未授权使用，请联系管理员
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 温馨提示与免责声明弹窗 */}
        {showDisclaimer && (
          <View className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <View className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* 弹窗头部 */}
              <View className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <Text className="text-white text-xl font-bold">温馨提示</Text>
              </View>

              {/* 弹窗内容 */}
              <ScrollView scrollY className="p-6" style={{ maxHeight: '60vh' }}>
                <View className="space-y-4">
                  <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <Text className="font-bold text-blue-900 mb-2">👋 欢迎使用中医智能好帮手</Text>
                    <Text className="text-gray-700 text-sm">
                      本系统基于张仲景经方和历代名医医案，结合人工智能技术为您提供智能健康建议。
                    </Text>
                  </View>

                  <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <Text className="font-bold text-purple-900 mb-2">👥 账户类别说明</Text>
                    <Text className="text-gray-700 text-sm block mb-1">
                      <Text className="font-bold">机构账户</Text>：需上传资质证明，经管理员审核后获得全权限，可为用户开具处方。
                    </Text>
                    <Text className="text-gray-700 text-sm">
                      <Text className="font-bold">个人账户</Text>：直接注册使用，功能受限，严格限于科研、教学、提升自身业务水平之用途。
                    </Text>
                  </View>

                  <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <Text className="font-bold text-yellow-900 mb-2">⚠️ 免责声明</Text>
                    <Text className="text-gray-700 text-sm block mb-1">
                      1. 本系统提供的健康建议仅供参考，不构成医疗诊断或治疗方案。
                    </Text>
                    <Text className="text-gray-700 text-sm block mb-1">
                      2. 如有严重疾病或急症，请及时前往正规医院就诊。
                    </Text>
                    <Text className="text-gray-700 text-sm block mb-1">
                      3. 本系统不承担因使用本系统健康建议而产生的任何责任。
                    </Text>
                    <Text className="text-gray-700 text-sm">
                      4. 孕妇、儿童、危重病用户请务必在医生指导下使用。
                    </Text>
                  </View>

                  <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <Text className="font-bold text-red-900 mb-2">🚫 个人用户限制</Text>
                    <Text className="font-bold text-red-700 text-sm block mb-1">个人用户请注意以下限制：</Text>
                    <Text className="text-gray-700 text-sm block mb-1">
                      1. 无法为孕妇、儿童、高危病重用户开处方
                    </Text>
                    <Text className="text-gray-700 text-sm block mb-1">
                      2. 无法查看涉及有毒有害药材的名称、剂量
                    </Text>
                    <Text className="text-gray-700 text-sm block mb-1">
                      3. 严格限于科研、教学、提升自身业务水平之用途
                    </Text>
                    <Text className="text-gray-700 text-sm">
                      4. 严禁为他人开具处方，否则将承担相应法律责任
                    </Text>
                  </View>

                  <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <Text className="font-bold text-gray-900 mb-2">📝 注册说明</Text>
                    <Text className="text-gray-700 text-sm">
                      注册后将为您自动创建账号，账号名为您的手机号，默认密码为 123456。您可以后续在个人中心修改密码。
                    </Text>
                  </View>

                  <View className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <Text className="font-bold text-green-900 mb-2">🔒 隐私保护</Text>
                    <Text className="text-gray-700 text-sm">
                      您的个人信息和健康记录将严格保密，仅用于提供健康咨询服务。
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* 弹窗底部 */}
              <View className="p-4 border-t border-gray-200 flex gap-3">
                <View
                  className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-3 cursor-pointer text-center transition-colors"
                  onClick={() => setShowDisclaimer(false)}
                >
                  <Text className="text-gray-700 font-medium">取消</Text>
                </View>
                <View
                  className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-3 cursor-pointer text-center transition-colors"
                  onClick={() => {
                    setShowDisclaimer(false)
                    Taro.navigateTo({ url: '/pages/register/index' })
                  }}
                >
                  <Text className="text-white font-medium">我已阅读并同意</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }

  // 移动端：垂直布局
  return (
    <View className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ResponsiveContainer width={isDesktop ? 'narrow' : 'full'} center={isDesktop}>
        <ScrollView scrollY className={isMobile ? 'h-screen' : 'min-h-screen'}>
          {/* 背景装饰 */}
          <DesktopOnly>
            <View className="absolute inset-0 overflow-hidden pointer-events-none">
              <View className="absolute top-20 -right-20 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></View>
              <View className="absolute bottom-20 -left-20 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl"></View>
            </View>
          </DesktopOnly>

          {/* 登录卡片容器 */}
          <View className={`relative z-10 ${isMobile ? 'p-4' : 'flex items-center justify-center min-h-screen p-8'}`}>
            <View className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${isMobile ? 'w-full' : 'w-full max-w-md'}`}>
              {/* 头部 - 响应式设计 */}
              <View className={`bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center ${isMobile ? 'p-6' : 'p-8'}`}>
                {/* Logo/标题 */}
                <View className="mb-4">
                  <Text className={`font-bold text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                    中医智能好帮手
                  </Text>
                </View>

                {/* 副标题 */}
                <Text className={`text-blue-100 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  请登录使用
                </Text>

                {/* PC 端额外信息 */}
                <DesktopOnly>
                  <Text className="block text-blue-100 text-sm mt-4">
                    专业 · 便捷 · 可靠
                  </Text>
                </DesktopOnly>
              </View>

              {/* 登录表单 */}
              <View className={`p-6 space-y-4 ${isMobile ? 'p-4 space-y-3' : 'p-6 space-y-4'}`}>
                {/* 用户名输入框 */}
                <View>
                  <Text className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    用户名
                  </Text>
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Input
                      className={`bg-transparent ${isMobile ? 'text-base' : 'text-base'}`}
                      placeholder="请输入用户名"
                      value={username}
                      onInput={(e) => setUsername(e.detail.value)}
                    />
                  </View>
                </View>

                {/* 密码输入框 */}
                <View>
                  <Text className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    密码
                  </Text>
                  <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }} className="bg-gray-50 rounded-xl px-4 py-3">
                      <Input
                        className={`bg-transparent ${isMobile ? 'text-base' : 'text-base'}`}
                        placeholder="请输入密码"
                        password={!showPassword}
                        value={password}
                        onInput={(e) => setPassword(e.detail.value)}
                      />
                    </View>
                    <View
                      className={`ml-3 px-4 py-3 bg-gray-100 rounded-xl cursor-pointer ${showPassword ? 'bg-blue-100' : ''}`}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Text className={`text-lg ${showPassword ? 'text-blue-600' : 'text-gray-500'}`}>
                        {showPassword ? '👁' : '🙈'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 记住密码 */}
                <View
                  className="flex items-center cursor-pointer"
                  onClick={handleToggleRememberMe}
                >
                  <View className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-2 ${
                    rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}
                  >
                    {rememberMe && <Text className="text-white text-sm">✓</Text>}
                  </View>
                  <Text className={`text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    记住密码
                  </Text>
                </View>

                {/* 错误信息 */}
                {error && (
                  <View className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <Text className="text-red-600 text-sm">{error}</Text>
                  </View>
                )}

                {/* 微信登录按钮 */}
                <View
                  className="bg-green-500 hover:bg-green-600 rounded-xl p-4 cursor-pointer transition-colors"
                  onClick={handleWechatLogin}
                >
                  <Text className="text-white font-medium text-center">
                    📱 微信一键登录
                  </Text>
                </View>
                <Text className={`text-center text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  点击上方按钮，快速登录（无需输入账号密码）
                </Text>

                {/* 分割线 */}
                <View className="flex items-center my-4">
                  <View className="flex-1 h-px bg-gray-200"></View>
                  <Text className="px-4 text-gray-400">或</Text>
                  <View className="flex-1 h-px bg-gray-200"></View>
                </View>

                {/* 账号密码登录按钮 */}
                <View
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 cursor-pointer transition-colors disabled:bg-gray-400"
                  onClick={handleLogin}
                >
                  <Text className="text-white font-medium text-center">
                    {loading ? '登录中...' : '账号密码登录'}
                  </Text>
                </View>

                {/* 新用户注册提示 */}
                <View className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 ${isMobile ? 'p-3' : 'p-4'}`}>
                  <View className="flex items-center mb-2">
                    <Text className={`font-semibold text-blue-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
                      🎁 新用户注册享福利
                    </Text>
                  </View>
                  <Text className={`text-gray-600 mb-3 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    注册即可获得 3 天免费使用期限
                  </Text>
                  <View
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 cursor-pointer text-center transition-colors"
                    onClick={() => setShowDisclaimer(true)}
                  >
                    <Text className="text-white font-medium">
                      新用户注册
                    </Text>
                  </View>
                </View>
              </View>

              {/* 底部提示 */}
              <View className={`bg-gray-50 p-4 text-center ${isMobile ? 'p-3' : 'p-4'}`}>
                <Text className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  如未授权使用，请联系管理员
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </ResponsiveContainer>

      {/* 温馨提示与免责声明弹窗 */}
      {showDisclaimer && (
        <View className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <View className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* 弹窗头部 */}
            <View className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <Text className="text-white text-xl font-bold">温馨提示</Text>
            </View>

            {/* 弹窗内容 */}
            <ScrollView scrollY className="p-6" style={{ maxHeight: '60vh' }}>
              <View className="space-y-4">
                {/* 欢迎信息 */}
                <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <Text className="font-bold text-blue-900 mb-2">👋 欢迎使用中医智能好帮手</Text>
                  <Text className="text-gray-700 text-sm">
                    本系统基于张仲景经方和历代名医医案，结合人工智能技术为您提供智能健康建议。
                  </Text>
                </View>

                {/* 账户类别 */}
                <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <Text className="font-bold text-purple-900 mb-2">👥 账户类别说明</Text>
                  <Text className="text-gray-700 text-sm block mb-1">
                    <Text className="font-bold">机构账户</Text>：需上传资质证明，经管理员审核后获得全权限，可为用户开具处方。
                  </Text>
                  <Text className="text-gray-700 text-sm">
                    <Text className="font-bold">个人账户</Text>：直接注册使用，功能受限，严格限于科研、教学、提升自身业务水平之用途。
                  </Text>
                </View>

                {/* 免责声明 */}
                <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <Text className="font-bold text-yellow-900 mb-2">⚠️ 免责声明</Text>
                  <Text className="text-gray-700 text-sm block mb-1">
                    1. 本系统提供的健康建议仅供参考，不构成医疗诊断或治疗方案。
                  </Text>
                  <Text className="text-gray-700 text-sm block mb-1">
                    2. 如有严重疾病或急症，请及时前往正规医院就诊。
                  </Text>
                  <Text className="text-gray-700 text-sm block mb-1">
                    3. 本系统不承担因使用本系统健康建议而产生的任何责任。
                  </Text>
                  <Text className="text-gray-700 text-sm">
                    4. 孕妇、儿童、危重病用户请务必在医生指导下使用。
                  </Text>
                </View>

                {/* 个人用户限制 */}
                <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <Text className="font-bold text-red-900 mb-2">🚫 个人用户限制</Text>
                  <Text className="font-bold text-red-700 text-sm block mb-1">个人用户请注意以下限制：</Text>
                  <Text className="text-gray-700 text-sm block mb-1">
                    1. 无法为孕妇、儿童、高危病重用户开处方
                  </Text>
                  <Text className="text-gray-700 text-sm block mb-1">
                    2. 无法查看涉及有毒有害药材的名称、剂量
                  </Text>
                  <Text className="text-gray-700 text-sm block mb-1">
                    3. 严格限于科研、教学、提升自身业务水平之用途
                  </Text>
                  <Text className="text-gray-700 text-sm">
                    4. 严禁为他人开具处方，否则将承担相应法律责任
                  </Text>
                </View>

                {/* 注册说明 */}
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <Text className="font-bold text-gray-900 mb-2">📝 注册说明</Text>
                  <Text className="text-gray-700 text-sm">
                    注册后将为您自动创建账号，账号名为您的手机号，默认密码为 123456。您可以后续在个人中心修改密码。
                  </Text>
                </View>

                {/* 隐私保护 */}
                <View className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <Text className="font-bold text-green-900 mb-2">🔒 隐私保护</Text>
                  <Text className="text-gray-700 text-sm">
                    您的个人信息和健康记录将严格保密，仅用于提供健康咨询服务。
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* 弹窗底部 */}
            <View className="p-4 border-t border-gray-200 flex gap-3">
              <View
                className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-3 cursor-pointer text-center transition-colors"
                onClick={() => setShowDisclaimer(false)}
              >
                <Text className="text-gray-700 font-medium">取消</Text>
              </View>
              <View
                className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-3 cursor-pointer text-center transition-colors"
                onClick={() => {
                  setShowDisclaimer(false)
                  Taro.navigateTo({ url: '/pages/register/index' })
                }}
              >
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
