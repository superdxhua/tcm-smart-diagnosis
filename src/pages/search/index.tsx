import { View, Text, ScrollView, Button, Input } from '@tarojs/components'
import Taro, { ENV_TYPE } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'

interface SearchResult {
  title: string
  url: string
  snippet: string
  siteName: string
  content?: string
  publishTime?: string
}

interface SearchResponse {
  query: string
  searchResults: SearchResult[]
  aiSummary?: string
  sourceCount: number
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResponse | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) {
      Taro.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log('=== 开始联网搜索 ===')
      console.log('URL:', '/api/medical-ai/search')
      console.log('请求参数:', { query, count: 5, summary: true })

      const res = await Network.request({
        url: '/api/medical-ai/search',
        method: 'POST',
        data: {
          query: query.trim(),
          count: 5,
          summary: true
        }
      })

      console.log('响应状态码:', res.statusCode)
      console.log('响应数据:', res.data)

      if (res.statusCode === 200 && res.data.data) {
        setResult(res.data.data)
      } else {
        throw new Error(res.data?.msg || '搜索失败')
      }
    } catch (error) {
      console.error('搜索失败:', error)
      Taro.showToast({
        title: error.message || '搜索失败，请重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenUrl = (url: string) => {
    Taro.showModal({
      title: '打开链接',
      content: `是否要在浏览器中打开该链接？\n${url}`,
      success: (res) => {
        if (res.confirm) {
          // H5 环境下直接打开
          if (Taro.getEnv() === ENV_TYPE.WEB) {
            window.open(url, '_blank')
          } else {
            Taro.showToast({
              title: '请复制链接到浏览器打开',
              icon: 'none'
            })
          }
        }
      }
    })
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
            <Text className="text-xl font-bold text-gray-800">联网搜索</Text>
          </View>
        </View>
      </View>

      {/* 搜索输入区域 */}
      <View className="bg-white px-4 py-4 mb-2">
        <View className="flex gap-2">
          <View className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
            <Input
              className="w-full bg-transparent text-base"
              placeholder="请输入搜索关键词"
              value={query}
              onInput={(e) => setQuery(e.detail.value)}
              placeholderClass="text-gray-400"
            />
          </View>
          <Button
            className="px-6 bg-blue-500 text-white rounded-lg"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? '搜索中' : '搜索'}
          </Button>
        </View>
        <Text className="block text-xs text-gray-500 mt-2">
          使用千问大模型进行智能总结
        </Text>
      </View>

      {/* 搜索结果 */}
      <ScrollView scrollY className="flex-1 px-4 pb-4">
        {loading && (
          <View className="flex items-center justify-center py-8">
            <Text className="text-gray-500">正在搜索并智能总结中...</Text>
          </View>
        )}

        {!loading && !result && (
          <View className="flex flex-col items-center justify-center py-20">
            <Text className="text-lg text-gray-500 mb-2">输入关键词开始搜索</Text>
            <Text className="text-sm text-gray-400">
              例如：高血压中医治疗、茯苓功效、桂枝汤应用
            </Text>
          </View>
        )}

        {!loading && result && (
          <View className="space-y-4">
            {/* AI 智能总结 */}
            {result.aiSummary && (
              <View className="bg-white rounded-lg p-4 shadow-sm">
                <Text className="block text-lg font-semibold text-blue-600 mb-3">
                  千问智能总结
                </Text>
                <Text className="block text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {result.aiSummary}
                </Text>
              </View>
            )}

            {/* 搜索结果列表 */}
            <View className="space-y-3">
              <Text className="block text-sm text-gray-600 mb-2">
                搜索结果（{result.sourceCount} 条）
              </Text>
              {result.searchResults.map((item, index) => (
                <View
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-sm"
                  onClick={() => item.url && handleOpenUrl(item.url)}
                >
                  <Text className="block text-base font-semibold text-blue-600 mb-2">
                    {item.title}
                  </Text>
                  <Text className="block text-xs text-gray-500 mb-2">
                    {item.siteName}
                    {item.publishTime && ` · ${item.publishTime}`}
                  </Text>
                  <Text className="block text-sm text-gray-700 leading-relaxed mb-2">
                    {item.snippet}
                  </Text>
                  {item.content && (
                    <Text className="block text-xs text-gray-500 line-clamp-2">
                      {item.content}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
