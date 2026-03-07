import { View, Text, ScrollView } from '@tarojs/components'
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import './official.css'

export default function OfficialPage() {
  useEffect(() => {
    // 设置页面标题（H5 和小程序）
    Taro.setNavigationBarTitle({
      title: '天源堂海王星药店'
    })

    // H5 端额外设置 document.title
    if (typeof document !== 'undefined') {
      document.title = '天源堂海王星药店'
    }
  }, [])

  const handleGoToApp = () => {
    // 跳转到应用首页
    Taro.reLaunch({
      url: '/pages/index/index'
    })
  }

  const handleGoToLogin = () => {
    // 跳转到登录页
    Taro.reLaunch({
      url: '/pages/login/index'
    })
  }

  return (
    <View className="official-page">
      <ScrollView scrollY className="official-scroll">
        {/* 顶部 Banner */}
        <View className="official-hero">
          <Text className="official-hero-title">天源堂海王星药店</Text>
        </View>

        {/* 平台介绍 */}
        <View className="official-section">
          <Text className="official-section-title">平台介绍</Text>
          <View className="official-section-content">
            <Text className="official-text">
              天源堂海王星药店致力于为专业中医医师和药店用户提供专业的健康管理辅助工具。平台整合了传统中医经典与现代人工智能技术，提供经方知识库查询、历史医案参考、AI健康咨询等功能，助力中医诊疗数字化转型。
            </Text>
          </View>
        </View>

        {/* 核心功能 */}
        <View className="official-section">
          <Text className="official-section-title">核心功能</Text>

          {/* 功能 1 */}
          <View className="official-feature">
            <View className="official-feature-icon">
              <Text className="official-feature-icon-text">📚</Text>
            </View>
            <View className="official-feature-content">
              <Text className="official-feature-title">经方知识库查询</Text>
              <Text className="official-feature-desc">
                收录《伤寒论》《金匮要略》等经典经方，支持快速查询和配伍分析
              </Text>
            </View>
          </View>

          {/* 功能 2 */}
          <View className="official-feature">
            <View className="official-feature-icon">
              <Text className="official-feature-icon-text">📖</Text>
            </View>
            <View className="official-feature-content">
              <Text className="official-feature-title">历史医案参考</Text>
              <Text className="official-feature-desc">
                丰富的历史医案库，为临床诊疗提供参考借鉴
              </Text>
            </View>
          </View>

          {/* 功能 3 */}
          <View className="official-feature">
            <View className="official-feature-icon">
              <Text className="official-feature-icon-text">🤖</Text>
            </View>
            <View className="official-feature-content">
              <Text className="official-feature-title">AI健康咨询</Text>
              <Text className="official-feature-desc">
                根据症状提供健康建议，仅供参考，不涉及医疗诊断
              </Text>
            </View>
          </View>

          {/* 功能 4 */}
          <View className="official-feature">
            <View className="official-feature-icon">
              <Text className="official-feature-icon-text">👤</Text>
            </View>
            <View className="official-feature-content">
              <Text className="official-feature-title">用户档案管理</Text>
              <Text className="official-feature-desc">
                完整的用户健康档案系统，支持病历、处方记录管理
              </Text>
            </View>
          </View>

          {/* 功能 5 */}
          <View className="official-feature">
            <View className="official-feature-icon">
              <Text className="official-feature-icon-text">💊</Text>
            </View>
            <View className="official-feature-content">
              <Text className="official-feature-title">处方辅助管理</Text>
              <Text className="official-feature-desc">
                含配伍禁忌检测和毒性药物风控，需医师审核确认
              </Text>
            </View>
          </View>
        </View>

        {/* 免责声明 */}
        <View className="official-section official-section-warning">
          <Text className="official-section-title warning-title">⚠️ 免责声明与风险提示</Text>
          <View className="official-section-content">
            <Text className="official-text warning-text">
              本药店开发此网站旨在为专业中医医师和药店用户提供健康管理辅助工具。所有AI分析结果和方案建议仅作为参考依据，不直接提供医疗诊断和治疗方案，需由具有执业资格的专业医师审核确认后方可使用。
            </Text>

            <Text className="official-text warning-text">
              网站已包含完整免责声明和风险提示，明确标注&quot;仅供参考，需医师审核&quot;，严格遵守国家医疗相关法律法规，保护用户隐私，不涉及非法医疗行为。
            </Text>

            <View className="official-warning-items">
              <Text className="official-warning-item">• 所有AI分析结果仅供参考</Text>
              <Text className="official-warning-item">• 需专业医师审核确认</Text>
              <Text className="official-warning-item">• 不提供医疗诊断和治疗方案</Text>
              <Text className="official-warning-item">• 严格遵守医疗相关法律法规</Text>
              <Text className="official-warning-item">• 保护用户隐私数据安全</Text>
            </View>
          </View>
        </View>

        {/* 服务说明 */}
        <View className="official-section">
          <Text className="official-section-title">服务说明</Text>
          <View className="official-section-content">
            <Text className="official-text">
              本网站为天源堂海王星药店开发的专业健康管理辅助平台，仅面向具有执业资格的专业中医医师和授权药店用户提供服务。网站内容仅供学习交流和参考使用，不替代专业医疗诊断。
            </Text>
          </View>
        </View>

        {/* 联系方式 */}
        <View className="official-section">
          <Text className="official-section-title">联系方式</Text>
          <View className="official-contact">
            <Text className="official-contact-label">药店名称：</Text>
            <Text className="official-contact-value">天源堂海王星药店</Text>
          </View>
          <View className="official-contact">
            <Text className="official-contact-label">网站类型：</Text>
            <Text className="official-contact-value">综合门户 / 网站应用服务</Text>
          </View>
          <View className="official-contact">
            <Text className="official-contact-label">服务对象：</Text>
            <Text className="official-contact-value">专业中医医师、药店用户</Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <View className="official-actions">
          <View className="official-action-button primary" onClick={handleGoToApp}>
            <Text className="official-action-button-text">进入应用</Text>
          </View>
          <View className="official-action-button" onClick={handleGoToLogin}>
            <Text className="official-action-button-text">用户登录</Text>
          </View>
        </View>

        {/* 底部版权 */}
        <View className="official-footer">
          <Text className="official-footer-text">
            © 2026 天源堂海王星药店 版权所有
          </Text>
          <Text className="official-footer-text">
            网站备案号：ICP备XXXXXXXX号
          </Text>
          <Text className="official-footer-text">
            技术支持：基于AI大模型的中医健康管理平台
          </Text>
        </View>

        <View className="official-spacer"></View>
      </ScrollView>
    </View>
  )
}
