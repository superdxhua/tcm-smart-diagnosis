import { View, Text, Input, Button, Picker, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Network } from '@/network'

const statusOptions = ['进行中', '调整中', '已完成']

export default function RecordDetailPage() {
  const [recordId, setRecordId] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false) // 是否为查看模式
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    visitDate: new Date().toISOString(),
    chiefComplaint: '',
    diagnosis: '',
    symptoms: '',
    pulse: '',
    tongue: '',
    doctorName: '',
    status: '进行中'
  })

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.id) {
      setRecordId(params.id)
      setIsEdit(true)
      setIsViewMode(true) // 查看已有病历时，进入查看模式
      loadRecord(params.id)
    }
    // 统一使用 memberId 和 memberName 参数名（与后端 members 表一致）
    if (params?.memberId) {
      setFormData(prev => ({ ...prev, patientId: params.memberId || '' }))
    }
    if (params?.memberName) {
      setFormData(prev => ({ ...prev, patientName: decodeURIComponent(params.memberName || '') || '' }))
    }
  }, [])

  const loadRecord = async (id: string) => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: `/api/health-records/${id}`,
        method: 'GET'
      })
      
      if (res.statusCode === 200) {
        const record = res.data.data
        if (record) {
          // 转换后端返回的下划线命名为前端使用的驼峰命名
          const updatedFormData = {
            patientId: record.patient_id || '',
            patientName: '', // 需要从用户信息获取
            visitDate: record.created_at || new Date().toISOString(),
            chiefComplaint: record.chief_complaint || '',
            diagnosis: record.diagnosis || '',
            symptoms: record.history || '',
            pulse: '',
            tongue: '',
            doctorName: record.doctor_id || '',
            status: '进行中'
          }
          
          // 如果有 patientId，加载用户信息
          if (record.patient_id) {
            try {
              const patientRes = await Network.request({
                url: `/api/members/${record.patient_id}`,
                method: 'GET'
              })
              
              if (patientRes.statusCode === 200 && patientRes.data.data) {
                updatedFormData.patientName = patientRes.data.data.name || ''
              }
            } catch (patientError) {
              console.error('加载用户信息失败:', patientError)
            }
          }
          
          setFormData(updatedFormData)
        }
      }
    } catch (error) {
      console.error('加载病历详情失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    console.log('=== 开始保存病历 ===')
    console.log('formData:', formData)
    console.log('patientId:', formData.patientId, '类型:', typeof formData.patientId)
    console.log('chiefComplaint:', formData.chiefComplaint)

    if (!formData.patientId || !formData.chiefComplaint) {
      console.log('验证失败')
      if (!formData.patientId) {
        console.log('patientId 为空')
        Taro.showToast({
          title: '用户信息缺失，请重新添加用户',
          icon: 'none',
          duration: 3000
        })
        // 延迟跳转到用户列表页面
        setTimeout(() => {
          Taro.navigateTo({ url: '/pages/patients-list/index' })
        }, 1000)
      } else if (!formData.chiefComplaint) {
        console.log('chiefComplaint 为空')
        Taro.showToast({
          title: '请输入主诉',
          icon: 'none'
        })
      }
      return
    }

    try {
      setLoading(true)

      // 构建符合后端要求的数据格式
      // 注意：后端使用 memberId（与 members 表一致），不是 patientId
      const submitData = {
        memberId: formData.patientId, // 映射到后端的 memberId
        consultantId: formData.doctorName || 'default-consultant',
        visitNumber: 1, // 默认为 1，如果是后续就诊可以在后端计算
        chiefComplaint: formData.chiefComplaint,
        history: formData.symptoms || '',
        pastHistory: '',
        analysisResult: formData.diagnosis || '',
        differentiation: '',
        treatmentPrinciple: '',
        healthPlan: '待开方', // 默认处方，后续可以生成
        advice: '',
        status: 'active'
      }

      console.log('提交病历数据:', submitData)
      console.log('请求URL:', isEdit ? `/api/health-records/${recordId}` : '/api/health-records')
      console.log('请求方法:', isEdit ? 'PUT' : 'POST')

      const res = isEdit
        ? await Network.request({
            url: `/api/health-records/${recordId}`,
            method: 'PUT',
            data: submitData
          })
        : await Network.request({
            url: '/api/health-records', // 使用正确的 API 路径
            method: 'POST',
            data: submitData
          })

      console.log('响应状态码:', res.statusCode)
      console.log('响应数据:', res.data)
      console.log('响应数据JSON:', JSON.stringify(res.data, null, 2))

      if (res.statusCode === 200 || res.statusCode === 201) {
        const savedRecord = res.data.data

        Taro.showToast({
          title: isEdit ? '更新成功' : '添加成功',
          icon: 'success'
        })

        // 新增或编辑病历后，都进入智能诊疗阶段
        if (savedRecord) {
          setTimeout(() => {
            // 跳转到首页并传递用户ID和主诉，自动启动诊疗
            // 统一使用 memberId 和 memberName（与后端 members 表一致）
            Taro.reLaunch({
              url: `/pages/index/index?memberId=${formData.patientId}&memberName=${encodeURIComponent(formData.patientName || '')}&autoStart=true&chiefComplaint=${encodeURIComponent(formData.chiefComplaint)}&symptoms=${encodeURIComponent(formData.symptoms || '')}`
            })
          }, 1000)
        }
      } else {
        // 打印后端返回的具体错误信息
        console.error('后端返回的具体错误信息:', res.data)
        console.error('后端返回的具体错误信息JSON:', JSON.stringify(res.data, null, 2))
        throw new Error(res.data?.message || res.data?.msg || res.data?.error || '保存失败')
      }
    } catch (error: any) {
      console.error('========================================');
      console.error('=== [病历保存失败 - 详细调试信息] ===');
      console.error('========================================');

      // 1. 打印完整的错误对象
      console.error('完整错误对象:', error);
      console.error('错误JSON:', JSON.stringify(error, null, 2));

      // 2. 打印错误类型
      console.error('错误类型:', error.constructor.name);
      console.error('错误消息:', error.message);

      // 3. 如果有响应对象，打印响应详情
      if (error.response) {
        console.error('--- 响应对象 ---');
        console.error('响应状态:', error.response.status);
        console.error('响应状态文本:', error.response.statusText);
        console.error('响应头:', error.response.headers);
        console.error('响应数据:', error.response.data);
        console.error('响应数据JSON:', JSON.stringify(error.response.data, null, 2));

        // 尝试解析后端返回的错误信息
        try {
          const errorData = typeof error.response.data === 'string'
            ? JSON.parse(error.response.data)
            : error.response.data;
          console.error('解析后的错误数据:', errorData);
          console.error('解析后的错误数据JSON:', JSON.stringify(errorData, null, 2));

          // 弹窗显示后端返回的错误信息
          const errorMsg = errorData?.msg || errorData?.error || errorData?.message || errorData?.fullError || JSON.stringify(errorData);
          Taro.showModal({
            title: '保存失败',
            content: `后端错误: ${errorMsg}`,
            showCancel: false
          });
        } catch (parseErr) {
          console.error('解析响应数据失败:', parseErr);
          Taro.showModal({
            title: '保存失败',
            content: `错误: ${error.message}\n响应: ${error.response.data}`,
            showCancel: false
          });
        }
      } else if (error.request) {
        // 4. 如果有请求对象但没有响应（网络错误）
        console.error('--- 请求对象（无响应） ---');
        console.error('请求信息:', error.request);
        console.error('请求信息JSON:', JSON.stringify(error.request, null, 2));
        console.error('这通常意味着网络请求没有到达服务器');

        Taro.showModal({
          title: '保存失败',
          content: `网络错误: 请求已发出但没有收到响应\n错误: ${error.message}`,
          showCancel: false
        });
      } else {
        // 5. 其他错误
        console.error('--- 其他错误 ---');
        console.error('其他错误JSON:', JSON.stringify(error, null, 2));
        Taro.showModal({
          title: '保存失败',
          content: `错误: ${error.message || JSON.stringify(error)}`,
          showCancel: false
        });
      }

      // 6. 打印堆栈信息
      if (error.stack) {
        console.error('错误堆栈:', error.stack);
      }

      console.error('========================================');
      console.error('=== [调试信息结束] ===');
      console.error('========================================');
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该病历吗？删除后不可恢复。',
      success: async (res) => {
        if (res.confirm) {
          try {
            setLoading(true)
            await Network.request({
              url: `/api/health-records/${recordId}`,
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

  // 切换到编辑模式
  const handleEdit = () => {
    setIsViewMode(false)
  }

  // 取消编辑，返回查看模式
  const handleCancelEdit = () => {
    setIsViewMode(true)
    // 重新加载原始数据
    if (recordId) {
      loadRecord(recordId)
    }
  }

  const handleAdjustPrescription = () => {
    if (!recordId) return
    Taro.navigateTo({
      url: `/pages/prescription-adjust/index?recordId=${recordId}`
    })
  }

  const handleMedicationFeedback = () => {
    if (!recordId) return
    Taro.navigateTo({
      url: `/pages/medication-feedback/index?recordId=${recordId}`
    })
  }

  const handleChatWithAI = () => {
    if (!recordId) return
    Taro.navigateTo({
      url: `/pages/ai-chat/index?recordId=${recordId}`
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
            <Text className="block text-xl font-bold text-gray-800">
              {isEdit && isViewMode ? '查看病历' : isEdit ? '编辑病历' : '新增病历'}
            </Text>
          </View>
        </View>
      </View>

      {/* 表单内容 */}
      <ScrollView scrollY className="flex-1 px-4 py-4">
        <View className="bg-white rounded-lg p-4 shadow-sm">
          {/* 用户信息 */}
          {formData.patientName && (
            <View className="mb-4 bg-blue-50 rounded-lg p-3">
              <Text className="block text-sm text-gray-600">用户：{formData.patientName}</Text>
            </View>
          )}

          {/* 就诊日期 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              就诊日期 {isViewMode ? '' : <Text className="text-red-500">*</Text>}
            </Text>
            {isViewMode ? (
              <View className="w-full bg-indigo-50 border-2 border-indigo-200 rounded-xl px-4 py-3">
                <Text className="block text-gray-800 text-base">
                  {new Date(formData.visitDate).toLocaleDateString()}
                </Text>
              </View>
            ) : (
              <Picker
                mode="date"
                value={new Date(formData.visitDate).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, visitDate: new Date(e.detail.value).toISOString() })}
              >
                <View className="w-full bg-indigo-50 border-2 border-indigo-200 rounded-xl px-4 py-3">
                  <Text className="block text-gray-800 text-base">
                    {new Date(formData.visitDate).toLocaleDateString()}
                  </Text>
                </View>
              </Picker>
            )}
          </View>

          {/* 医师 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">接诊医师</Text>
            {isViewMode ? (
              <View className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3">
                <Text className="block text-gray-800 text-base">{formData.doctorName || '-'}</Text>
              </View>
            ) : (
              <View className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请输入医师姓名"
                  placeholderClass="text-gray-400"
                  value={formData.doctorName}
                  onInput={(e) => setFormData({ ...formData, doctorName: e.detail.value })}
                />
              </View>
            )}
          </View>

          {/* 主诉 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">
              主诉 {isViewMode ? '' : <Text className="text-red-500">*</Text>}
            </Text>
            {isViewMode ? (
              <View className="w-full bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3">
                <Text className="block text-gray-800 text-base">{formData.chiefComplaint || '-'}</Text>
              </View>
            ) : (
              <View className="w-full bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请输入主诉（如：头痛3天）"
                  placeholderClass="text-gray-400"
                  value={formData.chiefComplaint}
                  onInput={(e) => setFormData({ ...formData, chiefComplaint: e.detail.value })}
                />
              </View>
            )}
          </View>

          {/* 诊断 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">诊断</Text>
            {isViewMode ? (
              <View className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3">
                <Text className="block text-gray-800 text-base">{formData.diagnosis || '-'}</Text>
              </View>
            ) : (
              <View className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请输入诊断结果"
                  placeholderClass="text-gray-400"
                  value={formData.diagnosis}
                  onInput={(e) => setFormData({ ...formData, diagnosis: e.detail.value })}
                />
              </View>
            )}
          </View>

          {/* 症状 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">症状表现</Text>
            {isViewMode ? (
              <View className="w-full bg-purple-50 border-2 border-purple-200 rounded-xl px-4 py-3">
                <Text className="block text-gray-800 text-base">{formData.symptoms || '-'}</Text>
              </View>
            ) : (
              <View className="w-full bg-purple-50 border-2 border-purple-200 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请详细描述症状"
                  placeholderClass="text-gray-400"
                  value={formData.symptoms}
                  onInput={(e) => setFormData({ ...formData, symptoms: e.detail.value })}
                />
              </View>
            )}
          </View>

          {/* 脉象 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">脉象</Text>
            {isViewMode ? (
              <View className="w-full bg-rose-50 border-2 border-rose-200 rounded-xl px-4 py-3">
                <Text className="block text-gray-800 text-base">{formData.pulse || '-'}</Text>
              </View>
            ) : (
              <View className="w-full bg-rose-50 border-2 border-rose-200 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请输入脉象（如：弦脉）"
                  placeholderClass="text-gray-400"
                  value={formData.pulse}
                  onInput={(e) => setFormData({ ...formData, pulse: e.detail.value })}
                />
              </View>
            )}
          </View>

          {/* 舌象 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">舌象</Text>
            {isViewMode ? (
              <View className="w-full bg-pink-50 border-2 border-pink-200 rounded-xl px-4 py-3">
                <Text className="block text-gray-800 text-base">{formData.tongue || '-'}</Text>
              </View>
            ) : (
              <View className="w-full bg-pink-50 border-2 border-pink-200 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请输入舌象（如：舌红苔薄白）"
                  placeholderClass="text-gray-400"
                  value={formData.tongue}
                  onInput={(e) => setFormData({ ...formData, tongue: e.detail.value })}
                />
              </View>
            )}
          </View>

          {/* 状态 */}
          <View className="mb-4">
            <Text className="block text-sm font-medium text-gray-700 mb-2">状态</Text>
            {isViewMode ? (
              <View className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3">
                <Text className="block text-gray-800 text-base">{formData.status}</Text>
              </View>
            ) : (
              <Picker
                mode="selector"
                range={statusOptions}
                value={statusOptions.indexOf(formData.status)}
                onChange={(e) => setFormData({ ...formData, status: statusOptions[e.detail.value] })}
              >
                <View className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3">
                  <Text className="block text-gray-800 text-base">{formData.status}</Text>
                </View>
              </Picker>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={{ position: 'fixed', bottom: 50, left: 0, right: 0, display: 'flex', flexDirection: 'row', gap: '8px', padding: '12px', backgroundColor: '#fff', borderTop: '1px solid #e5e5e5', zIndex: 100 }}>
        {/* 查看模式：显示修改、删除等功能按钮 */}
        {isEdit && isViewMode && (
          <>
            <View style={{ flex: 1 }}>
              <Button
                className="w-full bg-blue-500 text-white rounded-lg py-3"
                onClick={handleEdit}
              >
                修改
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                className="w-full bg-red-500 text-white rounded-lg py-3"
                onClick={handleDelete}
              >
                删除
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                className="w-full bg-orange-500 text-white rounded-lg py-3"
                onClick={handleAdjustPrescription}
              >
                调整处方
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                className="w-full bg-purple-500 text-white rounded-lg py-3"
                onClick={handleMedicationFeedback}
              >
                服药反馈
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                className="w-full bg-indigo-500 text-white rounded-lg py-3"
                onClick={handleChatWithAI}
              >
                AI讨论
              </Button>
            </View>
          </>
        )}

        {/* 编辑模式：显示取消、保存按钮 */}
        {isEdit && !isViewMode && (
          <>
            <View style={{ flex: 1 }}>
              <Button
                className="w-full bg-gray-500 text-white rounded-lg py-3"
                onClick={handleCancelEdit}
              >
                取消
              </Button>
            </View>
            <View style={{ flex: 1.5 }}>
              <Button
                className="w-full bg-green-500 text-white rounded-lg py-3"
                onClick={handleSave}
              >
                保存病历
              </Button>
            </View>
          </>
        )}

        {/* 新增模式：只显示提交按钮 */}
        {!isEdit && (
          <View style={{ flex: 1 }}>
            <Button
              className="w-full bg-green-500 text-white rounded-lg py-3"
              onClick={handleSave}
            >
              提交病历
            </Button>
          </View>
        )}
      </View>
    </View>
  )
}
