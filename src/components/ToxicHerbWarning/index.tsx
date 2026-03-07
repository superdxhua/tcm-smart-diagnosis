import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { ToxicHerb, IncompatibilityResult, PregnancyContraindicationResult } from '@/utils/toxic-herb-control'

interface ToxicHerbWarningProps {
  /** 有毒有害中药材列表 */
  toxicHerbs: Array<ToxicHerb & { currentDosage: string; dosageExceeded: boolean }>
  /** 风险等级 */
  riskLevel: 'low' | 'medium' | 'high' | 'severe'
  /** 警告消息 */
  warningMessage: string
  /** 配伍禁忌检测结果 */
  incompatibilities?: IncompatibilityResult
  /** 妊娠禁忌检测结果 */
  pregnancyContraindications?: PregnancyContraindicationResult
  /** 用户信息 */
  patientInfo?: {
    age?: number
    gender?: string
    isPregnant?: boolean
    healthCondition?: string
  }
  /** 是否显示免责声明链接 */
  showDisclaimer?: boolean
  /** 用户确认后的回调 */
  onConfirm?: () => void
}

export default function ToxicHerbWarning({
  toxicHerbs,
  riskLevel,
  warningMessage,
  incompatibilities,
  pregnancyContraindications,
  patientInfo,
  showDisclaimer = true,
  onConfirm
}: ToxicHerbWarningProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasConfirmed, setHasConfirmed] = useState(false)

  // 如果没有有毒有害中药材且没有配伍禁忌且没有妊娠禁忌，不显示
  if (toxicHerbs.length === 0 && (!incompatibilities || !incompatibilities.hasIncompatibility) && (!pregnancyContraindications || !pregnancyContraindications.hasContraindication)) {
    return null
  }

  // 检查是否有妊娠禁忌
  const hasPregnancyContraindication = pregnancyContraindications?.hasContraindication || false
  const hasIncompatibility = incompatibilities?.hasIncompatibility || false
  const hasToxicHerbs = toxicHerbs.length > 0

  // 根据风险等级获取颜色配置
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'severe':
        return {
          bg: 'bg-red-100',
          border: 'border-red-600',
          icon: '🔴',
          titleColor: 'text-red-800',
          bodyColor: 'text-red-700',
          buttonBg: 'bg-red-600',
          buttonHover: 'hover:bg-red-700'
        }
      case 'high':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-600',
          icon: '🟠',
          titleColor: 'text-orange-800',
          bodyColor: 'text-orange-700',
          buttonBg: 'bg-orange-600',
          buttonHover: 'hover:bg-orange-700'
        }
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-600',
          icon: '🟡',
          titleColor: 'text-yellow-800',
          bodyColor: 'text-yellow-700',
          buttonBg: 'bg-yellow-600',
          buttonHover: 'hover:bg-yellow-700'
        }
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-600',
          icon: '⚪',
          titleColor: 'text-gray-800',
          bodyColor: 'text-gray-700',
          buttonBg: 'bg-gray-600',
          buttonHover: 'hover:bg-gray-700'
        }
    }
  }

  const colors = getRiskColor()

  // 获取风险等级文本
  const getRiskLevelText = () => {
    switch (riskLevel) {
      case 'severe':
        return '严重风险'
      case 'high':
        return '高风险'
      case 'medium':
        return '中等风险'
      default:
        return '低风险'
    }
  }

  // 处理展开/收起
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // 处理确认
  const handleConfirm = () => {
    setHasConfirmed(true)
    if (onConfirm) {
      onConfirm()
    }
  }

  // 跳转到免责声明页面
  const handleGoToDisclaimer = () => {
    Taro.navigateTo({
      url: '/pages/disclaimer/index'
    })
  }

  return (
    <View
      className={`${colors.bg} rounded-xl p-6 mb-6 border-4 ${colors.border} shadow-lg`}
    >
      {/* 警告头部 */}
      <View className="flex items-start gap-3 mb-4">
        <Text className="text-4xl">{colors.icon}</Text>
        <View className="flex-1">
          <View className="flex items-center gap-2 mb-2">
            <Text className={`text-2xl font-bold ${colors.titleColor}`}>
              ⚠️ 处方风控警示
            </Text>
            <View className={`${colors.buttonBg} px-3 py-1 rounded`}>
              <Text className="block text-xs text-white font-medium">
                {getRiskLevelText()}
              </Text>
            </View>
            {hasIncompatibility && (
              <View className="bg-purple-600 px-3 py-1 rounded">
                <Text className="block text-xs text-white font-medium">
                  配伍禁忌
                </Text>
              </View>
            )}
            {hasPregnancyContraindication && patientInfo?.isPregnant && (
              <View className="bg-pink-600 px-3 py-1 rounded">
                <Text className="block text-xs text-white font-medium">
                  妊娠禁忌
                </Text>
              </View>
            )}
          </View>
          <Text className={`text-base ${colors.bodyColor} leading-relaxed`}>
            {warningMessage}
          </Text>
          {incompatibilities?.hasIncompatibility && (
            <Text className={`text-base ${colors.bodyColor} leading-relaxed mt-2 block`}>
              {incompatibilities.warningMessage}
            </Text>
          )}
          {pregnancyContraindications?.hasContraindication && (
            <Text className={`text-base ${colors.bodyColor} leading-relaxed mt-2 block`}>
              {pregnancyContraindications.warningMessage}
            </Text>
          )}
        </View>
      </View>

      {/* 展开/收起按钮 */}
      <View
        className="bg-white bg-opacity-50 rounded-lg p-3 mb-4"
        onClick={handleToggleExpand}
      >
        <View className="flex items-center justify-between">
          <Text className={`text-sm font-medium ${colors.titleColor}`}>
            {isExpanded ? '收起详细信息' : '展开详细信息'}
          </Text>
          <Text className="text-xl">{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </View>

      {/* 详细信息 */}
      {isExpanded && (
        <View className="space-y-4">
          {/* 有毒有害中药材列表 */}
          <View className="bg-white rounded-lg p-4">
            <Text className={`block text-sm font-bold ${colors.titleColor} mb-3`}>
              检测到的有毒有害中药材 ({toxicHerbs.length})
            </Text>
            {toxicHerbs.map((herb, index) => (
              <View key={index} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b border-gray-200 last:border-0">
                <View className="flex items-center justify-between mb-2">
                  <View className="flex items-center gap-2">
                    <Text className={`text-lg font-bold ${colors.titleColor}`}>
                      {herb.name}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded ${
                        herb.toxicityLevel === '大毒'
                          ? 'bg-red-600'
                          : herb.toxicityLevel === '有毒'
                          ? 'bg-orange-600'
                          : 'bg-yellow-600'
                      }`}
                    >
                      <Text className="block text-xs text-white font-medium">
                        {herb.toxicityLevel}
                      </Text>
                    </View>
                    {herb.dosageExceeded && (
                      <View className="bg-red-600 px-2 py-1 rounded">
                        <Text className="block text-xs text-white font-medium">
                          剂量超标
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-gray-600">
                    当前剂量：{herb.currentDosage}g / 最大剂量：{herb.maxDosage}g
                  </Text>
                </View>

                {/* 禁忌人群 */}
                {herb.contraindications.length > 0 && (
                  <View className="mb-2">
                    <Text className={`text-xs font-medium ${colors.titleColor} mb-1 block`}>
                      禁忌人群：
                    </Text>
                    <View className="flex flex-wrap gap-1">
                      {herb.contraindications.map((contraindication, idx) => (
                        <View
                          key={idx}
                          className="bg-red-100 px-2 py-1 rounded"
                        >
                          <Text className="block text-xs text-red-700">
                            {contraindication}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 注意事项 */}
                {herb.precautions.length > 0 && (
                  <View className="mb-2">
                    <Text className={`text-xs font-medium ${colors.titleColor} mb-1 block`}>
                      注意事项：
                    </Text>
                    {herb.precautions.map((precaution, idx) => (
                      <Text key={idx} className={`text-xs ${colors.bodyColor} block`}>
                        • {precaution}
                      </Text>
                    ))}
                  </View>
                )}

                {/* 备注 */}
                {herb.notes && (
                  <View>
                    <Text className={`text-xs font-medium ${colors.titleColor} mb-1 block`}>
                      备注：
                    </Text>
                    <Text className={`text-xs ${colors.bodyColor} block`}>
                      {herb.notes}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* 配伍禁忌列表 */}
          {hasIncompatibility && incompatibilities && (
            <View className="bg-purple-50 rounded-lg p-4 border-2 border-purple-400">
              <Text className="block text-sm font-bold text-purple-800 mb-3">
                ⚠️ 检测到的配伍禁忌 ({incompatibilities.conflicts.length})
              </Text>
              <View className="space-y-3">
                {incompatibilities.conflicts.map((conflict, index) => (
                  <View key={index} className="bg-white rounded-lg p-3 border border-purple-300">
                    <View className="flex items-center gap-2 mb-2">
                      <Text className="text-xl">🚫</Text>
                      <Text className={`text-base font-bold ${colors.titleColor}`}>
                        {conflict.type}
                      </Text>
                    </View>
                    <View className="flex items-center gap-2 mb-2">
                      <View className="bg-red-100 px-3 py-1 rounded">
                        <Text className="block text-sm font-medium text-red-800">
                          {conflict.herbA}
                        </Text>
                      </View>
                      <Text className="text-lg text-gray-500">+</Text>
                      <View className="bg-red-100 px-3 py-1 rounded">
                        <Text className="block text-sm font-medium text-red-800">
                          {conflict.herbB}
                        </Text>
                      </View>
                    </View>
                    <Text className={`text-sm ${colors.bodyColor}`}>
                      {conflict.risk}
                    </Text>
                  </View>
                ))}
              </View>
              {/* 配伍禁忌特别提示 */}
              <View className="mt-3 bg-red-100 rounded-lg p-3 border-2 border-red-400">
                <View className="flex items-start gap-2">
                  <Text className="text-xl">⚠️</Text>
                  <Text className="text-sm font-bold text-red-800 block">
                    配伍禁忌是中药用药安全的重要规则，违反配伍禁忌可能导致严重的毒副作用或降低药效。强烈建议在专业中医师指导下调整处方！
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 妊娠禁忌列表 */}
          {hasPregnancyContraindication && pregnancyContraindications && patientInfo?.isPregnant && (
            <View className="bg-pink-50 rounded-lg p-4 border-2 border-pink-400">
              <Text className="block text-sm font-bold text-pink-800 mb-3">
                🚨 检测到的妊娠禁忌
              </Text>

              {/* 妊娠禁用药列表 */}
              {pregnancyContraindications.forbiddenHerbs.length > 0 && (
                <View className="mb-3">
                  <Text className="block text-xs font-bold text-red-800 mb-2">
                    妊娠禁用药（{pregnancyContraindications.forbiddenHerbs.length} 种）- 绝对禁止使用
                  </Text>
                  <View className="space-y-2">
                    {pregnancyContraindications.forbiddenHerbs.map((herb, index) => (
                      <View key={index} className="bg-red-100 rounded-lg p-3 border border-red-300">
                        <View className="flex items-center gap-2 mb-2">
                          <Text className="text-xl">🚫</Text>
                          <Text className="text-base font-bold text-red-800">
                            {herb.name}
                          </Text>
                          <View className="bg-red-600 px-2 py-1 rounded">
                            <Text className="block text-xs text-white font-medium">
                              禁用
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm text-red-700 mb-2 block">
                          {herb.risk}
                        </Text>
                        {herb.pregnancyRisk && herb.pregnancyRisk.length > 0 && (
                          <View className="mb-2">
                            <Text className="text-xs font-medium text-red-800 mb-1 block">
                              孕期风险：
                            </Text>
                            <View className="flex flex-wrap gap-1">
                              {herb.pregnancyRisk.map((risk, idx) => (
                                <View key={idx} className="bg-white px-2 py-1 rounded">
                                  <Text className="block text-xs text-red-700">
                                    {risk}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                        {herb.precautions.length > 0 && (
                          <View>
                            <Text className="text-xs font-medium text-red-800 mb-1 block">
                              注意事项：
                            </Text>
                            {herb.precautions.map((precaution, idx) => (
                              <Text key={idx} className="text-xs text-red-700 block">
                                • {precaution}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 妊娠慎用药列表 */}
              {pregnancyContraindications.cautiousHerbs.length > 0 && (
                <View>
                  <Text className="block text-xs font-bold text-orange-800 mb-2">
                    妊娠慎用药（{pregnancyContraindications.cautiousHerbs.length} 种）- 需谨慎使用
                  </Text>
                  <View className="space-y-2">
                    {pregnancyContraindications.cautiousHerbs.map((herb, index) => (
                      <View key={index} className="bg-orange-100 rounded-lg p-3 border border-orange-300">
                        <View className="flex items-center gap-2 mb-2">
                          <Text className="text-xl">⚠️</Text>
                          <Text className="text-base font-bold text-orange-800">
                            {herb.name}
                          </Text>
                          <View className="bg-orange-600 px-2 py-1 rounded">
                            <Text className="block text-xs text-white font-medium">
                              慎用
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm text-orange-700 mb-2 block">
                          {herb.risk}
                        </Text>
                        {herb.pregnancyRisk && herb.pregnancyRisk.length > 0 && (
                          <View className="mb-2">
                            <Text className="text-xs font-medium text-orange-800 mb-1 block">
                              孕期风险：
                            </Text>
                            <View className="flex flex-wrap gap-1">
                              {herb.pregnancyRisk.map((risk, idx) => (
                                <View key={idx} className="bg-white px-2 py-1 rounded">
                                  <Text className="block text-xs text-orange-700">
                                    {risk}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                        {herb.precautions.length > 0 && (
                          <View>
                            <Text className="text-xs font-medium text-orange-800 mb-1 block">
                              注意事项：
                            </Text>
                            {herb.precautions.map((precaution, idx) => (
                              <Text key={idx} className="text-xs text-orange-700 block">
                                • {precaution}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 妊娠禁忌特别提示 */}
              <View className="mt-3 bg-red-100 rounded-lg p-3 border-2 border-red-400">
                <View className="flex items-start gap-2">
                  <Text className="text-xl">⚠️</Text>
                  <Text className="text-sm font-bold text-red-800 block">
                    妊娠用药安全至关重要！妊娠禁用药绝对禁止使用，妊娠慎用药必须在专业中医师指导下使用，以确保母婴安全！
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 重要提示 */}
          {(hasToxicHerbs || hasIncompatibility || hasPregnancyContraindication) && (
            <View className="bg-red-50 rounded-lg p-4 border-2 border-red-400">
              <View className="flex items-start gap-2 mb-3">
                <Text className="text-2xl">📋</Text>
                <Text className="text-base font-bold text-red-800">
                  重要提示
                </Text>
              </View>
              <View className="space-y-2">
                {hasToxicHerbs && (
                  <>
                    <Text className="text-sm text-red-700 block">
                      1. 本处方包含有毒有害中药材，必须在专业中医师指导下使用！
                    </Text>
                    <Text className="text-sm text-red-700 block">
                      2. 严格遵医嘱服药，不可擅自更改剂量或停药！
                    </Text>
                    <Text className="text-sm text-red-700 block">
                      3. 服药期间如出现不适，应立即停药并就医！
                    </Text>
                    <Text className="text-sm text-red-700 block">
                      4. 建议定期复查，监测肝肾功能！
                    </Text>
                    <Text className="text-sm text-red-700 block">
                      5. 儿童用药需在成人监护下进行！
                    </Text>
                  </>
                )}
                {hasIncompatibility && (
                  <>
                    <Text className="text-sm text-red-700 block">
                      {hasToxicHerbs ? '6.' : '1.'} 处方中存在配伍禁忌，违反中药配伍原则！
                    </Text>
                    <Text className="text-sm text-red-700 block">
                      {hasToxicHerbs ? '7.' : '2.'} 配伍禁忌可能产生严重毒副作用或降低药效！
                    </Text>
                    <Text className="text-sm text-red-700 block">
                      {hasToxicHerbs ? '8.' : '3.'} 强烈建议在专业中医师指导下重新调整处方！
                    </Text>
                  </>
                )}
                {hasPregnancyContraindication && (
                  <>
                    <Text className="text-sm text-red-700 block">
                      {(hasToxicHerbs || hasIncompatibility) ? `${(hasToxicHerbs ? 8 : 3) + (hasIncompatibility ? 3 : 0) + 1}.` : '1.'} 妊娠用药安全至关重要，需严格遵循禁忌原则！
                    </Text>
                    <Text className="text-sm text-red-700 block">
                      {(hasToxicHerbs || hasIncompatibility) ? `${(hasToxicHerbs ? 8 : 3) + (hasIncompatibility ? 3 : 0) + 2}.` : '2.'} 妊娠禁用药绝对禁止使用，对胎儿有严重危害！
                    </Text>
                    <Text className="text-sm text-red-700 block">
                      {(hasToxicHerbs || hasIncompatibility) ? `${(hasToxicHerbs ? 8 : 3) + (hasIncompatibility ? 3 : 0) + 3}.` : '3.'} 妊娠慎用药必须在专业中医师指导下谨慎使用！
                    </Text>
                  </>
                )}
              </View>
            </View>
          )}

          {/* 禁忌检查 */}
          {patientInfo && (
            <View className="bg-orange-50 rounded-lg p-4 border-2 border-orange-400">
              <View className="flex items-start gap-2 mb-3">
                <Text className="text-2xl">👤</Text>
                <Text className="text-base font-bold text-orange-800">
                  用户禁忌检查
                </Text>
              </View>
              <View className="space-y-2">
                {patientInfo.age && (
                  <Text className="text-sm text-orange-700 block">
                    • 用户年龄：{patientInfo.age} 岁
                  </Text>
                )}
                {patientInfo.gender && (
                  <Text className="text-sm text-orange-700 block">
                    • 用户性别：{patientInfo.gender}
                  </Text>
                )}
                {patientInfo.isPregnant && (
                  <Text className="text-sm text-red-700 font-bold block">
                    ⚠️ 用户为孕妇，部分有毒有害中药材禁用！
                  </Text>
                )}
                {patientInfo.healthCondition && (
                  <Text className="text-sm text-orange-700 block">
                    • 健康状况：{patientInfo.healthCondition}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {/* 免责声明链接 */}
      {showDisclaimer && (
        <View className="mt-4">
          <View
            className="bg-white bg-opacity-50 rounded-lg p-3"
            onClick={handleGoToDisclaimer}
          >
            <Text className={`text-sm ${colors.titleColor} text-center`}>
              📄 查看完整免责声明
            </Text>
          </View>
        </View>
      )}

      {/* 确认按钮 */}
      {!hasConfirmed && (
        <View className="mt-4">
          <View
            className={`${colors.buttonBg} ${colors.buttonHover} py-4 rounded-xl`}
            onClick={handleConfirm}
          >
            <Text className="block text-lg font-medium text-white text-center">
              我已了解上述风险，确认使用本处方
            </Text>
          </View>
        </View>
      )}

      {/* 已确认状态 */}
      {hasConfirmed && (
        <View className="mt-4">
          <View className="bg-green-100 rounded-lg p-3 border-2 border-green-600">
            <View className="flex items-center gap-2">
              <Text className="text-xl">✅</Text>
              <Text className="text-sm font-medium text-green-800">
                您已确认了解处方风险，请严格遵医嘱使用
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
