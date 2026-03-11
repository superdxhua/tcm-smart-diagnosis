import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function AiTcmPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [patientInfo, setPatientInfo] = useState<any>({})
  const [contextInfo, setContextInfo] = useState('')

  // 1. 页面加载时，获取参数并立即开始问询
  useEffect(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params) {
      // 接收所有参数
      const info = {
        id: params.patientId || '',
        name: params.name || '',
        age: params.age || '',
        gender: params.gender || ''
      }
      
      setPatientInfo(info)
      setPatientId(info.id)

      // 组装上下文信息（主诉、既往史、补充信息）
      const context = `主诉：${params.chiefComplaint || '无'}；既往史：${params.pastHistory || '无'}；补充信息：${params.additionalInfo || '无'}`
      setContextInfo(context)

      // 立刻发起问询
      startInquiry(info, context)
    }
  }, [])

  // 2. 发起问询
  const startInquiry = async (info: any, context: string) => {
    setLoading(true)
    // 添加一个“正在思考”的提示
    setMessages([{ role: 'assistant', content: 'AI 专家正在分析您的信息，请稍候...' }])

    try {
      const res = await Taro.request({
        url: 'https://api.zhongyihskhealth.com/api/ai-tcm/inquiry',
        method: 'POST',
        data: {
          basicInfo: info,
          supplementaryInfo: context,
          dialogHistory: []
        }
      })
      
      if (res.statusCode === 200 && res.data) {
        const aiContent = res.data.data || res.data
        setMessages([{ role: 'assistant', content: aiContent }])
      } else {
        throw new Error('AI 返回数据格式错误')
      }
    } catch (e: any) {
      console.error(e)
      setMessages([{ role: 'assistant', content: `连接失败：${e.message || '请检查网络'}` }])
      Taro.showToast({ title: '连接失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 3. 发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) return
    
    const newMessages = [...messages, { role: 'user', content: inputValue }]
    setMessages(newMessages)
    setInputValue('')
    setLoading(true)

    try {
      const res = await Taro.request({
        url: 'https://api.zhongyihskhealth.com/api/ai-tcm/inquiry',
        method: 'POST',
        data: {
          basicInfo: patientInfo,
          supplementaryInfo: contextInfo,
          dialogHistory: newMessages
        }
      })

      if (res.statusCode === 200 && res.data) {
        const aiContent = res.data.data || res.data
        setMessages([...newMessages, { role: 'assistant', content: aiContent }])
      }
    } catch (e) {
      Taro.showToast({ title: '发送失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='container'>
      {/* 聊天记录区 */}
      <ScrollView className='message-list' scrollY>
        {messages.map((msg, i) => (
          <View key={i} className={msg.role === 'user' ? 'user-msg' : 'ai-msg'}>
            <Text>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 输入区 */}
      <View className='input-box'>
        <Input 
          className='input' 
          value={inputValue} 
          onInput={e => setInputValue(e.detail.value)} 
          placeholder='请输入您的回答...' 
        />
        <Button className='btn' onClick={handleSend} loading={loading}>发送</Button>
      </View>
    </View>
  )
}
