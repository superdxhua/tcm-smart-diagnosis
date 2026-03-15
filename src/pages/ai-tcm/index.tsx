import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function AiTcmPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [patientInfo, setPatientInfo] = useState<any>({})
  const [contextInfo, setContextInfo] = useState('')
  
  // === 问诊轮次计数器 ===
  const [turnCount, setTurnCount] = useState(0)
  // === 设定最大问诊轮次为 6 ===
  const MAX_TURNS = 6
  // === 问诊是否结束的标志 ===
  const [isFinished, setIsFinished] = useState(false)

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

      const context = `主诉：${params.chiefComplaint || '无'}。既往史：${params.pastHistory || '无'}。`
      setContextInfo(context)

      // 初始化系统提示（人设）
      const systemPrompt = { 
        role: 'system', 
        content: '你是一位精通《伤寒论》《金匮要略》的经方中医师。规则：1. 每次只问一个关键问题。2. 不要废话。3. 等待用户回答后再问下一个。'
      }
      
      // 第一轮提问
      startInquiry(info, context, [systemPrompt])
    }
  }, [])

  const startInquiry = async (info: any, context: string, history: any[]) => {
    setLoading(true)
    setMessages(prev => [...prev, { role: 'assistant', content: 'AI 专家正在思考...' }])

    try {
      const userMessage = {
        role: 'user',
        content: `患者基础信息：${JSON.stringify(info)}\n补充信息：${context}\n请开始问诊。`
      }
      const messagesToSend = [...history, userMessage]

      const res = await Taro.request({
        url: 'https://api.zhongyihskhealth.com/api/ai-tcm/inquiry',
        method: 'POST',
        data: {
          basicInfo: info,
          supplementaryInfo: context,
          dialogHistory: messagesToSend
        },
        header: { 'content-type': 'application/json' }
      })

      if (res.statusCode === 200 && res.data) {
        const aiContent = typeof res.data === 'string' ? res.data : (res.data as any).data
        
        setMessages(prev => {
          const newMsgs = [...prev]
          newMsgs[newMsgs.length - 1] = { role: 'assistant', content: aiContent }
          return newMsgs
        })
        
        setTurnCount(1)
      } else {
        throw new Error('AI 服务异常')
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `连接失败：${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return
    
    const userMsg = { role: 'user', content: inputValue }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setLoading(true)
    
    const newTurnCount = turnCount + 1
    setTurnCount(newTurnCount)

    // === 检查是否达到第 6 轮 ===
    if (newTurnCount >= MAX_TURNS) {
      setMessages(prev => [...prev, { role: 'assistant', content: '问诊已结束，正在为您生成健康方案...' }])
      
      // 这里可以调用生成方案接口
      // await generatePlan()
      
      setIsFinished(true)
      setLoading(false)
      return
    }

    try {
      const systemPrompt = { 
        role: 'system', 
        content: '你是一位精通《伤寒论》《金匮要略》的经方中医师。规则：1. 每次只问一个关键问题。2. 不要废话。3. 等待用户回答后再问下一个。'
      }
      
      const historyToSend = [systemPrompt, ...messages.slice(1), userMsg]

      const res = await Taro.request({
        url: 'https://api.zhongyihskhealth.com/api/ai-tcm/inquiry',
        method: 'POST',
        data: {
          basicInfo: patientInfo,
          supplementaryInfo: contextInfo,
          dialogHistory: historyToSend
        },
        header: { 'content-type': 'application/json' }
      })

      if (res.statusCode === 200 && res.data) {
        const aiContent = typeof res.data === 'string' ? res.data : (res.data as any).data
        setMessages(prev => [...prev, { role: 'assistant', content: aiContent }])
      }
    } catch (e) {
      Taro.showToast({ title: '发送失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='container'>
      <View className='header'>
        <Text>问诊进度：{turnCount} / {MAX_TURNS}</Text>
      </View>
      
      <ScrollView className='message-list' scrollY>
        {messages.map((msg, i) => (
          <View key={i} className={msg.role === 'user' ? 'user-msg' : 'ai-msg'}>
            <Text>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View className='input-box'>
        {isFinished ? (
          <View className='finished-tip'>
            <Text>问诊已结束，请查看上方方案</Text>
            {/* 这里可以放“重新问诊”按钮 */}
          </View>
        ) : (
          <>
            <Input 
              className='input' 
              value={inputValue} 
              onInput={e => setInputValue(e.detail.value)} 
              placeholder='请输入您的回答...' 
            />
            <Button className='btn' onClick={handleSend} loading={loading}>发送</Button>
          </>
        )}
      </View>
    </View>
  )
}