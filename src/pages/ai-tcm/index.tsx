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

  useEffect(() => {
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params
    
    if (params) {
      const info = {
        id: params.patientId || '',
        name: params.name || '',
        age: params.age || '',
        gender: params.gender || ''
      }
      
      setPatientInfo(info)
      setPatientId(info.id)

      const context = `主诉：${params.chiefComplaint || '无'}。既往史：${params.pastHistory || '无'}。补充信息：${params.additionalInfo || '无'}。`
      setContextInfo(context)

      startInquiry(info, context)
    }
  }, [])

  const startInquiry = async (info: any, context: string) => {
    setLoading(true)
    setMessages([{ role: 'assistant', content: 'AI 专家正在分析您的信息...' }])

    try {
      const res = await Taro.request({
        url: 'https://api.zhongyihskhealth.com/api/ai-tcm/inquiry',
        method: 'POST',
        data: {
          // 彻底移除 bot_id
          // 修正 Token 前缀为 cztei_
          messages: [
            { role: 'system', content: '你是一位精通《伤寒论》的经方中医师。' },
            { role: 'user', content: `患者信息：${JSON.stringify(info)}。${context}` }
          ]
        },
        header: {
          'content-type': 'application/json',
          // 使用您刚才确认的 Token (cztei_ 开头)
          'Authorization': 'Bearer cztei_hSTunaxZfPSE9KODEx6LVX2krJDXRwZzgORGvzHOhZC7MfeviVKT7pFWYIbH3sQ6L'
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
          // 彻底移除 bot_id
          messages: [
             ...newMessages
          ]
        },
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer cztei_hSTunaxZfPSE9KODEx6LVX2krJDXRwZzgORGvzHOhZC7MfeviVKT7pFWYIbH3sQ6L'
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
      <ScrollView className='message-list' scrollY>
        {messages.map((msg, i) => (
          <View key={i} className={msg.role === 'user' ? 'user-msg' : 'ai-msg'}>
            <Text>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

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
