import { View, Text, Input, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function RegisterPage() {
  const [userType, setUserType] = useState<'individual' | 'institution'>('individual') // 用户类别
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

  // 小程序端：手机号授权注册
  const handleWeappRegister = async (e: any) => {
    if (!e.detail.code) {
      Taro.showToast({
        title: '获取手机号失败，请重试',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('小程序授权码:', e.detail.code)

      // 调用后端接口，使用授权码注册
      const response = await Network.request({
        url: userType === 'institution'
          ? '/api/auth/register-weapp-institution'
          : '/api/auth/register-weapp',
        method: 'POST',
        data: { code: e.detail.code },
      })

      console.log('注册响应:', response.data)

      if (response.data.code === 200) {
        const { token, user } = response.data.data

        // 保存登录信息
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('user', user)

        // 根据用户类型显示不同提示
        if (userType === 'institution') {
          Taro.showToast({
            title: '注册成功，等待审核',
            icon: 'success',
            duration: 3000,
          })
        } else {
          Taro.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 2000,
          })
        }

        // 跳转到首页
        setTimeout(() => {
          Taro.reLaunch({
            url: '/pages/index/index',
          })
        }, userType === 'institution' ? 3000 : 2000)
      } else {
        setError(response.data.msg || '注册失败')
      }
    } catch (err: any) {
      console.error('注册失败:', err)
      setError(err.message || '网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  // H5 端：手机号注册
  const handleH5Register = async () => {
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError('请输入正确的手机号')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 调用后端接口，使用手机号注册
      const response = await Network.request({
        url: userType === 'institution'
          ? '/api/auth/register-phone-institution'
          : '/api/auth/register-phone',
        method: 'POST',
        data: { phone: phoneNumber },
      })

      console.log('注册响应:', response.data)

      if (response.data.code === 200) {
        const { token, user } = response.data.data

        // 保存登录信息
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('user', user)

        // 根据用户类型显示不同提示
        if (userType === 'institution') {
          Taro.showToast({
            title: '注册成功，等待审核',
            icon: 'success',
            duration: 3000,
          })
        } else {
          Taro.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 2000,
          })
        }

        // 跳转到首页
        setTimeout(() => {
          Taro.reLaunch({
            url: '/pages/index/index',
          })
        }, userType === 'institution' ? 3000 : 2000)
      } else {
        setError(response.data.msg || '注册失败')
      }
    } catch (err: any) {
      console.error('注册失败:', err)
      setError(err.message || '网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  // 医疗机构用户：跳转到资质上传页面
  const handleInstitutionRegister = () => {
    Taro.navigateTo({
      url: '/pages/register-form/index',
    })
  }

  return (
    <View className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <View className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        {/* 顶部导航栏 */}
        <View className="flex items-center justify-between mb-6">
          <View
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg"
            onClick={() => Taro.navigateBack()}
          >
            <Text className="block text-lg text-gray-600">←</Text>
          </View>
          <Text className="block text-xl font-bold text-gray-800">新用户注册</Text>
          <View className="w-10"></View>
        </View>

        {/* 欢迎信息 */}
        <View className="text-center mb-6">
          <Text className="block text-2xl font-bold text-gray-900 mb-2">
            选择用户类型
          </Text>
          <Text className="block text-sm text-gray-600">
            请选择您的身份类型
          </Text>
        </View>

        {/* 用户类别选择 */}
        <View className="space-y-4 mb-6">
          <View
            className={`p-4 rounded-lg border-2 cursor-pointer ${
              userType === 'institution'
                ? 'bg-purple-50 border-purple-500'
                : 'bg-white border-gray-200'
            }`}
            onClick={() => setUserType('institution')}
          >
            <View className="flex items-center gap-3 mb-2">
              <Text className="block text-2xl">🏥</Text>
              <Text className="block text-base font-bold text-gray-800">
                机构账户
              </Text>
            </View>
            <Text className="block text-xs text-gray-600 mb-2">
              需上传资质证明，经审核后获得全权限
            </Text>
            <View className="space-y-1">
              <Text className="block text-xs text-gray-500">
                ✓ 可为所有用户开具处方
              </Text>
              <Text className="block text-xs text-gray-500">
                ✓ 查看完整药材信息
              </Text>
              <Text className="block text-xs text-gray-500">
                ✓ 专业医疗用途
              </Text>
            </View>
          </View>

          <View
            className={`p-4 rounded-lg border-2 cursor-pointer ${
              userType === 'individual'
                ? 'bg-green-50 border-green-500'
                : 'bg-white border-gray-200'
            }`}
            onClick={() => setUserType('individual')}
          >
            <View className="flex items-center gap-3 mb-2">
              <Text className="block text-2xl">👤</Text>
              <Text className="block text-base font-bold text-gray-800">
                个人账户
              </Text>
            </View>
            <Text className="block text-xs text-gray-600 mb-2">
              直接注册，功能受限
            </Text>
            <View className="space-y-1">
              <Text className="block text-xs text-gray-500">
                ✓ 科研、教学用途
              </Text>
              <Text className="block text-xs text-gray-500">
                ✓ 提升业务水平
              </Text>
              <Text className="block text-xs text-gray-500">
                ✓ 可管理 4 位用户
              </Text>
              <Text className="block text-xs text-red-500">
                ✗ 无法删除用户
              </Text>
              <Text className="block text-xs text-red-500">
                ✗ 无法为孕妇、儿童、高危用户开方
              </Text>
              <Text className="block text-xs text-red-500">
                ✗ 无法查看有毒有害药材信息
              </Text>
            </View>
          </View>
        </View>

        {/* 权限对比说明 */}
        <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <Text className="block text-sm text-blue-800 font-bold mb-2">
            📊 权限对比
          </Text>
          <View className="space-y-2">
            <View className="flex items-start gap-2">
              <Text className="block text-xs text-blue-700 font-medium mt-0.5">• 用户管理：</Text>
              <Text className="block text-xs text-blue-700 flex-1">机构账户无限制，个人账户最多 4 位且无法删除</Text>
            </View>
            <View className="flex items-start gap-2">
              <Text className="block text-xs text-blue-700 font-medium mt-0.5">• 处方开具：</Text>
              <Text className="block text-xs text-blue-700 flex-1">机构账户可为所有用户开方，个人账户受限</Text>
            </View>
            <View className="flex items-start gap-2">
              <Text className="block text-xs text-blue-700 font-medium mt-0.5">• 药材信息：</Text>
              <Text className="block text-xs text-blue-700 flex-1">机构账户可查看完整信息，个人账户无法查看有毒有害药材</Text>
            </View>
          </View>
        </View>

        {/* 注册说明 */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="block text-sm text-gray-800 font-medium mb-2">
            📝 注册说明
          </Text>
          <Text className="block text-xs text-gray-700 leading-relaxed">
            账号名：您的手机号
          </Text>
          <Text className="block text-xs text-gray-700 leading-relaxed mt-1">
            默认密码：123456
          </Text>
          {userType === 'individual' && (
            <Text className="block text-xs text-red-700 leading-relaxed mt-2 font-bold">
              ⚠️ 个人用户仅供学习参考，严禁为他人开具处方
            </Text>
          )}
        </View>

        {/* 注册按钮 */}
        {isWeapp ? (
          // 小程序端
          <View className="space-y-3">
            {userType === 'institution' ? (
              // 医疗机构：跳转到资质上传页面
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl py-4"
                onClick={handleInstitutionRegister}
                disabled={loading}
              >
                去上传资质
              </Button>
            ) : (
              // 个人用户：手机号授权注册
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl py-4"
                openType="getPhoneNumber"
                onGetPhoneNumber={handleWeappRegister}
                disabled={loading}
              >
                {loading ? '注册中...' : '手机号快速注册'}
              </Button>
            )}

            {error && (
              <View className="bg-red-50 rounded-lg p-3">
                <Text className="block text-sm text-red-600 text-center">
                  {error}
                </Text>
              </View>
            )}
          </View>
        ) : (
          // H5 端
          <View className="space-y-3">
            {userType === 'institution' ? (
              // 医疗机构：跳转到资质上传页面
              <View
                className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl py-4"
                onClick={handleInstitutionRegister}
              >
                <Text className="block text-base font-medium text-white text-center">
                  去上传资质
                </Text>
              </View>
            ) : (
              // 个人用户：手机号输入注册
              <>
                <View>
                  <Text className="block text-sm font-medium text-gray-700 mb-1">
                    手机号
                  </Text>
                  <View className="bg-gray-50 rounded-lg px-4 py-3">
                    <Input
                      className="w-full bg-transparent text-base"
                      placeholder="请输入手机号"
                      type="number"
                      maxlength={11}
                      value={phoneNumber}
                      onInput={(e) => setPhoneNumber(e.detail.value)}
                    />
                  </View>
                </View>

                {error && (
                  <View className="bg-red-50 rounded-lg p-3">
                    <Text className="block text-sm text-red-600 text-center">
                      {error}
                    </Text>
                  </View>
                )}

                <View className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl py-4">
                  <Text
                    className="block text-base font-medium text-white text-center"
                    onClick={handleH5Register}
                  >
                    {loading ? '注册中...' : '立即注册'}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* 注册成功提示 */}
        <View className="mt-6 text-center">
          <Text className="block text-sm text-gray-600 mb-2">
            注册后即可获得 3 天免费使用期限
          </Text>
          <Text className="block text-xs text-gray-500">
            默认密码为 123456，可在个人中心修改
          </Text>
        </View>

        {/* 登录入口 */}
        <View className="mt-6 text-center border-t pt-4">
          <Text className="block text-sm text-gray-600 mb-2">
            已有账号？
          </Text>
          <View
            className="bg-gray-200 px-6 py-2 rounded-lg inline-block"
            onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
          >
            <Text className="block text-sm text-gray-700 font-medium">
              立即登录
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
