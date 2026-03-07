import { View, Text, Input, Textarea, Button } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'

interface Package {
  id: string
  name: string
  duration: number
  price: number
  description: string
  is_active: boolean
  sort_order: number
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)

  // 表单状态
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState('0')

  // 获取套餐列表
  const fetchPackages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/packages/all',
        method: 'GET'
      })

      if (res.statusCode === 200 && res.data.data) {
        setPackages(res.data.data)
      }
    } catch (error) {
      console.error('获取套餐列表失败:', error)
      Taro.showToast({
        title: '获取套餐列表失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // 创建套餐
  const handleCreatePackage = async () => {
    if (!name || !duration || !price) {
      Taro.showToast({
        title: '请填写必填项',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/packages/create',
        method: 'POST',
        data: {
          name,
          duration: parseInt(duration),
          price: parseFloat(price),
          description,
          sortOrder: parseInt(sortOrder)
        }
      })

      if (res.statusCode === 200) {
        Taro.showToast({
          title: '创建成功',
          icon: 'success'
        })
        setShowCreateModal(false)
        resetForm()
        fetchPackages()
      }
    } catch (error) {
      console.error('创建套餐失败:', error)
      Taro.showToast({
        title: '创建失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 更新套餐
  const handleUpdatePackage = async () => {
    if (!editingPackage) return

    setLoading(true)
    try {
      const res = await Network.request({
        url: `/api/packages/${editingPackage.id}`,
        method: 'PUT',
        data: {
          name,
          duration: duration ? parseInt(duration) : undefined,
          price: price ? parseFloat(price) : undefined,
          description,
          sort_order: sortOrder ? parseInt(sortOrder) : undefined,
          is_active: editingPackage.is_active
        }
      })

      if (res.statusCode === 200) {
        Taro.showToast({
          title: '更新成功',
          icon: 'success'
        })
        setShowEditModal(false)
        setEditingPackage(null)
        resetForm()
        fetchPackages()
      }
    } catch (error) {
      console.error('更新套餐失败:', error)
      Taro.showToast({
        title: '更新失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 删除套餐
  const handleDeletePackage = async (packageId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该套餐吗？',
      success: async (modalRes) => {
        if (modalRes.confirm) {
          setLoading(true)
          try {
            const res = await Network.request({
              url: `/api/packages/${packageId}`,
              method: 'DELETE'
            })

            if (res.statusCode === 200) {
              Taro.showToast({
                title: '删除成功',
                icon: 'success'
              })
              fetchPackages()
            }
          } catch (error) {
            console.error('删除套餐失败:', error)
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

  // 切换套餐状态
  const handleToggleActive = async (pkg: Package) => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: `/api/packages/${pkg.id}`,
        method: 'PUT',
        data: {
          is_active: !pkg.is_active
        }
      })

      if (res.statusCode === 200) {
        Taro.showToast({
          title: '状态更新成功',
          icon: 'success'
        })
        fetchPackages()
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      Taro.showToast({
        title: '更新失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 打开编辑弹窗
  const handleOpenEditModal = (pkg: Package) => {
    setEditingPackage(pkg)
    setName(pkg.name)
    setDuration(pkg.duration.toString())
    setPrice(pkg.price.toString())
    setDescription(pkg.description || '')
    setSortOrder(pkg.sort_order.toString())
    setShowEditModal(true)
  }

  // 重置表单
  const resetForm = () => {
    setName('')
    setDuration('')
    setPrice('')
    setDescription('')
    setSortOrder('0')
  }

  // 打开创建弹窗
  const handleOpenCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <View className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View
              className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl"
              onClick={() => Taro.navigateBack()}
            >
              <Text className="block text-xl text-gray-600">←</Text>
            </View>
            <Text className="block text-xl font-bold text-gray-900">套餐管理</Text>
          </View>
          <View
            className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 rounded-xl shadow-md"
            onClick={handleOpenCreateModal}
          >
            <Text className="block text-sm text-white font-semibold">+ 新建套餐</Text>
          </View>
        </View>
      </View>

      {/* 套餐列表 */}
      <View className="p-4">
        {loading && packages.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <Text className="block text-gray-500">加载中...</Text>
          </View>
        ) : packages.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Text className="block text-4xl text-gray-400">📦</Text>
            </View>
            <Text className="block text-gray-500 mb-2">暂无套餐</Text>
            <Text className="block text-sm text-gray-400">点击右上角创建第一个套餐</Text>
          </View>
        ) : (
          <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {packages.map((pkg) => (
              <View
                key={pkg.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {/* 套餐头部 */}
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: '12px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Text className="block text-xl font-bold text-gray-900">
                        {pkg.name}
                      </Text>
                      <View
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        <Text className="block">{pkg.is_active ? '✓ 已启用' : '✕ 已禁用'}</Text>
                      </View>
                    </View>
                    <View className="flex items-center gap-2 mb-2">
                      <View className="bg-blue-50 px-3 py-1.5 rounded-lg">
                        <Text className="block text-sm font-medium text-blue-600">
                          {pkg.duration} 天
                        </Text>
                      </View>
                      <View className="bg-gradient-to-r from-orange-400 to-orange-500 px-3 py-1.5 rounded-lg">
                        <Text className="block text-sm font-bold text-white">
                          ¥{pkg.price}
                        </Text>
                      </View>
                    </View>
                    {pkg.description && (
                      <Text className="block text-sm text-gray-500 leading-relaxed">
                        {pkg.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* 操作按钮 */}
                <View className="pt-3 border-t border-gray-100">
                  <View style={{ display: 'flex', gap: '10px' }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        className="bg-blue-50 text-blue-600 py-2.5 rounded-xl text-sm font-medium"
                        onClick={() => handleOpenEditModal(pkg)}
                      >
                        编辑
                      </Button>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        className={`${pkg.is_active ? 'bg-gray-50 text-gray-600' : 'bg-green-50 text-green-600'} py-2.5 rounded-xl text-sm font-medium`}
                        onClick={() => handleToggleActive(pkg)}
                      >
                        {pkg.is_active ? '禁用' : '启用'}
                      </Button>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        className="bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-medium"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        删除
                      </Button>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 创建套餐弹窗 */}
      {showCreateModal && (
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        >
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '420px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}
          >
            <Text className="block text-2xl font-bold text-gray-900 mb-6">创建套餐</Text>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <View>
                <Text className="block text-sm font-semibold text-gray-700 mb-2">套餐名称 *</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                  <Input
                    style={{ width: '100%', fontSize: '15px' }}
                    placeholder="例如：7天体验套餐"
                    value={name}
                    onInput={(e) => setName(e.detail.value)}
                  />
                </View>
              </View>

              <View style={{ display: 'flex', gap: '12px' }}>
                <View style={{ flex: 1 }}>
                  <Text className="block text-sm font-semibold text-gray-700 mb-2">有效期（天）*</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                    <Input
                      type="number"
                      style={{ width: '100%', fontSize: '15px' }}
                      placeholder="例如：7"
                      value={duration}
                      onInput={(e) => setDuration(e.detail.value)}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="block text-sm font-semibold text-gray-700 mb-2">价格（元）*</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                    <Input
                      type="digit"
                      style={{ width: '100%', fontSize: '15px' }}
                      placeholder="例如：10"
                      value={price}
                      onInput={(e) => setPrice(e.detail.value)}
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text className="block text-sm font-semibold text-gray-700 mb-2">排序</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                  <Input
                    type="number"
                    style={{ width: '100%', fontSize: '15px' }}
                    placeholder="0"
                    value={sortOrder}
                    onInput={(e) => setSortOrder(e.detail.value)}
                  />
                </View>
              </View>

              <View>
                <Text className="block text-sm font-semibold text-gray-700 mb-2">套餐描述</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                  <Textarea
                    style={{ width: '100%', minHeight: '100px', fontSize: '15px', backgroundColor: 'transparent' }}
                    placeholder="套餐详细描述"
                    value={description}
                    onInput={(e) => setDescription(e.detail.value)}
                    maxlength={200}
                  />
                </View>
                <Text className="block text-xs text-gray-400 mt-1">{description.length}/200</Text>
              </View>

              <View style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <View style={{ flex: 1 }}>
                  <Button
                    className="bg-gray-100 text-gray-700 py-3 rounded-xl text-base font-semibold"
                    onClick={() => setShowCreateModal(false)}
                  >
                    取消
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl text-base font-semibold"
                    onClick={handleCreatePackage}
                    disabled={loading}
                  >
                    {loading ? '创建中...' : '创建'}
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 编辑套餐弹窗 */}
      {showEditModal && editingPackage && (
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        >
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '420px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}
          >
            <Text className="block text-2xl font-bold text-gray-900 mb-6">编辑套餐</Text>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <View>
                <Text className="block text-sm font-semibold text-gray-700 mb-2">套餐名称 *</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                  <Input
                    style={{ width: '100%', fontSize: '15px' }}
                    placeholder="套餐名称"
                    value={name}
                    onInput={(e) => setName(e.detail.value)}
                  />
                </View>
              </View>

              <View style={{ display: 'flex', gap: '12px' }}>
                <View style={{ flex: 1 }}>
                  <Text className="block text-sm font-semibold text-gray-700 mb-2">有效期（天）</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                    <Input
                      type="number"
                      style={{ width: '100%', fontSize: '15px' }}
                      placeholder="有效期"
                      value={duration}
                      onInput={(e) => setDuration(e.detail.value)}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="block text-sm font-semibold text-gray-700 mb-2">价格（元）</Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                    <Input
                      type="digit"
                      style={{ width: '100%', fontSize: '15px' }}
                      placeholder="价格"
                      value={price}
                      onInput={(e) => setPrice(e.detail.value)}
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text className="block text-sm font-semibold text-gray-700 mb-2">排序</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                  <Input
                    type="number"
                    style={{ width: '100%', fontSize: '15px' }}
                    placeholder="排序"
                    value={sortOrder}
                    onInput={(e) => setSortOrder(e.detail.value)}
                  />
                </View>
              </View>

              <View>
                <Text className="block text-sm font-semibold text-gray-700 mb-2">套餐描述</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                  <Textarea
                    style={{ width: '100%', minHeight: '100px', fontSize: '15px', backgroundColor: 'transparent' }}
                    placeholder="套餐描述"
                    value={description}
                    onInput={(e) => setDescription(e.detail.value)}
                    maxlength={200}
                  />
                </View>
                <Text className="block text-xs text-gray-400 mt-1">{description.length}/200</Text>
              </View>

              <View style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <View style={{ flex: 1 }}>
                  <Button
                    className="bg-gray-100 text-gray-700 py-3 rounded-xl text-base font-semibold"
                    onClick={() => setShowEditModal(false)}
                  >
                    取消
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl text-base font-semibold"
                    onClick={handleUpdatePackage}
                    disabled={loading}
                  >
                    {loading ? '保存中...' : '保存'}
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
