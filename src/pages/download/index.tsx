import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import './index.scss'

export default function DownloadPage() {
  const [apkStatus, setApkStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    checkApkStatus()
  }, [])

  const checkApkStatus = async () => {
    try {
      const res = await Network.request({
        url: '/api/download/status'
      })
      setApkStatus(res.data.data)
    } catch (error) {
      console.error('检查 APK 状态失败:', error)
      Taro.showToast({
        title: '检查失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!apkStatus?.available) {
      Taro.showModal({
        title: '提示',
        content: 'APK 文件尚未生成，请联系管理员获取安装包',
        showCancel: false,
        confirmText: '我知道了'
      })
      return
    }

    setDownloading(true)

    try {
      const downloadUrl = `${window.location.origin}/api/download/apk`

      // 创建下载链接
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = 'app-debug.apk'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      Taro.showToast({
        title: '下载已开始',
        icon: 'success'
      })

      // 3 秒后恢复按钮状态
      setTimeout(() => {
        setDownloading(false)
      }, 3000)
    } catch (error) {
      console.error('下载失败:', error)
      Taro.showToast({
        title: '下载失败，请重试',
        icon: 'none'
      })
      setDownloading(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    checkApkStatus()
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '未知'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const formatDate = (date: string) => {
    if (!date) return '未知'
    const d = new Date(date)
    return d.toLocaleDateString('zh-CN')
  }

  const openGuide = () => {
    Taro.showModal({
      title: '安装教程',
      content: '安装教程文档位于项目根目录，请查看 README.md 中的文档链接',
      showCancel: false
    })
  }

  const handleContact = () => {
    Taro.showModal({
      title: '联系我们',
      content: '邮箱：support@example.com\n电话：400-xxx-xxxx',
      showCancel: false
    })
  }

  if (loading) {
    return (
      <View className="download-container">
        <View className="loading-container">
          <Text className="block loading-text">检查中...</Text>
        </View>
      </View>
    )
  }

  const env = Taro.getEnv() as string
  const isH5 = env === 'h5' || env === 'web'

  return (
    <View className="download-container">
      {/* PWA 安装引导（仅 H5 环境） */}
      {isH5 && (
        <View className="pwa-install-guide">
          <View className="guide-header">
            <Text className="block guide-icon">🚀</Text>
            <View className="guide-text">
              <Text className="block guide-title">推荐使用 H5 版本</Text>
              <Text className="block guide-desc">
                无需下载，添加到主屏幕即可像 APP 一样使用
              </Text>
            </View>
          </View>
          <Button
            className="pwa-install-btn"
            onClick={() => {
              Taro.showModal({
                title: '如何安装到主屏幕',
                content: 'iOS用户：点击分享 → 添加到主屏幕\n\nAndroid用户：点击菜单 → 添加到主屏幕',
                showCancel: false,
                confirmText: '我知道了'
              })
            }}
          >
            如何安装？
          </Button>
        </View>
      )}

      {/* 头部 */}
      <View className="header">
        <View className="logo-area">
          <Text className="block app-name">中医智能诊疗</Text>
          <Text className="block app-subtitle">AI 驱动的中医问诊系统</Text>
        </View>
      </View>

      {/* APP 信息卡片 */}
      <View className="info-card">
        <View className="info-row">
          <Text className="block info-label">版本号</Text>
          <Text className="info-value">1.0.0</Text>
        </View>
        <View className="info-row">
          <Text className="block info-label">文件大小</Text>
          <Text className="info-value">
            {apkStatus?.available ? formatFileSize(apkStatus.size) : '暂无'}
          </Text>
        </View>
        <View className="info-row">
          <Text className="block info-label">更新日期</Text>
          <Text className="info-value">
            {apkStatus?.available ? formatDate(apkStatus.uploadTime) : '暂无'}
          </Text>
        </View>
        <View className="info-row">
          <Text className="block info-label">支持系统</Text>
          <Text className="info-value">华为鸿蒙 2.0+、Android 5.0+</Text>
        </View>
      </View>

      {/* 下载状态卡片 */}
      <View className="status-card">
        <View className="status-header">
          <Text className="block status-label">下载状态</Text>
          <View className={`status-badge ${apkStatus?.available ? 'available' : 'unavailable'}`}>
            <Text className="block status-text">
              {apkStatus?.available ? '✓ 可以下载' : '✗ 暂无文件'}
            </Text>
          </View>
        </View>
        <Text className="block status-message">
          {apkStatus?.message || '检查中...'}
        </Text>
      </View>

      {/* 下载按钮 */}
      <View className="download-action">
        <Button
          className={`download-button ${downloading ? 'downloading' : ''}`}
          onClick={handleDownload}
          disabled={downloading || !apkStatus?.available}
        >
          {downloading ? '下载中...' : '下载 APK 文件'}
        </Button>
        <Button
          className="refresh-button"
          onClick={handleRefresh}
          size="mini"
        >
          刷新状态
        </Button>
      </View>

      {/* 不可下载时的提示 */}
      {!apkStatus?.available && (
        <View className="unavailable-hint">
          <Text className="block hint-title">暂时无法下载？</Text>
          <Text className="block hint-text">请联系管理员获取安装包</Text>
          <View className="contact-methods">
            <Text className="block contact-item">📧 support@example.com</Text>
            <Text className="block contact-item">📞 400-xxx-xxxx</Text>
          </View>
        </View>
      )}

      {/* 安装教程 */}
      <View className="guide-section">
        <Text className="block section-title">安装指南</Text>
        <View className="guide-steps">
          <View className="guide-step">
            <View className="step-number">1</View>
            <Text className="block step-text">下载 APK 文件</Text>
          </View>
          <View className="guide-step">
            <View className="step-number">2</View>
            <Text className="block step-text">允许安装未知应用</Text>
          </View>
          <View className="guide-step">
            <View className="step-number">3</View>
            <Text className="block step-text">点击 APK 文件安装</Text>
          </View>
          <View className="guide-step">
            <View className="step-number">4</View>
            <Text className="block step-text">开始使用</Text>
          </View>
        </View>
        <Button
          className="guide-button"
          size="mini"
          onClick={() => openGuide()}
        >
          查看详细安装教程
        </Button>
      </View>

      {/* 功能介绍 */}
      <View className="features-section">
        <Text className="block section-title">主要功能</Text>
        <View className="feature-list">
          <View className="feature-item">
            <Text className="block feature-icon">🤖</Text>
            <Text className="block feature-text">AI 智能问诊</Text>
          </View>
          <View className="feature-item">
            <Text className="block feature-icon">💊</Text>
            <Text className="block feature-text">处方生成</Text>
          </View>
          <View className="feature-item">
            <Text className="block feature-icon">🔒</Text>
            <Text className="block feature-text">处方风控</Text>
          </View>
          <View className="feature-item">
            <Text className="block feature-icon">💰</Text>
            <Text className="block feature-text">在线支付</Text>
          </View>
        </View>
      </View>

      {/* 常见问题 */}
      <View className="faq-section">
        <Text className="block section-title">常见问题</Text>
        <View className="faq-list">
          <View className="faq-item">
            <Text className="block faq-question">Q: 华为鸿蒙手机可以用吗？</Text>
            <Text className="block faq-answer">A: 可以！鸿蒙系统基于 Android AOSP，完全兼容 APK 文件。</Text>
          </View>
          <View className="faq-item">
            <Text className="block faq-question">Q: 提示&quot;解析包错误&quot;怎么办？</Text>
            <Text className="block faq-answer">A: 请重新下载 APK 文件，确保下载完整。</Text>
          </View>
          <View className="faq-item">
            <Text className="block faq-question">Q: 安装时提示&quot;禁止安装&quot;？</Text>
            <Text className="block faq-answer">A: 需要在设置中允许安装未知来源应用。</Text>
          </View>
        </View>
      </View>

      {/* 联系我们 */}
      <View className="contact-section">
        <Button
          className="contact-button"
          onClick={handleContact}
          size="mini"
        >
          联系我们
        </Button>
      </View>

      {/* 页脚 */}
      <View className="footer">
        <Text className="block footer-text">中医智能诊疗 v1.0.0</Text>
        <Text className="block footer-text">© 2026 All Rights Reserved</Text>
      </View>
    </View>
  )
}
