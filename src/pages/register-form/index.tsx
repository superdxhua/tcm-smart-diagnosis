import { View, Text, Input, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

export default function RegisterFormPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [qualifications, setQualifications] = useState({
    institutionLicense: '', // 营业执照
    practiceLicense: '', // 执业许可证
    physicianCert: '', // 医师资格证书
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState('')
  const [error, setError] = useState('')
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

  // 小程序端：手机号授权
  const handleWeappPhone = async (e: any) => {
    if (!e.detail.code) {
      Taro.showToast({
        title: '获取手机号失败，请重试',
        icon: 'none',
      })
      return
    }

    // TODO: 调用微信 API 解析授权码获取手机号
    // 这里暂时使用模拟数据
    const mockPhone = `1${Math.floor(Math.random() * 9000000000 + 1000000000)}`
    setPhoneNumber(mockPhone)
    Taro.showToast({
      title: '手机号获取成功',
      icon: 'success',
    })
  }

  // H5 端：手动输入手机号
  const handlePhoneInput = (e: any) => {
    setPhoneNumber(e.detail.value)
  }

  // 选择资质文件
  const handleChooseFile = async (type: 'institutionLicense' | 'practiceLicense' | 'physicianCert') => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setUploading(type)

        // 上传到后端
        const uploadRes = await Network.uploadFile({
          url: '/api/auth/upload-qualification',
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            type,
          },
        })

        setUploading('')
        const data = JSON.parse(uploadRes.data)

        if (data.code === 200) {
          setQualifications(prev => ({
            ...prev,
            [type]: data.data.url,
          }))
          Taro.showToast({
            title: '上传成功',
            icon: 'success',
          })
        } else {
          throw new Error(data.msg || '上传失败')
        }
      }
    } catch (err: any) {
      console.error('上传失败:', err)
      setUploading('')
      Taro.showToast({
        title: err.message || '上传失败',
        icon: 'none',
      })
    }
  }

  // 提交注册
  const handleSubmit = async () => {
    // 验证手机号
    if (!phoneNumber) {
      setError('请输入手机号')
      return
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError('请输入正确的手机号')
      return
    }

    // 验证资质
    if (!qualifications.institutionLicense) {
      setError('请上传营业执照')
      return
    }

    if (!qualifications.practiceLicense) {
      setError('请上传执业许可证')
      return
    }

    if (!qualifications.physicianCert) {
      setError('请上传医师资格证书')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 调用后端接口注册
      const response = await Network.request({
        url: '/api/auth/register-institution',
        method: 'POST',
        data: {
          phone: phoneNumber,
          qualifications,
        },
      })

      console.log('注册响应:', response.data)

      if (response.data.code === 200) {
        Taro.showToast({
          title: '注册成功，等待审核',
          icon: 'success',
          duration: 3000,
        })

        // 跳转到登录页
        setTimeout(() => {
          Taro.redirectTo({
            url: '/pages/login/index',
          })
        }, 3000)
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

  // 获取资质标题
  const getQualificationTitle = (type: string) => {
    const titles: Record<string, string> = {
      institutionLicense: '营业执照',
      practiceLicense: '执业许可证',
      physicianCert: '医师资格证书',
    }
    return titles[type] || type
  }

  return (
    <View className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <View className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        {/* 顶部导航栏 */}
        <View className="flex items-center justify-between mb-6">
          <View
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg"
            onClick={() => Taro.navigateBack()}
          >
            <Text className="block text-lg text-gray-600">←</Text>
          </View>
          <Text className="block text-xl font-bold text-gray-800">机构注册</Text>
          <View className="w-10"></View>
        </View>

        {/* 说明 */}
        <View className="bg-purple-50 rounded-lg p-4 mb-6">
          <Text className="block text-sm text-purple-800 font-medium mb-1">
            📋 资质说明
          </Text>
          <Text className="block text-xs text-purple-700 leading-relaxed">
            请上传以下资质证明，审核通过后将自动获得3天免费使用期限。
          </Text>
        </View>

        {/* 手机号输入 */}
        <View className="mb-6">
          <Text className="block text-sm font-medium text-gray-700 mb-2">
            手机号（作为账户名）
          </Text>
          {isWeapp ? (
            // 小程序端：手机号授权
            <Button
              className="w-full bg-purple-500 text-white rounded-xl py-3"
              openType="getPhoneNumber"
              onGetPhoneNumber={handleWeappPhone}
              disabled={loading}
            >
              {phoneNumber ? phoneNumber : '获取手机号'}
            </Button>
          ) : (
            // H5 端：手机号输入
            <View className="bg-gray-50 rounded-lg px-4 py-3">
              <Input
                className="w-full bg-transparent text-base"
                placeholder="请输入手机号"
                type="number"
                maxlength={11}
                value={phoneNumber}
                onInput={handlePhoneInput}
              />
            </View>
          )}
        </View>

        {/* 资质上传 */}
        <View className="space-y-4 mb-6">
          {(['institutionLicense', 'practiceLicense', 'physicianCert'] as const).map(type => (
            <View key={type}>
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                {getQualificationTitle(type)}
                <Text className="text-red-500 ml-1">*</Text>
              </Text>
              {qualifications[type] ? (
                // 已上传
                <View className="bg-green-50 rounded-lg p-3 flex items-center gap-3">
                  <Text className="block text-green-500">✓</Text>
                  <Text className="block text-xs text-green-700 flex-1">
                    已上传
                  </Text>
                  <View
                    className="px-3 py-1 bg-white rounded-full"
                    onClick={() => handleChooseFile(type)}
                  >
                    <Text className="block text-xs text-purple-600">重新上传</Text>
                  </View>
                </View>
              ) : (
                // 未上传
                <View
                  className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 text-center"
                  onClick={() => handleChooseFile(type)}
                >
                  <Text className="block text-2xl mb-2">📄</Text>
                  <Text className="block text-sm text-gray-600">
                    {uploading === type ? '上传中...' : `点击上传${getQualificationTitle(type)}`}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 错误提示 */}
        {error && (
          <View className="bg-red-50 rounded-lg p-3 mb-6">
            <Text className="block text-sm text-red-600 text-center">
              {error}
            </Text>
          </View>
        )}

        {/* 提交按钮 */}
        <View
          className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl py-4"
          onClick={handleSubmit}
        >
          <Text className="block text-base font-medium text-white text-center">
            {loading ? '注册中...' : '提交审核'}
          </Text>
        </View>

        {/* 说明 */}
        <View className="mt-6 text-center">
          <Text className="block text-sm text-gray-600 mb-2">
            提交后等待管理员审核
          </Text>
          <Text className="block text-xs text-gray-500">
            审核通过后将自动获得3天免费使用期限
          </Text>
        </View>

        {/* 返回登录 */}
        <View className="mt-4 text-center">
          <View
            className="bg-gray-200 px-6 py-2 rounded-lg inline-block"
            onClick={() => Taro.redirectTo({ url: '/pages/login/index' })}
          >
            <Text className="block text-sm text-gray-700 font-medium">
              返回登录
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
