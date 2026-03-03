import { View, Text, Input, Button, Picker, ScrollView, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Network } from '@/network'

const genderOptions = ['男', '女']

export default function PatientDetailPage() {
  const [patientId, setPatientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [remainingPatients, setRemainingPatients] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    age: '',
    birthYear: '',
    height: '',
    weight: '',
    phone: '',
    contactInfo: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    tongueCondition: '',
    sleepCondition: '',
    digestionCondition: '',
    isPregnant: false,
    isChild: false
  })

  useEffect(() => {
    loadUserInfo()
    const params = Taro.getCurrentInstance().router?.params
    if (params?.id) {
      setPatientId(params.id)
      setIsEdit(true)
      loadPatient(params.id)
    } else {
      // 新增模式，获取剩余可添加人数
      const remaining = params?.remaining
      if (remaining) {
        setRemainingPatients(parseInt(remaining))
      }

      // 个人用户添加用户时弹出提示
      const userInfo = Taro.getStorageSync('user')
      if (userInfo?.role === 'individual') {
        Taro.showModal({
          title: '个人账户提示',
          content: '个人账户无法删除用户，且添加人数上限为 4 人。如需删除用户或添加更多用户，请联系管理员申请机构资质认证。',
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    }
  }, [])

  const loadUserInfo = () => {
    const userInfo = Taro.getStorageSync('user')
    setUser(userInfo)
  }

  const loadPatient = async (id: string) => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: `/api/members/${id}`,
        method: 'GET'
      })
      
      if (res.statusCode === 200) {
        const patient = res.data.data
        console.log('加载用户信息 - 原始数据:', JSON.stringify(patient, null, 2))
        console.log('用户名称:', patient.name, '类型:', typeof patient.name)
        if (patient) {
          setFormData({
            name: patient.name || '',
            gender: patient.gender || '男',
            age: patient.age?.toString() || '',
            birthYear: patient.birth_year?.toString() || '',
            height: patient.height?.toString() || '',
            weight: patient.weight?.toString() || '',
            phone: patient.phone || '',
            contactInfo: patient.contact_info || '',
            address: patient.address || '',
            medicalHistory: patient.medical_history || '',
            allergies: patient.allergies || '',
            tongueCondition: patient.tongue_condition || '',
            sleepCondition: patient.sleep_condition || '',
            digestionCondition: patient.digestion_condition || '',
            isPregnant: patient.is_pregnant || false,
            isChild: patient.is_child || false
          })
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.age) {
      Taro.showToast({
        title: '请填写必填信息',
        icon: 'none'
      })
      return
    }

    try {
      setLoading(true)
      const data = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        doctorId: 'default-doctor'
      }

      console.log('提交用户数据:', JSON.stringify(data, null, 2))
      console.log('用户名称:', data.name, '类型:', typeof data.name)

      const res = isEdit
        ? await Network.request({
            url: `/api/members/${patientId}`,
            method: 'PUT',
            data
          })
        : await Network.request({
            url: '/api/members',
            method: 'POST',
            data
          })

      if (res.statusCode === 200) {
        const savedPatient = res.data.data

        Taro.showToast({
          title: isEdit ? '更新成功' : '添加成功',
          icon: 'success'
        })

        // 如果是新增用户，触发用户创建事件
        if (!isEdit && savedPatient) {
          Taro.eventCenter.trigger('patientCreated', savedPatient)
        }

        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    if (!formData.name || !formData.age) {
      Taro.showToast({
        title: '请填写必填信息',
        icon: 'none'
      })
      return
    }

    try {
      setLoading(true)
      const data = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        doctorId: 'default-doctor'
      }

      let savedPatientId: string
      let savedPatientName: string

      if (isEdit) {
        // 编辑模式：使用当前 patientId
        savedPatientId = patientId
        savedPatientName = formData.name
        
        await Network.request({
          url: `/api/members/${patientId}`,
          method: 'PUT',
          data
        })
        
        Taro.showToast({
          title: '更新成功',
          icon: 'success'
        })
      } else {
        // 新增模式：保存后获取新ID
        const res = await Network.request({
          url: '/api/members',
          method: 'POST',
          data
        })
        
        savedPatientId = res.data.data.id
        savedPatientName = formData.name
        
        Taro.showToast({
          title: '添加成功',
          icon: 'success'
        })
      }

      // 跳转到病历页面
      setTimeout(() => {
        Taro.redirectTo({
          url: `/pages/record-detail/index?memberId=${savedPatientId}&memberName=${savedPatientName}`
        })
      }, 1000)
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该用户吗？删除后不可恢复。',
      success: async (res) => {
        if (res.confirm) {
          try {
            setLoading(true)
            await Network.request({
              url: `/api/members/${patientId}`,
              method: 'DELETE'
            })
            
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            })
            setTimeout(() => {
              Taro.navigateBack()
            }, 1500)
          } catch (error) {
            console.error('删除失败:', error)
            Taro.showToast({
              title: '删除失败',
              icon: 'none'
            })
          } finally {
            setLoading(false)
          }
        }
      }
    })
  }

  const handleViewRecords = () => {
    if (!patientId) return
    Taro.navigateTo({
      url: `/pages/records-list/index?memberId=${patientId}&memberName=${formData.name}`
    })
  }

  const handleStartConsult = () => {
    if (!patientId) {
      Taro.showToast({
        title: '请先保存用户信息',
        icon: 'none'
      })
      return
    }

    // 跳转到首页，自动启动智能咨询
    // 统一使用 memberId 和 memberName（与后端 members 表一致）
    Taro.switchTab({
      url: `/pages/index/index?memberId=${patientId}&memberName=${encodeURIComponent(formData.name)}`
    })
  }

  if (loading) {
    return (
      <View className="flex items-center justify-center min-h-screen bg-gray-100">
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
              {isEdit ? '编辑用户' : '添加用户'}
            </Text>
          </View>
          <Text className="block text-xs text-gray-500">
            {isEdit ? '修改用户信息' : '新建用户档案'}
          </Text>
        </View>
      </View>

      {/* 个人用户剩余名额提示 */}
      {user?.role === 'individual' && !isEdit && remainingPatients !== null && (
        <View className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-2">
              <Text className="block text-lg">👥</Text>
              <Text className="block text-sm text-blue-800">
                您还可以添加 {remainingPatients} 位用户
              </Text>
            </View>
          </View>
          {remainingPatients === 0 && (
            <View className="mt-2 bg-orange-100 rounded-lg p-2">
              <Text className="block text-xs text-orange-700 text-center">
                ⚠️ 已达到个人用户数量上限
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 表单内容 */}
      <ScrollView scrollY className="flex-1 px-4 py-4" style={{ height: 'calc(100vh - 140px)' }}>
        
        {/* 基本信息 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex items-center mb-4">
            <View className="w-1 h-5 bg-blue-500 rounded mr-2"></View>
            <Text className="block text-base font-semibold text-gray-800">
              基本信息
            </Text>
          </View>

          {/* 姓名 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              <Text className="block text-red-500 mr-1">*</Text>姓名
            </Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入用户姓名"
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
              />
            </View>
          </View>

          {/* 性别和年龄 */}
          <View className="flex gap-3 mb-4">
            <View className="flex-1">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                <Text className="block text-red-500 mr-1">*</Text>性别
              </Text>
              <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <Picker mode="selector" range={genderOptions} value={genderOptions.indexOf(formData.gender)} onChange={(e) => setFormData({ ...formData, gender: genderOptions[e.detail.value] })}>
                  <Text className="block text-base text-gray-800">{formData.gender}</Text>
                </Picker>
              </View>
            </View>
            <View className="flex-1">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                <Text className="block text-red-500 mr-1">*</Text>年龄
              </Text>
              <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <Input
                  className="w-full bg-transparent"
                  type="digit"
                  placeholder="年龄"
                  value={formData.age}
                  onInput={(e) => setFormData({ ...formData, age: e.detail.value })}
                />
              </View>
            </View>
          </View>

          {/* 出生年份 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              出生年份
            </Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <Input
                className="w-full bg-transparent"
                type="digit"
                placeholder="如：1990"
                value={formData.birthYear}
                onInput={(e) => setFormData({ ...formData, birthYear: e.detail.value })}
              />
            </View>
          </View>

          {/* 身高体重 */}
          <View className="flex gap-3">
            <View className="flex-1">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                身高
              </Text>
              <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <Input
                  className="w-full bg-transparent"
                  type="digit"
                  placeholder="如：170cm"
                  value={formData.height}
                  onInput={(e) => setFormData({ ...formData, height: e.detail.value })}
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                体重
              </Text>
              <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <Input
                  className="w-full bg-transparent"
                  type="digit"
                  placeholder="如：65kg"
                  value={formData.weight}
                  onInput={(e) => setFormData({ ...formData, weight: e.detail.value })}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 联系方式 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex items-center mb-4">
            <View className="w-1 h-5 bg-green-500 rounded mr-2"></View>
            <Text className="block text-base font-semibold text-gray-800">
              联系方式
            </Text>
          </View>

          {/* 电话 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              联系电话
            </Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <Input
                className="w-full bg-transparent"
                type="number"
                placeholder="请输入联系电话"
                value={formData.phone}
                onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}
              />
            </View>
          </View>

          {/* 其他联系方式 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              其他联系方式
            </Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <Input
                className="w-full bg-transparent"
                placeholder="微信、邮箱等"
                value={formData.contactInfo}
                onInput={(e) => setFormData({ ...formData, contactInfo: e.detail.value })}
              />
            </View>
          </View>

          {/* 地址 */}
          <View>
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              住址
            </Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入详细地址"
                value={formData.address}
                onInput={(e) => setFormData({ ...formData, address: e.detail.value })}
              />
            </View>
          </View>
        </View>

        {/* 病史信息 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex items-center mb-4">
            <View className="w-1 h-5 bg-orange-500 rounded mr-2"></View>
            <Text className="block text-base font-semibold text-gray-800">
              病史信息
            </Text>
          </View>

          {/* 既往病史 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              既往病史
            </Text>
            <Textarea
              className="w-full bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
              placeholder="请输入既往病史"
              value={formData.medicalHistory}
              onInput={(e) => setFormData({ ...formData, medicalHistory: e.detail.value })}
              maxlength={500}
            />
          </View>

          {/* 过敏史 */}
          <View>
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              过敏史
            </Text>
            <Textarea
              className="w-full bg-orange-50 rounded-lg px-4 py-3 border-2 border-orange-300"
              placeholder="请输入过敏史（如青霉素过敏），无过敏史请填「无」"
              value={formData.allergies}
              onInput={(e) => setFormData({ ...formData, allergies: e.detail.value })}
              maxlength={500}
            />
          </View>
        </View>

        {/* 中医体征 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex items-center mb-4">
            <View className="w-1 h-5 bg-purple-500 rounded mr-2"></View>
            <Text className="block text-base font-semibold text-gray-800">
              中医体征
            </Text>
          </View>

          {/* 舌象 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              舌象状况
            </Text>
            <Textarea
              className="w-full bg-green-50 rounded-lg px-4 py-3 border border-gray-200"
              placeholder="如：舌红苔薄黄、舌淡苔白等"
              value={formData.tongueCondition}
              onInput={(e) => setFormData({ ...formData, tongueCondition: e.detail.value })}
              maxlength={200}
            />
          </View>

          {/* 睡眠 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              睡眠状况
            </Text>
            <Textarea
              className="w-full bg-purple-50 rounded-lg px-4 py-3 border border-gray-200"
              placeholder="如：易醒、多梦、失眠等"
              value={formData.sleepCondition}
              onInput={(e) => setFormData({ ...formData, sleepCondition: e.detail.value })}
              maxlength={200}
            />
          </View>

          {/* 大小便 */}
          <View>
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              大小便状况
            </Text>
            <Textarea
              className="w-full bg-blue-50 rounded-lg px-4 py-3 border border-gray-200"
              placeholder="如：便秘、腹泻、尿频等"
              value={formData.digestionCondition}
              onInput={(e) => setFormData({ ...formData, digestionCondition: e.detail.value })}
              maxlength={200}
            />
          </View>
        </View>

        {/* 特殊人群 */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <View className="flex items-center mb-4">
            <View className="w-1 h-5 bg-pink-500 rounded mr-2"></View>
            <Text className="block text-base font-semibold text-gray-800">
              特殊人群标识
            </Text>
          </View>

          <View className="flex gap-4">
            <View
              className={`flex-1 flex flex-col items-center justify-center py-4 rounded-xl border-2 ${
                formData.isPregnant ? 'bg-pink-100 border-pink-500' : 'bg-gray-50 border-gray-200'
              }`}
              onClick={() => setFormData({ ...formData, isPregnant: !formData.isPregnant })}
            >
              <Text className="block text-3xl mb-2">🤰</Text>
              <Text className={`block text-sm font-medium ${formData.isPregnant ? 'text-pink-600' : 'text-gray-500'}`}>
                孕妇
              </Text>
            </View>
            <View
              className={`flex-1 flex flex-col items-center justify-center py-4 rounded-xl border-2 ${
                formData.isChild ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200'
              }`}
              onClick={() => setFormData({ ...formData, isChild: !formData.isChild })}
            >
              <Text className="block text-3xl mb-2">👶</Text>
              <Text className={`block text-sm font-medium ${formData.isChild ? 'text-blue-600' : 'text-gray-500'}`}>
                儿童
              </Text>
            </View>
          </View>
        </View>

        {/* 提示信息 */}
        <View className="bg-blue-50 rounded-xl p-4 mb-4">
          <View className="flex items-start gap-2">
            <Text className="block text-xl">💡</Text>
            <View className="flex-1">
              <Text className="block text-sm font-medium text-blue-800 mb-1">
                填写提示
              </Text>
              <Text className="block text-xs text-blue-600 leading-relaxed">
                带 * 号的字段为必填项。过敏史如无请填写「无」，这关系到用药安全。中医体征信息有助于更精准的辨证论治。填写完成后点击「下一步」创建病历。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #e5e5e5',
          padding: '12px',
          zIndex: 100
        }}
      >
        <View style={{ display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap' }}>
          {isEdit && user?.role !== 'individual' && (
            <View style={{ flex: 1, minWidth: '80px' }}>
              <Button
                className="w-full bg-red-500 text-white rounded-lg py-3"
                onClick={handleDelete}
              >
                删除
              </Button>
            </View>
          )}
          {isEdit && (
            <View style={{ flex: 1, minWidth: '80px' }}>
              <Button
                className="w-full bg-blue-500 text-white rounded-lg py-3"
                onClick={handleViewRecords}
              >
                查看病历
              </Button>
            </View>
          )}
          <View style={{ flex: 1, minWidth: '80px' }}>
            <Button
              className="w-full bg-gray-500 text-white rounded-lg py-3"
              onClick={handleSave}
            >
              {isEdit ? '保存' : '完成'}
            </Button>
          </View>
          {isEdit && (
            <View style={{ flex: 2, minWidth: '150px' }}>
              <Button
                className="w-full bg-orange-500 text-white rounded-lg py-3"
                onClick={handleStartConsult}
              >
                开始咨询
              </Button>
            </View>
          )}
          <View style={{ flex: 2, minWidth: '150px' }}>
            <Button
              className="w-full bg-green-500 text-white rounded-lg py-3"
              onClick={handleNext}
            >
              下一步：填写病历
            </Button>
          </View>
        </View>
      </View>
    </View>
  )
}
