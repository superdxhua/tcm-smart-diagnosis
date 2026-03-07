import { View, Text, Input, Picker, Button, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import './index.css'

interface User {
  id: string
  username: string
  role: string
  isActive: boolean
  createdAt: string
  expiresAt?: string
  password?: string
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState('')

  // 新增账户表单状态
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newRole, setNewRole] = useState('user')

  // 延长使用期限表单状态
  const [showExtendExpiryForm, setShowExtendExpiryForm] = useState(false)
  const [extendUserId, setExtendUserId] = useState('')
  const [extendDays, setExtendDays] = useState('30')

  // 修改账户信息表单状态
  const [showUpdateAccountForm, setShowUpdateAccountForm] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [updateUsername, setUpdateUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [updateNewPassword, setUpdateNewPassword] = useState('')
  const [confirmUpdatePassword, setConfirmUpdatePassword] = useState('')

  // 密码显示/隐藏状态
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  // 账户搜索状态
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  useEffect(() => {
    const authToken = Taro.getStorageSync('token')
    const user = Taro.getStorageSync('user')

    if (!authToken || !user || user.role !== 'admin') {
      Taro.showToast({
        title: '需要管理员权限',
        icon: 'none',
      })
      Taro.redirectTo({
        url: '/pages/login/index',
      })
      return
    }

    setToken(authToken)
    setCurrentUser(user)
    setUpdateUsername(user.username || '')
    loadUsers(authToken)
  }, [])

  // 搜索账户
  const handleSearchUsers = (keyword: string) => {
    setSearchKeyword(keyword)
    if (!keyword.trim()) {
      setFilteredUsers(users.filter(u => u.role === 'user' || u.role === 'individual'))
    } else {
      const filtered = users.filter(u =>
        (u.role === 'user' || u.role === 'individual') &&
        u.username.toLowerCase().includes(keyword.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }

  // 打开搜索对话框
  const openSearchDialog = () => {
    setSearchKeyword('')
    setFilteredUsers(users.filter(u => u.role === 'user' || u.role === 'individual'))
    setShowSearchDialog(true)
  }

  // 选择账户
  const selectUser = (user: User) => {
    setSelectedUserId(user.id)
    setShowSearchDialog(false)
    setSearchKeyword('')
  }

  const loadUsers = async (authToken: string) => {
    setLoading(true)
    setError('')

    try {
      console.log('开始加载账户列表，token:', authToken ? '存在' : '不存在')

      const response = await Network.request({
        url: '/api/auth/users',
        method: 'GET',
        header: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      console.log('账户列表响应:', response)
      console.log('响应数据:', response.data)
      console.log('响应状态码:', response.statusCode)

      // 添加空值检查
      if (!response.data) {
        setError('响应数据为空，请稍后重试')
        return
      }

      if (response.data.code === 200) {
        setUsers(response.data.data || [])
      } else if (response.data.code === 401) {
        // token 无效，清除本地存储并跳转登录页
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('user')
        setError('登录已过期，请重新登录')
        setTimeout(() => {
          Taro.redirectTo({
            url: '/pages/login/index',
          })
        }, 1500)
      } else {
        setError(response.data.msg || '获取账户列表失败')
      }
    } catch (err: any) {
      console.error('获取账户列表失败:', err)
      console.error('错误详情:', err.errMsg || err.message)

      // 如果是 401 错误，清除本地存储并跳转登录页
      if (err.errMsg && err.errMsg.includes('401')) {
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('user')
        setError('登录已过期，请重新登录')
        setTimeout(() => {
          Taro.redirectTo({
            url: '/pages/login/index',
          })
        }, 1500)
      } else {
        setError(err.message || '网络请求失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAuthorize = async () => {
    if (!selectedUserId || !expiresAt) {
      setError('请选择账户和设置有效期')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await Network.request({
        url: '/api/auth/authorize',
        method: 'POST',
        data: {
          userId: selectedUserId,
          expiresAt: new Date(expiresAt).toISOString(),
        },
        header: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('授权响应:', response.data)

      // 添加空值检查
      if (!response.data) {
        setError('响应数据为空，请稍后重试')
        return
      }

      if (response.data.code === 200) {
        Taro.showToast({
          title: '授权成功',
          icon: 'success',
        })
        setSelectedUserId('')
        setExpiresAt('')
      } else if (response.data.code === 401) {
        handleTokenExpired()
      } else {
        setError(response.data.msg || '授权失败')
      }
    } catch (err: any) {
      console.error('授权失败:', err)
      if (err.errMsg && err.errMsg.includes('401')) {
        handleTokenExpired()
      } else {
        setError(err.message || '网络请求失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      setError('请输入账户名和密码')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await Network.request({
        url: '/api/admin/users',
        method: 'POST',
        data: {
          username: newUsername,
          password: newPassword,
          role: newRole,
        },
        header: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('新增账户响应:', response.data)

      // 添加空值检查
      if (!response.data) {
        setError('响应数据为空，请稍后重试')
        return
      }

      if (response.data.code === 200) {
        Taro.showToast({
          title: '新增账户成功',
          icon: 'success',
        })
        setNewUsername('')
        setNewPassword('')
        setConfirmPassword('')
        setNewRole('user')
        setShowAddUserForm(false)
        loadUsers(token)
      } else if (response.data.code === 401) {
        handleTokenExpired()
      } else {
        setError(response.data.msg || '新增账户失败')
      }
    } catch (err: any) {
      console.error('新增账户失败:', err)
      if (err.errMsg && err.errMsg.includes('401')) {
        handleTokenExpired()
      } else {
        setError(err.message || '网络请求失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除账户 "${username}" 吗？此操作不可恢复。`,
      success: async (res) => {
        if (res.confirm) {
          setLoading(true)
          setError('')

          try {
            const response = await Network.request({
              url: `/api/admin/users/${userId}`,
              method: 'DELETE',
              header: {
                Authorization: `Bearer ${token}`,
              },
            })

            console.log('删除账户响应:', response.data)

            // 添加空值检查
            if (!response.data) {
              setError('响应数据为空，请稍后重试')
              return
            }

            if (response.data.code === 200) {
              Taro.showToast({
                title: '删除账户成功',
                icon: 'success',
              })
              loadUsers(token)
            } else if (response.data.code === 401) {
              handleTokenExpired()
            } else {
              setError(response.data.msg || '删除账户失败')
            }
          } catch (err: any) {
            console.error('删除账户失败:', err)
            if (err.errMsg && err.errMsg.includes('401')) {
              handleTokenExpired()
            } else {
              setError(err.message || '网络请求失败')
            }
          } finally {
            setLoading(false)
          }
        }
      },
    })
  }

  const handleExtendExpiry = async (userId: string, _username: string) => {
    setExtendUserId(userId)
    setExtendDays('30')
    setShowExtendExpiryForm(true)
  }

  const handleExtendExpirySubmit = async () => {
    const days = parseInt(extendDays)
    if (Number.isNaN(days) || days <= 0) {
      Taro.showToast({
        title: '请输入有效的天数',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    setError('')
    setShowExtendExpiryForm(false)

    try {
      // 计算新的过期时间
      const newExpiryDate = new Date()
      newExpiryDate.setDate(newExpiryDate.getDate() + days)

      const response = await Network.request({
        url: `/api/auth/authorize`,
        method: 'POST',
        data: {
          userId: extendUserId,
          expiresAt: newExpiryDate.toISOString(),
        },
        header: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('延长使用期限响应:', response.data)

      // 添加空值检查
      if (!response.data) {
        setError('响应数据为空，请稍后重试')
        return
      }

      if (response.data.code === 200) {
        Taro.showToast({
          title: `已延长 ${days} 天`,
          icon: 'success',
        })
        loadUsers(token)
      } else if (response.data.code === 401) {
        handleTokenExpired()
      } else {
        setError(response.data.msg || '延长使用期限失败')
      }
    } catch (err: any) {
      console.error('延长使用期限失败:', err)
      if (err.errMsg && err.errMsg.includes('401')) {
        handleTokenExpired()
      } else {
        setError(err.message || '网络请求失败')
      }
    } finally {
      setLoading(false)
      setExtendUserId('')
    }
  }

  const handleExtendExpiryCancel = () => {
    setShowExtendExpiryForm(false)
    setExtendUserId('')
    setExtendDays('30')
  }

  const handleTokenExpired = () => {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('user')
    setError('登录已过期，请重新登录')
    setTimeout(() => {
      Taro.redirectTo({
        url: '/pages/login/index',
      })
    }, 1500)
  }

  const handleUpdateAccount = async () => {
    console.log('开始更新账户信息')
    console.log('currentUser:', currentUser)
    console.log('updateUsername:', updateUsername)
    console.log('updateNewPassword:', updateNewPassword ? '有' : '无')
    console.log('currentPassword:', currentPassword ? '有' : '无')
    console.log('confirmUpdatePassword:', confirmUpdatePassword ? '有' : '无')

    if (!currentUser) {
      console.error('错误：未获取到当前账户信息')
      setError('未获取到当前账户信息')
      Taro.showToast({
        title: '未获取到当前账户信息',
        icon: 'none',
      })
      return
    }

    if (!updateUsername) {
      console.error('错误：账户名不能为空')
      setError('账户名不能为空')
      Taro.showToast({
        title: '账户名不能为空',
        icon: 'none',
      })
      return
    }

    if (updateNewPassword) {
      if (!currentPassword) {
        console.error('错误：修改密码需要提供当前密码')
        setError('修改密码需要提供当前密码')
        Taro.showToast({
          title: '请输入当前密码',
          icon: 'none',
        })
        return
      }

      if (updateNewPassword.length < 6) {
        console.error('错误：新密码长度至少6位')
        setError('新密码长度至少6位')
        Taro.showToast({
          title: '新密码长度至少6位',
          icon: 'none',
        })
        return
      }

      if (updateNewPassword !== confirmUpdatePassword) {
        console.error('错误：两次输入的新密码不一致')
        setError('两次输入的新密码不一致')
        Taro.showToast({
          title: '两次输入的新密码不一致',
          icon: 'none',
        })
        return
      }
    }

    console.log('验证通过，开始发送请求')
    setLoading(true)
    setError('')

    try {
      console.log('发送请求到 /api/auth/update-user')
      const response = await Network.request({
        url: '/api/auth/update-user',
        method: 'POST',
        data: {
          userId: currentUser.id,
          username: updateUsername,
          currentPassword,
          newPassword: updateNewPassword,
        },
        header: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('收到响应:', response)
      console.log('响应数据:', response.data)
      console.log('响应状态码:', response.statusCode)

      // 添加空值检查
      if (!response.data) {
        console.error('错误：响应数据为空')
        setError('响应数据为空，请稍后重试')
        Taro.showToast({
          title: '响应数据为空，请稍后重试',
          icon: 'none',
        })
        return
      }

      if (response.data.code === 200) {
        console.log('更新成功')
        Taro.showToast({
          title: '账户信息更新成功',
          icon: 'success',
        })

        // 更新本地存储的账户信息
        const updatedUser = {
          ...currentUser,
          username: response.data.data.username,
        }
        Taro.setStorageSync('user', updatedUser)
        setCurrentUser(updatedUser)

        // 重置表单
        setCurrentPassword('')
        setUpdateNewPassword('')
        setConfirmUpdatePassword('')
        setShowUpdateAccountForm(false)
      } else if (response.data.code === 401) {
        console.error('错误：token 已过期')
        handleTokenExpired()
      } else {
        console.error('错误：', response.data.msg)
        setError(response.data.msg || '更新失败')
        Taro.showToast({
          title: response.data.msg || '更新失败',
          icon: 'none',
        })
      }
    } catch (err: any) {
      console.error('更新账户信息失败:', err)
      console.error('错误详情:', err.errMsg || err.message)
      if (err.errMsg && err.errMsg.includes('401')) {
        handleTokenExpired()
      } else {
        setError(err.message || '网络请求失败')
        Taro.showToast({
          title: err.message || '网络请求失败',
          icon: 'none',
        })
      }
    } finally {
      console.log('请求完成，重置 loading 状态')
      setLoading(false)
    }
  }

  const handleUpdateAccountCancel = () => {
    setShowUpdateAccountForm(false)
    setCurrentPassword('')
    setUpdateNewPassword('')
    setConfirmUpdatePassword('')
    if (currentUser) {
      setUpdateUsername(currentUser.username || '')
    }
  }

  const handleLogout = () => {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('user')
    Taro.redirectTo({
      url: '/pages/login/index',
    })
  }

  const handleBack = () => {
    Taro.reLaunch({
      url: '/pages/index/index',
    })
  }

  return (
    <View className="min-h-screen bg-gray-50 p-4">
      <View className="flex items-center justify-between mb-6">
        <View>
          <Text className="block text-2xl font-bold text-gray-900">
            管理员设置
          </Text>
          <Text className="block text-sm text-gray-600">
            管理账户授权和有效期
          </Text>
        </View>
        <View className="flex gap-2">
          <View className="bg-purple-500 px-3 py-2 rounded-lg">
            <Text className="block text-xs text-white" onClick={() => Taro.navigateTo({ url: '/pages/customer-service/index' })}>
              📞 客服
            </Text>
          </View>
          <View className="bg-gray-500 px-3 py-2 rounded-lg">
            <Text className="block text-xs text-white" onClick={handleBack}>
              返回
            </Text>
          </View>
          <View className="bg-red-500 px-3 py-2 rounded-lg">
            <Text className="block text-xs text-white" onClick={handleLogout}>
              退出
            </Text>
          </View>
        </View>
      </View>

      {/* 账户信息区域 */}
      <View className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-4 mb-4">
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-lg font-bold text-white">
              账户信息
            </Text>
            <Text className="block text-xs text-blue-100">
              当前账户: {currentUser?.username || '未知'}
            </Text>
          </View>
          <View
            className="bg-white px-4 py-2 rounded-lg"
            onClick={() => {
              if (currentUser) {
                setShowUpdateAccountForm(true)
                setUpdateUsername(currentUser.username || '')
              }
            }}
          >
            <Text className="block text-xs text-blue-600 font-medium">
              修改账户
            </Text>
          </View>
        </View>
      </View>

      {error && (
        <View className="bg-red-50 rounded-lg p-3 mb-4">
          <Text className="block text-sm text-red-600 text-center">
            {error}
          </Text>
        </View>
      )}

      {/* 套餐管理入口 */}
      <View className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 mb-4">
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-lg font-bold text-white">
              服务套餐管理
            </Text>
            <Text className="block text-xs text-purple-100">
              设置服务套餐的期限与金额
            </Text>
          </View>
          <View
            className="bg-white px-4 py-2 rounded-lg"
            onClick={() => {
              Taro.navigateTo({
                url: '/pages/admin-packages/index'
              })
            }}
          >
            <Text className="block text-xs text-indigo-600 font-medium">
              进入管理
            </Text>
          </View>
        </View>
      </View>

      {/* 新增账户区域 */}
      <View className="bg-white rounded-xl p-4 mb-4">
        <View className="flex items-center justify-between mb-4">
          <Text className="block text-lg font-bold text-gray-900">
            新增账户
          </Text>
          <View
            className={`bg-blue-500 px-4 py-2 rounded-lg ${showAddUserForm ? 'bg-gray-400' : ''}`}
            onClick={() => setShowAddUserForm(!showAddUserForm)}
          >
            <Text className="block text-xs text-white">
              {showAddUserForm ? '收起' : '展开'}
            </Text>
          </View>
        </View>

        {showAddUserForm && (
          <>
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                账户名
              </Text>
              <View className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 transition-colors">
                <Input
                  style={{ width: '100%' }}
                  placeholder="请输入账户名"
                  value={newUsername}
                  onInput={(e) => setNewUsername(e.detail.value)}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </Text>
              <View className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 transition-colors">
                <Input
                  style={{ width: '100%' }}
                  password
                  placeholder="请输入密码"
                  value={newPassword}
                  onInput={(e) => setNewPassword(e.detail.value)}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </Text>
              <View className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 transition-colors">
                <Input
                  style={{ width: '100%' }}
                  password
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onInput={(e) => setConfirmPassword(e.detail.value)}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                角色
              </Text>
              <View
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between"
                onClick={() => {
                  Taro.showActionSheet({
                    itemList: ['普通账户', '管理员'],
                    success: (res) => {
                      setNewRole(res.tapIndex === 0 ? 'user' : 'admin')
                    },
                  })
                }}
              >
                <Text className="block text-sm text-gray-900">
                  {newRole === 'user' ? '普通账户' : '管理员'}
                </Text>
                <Text className="block text-sm text-gray-400">▼</Text>
              </View>
            </View>

            <Button
              className="w-full bg-blue-500 text-white py-3 rounded-lg"
              onClick={handleAddUser}
            >
              创建账户
            </Button>
          </>
        )}
      </View>

      {/* 授权区域 */}
      <View className="bg-white rounded-xl p-4 mb-4">
        <Text className="block text-lg font-bold text-gray-900 mb-4">
          账户授权
        </Text>

        <View className="mb-4">
          <Text className="block text-sm font-medium text-gray-700 mb-1">
            选择账户
          </Text>
          <View
            className="bg-white border border-gray-300 rounded-lg px-4 py-3"
            onClick={openSearchDialog}
          >
            <Text className="block text-sm text-gray-700">
              {selectedUserId
                ? (users.find(u => u.id === selectedUserId)?.username || '选择账户')
                : '请选择账户'}
            </Text>
            <Text className="block text-xs text-gray-400 mt-1">点击搜索并选择账户</Text>
          </View>
        </View>

        <View className="mb-4">
          <Text className="block text-sm font-medium text-gray-700 mb-1">
            有效期
          </Text>
          <Picker
            mode="date"
            value={expiresAt}
            end={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            onChange={(e) => {
              console.log('日期选择:', e.detail.value)
              setExpiresAt(e.detail.value)
            }}
          >
            <View className="bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between">
              <Text className="block text-sm text-gray-700">
                {expiresAt || '请选择有效期'}
              </Text>
              <Text className="block text-xs text-gray-400">📅</Text>
            </View>
          </Picker>
        </View>

        <View className="bg-blue-600 rounded-xl py-3">
          <Text
            className="block text-base font-medium text-white text-center"
            onClick={handleAuthorize}
          >
            {loading ? '授权中...' : '授权账户'}
          </Text>
        </View>
      </View>

      {/* 账户列表 */}
      <View className="bg-white rounded-xl p-4">
        <Text className="block text-lg font-bold text-gray-900 mb-4">
          账户列表
        </Text>

        {loading && users.length === 0 ? (
          <Text className="block text-sm text-gray-500 text-center py-4">
            加载中...
          </Text>
        ) : users.length === 0 ? (
          <Text className="block text-sm text-gray-500 text-center py-4">
            暂无账户
          </Text>
        ) : (
          <View className="space-y-2">
            {users.map((user) => (
              <View
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <View className="flex-1">
                  <Text className="block text-base font-medium text-gray-900">
                    {user.username}
                  </Text>
                  <Text className="block text-xs text-gray-500">
                    {user.role === 'admin' ? '管理员' : '账户'}
                  </Text>
                  {user.role !== 'admin' && user.password && (
                    <Text className="block text-xs text-gray-400 mt-1">
                      密码: {user.password}
                    </Text>
                  )}
                  {user.role !== 'admin' && user.expiresAt && (
                    <Text className="block text-xs text-gray-400 mt-1">
                      有效期至: {new Date(user.expiresAt).toLocaleDateString('zh-CN')}
                    </Text>
                  )}
                </View>
                <View className="flex items-center gap-2">
                  <View
                    className={`px-2 py-1 rounded ${
                      user.isActive ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <Text
                      className={`block text-xs ${
                        user.isActive ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {user.isActive ? '正常' : '禁用'}
                    </Text>
                  </View>
                  {user.role !== 'admin' && (
                    <>
                      <View
                        className="bg-blue-500 px-3 py-1 rounded"
                        onClick={() => handleExtendExpiry(user.id, user.username)}
                      >
                        <Text className="block text-xs text-white">
                          延长
                        </Text>
                      </View>
                      <View
                        className="bg-red-500 px-3 py-1 rounded"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                      >
                        <Text className="block text-xs text-white">
                          删除
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 延长使用期限弹窗 */}
      {showExtendExpiryForm && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-xl p-6 mx-4 max-w-sm w-full">
            <Text className="block text-lg font-bold text-gray-900 mb-4">
              延长使用期限
            </Text>
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-1">
                延长天数
              </Text>
              <Input
                className="w-full bg-gray-50 rounded-lg px-4 py-3"
                type="digit"
                value={extendDays}
                onInput={(e) => setExtendDays(e.detail.value)}
              />
            </View>
            <View className="flex gap-3">
              <View className="flex-1">
                <Button
                  className="w-full bg-gray-300 text-gray-700"
                  onClick={handleExtendExpiryCancel}
                >
                  取消
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  className="w-full bg-blue-500"
                  onClick={handleExtendExpirySubmit}
                >
                  确认
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 修改账户信息弹窗 */}
      {showUpdateAccountForm && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-xl p-6 mx-4 max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <View className="flex items-center justify-between mb-6">
              <Text className="block text-lg font-bold text-gray-900">
                修改账户信息
              </Text>
              <View
                className="text-gray-400 text-2xl cursor-pointer"
                onClick={handleUpdateAccountCancel}
              >
                ✕
              </View>
            </View>

            {/* 修改账户名 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                账户名
              </Text>
              <View className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 transition-colors">
                <Input
                  className="w-full bg-transparent"
                  placeholder="请输入账户名"
                  value={updateUsername}
                  onInput={(e) => setUpdateUsername(e.detail.value)}
                />
              </View>
            </View>

            {/* 当前密码 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                当前密码 <Text className="text-red-500">*</Text>
              </Text>
              <Text className="block text-xs text-gray-500 mb-1">
                修改密码时必填
              </Text>
              <View className="bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center focus-within:border-blue-500 transition-colors">
                <Input
                  className="flex-1 bg-transparent"
                  password={!showCurrentPassword}
                  placeholder="请输入当前密码"
                  value={currentPassword}
                  onInput={(e) => setCurrentPassword(e.detail.value)}
                />
                <Text
                  className="text-gray-400 text-sm ml-2 cursor-pointer"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </View>
            </View>

            {/* 新密码 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                新密码
              </Text>
              <Text className="block text-xs text-gray-500 mb-1">
                留空则不修改密码，至少6位
              </Text>
              <View className="bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center focus-within:border-blue-500 transition-colors">
                <Input
                  className="flex-1 bg-transparent"
                  password={!showNewPassword}
                  placeholder="请输入新密码"
                  value={updateNewPassword}
                  onInput={(e) => setUpdateNewPassword(e.detail.value)}
                />
                <Text
                  className="text-gray-400 text-sm ml-2 cursor-pointer"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </View>
              {updateNewPassword && updateNewPassword.length < 6 && (
                <Text className="block text-xs text-red-500 mt-1">
                  密码长度至少6位
                </Text>
              )}
            </View>

            {/* 确认新密码 */}
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码
              </Text>
              <Text className="block text-xs text-gray-500 mb-1">
                请再次输入新密码以确认
              </Text>
              <View className="bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center focus-within:border-blue-500 transition-colors">
                <Input
                  className="flex-1 bg-transparent"
                  password={!showConfirmNewPassword}
                  placeholder="请再次输入新密码"
                  value={confirmUpdatePassword}
                  onInput={(e) => setConfirmUpdatePassword(e.detail.value)}
                />
                <Text
                  className="text-gray-400 text-sm ml-2 cursor-pointer"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                >
                  {showConfirmNewPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </View>
              {confirmUpdatePassword && updateNewPassword && confirmUpdatePassword !== updateNewPassword && (
                <Text className="block text-xs text-red-500 mt-1">
                  两次输入的密码不一致
                </Text>
              )}
            </View>

            <View className="flex gap-3 mt-6">
              <View className="flex-1">
                <View
                  className="w-full bg-gray-300 text-gray-700 rounded-lg py-3 text-center cursor-pointer"
                  onClick={handleUpdateAccountCancel}
                >
                  <Text className="block text-sm font-medium">取消</Text>
                </View>
              </View>
              <View className="flex-1">
                <View
                  className={`w-full bg-blue-500 text-white rounded-lg py-3 text-center cursor-pointer ${loading ? 'opacity-50' : ''}`}
                  onClick={!loading ? handleUpdateAccount : undefined}
                >
                  <Text className="block text-sm font-medium">
                    {loading ? '更新中...' : '确认修改'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 账户搜索对话框 */}
      {showSearchDialog && (
        <View
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
          onClick={() => setShowSearchDialog(false)}
        >
          <View
            className="bg-white rounded-t-2xl w-full max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 对话框头部 */}
            <View className="flex items-center justify-between p-4 border-b border-gray-200">
              <Text className="block text-lg font-bold text-gray-900">
                选择账户
              </Text>
              <View
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                onClick={() => setShowSearchDialog(false)}
              >
                <Text className="block text-xl text-gray-500">✕</Text>
              </View>
            </View>

            {/* 搜索输入框 */}
            <View className="p-4">
              <View className="bg-gray-100 rounded-xl px-4 py-3 flex items-center gap-2">
                <Text className="text-xl">🔍</Text>
                <Input
                  style={{ flex: 1, fontSize: '14px' }}
                  placeholder="搜索账户名..."
                  value={searchKeyword}
                  onInput={(e) => handleSearchUsers(e.detail.value)}
                  placeholderClass="text-gray-400"
                  focus
                />
                {searchKeyword && (
                  <View
                    className="bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => handleSearchUsers('')}
                  >
                    <Text className="block text-xs text-gray-600">✕</Text>
                  </View>
                )}
              </View>
            </View>

            {/* 账户列表 */}
            <View className="flex-1 px-4 pb-4" style={{ maxHeight: '400px' }}>
              <ScrollView scrollY>
                {filteredUsers.length === 0 ? (
                  <View className="flex flex-col items-center justify-center py-8">
                    <Text className="block text-4xl mb-2">🔍</Text>
                    <Text className="block text-sm text-gray-500">
                      {searchKeyword ? '未找到匹配的账户' : '暂无可授权账户'}
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-2">
                    {filteredUsers.map((user) => (
                      <View
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        onClick={() => selectUser(user)}
                      >
                        <View className="flex-1">
                          <Text className="block text-base font-medium text-gray-900">
                            {user.username}
                          </Text>
                          <Text className="block text-xs text-gray-500">
                            {user.role === 'individual' ? '个体账户' : '普通账户'}
                          </Text>
                          {user.expiresAt && (
                            <Text className="block text-xs text-gray-400 mt-1">
                              有效期: {new Date(user.expiresAt).toLocaleDateString('zh-CN')}
                            </Text>
                          )}
                        </View>
                        <View className="bg-blue-500 px-3 py-1 rounded">
                          <Text className="block text-xs text-white">
                            {user.id === selectedUserId ? '✓ 已选择' : '选择'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default AdminPage
