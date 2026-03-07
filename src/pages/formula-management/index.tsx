import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react-taro'

interface Formula {
  formula: string
  source: string
  chapter: string
  mechanism: string
  treatmentMethod: string
  meridianCategory?: string
  keySymptoms: string[]
}

interface FormulaListResponse {
  total: number
  page: number
  pageSize: number
  totalPages: number
  formulas: Formula[]
}

export default function FormulaManagementPage() {
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [filterMeridian, setFilterMeridian] = useState('')
  const [filterTreatment, setFilterTreatment] = useState('')

  // 六经选项
  const meridianOptions = ['全部', '太阳', '阳明', '少阳', '太阴', '少阴', '厥阴']

  const loadFormulas = useCallback(async () => {
    setLoading(true)
    try {
      let url = `/api/formula-management/formulas?page=${currentPage}&pageSize=20`

      if (filterMeridian && filterMeridian !== '全部') {
        url = `/api/formula-management/formulas/meridian/${filterMeridian}`
      } else if (filterTreatment) {
        url = `/api/formula-management/formulas/treatment/${filterTreatment}`
      }

      console.log('[FormulaManagement] 请求 URL:', url)
      console.log('[FormulaManagement] 请求参数:', { method: 'GET' })

      const res = await Network.request({
        url,
        method: 'GET'
      })

      console.log('[FormulaManagement] 响应数据:', res.data)

      if (res.data.code === 200) {
        const data = res.data.data as FormulaListResponse
        setFormulas(data.formulas)
        setTotalPages(data.totalPages)
        setTotalCount(data.total)

        // 如果使用的是分页接口
        if (data.page) {
          setCurrentPage(data.page)
        }
      } else {
        Taro.showToast({ title: res.data.msg || '加载失败', icon: 'none' })
      }
    } catch (error) {
      console.error('[FormulaManagement] 加载失败:', error)
      Taro.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterMeridian, filterTreatment])

  useEffect(() => {
    loadFormulas()
  }, [loadFormulas])

  const handleSearch = () => {
    setCurrentPage(1)
    loadFormulas()
  }

  const handleViewDetail = (formulaName: string) => {
    Taro.navigateTo({
      url: `/pages/formula-detail/index?name=${encodeURIComponent(formulaName)}`
    })
  }

  const handleEdit = (formulaName: string) => {
    Taro.navigateTo({
      url: `/pages/formula-edit/index?name=${encodeURIComponent(formulaName)}`
    })
  }

  const handleDelete = async (formulaName: string) => {
    const res = await Taro.showModal({
      title: '确认删除',
      content: `确定要删除方剂"${formulaName}"吗？`
    })

    if (!res.confirm) return

    try {
      const deleteRes = await Network.request({
        url: `/api/formula-management/formulas/${encodeURIComponent(formulaName)}`,
        method: 'DELETE'
      })

      if (deleteRes.data.code === 200) {
        Taro.showToast({ title: '删除成功', icon: 'success' })
        loadFormulas()
      } else {
        Taro.showToast({ title: deleteRes.data.msg || '删除失败', icon: 'none' })
      }
    } catch (error) {
      console.error('[FormulaManagement] 删除失败:', error)
      Taro.showToast({ title: '网络错误', icon: 'none' })
    }
  }

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* 头部搜索栏 */}
      <View className="bg-white px-4 py-4 shadow-sm">
        <View className="block text-2xl font-bold text-red-600 mb-4">
          方剂管理
        </View>

        {/* 搜索框 */}
        <View className="bg-gray-100 rounded-lg px-4 py-3 mb-3">
          <Input
            className="w-full bg-transparent"
            placeholder="搜索方剂名称..."
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>

        {/* 筛选条件 */}
        <View className="flex flex-wrap gap-2">
          <View className="flex items-center bg-red-50 px-3 py-2 rounded-lg">
            <Text className="block text-sm text-gray-700 mr-2">六经:</Text>
            {meridianOptions.map((option) => (
              <Text
                key={option}
                className={`block px-2 py-1 rounded text-sm mr-1 ${
                  filterMeridian === option ? 'bg-red-600 text-white' : 'text-gray-600'
                }`}
                onClick={() => {
                  setFilterMeridian(filterMeridian === option ? '' : option)
                  setFilterTreatment('')
                  setCurrentPage(1)
                }}
              >
                {option}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* 统计信息 */}
      <View className="bg-white px-4 py-2 border-b border-gray-200">
        <View className="flex items-center justify-between">
          <Text className="block text-sm text-gray-600">
            共 {totalCount} 条方剂
          </Text>
          <Text className="block text-sm text-gray-600">
            第 {currentPage} / {totalPages} 页
          </Text>
        </View>
      </View>

      {/* 方剂列表 */}
      <ScrollView className="flex-1" scrollY>
        {loading ? (
          <View className="flex items-center justify-center py-8">
            <Text className="block text-gray-500">加载中...</Text>
          </View>
        ) : formulas.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-16">
            <Text className="block text-gray-400 text-lg mb-2">暂无数据</Text>
            <Text className="block text-gray-400">点击右下角按钮添加新方剂</Text>
          </View>
        ) : (
          formulas.map((formula) => (
            <View key={formula.formula} className="bg-white mx-4 mt-3 rounded-lg shadow-sm overflow-hidden">
              <View className="p-4">
                {/* 方剂名称和标签 */}
                <View className="flex items-center justify-between mb-2">
                  <Text className="block text-lg font-semibold text-gray-800">
                    {formula.formula}
                  </Text>
                  <View className="flex gap-2">
                    <Text className="block px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                      {formula.treatmentMethod}
                    </Text>
                    {formula.meridianCategory && (
                      <Text className="block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                        {formula.meridianCategory}
                      </Text>
                    )}
                  </View>
                </View>

                {/* 来源 */}
                <View className="flex items-center mb-2">
                  <Text className="block text-sm text-gray-500">
                    来源：{formula.source}
                  </Text>
                  {formula.chapter && (
                    <Text className="block text-sm text-gray-400 ml-2">
                      · {formula.chapter}
                    </Text>
                  )}
                </View>

                {/* 病机 */}
                <View className="mb-2">
                  <Text className="block text-sm text-gray-700">
                    病机：{formula.mechanism}
                  </Text>
                </View>

                {/* 主症 */}
                {formula.keySymptoms.length > 0 && (
                  <View className="mb-3">
                    <Text className="block text-sm text-gray-600 mb-1">主症：</Text>
                    <View className="flex flex-wrap gap-1">
                      {formula.keySymptoms.slice(0, 5).map((symptom, index) => (
                        <Text key={index} className="block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {symptom}
                        </Text>
                      ))}
                      {formula.keySymptoms.length > 5 && (
                        <Text className="block px-2 py-1 bg-gray-100 text-gray-400 text-xs rounded">
                          +{formula.keySymptoms.length - 5}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* 操作按钮 */}
                <View className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <View
                    className="flex items-center px-3 py-1.5 bg-gray-100 rounded"
                    onClick={() => handleViewDetail(formula.formula)}
                  >
                    <Eye size={16} color="#6B7280" />
                    <Text className="block text-sm text-gray-600 ml-1">查看</Text>
                  </View>
                  <View
                    className="flex items-center px-3 py-1.5 bg-blue-50 rounded"
                    onClick={() => handleEdit(formula.formula)}
                  >
                    <Pencil size={16} color="#3B82F6" />
                    <Text className="block text-sm text-blue-600 ml-1">编辑</Text>
                  </View>
                  <View
                    className="flex items-center px-3 py-1.5 bg-red-50 rounded"
                    onClick={() => handleDelete(formula.formula)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <Text className="block text-sm text-red-600 ml-1">删除</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        {/* 加载更多 */}
        {currentPage < totalPages && !loading && (
          <View className="flex justify-center py-4">
            <Text
              className="block text-red-600"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              加载更多
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 底部操作按钮 */}
      <View className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <View
          className="flex items-center justify-center py-3 bg-red-600 rounded-lg"
          onClick={() => Taro.navigateTo({ url: '/pages/formula-create/index' })}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text className="block text-white font-semibold ml-2">添加新方剂</Text>
        </View>
      </View>
    </View>
  )
}
