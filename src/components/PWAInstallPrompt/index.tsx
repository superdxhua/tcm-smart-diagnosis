import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { X, Download } from 'lucide-react-taro'
import Taro from '@tarojs/taro'
import './index.css'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 检查是否已经安装
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    if (isInstalled) {
      return
    }

    // 检查用户是否已经拒绝过（7天内不再提示）
    const dismissedTime = localStorage.getItem('pwaInstallPromptDismissed')
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        return
      }
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // 阻止默认的安装提示
      e.preventDefault()
      // 保存事件以便稍后触发
      setDeferredPrompt(e)
      // 延迟显示，等待用户有积极交互
      setTimeout(() => {
        // 检查用户是否已经有积极交互（页面停留时间超过 10 秒）
        const sessionTime = Date.now()
        localStorage.setItem('pwaSessionStartTime', sessionTime.toString())
      }, 0)
    }

    const handleAppInstalled = () => {
      // 隐藏安装提示
      setShowPrompt(false)
      setDeferredPrompt(null)
      // 清除存储
      localStorage.removeItem('pwaSessionStartTime')
    }

    // 监听安装事件
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // 检查用户是否停留了足够长的时间（10秒）
    const checkSessionTime = () => {
      const sessionStartTime = localStorage.getItem('pwaSessionStartTime')
      if (sessionStartTime && deferredPrompt && !showPrompt) {
        const sessionTime = parseInt(sessionStartTime)
        const elapsedSeconds = (Date.now() - sessionTime) / 1000
        if (elapsedSeconds >= 10) {
          setShowPrompt(true)
        }
      }
    }

    const timer = setInterval(checkSessionTime, 1000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearInterval(timer)
    }
  }, [deferredPrompt, showPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    // 显示原生安装提示
    deferredPrompt.prompt()

    // 等待用户响应
    const { outcome } = await deferredPrompt.userChoice

    console.log(`User response to the install prompt: ${outcome}`)

    // 隐藏安装提示
    setShowPrompt(false)
    setDeferredPrompt(null)
    localStorage.removeItem('pwaSessionStartTime')
  }

  const handleClose = () => {
    setShowPrompt(false)
    // 保存用户的选择，7天内不再显示
    localStorage.setItem('pwaInstallPromptDismissed', Date.now().toString())
    localStorage.removeItem('pwaSessionStartTime')
    setDeferredPrompt(null)
  }

  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

  // 在小程序中不显示提示
  if (isWeapp || !showPrompt) {
    return null
  }

  return (
    <View className="pwa-install-prompt">
      <View className="pwa-prompt-content">
        <View className="pwa-prompt-header">
          <View className="pwa-prompt-icon">
            <Download size={24} color="#1890ff" />
          </View>
          <View className="pwa-prompt-info">
            <Text className="pwa-prompt-title">添加到主屏幕</Text>
            <Text className="pwa-prompt-description">
              将&quot;中医智能好帮手&quot;添加到主屏幕，体验更流畅
            </Text>
          </View>
          <View className="pwa-prompt-close" onClick={handleClose}>
            <X size={20} color="#999" />
          </View>
        </View>
        <View className="pwa-prompt-actions">
          <Button
            className="pwa-install-button pwa-install-button-primary"
            onClick={handleInstall}
          >
            立即添加
          </Button>
          <Button
            className="pwa-install-button pwa-install-button-secondary"
            onClick={handleClose}
          >
            暂不添加
          </Button>
        </View>
      </View>
    </View>
  )
}
