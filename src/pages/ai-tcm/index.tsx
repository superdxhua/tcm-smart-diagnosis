import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function AiTcmPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [patientId, setPatientId] = useState('')

  // 1. 页面加载时，获取参数
  useEffect(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    if (params?.patientId) {
      setPatientId(params.patientId)
      // 开始第一次问询
      startInquiry(params.patientId)
    }
  }, [])

  // 2. 发起问询
  const startInquiry = async (id: string) => {
    setLoading(true)
    try {
      const res = await Taro.request({
        url: 'https://api.zhongyihskhealth.com/api/ai-tcm/inquiry',
        method: 'POST',
        data: {
          basicInfo: { patientId: id }, // 简化版，实际应传更多信息
          supplementaryInfo: '',
          dialogHistory: []
        }
      })
      
      if (res.data.code === 200) {
        setMessages([{ role: 'assistant', content: res.data.data }])
      }
    } catch (e) {
      Taro.showToast({ title: '网络错误', icon: 'none' })
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
          basicInfo: { patientId },
          supplementaryInfo: '',
          dialogHistory: newMessages
        }
      })

      if (res.data.code === 200) {
        setMessages([...newMessages, { role: 'assistant', content: res.data.data }])
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
