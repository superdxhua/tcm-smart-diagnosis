import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import { Network } from '@/network'
import './index.scss'

interface MerchantQrCode {
  merchantName: string
  qrCode: string
  instructions: string[]
  notice: string
}

interface Package {
  id: string
  name: string
  duration: number
  price: number
  description: string
  is_active: boolean
}

interface RechargeOrder {
  id: string
  orderNo: string
  amount: string
  paymentMethod: string
  status: string
  auditStatus: string
  screenshotUrl?: string
  auditRemark?: string
  createdAt: string
  paidAt?: string
}

export default function RechargePage() {
  const [merchantQrCodes, setMerchantQrCodes] = useState<MerchantQrCode | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [currentOrder, setCurrentOrder] = useState<RechargeOrder | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState<string>('')
  const [orders, setOrders] = useState<RechargeOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // 获取用户信息
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    loadUserInfo()
    loadMerchantQrCodes()
    loadPackages()
    loadRechargeOrders()
  }, [])

  const loadUserInfo = async () => {
    try {
      const userInfo = Taro.getStorageSync('userInfo')
      if (userInfo) {
        setUserId(userInfo.id)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const loadPackages = async () => {
    try {
      const res = await Network.request({
        url: '/api/packages/all',
        method: 'GET',
      })
      console.log('套餐列表:', res.data.data)
      // 只显示激活的套餐
      setPackages((res.data.data || []).filter((pkg: Package) => pkg.is_active))
    } catch (error) {
      console.error('获取套餐列表失败:', error)
    }
  }

  const loadMerchantQrCodes = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/payment/merchant-qrcodes',
        method: 'GET',
      })
      console.log('商户收款码配置:', res.data.data)
      setMerchantQrCodes(res.data.data)
    } catch (error) {
      console.error('获取商户收款码配置失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const loadRechargeOrders = async () => {
    try {
      const userInfo = Taro.getStorageSync('userInfo')
      if (!userInfo) {
        Taro.showToast({ title: '请先登录', icon: 'none' })
        return
      }

      const res = await Network.request({
        url: '/api/payment/manual-recharge/orders',
        method: 'GET',
        data: { userId: userInfo.id },
      })
      console.log('充值订单列表:', res.data.data)
      setOrders(res.data.data || [])
    } catch (error) {
      console.error('获取充值订单失败:', error)
    }
  }

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg)
    console.log('选择套餐:', pkg)
  }

  const handleCreateOrder = async () => {
    if (!selectedPackage) {
      Taro.showToast({ title: '请选择套餐', icon: 'none' })
      return
    }

    const amount = selectedPackage.price

    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/payment/manual-recharge/create',
        method: 'POST',
        data: {
          userId,
          amount,
          paymentMethod: 'generic', // 通用支付方式
        },
      })
      console.log('创建充值订单成功:', res.data.data)
      setCurrentOrder(res.data.data)
      Taro.showToast({ title: '订单创建成功', icon: 'success' })
    } catch (error) {
      console.error('创建充值订单失败:', error)
      Taro.showToast({ title: '订单创建失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleChooseImage = async () => {
    if (!currentOrder) {
      Taro.showToast({ title: '请先创建订单', icon: 'none' })
      return
    }

    try {
      setUploading(true)
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      console.log('选择图片:', res.tempFilePaths[0])

      // 上传图片
      const uploadRes = await Network.uploadFile({
        url: '/api/upload',
        filePath: res.tempFilePaths[0],
        name: 'file',
      })

      console.log('上传图片成功:', uploadRes)
      const fileUrl = JSON.parse(uploadRes.data).data.fileUrl

      setScreenshotUrl(fileUrl)
      Taro.showToast({ title: '上传成功', icon: 'success' })
    } catch (error) {
      console.error('上传图片失败:', error)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    } finally {
      setUploading(false)
    }
  }

  const handleUploadScreenshot = async () => {
    if (!currentOrder) {
      Taro.showToast({ title: '请先创建订单', icon: 'none' })
      return
    }

    if (!screenshotUrl) {
      Taro.showToast({ title: '请先上传转账截图', icon: 'none' })
      return
    }

    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/payment/manual-recharge/upload-screenshot',
        method: 'POST',
        data: {
          userId,
          orderNo: currentOrder.orderNo,
          screenshotUrl,
        },
      })
      console.log('上传截图成功:', res.data.data)
      setCurrentOrder({ ...currentOrder, auditStatus: 'submitted' })
      Taro.showToast({ title: '截图已上传，等待审核', icon: 'success' })
      loadRechargeOrders()
    } catch (error) {
      console.error('上传截图失败:', error)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getAuditStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待上传截图',
      submitted: '待审核',
      approved: '审核通过',
      rejected: '审核拒绝',
    }
    return statusMap[status] || status
  }

  const getAuditStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'text-gray-500',
      submitted: 'text-blue-500',
      approved: 'text-green-500',
      rejected: 'text-red-500',
    }
    return colorMap[status] || 'text-gray-500'
  }

  return (
    <View className="recharge-page">
      {/* 顶部导航 */}
      <View className="recharge-header">
        <View className="header-content">
          <View className="header-left">
            <Text className="block text-2xl font-bold">账户充值</Text>
            <Text className="block text-sm text-gray-500 mt-2">扫码转账，快速到账</Text>
          </View>
          <View className="header-right">
            <View className="customer-service-btn" onClick={() => Taro.navigateTo({ url: '/pages/customer-service/index' })}>
              <Text className="block text-lg">📞</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY className="recharge-content">
        {/* 套餐选择 */}
        <View className="amount-section">
          <Text className="block text-lg font-semibold mb-4">选择套餐</Text>

          <View className="packages-container">
            {packages.length === 0 ? (
              <View className="empty-packages">
                <Text className="block text-gray-500 text-center">暂无可用套餐</Text>
              </View>
            ) : (
              packages.map((pkg) => (
                <View
                  key={pkg.id}
                  className={`package-item ${selectedPackage?.id === pkg.id ? 'active' : ''}`}
                  onClick={() => handleSelectPackage(pkg)}
                >
                  <View className="package-info">
                    <Text className="block package-name">{pkg.name}</Text>
                    <Text className="block package-description text-sm text-gray-600">
                      {pkg.duration}天
                    </Text>
                  </View>
                  <View className="package-price">
                    <Text className="block text-2xl font-bold text-orange-600">
                      ¥{pkg.price}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* 显示选中的套餐金额 */}
          {selectedPackage && (
            <View className="selected-amount-display">
              <Text className="block text-sm text-gray-500">待付款金额：</Text>
              <Text className="block text-2xl font-bold text-orange-600">
                ¥{selectedPackage.price}
              </Text>
            </View>
          )}

          <Button
            className="create-order-btn"
            onClick={handleCreateOrder}
            disabled={loading || !!currentOrder || !selectedPackage}
          >
            {loading ? '创建中...' : currentOrder ? '已创建订单' : '创建订单'}
          </Button>
        </View>

        {/* 收款码展示 */}
        {currentOrder && (
          <View className="qr-section">
            <Text className="block text-lg font-semibold mb-4">扫码支付</Text>

            {merchantQrCodes && (
              <View className="qr-code-container">
                <Image
                  src={merchantQrCodes.qrCode}
                  className="qr-code-image"
                  mode="widthFix"
                />
                <Text className="block text-center text-sm text-gray-500 mt-3">
                  请使用微信、支付宝或云闪付扫描上方二维码
                </Text>
              </View>
            )}

            {merchantQrCodes && (
              <View className="instructions">
                <Text className="block text-sm font-semibold mb-2">操作说明：</Text>
                {merchantQrCodes.instructions.map((instruction, index) => (
                  <Text key={index} className="block text-sm text-gray-600">
                    {index + 1}. {instruction}
                  </Text>
                ))}
                <Text className="block text-sm text-red-500 mt-2">{merchantQrCodes.notice}</Text>
              </View>
            )}

            {/* 显示订单信息 */}
            <View className="order-info">
              <Text className="block text-sm text-gray-500 mb-2">订单号：{currentOrder.orderNo}</Text>
              <Text className="block text-2xl font-bold text-orange-600">
                ¥{currentOrder.amount}
              </Text>
            </View>
          </View>
        )}

        {/* 上传截图 */}
        {currentOrder && currentOrder.auditStatus !== 'approved' && (
          <View className="screenshot-section">
            <Text className="block text-lg font-semibold mb-4">上传转账截图</Text>

            {!screenshotUrl ? (
              <Button className="upload-btn" onClick={handleChooseImage} disabled={uploading}>
                {uploading ? '上传中...' : '选择转账截图'}
              </Button>
            ) : (
              <View className="screenshot-preview">
                <Image src={screenshotUrl} className="screenshot-image" mode="widthFix" />
                <Button className="reupload-btn" onClick={handleChooseImage} disabled={uploading}>
                  重新上传
                </Button>
              </View>
            )}

            {screenshotUrl && currentOrder.auditStatus === 'pending' && (
              <Button className="submit-btn" onClick={handleUploadScreenshot} disabled={loading}>
                {loading ? '提交中...' : '提交审核'}
              </Button>
            )}

            {currentOrder.auditStatus === 'submitted' && (
              <View className="audit-status">
                <Text className="block text-center text-blue-500">已提交审核，请耐心等待管理员审核</Text>
              </View>
            )}

            {currentOrder.auditStatus === 'rejected' && (
              <View className="audit-status rejected">
                <Text className="block text-center text-red-500">审核被拒绝</Text>
                {currentOrder.auditRemark && (
                  <Text className="block text-center text-sm text-gray-500 mt-2">
                    原因：{currentOrder.auditRemark}
                  </Text>
                )}
                <Button className="retry-btn" onClick={handleChooseImage} disabled={uploading}>
                  重新上传截图
                </Button>
              </View>
            )}
          </View>
        )}

        {/* 充值记录 */}
        <View className="orders-section">
          <Text className="block text-lg font-semibold mb-4">充值记录</Text>

          {orders.length === 0 ? (
            <View className="empty-state">
              <Text className="block text-gray-500 text-center">暂无充值记录</Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} className="order-item">
                <View className="order-header">
                  <Text className="block text-sm text-gray-500">订单号：{order.orderNo}</Text>
                  <Text className={`block text-sm ${getAuditStatusColor(order.auditStatus)}`}>
                    {getAuditStatusText(order.auditStatus)}
                  </Text>
                </View>
                <View className="order-body">
                  <Text className="block text-lg font-semibold">¥{order.amount}</Text>
                  <Text className="block text-sm text-gray-500">
                    扫码支付
                  </Text>
                </View>
                <View className="order-footer">
                  <Text className="block text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString('zh-CN')}
                  </Text>
                  {order.paidAt && (
                    <Text className="block text-xs text-green-500">
                      到账时间：{new Date(order.paidAt).toLocaleString('zh-CN')}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}
