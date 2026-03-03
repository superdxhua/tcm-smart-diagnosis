import { useEffect, useState, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import { Network } from '@/network'
import './index.scss'

interface Order {
  id: string
  orderNo: string
  amount: number
  paymentMethod: string
  auditStatus: string
  screenshotUrl: string
  createdAt: string
  user: {
    id: string
    username: string
    role: string
  }
}

export default function AdminRechargePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [lastCount, setLastCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)

  // 播放提示音（使用 Web Audio API 生成提示音，无需外部文件）
  const playNotificationSound = () => {
    try {
      // 检查是否在浏览器环境中
      if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
        console.log('当前环境不支持 Web Audio API')
        return
      }

      // 使用 Web Audio API 生成"叮"的一声提示音
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      // 连接音频节点
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // 设置音频参数
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime) // A5 音符
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.3) // 降调到 A4
      oscillator.type = 'sine' // 正弦波

      // 设置音量包络
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      // 播放音频
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)

      console.log('提示音播放成功')
    } catch (error) {
      console.error('播放提示音异常:', error)
    }
  }

  // 获取待审核订单数量
  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await Network.request({
        url: '/api/admin/pending-recharge-count'
      })
      const currentCount = res.data.data.count

      console.log('待审核订单数量:', currentCount)

      // 如果有新订单（数量增加），播放提示音
      if (soundEnabled && currentCount > lastCount && currentCount > 0) {
        console.log('检测到新订单，播放提示音')
        playNotificationSound()

        // 页面标题闪烁提醒
        if (document && document.title) {
          const originalTitle = document.title
          let flashCount = 0
          const flashInterval = setInterval(() => {
            document.title = flashCount % 2 === 0
              ? `[${currentCount}条新订单] 管理员审核`
              : originalTitle
            flashCount++
            if (flashCount >= 6) {
              clearInterval(flashInterval)
              document.title = originalTitle
            }
          }, 1000)
        }
      }

      setPendingCount(currentCount)
      setLastCount(currentCount)
    } catch (error) {
      console.error('获取待审核订单数量失败:', error)
    }
  }, [soundEnabled, lastCount])

  // 获取待审核订单列表
  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/admin/pending-recharge-orders'
      })
      setOrders(res.data.data || [])
    } catch (error) {
      console.error('获取待审核订单失败:', error)
      Taro.showToast({ title: '获取订单列表失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 审核通过
  const handleApprove = async (orderNo: string) => {
    Taro.showModal({
      title: '确认审核通过',
      content: '确认通过该订单的审核？',
      success: async (res) => {
        if (res.confirm) {
          setProcessingOrderId(orderNo)
          try {
            await Network.request({
              url: '/api/admin/approve-recharge-order',
              method: 'POST',
              data: { orderNo }
            })

            Taro.showToast({ title: '审核通过', icon: 'success' })
            await fetchOrders() // 刷新订单列表
            await fetchPendingCount() // 刷新数量
          } catch (error) {
            console.error('审核通过失败:', error)
            Taro.showToast({ title: '审核失败', icon: 'none' })
          } finally {
            setProcessingOrderId(null)
          }
        }
      }
    })
  }

  // 审核拒绝
  const handleReject = async (orderNo: string) => {
    const remark = await new Promise<string>((resolve) => {
      Taro.showModal({
        title: '确认审核拒绝',
        content: '拒绝原因（可选）',
        // @ts-ignore - Taro.showModal 在某些平台支持 editable
        editable: true,
        placeholderText: '请输入拒绝原因',
        success: (res: any) => {
          if (res.confirm) {
            // @ts-ignore - Taro.showModal 返回的 res 包含 content 字段
            resolve(res.content || '审核拒绝')
          } else {
            resolve('')
          }
        },
        fail: () => resolve('')
      })
    })

    if (!remark) return

    setProcessingOrderId(orderNo)
    try {
      await Network.request({
        url: '/api/admin/reject-recharge-order',
        method: 'POST',
        data: {
          orderNo,
          remark
        }
      })

      Taro.showToast({ title: '审核拒绝', icon: 'success' })
      await fetchOrders() // 刷新订单列表
      await fetchPendingCount() // 刷新数量
    } catch (error) {
      console.error('审核拒绝失败:', error)
      Taro.showToast({ title: '审核失败', icon: 'none' })
    } finally {
      setProcessingOrderId(null)
    }
  }

  // 查看截图
  const viewScreenshot = (url: string) => {
    Taro.previewImage({
      urls: [url],
      current: url
    })
  }

  useEffect(() => {
    // 初始加载
    fetchOrders()
    fetchPendingCount()

    // 定时轮询：每30秒检查一次待审核订单数量
    const interval = setInterval(() => {
      fetchPendingCount()
    }, 30000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCount, soundEnabled])

  return (
    <View className="admin-recharge-page">
      {/* 顶部状态栏 */}
      <View className="status-bar">
        <View className="status-item">
          <Text className="status-label">待审核订单</Text>
          <Text className="status-count">{pendingCount}</Text>
        </View>
        <View
          className={`sound-toggle ${soundEnabled ? 'enabled' : 'disabled'}`}
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          <Text className="sound-icon">{soundEnabled ? '🔊' : '🔇'}</Text>
          <Text className="sound-text">提示音</Text>
        </View>
      </View>

      {/* 说明文字 */}
      <View className="tips">
        <Text className="tips-text">
          💡 系统每30秒自动检查新订单，有新订单时会播放提示音
        </Text>
      </View>

      {/* 订单列表 */}
      <ScrollView scrollY className="order-list">
        {loading ? (
          <View className="loading-container">
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="empty-container">
            <Text className="empty-text">暂无待审核订单</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} className="order-card">
              {/* 订单头部 */}
              <View className="order-header">
                <View className="order-info">
                  <Text className="order-no">订单号：{order.orderNo}</Text>
                  <Text className="order-time">
                    {new Date(order.createdAt).toLocaleString('zh-CN')}
                  </Text>
                </View>
                <Text className="order-amount">¥{order.amount.toFixed(2)}</Text>
              </View>

              {/* 用户信息 */}
              <View className="order-user">
                <Text className="user-label">用户：</Text>
                <Text className="user-name">{order.user.username}</Text>
                <Text className="user-role">({order.user.role})</Text>
              </View>

              {/* 支付方式 */}
              <View className="order-payment">
                <Text className="payment-label">支付方式：</Text>
                <Text className="payment-method">{order.paymentMethod === 'generic' ? '通用收款码' : order.paymentMethod}</Text>
              </View>

              {/* 转账截图 */}
              <View className="order-screenshot">
                <Text className="screenshot-label">转账截图：</Text>
                <Image
                  className="screenshot-image"
                  src={order.screenshotUrl}
                  mode="aspectFill"
                  onClick={() => viewScreenshot(order.screenshotUrl)}
                />
              </View>

              {/* 操作按钮 */}
              <View className="order-actions">
                <Button
                  className="reject-btn"
                  onClick={() => handleReject(order.orderNo)}
                  disabled={processingOrderId === order.id}
                >
                  拒绝
                </Button>
                <Button
                  className="approve-btn"
                  type="primary"
                  onClick={() => handleApprove(order.orderNo)}
                  disabled={processingOrderId === order.id}
                >
                  通过
                </Button>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
