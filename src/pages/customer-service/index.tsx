import { View, Text, ScrollView, Button, Textarea, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.css'

export default function CustomerServicePage() {
  const [feedback, setFeedback] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 客服联系方式
  const contactMethods = [
    {
      icon: '💬',
      title: '客服 QQ',
      value: '1234567890',
      description: '在线时间：9:00 - 21:00',
      action: 'copy'
    },
    {
      icon: '📞',
      title: '客服电话',
      value: '400-888-8888',
      description: '工作时间：周一至周五 9:00 - 18:00',
      action: 'call'
    },
    {
      icon: '📧',
      title: '客服邮箱',
      value: 'support@example.com',
      description: '24 小时响应',
      action: 'copy'
    },
    {
      icon: '💬',
      title: '微信群',
      value: '扫描二维码加入',
      description: '获取更多帮助',
      action: 'wechat'
    }
  ]

  // 常见问题
  const faqItems = [
    {
      question: '个人账户有什么限制？',
      answer: '个人账户最多只能添加 4 位用户，无法删除用户，无法为孕妇、儿童、高危用户开方，无法查看有毒有害药材信息。'
    },
    {
      question: '如何升级为机构账户？',
      answer: '在注册页面选择"机构账户"，上传相关资质证明，等待管理员审核通过即可获得全权限。'
    },
    {
      question: '账号被封禁了怎么办？',
      answer: '如果您的账号被封禁，可以通过客服 QQ 或电话联系管理员进行申诉。'
    },
    {
      question: '充值后多久到账？',
      answer: '充值提交后，管理员会在 1-2 个工作日内审核，审核通过后自动到账。'
    },
    {
      question: '处方准确吗？',
      answer: '本系统基于中医经典医案和 AI 技术，仅供参考和学习，严禁直接用于临床诊疗。如有疑问请咨询专业医师。'
    }
  ]

  // 复制文本
  const handleCopy = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  }

  // 拨打电话
  const handleCall = (phone: string) => {
    Taro.makePhoneCall({
      phoneNumber: phone.replace(/-/g, '')
    })
  }

  // 提交反馈
  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      Taro.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }

    if (!contact.trim()) {
      Taro.showToast({
        title: '请输入联系方式',
        icon: 'none'
      })
      return
    }

    setSubmitting(true)

    try {
      // TODO: 实现反馈提交逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))

      Taro.showToast({
        title: '反馈已提交，感谢您的建议！',
        icon: 'success'
      })

      setFeedback('')
      setContact('')
    } catch (error) {
      Taro.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="customer-service-page">
      {/* 顶部导航栏 */}
      <View className="navbar">
        <View
          className="navbar-back"
          onClick={() => Taro.navigateBack()}
        >
          <Text className="navbar-back-icon">←</Text>
        </View>
        <Text className="navbar-title">客服中心</Text>
        <View className="navbar-placeholder"></View>
      </View>

      <ScrollView scrollY className="content">
        {/* 客服联系方式 */}
        <View className="section">
          <View className="section-header">
            <Text className="section-icon">📞</Text>
            <Text className="section-title">联系我们</Text>
          </View>
          <Text className="section-subtitle">如有任何问题，请随时联系我们</Text>

          <View className="contact-list">
            {contactMethods.map((item, index) => (
              <View key={index} className="contact-item">
                <View className="contact-info">
                  <Text className="contact-icon">{item.icon}</Text>
                  <View className="contact-details">
                    <Text className="contact-title">{item.title}</Text>
                    <Text className="contact-value">{item.value}</Text>
                    <Text className="contact-desc">{item.description}</Text>
                  </View>
                </View>
                <View className="contact-actions">
                  {item.action === 'copy' && (
                    <Button
                      className="contact-btn contact-btn-copy"
                      onClick={() => handleCopy(item.value)}
                    >
                      复制
                    </Button>
                  )}
                  {item.action === 'call' && (
                    <Button
                      className="contact-btn contact-btn-call"
                      onClick={() => handleCall(item.value)}
                    >
                      拨打
                    </Button>
                  )}
                  {item.action === 'wechat' && (
                    <Button
                      className="contact-btn contact-btn-wechat"
                      onClick={() => Taro.showToast({ title: '请使用微信扫描二维码', icon: 'none' })}
                    >
                      扫码
                    </Button>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 常见问题 */}
        <View className="section">
          <View className="section-header">
            <Text className="section-icon">❓</Text>
            <Text className="section-title">常见问题</Text>
          </View>
          <Text className="section-subtitle">快速找到您需要的答案</Text>

          <View className="faq-list">
            {faqItems.map((item, index) => (
              <View key={index} className="faq-item">
                <Text className="faq-question">Q: {item.question}</Text>
                <Text className="faq-answer">A: {item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 在线反馈 */}
        <View className="section">
          <View className="section-header">
            <Text className="section-icon">💬</Text>
            <Text className="section-title">在线反馈</Text>
          </View>
          <Text className="section-subtitle">我们重视您的每一条建议</Text>

          <View className="feedback-form">
            <View className="form-group">
              <Text className="form-label">反馈内容 *</Text>
              <View className="form-textarea">
                <Textarea
                  className="form-textarea-input"
                  placeholder="请详细描述您的问题或建议..."
                  value={feedback}
                  onInput={(e) => setFeedback(e.detail.value)}
                  maxlength={500}
                />
                <Text className="form-textarea-count">{feedback.length}/500</Text>
              </View>
            </View>

            <View className="form-group">
              <Text className="form-label">联系方式 *</Text>
              <View className="form-input">
                <Input
                  className="form-input-field"
                  placeholder="请输入您的手机号或 QQ 号"
                  value={contact}
                  onInput={(e) => setContact(e.detail.value)}
                />
              </View>
            </View>

            <Button
              className="feedback-submit"
              onClick={handleSubmitFeedback}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '提交反馈'}
            </Button>
          </View>
        </View>

        {/* 底部提示 */}
        <View className="footer">
          <Text className="footer-text">
            感谢您使用我们的服务，如有任何问题请随时联系我们
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
