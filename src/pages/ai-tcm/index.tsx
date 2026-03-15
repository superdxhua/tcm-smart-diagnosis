  const startInquiry = async (info: any, context: string) => {
    setLoading(true)
    setMessages([{ role: 'assistant', content: 'AI 专家正在分析您的信息...' }])

    try {
      const res = await Taro.request({
        url: 'https://api.zhongyihskhealth.com/api/ai-tcm/inquiry',
        method: 'POST',
        data: {
          basicInfo: info,
          supplementaryInfo: context,
          dialogHistory: []
        },
        header: {
          'content-type': 'application/json',
          // 如果有token，在这里加上
          // 'Authorization': 'Bearer ...'
        }
      })
      
      console.log('API 原始返回:', res)

      // === 关键修复：适配阿里云/通义千问的返回格式 ===
      if (res.statusCode === 200 && res.data) {
        // 阿里云直接返回文本字符串，不需要复杂的解析
        const aiContent = res.data as string; 
        
        setMessages([{ role: 'assistant', content: aiContent }])
      } else {
        throw new Error('AI 服务返回异常')
      }
    } catch (e: any) {
      console.error(e)
      setMessages([{ role: 'assistant', content: `连接失败：${e.message || '请检查网络'}` }])
      Taro.showToast({ title: '连接失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }