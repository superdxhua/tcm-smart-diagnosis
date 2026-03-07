import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Network } from '@/network'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [recordId, setRecordId] = useState('')
  const [prescriptionContext, setPrescriptionContext] = useState('')

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.recordId) {
      setRecordId(params.recordId)
      loadPrescriptionContext(params.recordId)
    }

    // 添加欢迎消息
    setMessages([
      {
        role: 'assistant',
        content: '你好！我是中医诊疗助手。我可以帮你分析处方、解答疑问，或根据你的反馈调整处方建议。请问有什么可以帮你的？',
        timestamp: new Date().toISOString()
      }
    ])
  }, [])

  const loadPrescriptionContext = async (id: string) => {
    try {
      const res = await Network.request({
        url: `/api/health-records/${id}`, // 使用正确的 API 路径
        method: 'GET'
      })

      if (res.statusCode === 200 && res.data.data) {
        const record = res.data.data
        const context = `
当前用户信息：
- 姓名：${record.patientName}
- 主诉：${record.chiefComplaint}
- 诊断：${record.diagnosis}
- 症状：${record.symptoms}
- 脉象：${record.pulse}
- 舌象：${record.tongue}

当前处方：
- 药物组成：${record.prescription?.herbs?.join('、') || '未填写'}
- 剂量：${record.prescription?.dosage || '未填写'}
- 服用方法：${record.prescription?.instructions || '未填写'}
        `.trim()
        setPrescriptionContext(context)
      }
    } catch (error) {
      console.error('加载处方信息失败:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      return
    }

    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputText('')
    setLoading(true)

    try {
      // 转换为后端期望的格式（包含 role 和 content）
      const messagesForBackend = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // 如果有处方上下文，添加到第一条系统消息中
      if (prescriptionContext) {
        // 检查是否已有系统消息
        const hasSystemMessage = messagesForBackend.some(m => m.role === 'system')
        if (!hasSystemMessage) {
          // 在最前面插入系统消息
          messagesForBackend.unshift({
            role: 'system',
            content: `你是一位中医诊疗助手，负责与患者进行智能问询。\n\n${prescriptionContext}`
          })
        }
      }

      const res = await Network.request({
        url: '/api/ai/chat',
        method: 'POST',
        data: {
          messages: messagesForBackend
        }
      })

      if (res.statusCode === 200 && res.data.data) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: res.data.data.content,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      Taro.showToast({
        title: '发送失败，请重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApplySuggestion = () => {
    // 查找最后一条 AI 消息，检查是否包含处方调整建议
    const lastAiMessage = [...messages].reverse().find(m => m.role === 'assistant')
    if (lastAiMessage && lastAiMessage.content.includes('建议')) {
      Taro.showModal({
        title: '应用建议',
        content: '是否将 AI 的建议应用到当前处方？',
        success: (res) => {
          if (res.confirm && recordId) {
            // 跳转到处方调整页面，携带建议内容
            Taro.navigateTo({
              url: `/pages/prescription-adjust/index?recordId=${recordId}&suggestion=${encodeURIComponent(lastAiMessage.content)}`
            })
          }
        }
      })
    } else {
      Taro.showToast({
        title: '当前无可用建议',
        icon: 'none'
      })
    }
  }

  if (loading && messages.length === 1) {
    return (
      <View className="flex items-center justify-center min-h-screen bg-gray-50">
        <Text className="text-gray-500">加载中...</Text>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col">
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
            <Text className="text-xl font-bold text-gray-800">AI 助手对话</Text>
          </View>
        </View>
      </View>

      {/* 消息列表 */}
      <ScrollView
        scrollY
        className="flex-1 px-4 py-4"
        style={{ height: 'calc(100vh - 200px)' }}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
          >
            <View
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white shadow-sm'
              }`}
            >
              <Text className={`block text-sm ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                {message.content}
              </Text>
              <Text
                className={`block text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View className="flex justify-start mb-4">
            <View className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <Text className="text-sm text-gray-500">正在思考...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 应用建议按钮 */}
      {messages.length > 2 && (
        <View className="bg-white px-4 py-2 border-t">
          <Button
            className="bg-green-500 text-white rounded-lg py-2"
            onClick={handleApplySuggestion}
          >
            应用 AI 建议
          </Button>
        </View>
      )}

      {/* 底部输入框 */}
      <View style={{
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
        <View style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
          <View style={{ flex: 1, backgroundColor: '#f5f5f5', borderRadius: '20px', padding: '8px 12px' }}>
            <input style={{
              width: '100%',
              fontSize: '14px',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent'
            }} placeholder="输入您的疑问..." value={inputText}
              onInput={(e) => setInputText((e.target as HTMLInputElement).value)}
              onKeyPress={(e) => {
                if ((e as React.KeyboardEvent).key === 'Enter' && !loading) {
                  handleSendMessage()
                }
              }}
            />
          </View>
          <View style={{ flexShrink: 0 }}>
            <button disabled={loading || !inputText.trim()} onClick={handleSendMessage} style={{
              backgroundColor: loading || !inputText.trim() ? '#ccc' : '#1890ff',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 20px',
              fontSize: '14px',
              cursor: loading || !inputText.trim() ? 'not-allowed' : 'pointer'
            }}
            >
              {loading ? '发送中' : '发送'}
            </button>
          </View>
        </View>
      </View>
    </View>
  )
}
