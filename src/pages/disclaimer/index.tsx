import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.css'

export default function DisclaimerPage() {
  const handleGoBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className="min-h-screen bg-gray-50">
      <ScrollView scrollY className="h-screen">
        {/* 头部 */}
        <View className="bg-blue-600 px-6 py-8">
          <Text className="block text-3xl font-bold text-white text-center mb-2">
            免责声明
          </Text>
          <Text className="block text-base text-blue-100 text-center">
            使用本系统前，请仔细阅读以下内容
          </Text>
        </View>

        {/* 内容区域 */}
        <View className="p-6 pb-24">
          {/* 重要提示 */}
          <View className="bg-red-50 rounded-xl p-6 mb-6 border-2 border-red-400">
            <View className="flex items-start gap-3 mb-4">
              <Text className="text-3xl">⚠️</Text>
              <View className="flex-1">
                <Text className="block text-xl font-bold text-red-800 mb-2">
                  重要提示
                </Text>
                <Text className="block text-base text-red-700 leading-relaxed">
                  本免责声明是本小程序（以下简称&ldquo;本系统&rdquo;）的重要组成部分，您使用本系统即表示您已充分理解并同意本声明的全部内容。
                </Text>
              </View>
            </View>
          </View>

          {/* 1. 系统性质说明 */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-blue-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                一、系统性质说明
              </Text>
            </View>
            <View className="space-y-3">
              <Text className="block text-base text-gray-700 leading-relaxed">
                1.1 本系统是基于人工智能技术的中医辅助健康工具，仅作为中医师健康参考，不能替代专业中医师的健康咨询。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                1.2 本系统提供的调理建议仅供参考，不能作为健康方案的唯一依据。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                1.3 本系统的输出结果不构成参考建议，也不代表专业中医师的咨询意见。
              </Text>
            </View>
          </View>

          {/* 2. 使用范围和限制 */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-green-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                二、使用范围和限制
              </Text>
            </View>
            <View className="space-y-3">
              <Text className="block text-base text-gray-700 leading-relaxed">
                2.1 本系统仅供具备合法执业资格的中医师参考使用，非专业人士请勿直接使用。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                2.2 本系统不适用于危急重症、疑难杂症等需要紧急情况处理的情况。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                2.3 本系统不建议用于孕妇、婴幼儿、老年人等特殊人群的调理决策。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                2.4 使用本系统时，必须结合用户的具体情况，进行全面的中医分析。
              </Text>
            </View>
          </View>

          {/* 3. 有毒有害中药材风险 */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-orange-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                三、有毒有害中药材风险
              </Text>
            </View>
            <View className="space-y-3">
              <Text className="block text-base text-gray-700 leading-relaxed">
                3.1 中医药材中存在部分有毒有害物质（如附子、半夏、川乌、草乌等），使用不当可能对人体造成严重伤害。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                3.2 本系统已对有毒有害中药材进行风控检测和提醒，但不能完全替代专业中医师的判断。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                3.3 调理方案中若包含有毒有害中药材，必须在专业中医师严格监控下使用，严格按照炮制要求、剂量要求和煎服方法使用。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                3.4 严禁擅自调整有毒有害中药材的剂量，超出安全范围可能导致严重后果。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                3.5 使用有毒有害中药材时，应定期监测用户的肝肾功能，及时发现和处理不良反应。
              </Text>
            </View>
          </View>

          {/* 4. 风险提示 */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-purple-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                四、风险提示
              </Text>
            </View>
            <View className="space-y-3">
              <Text className="block text-base text-gray-700 leading-relaxed">
                4.1 中医药调理需要结合用户的具体情况，个体差异较大，效果因人而异。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                4.2 本系统提供的调理建议可能存在准确性、完整性、适用性等方面的局限性。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                4.3 本系统不能保证调理建议的有效性和安全性，使用者需自行承担使用风险。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                4.4 使用本系统导致的任何健康相关问题、法律责任、经济损失等，本系统不承担任何责任。
              </Text>
            </View>
          </View>

          {/* 5. 使用者的责任和义务 */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-teal-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                五、使用者的责任和义务
              </Text>
            </View>
            <View className="space-y-3">
              <Text className="block text-base text-gray-700 leading-relaxed">
                5.1 使用者应具备合法的中医执业资格，遵守相关法律法规和行业规范。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                5.2 使用者应充分了解用户的病情、体质、过敏史等信息，谨慎使用本系统。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                5.3 使用者应对本系统提供的调理建议进行独立的专业判断，结合临床经验做出决策。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                5.4 使用者应向用户充分告知调理方案的风险和注意事项，尊重用户的知情权和选择权。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                5.5 使用者应妥善保管用户的健康信息，保护用户隐私，遵守相关法律法规。
              </Text>
            </View>
          </View>

          {/* 6. 知识产权 */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-indigo-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                六、知识产权
              </Text>
            </View>
            <View className="space-y-3">
              <Text className="block text-base text-gray-700 leading-relaxed">
                6.1 本系统中的所有内容（包括但不限于文字、图片、音频、视频、软件、代码等）均受知识产权法保护。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                6.2 未经本系统所有者书面许可，任何人不得复制、传播、修改、商业利用本系统的任何内容。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                6.3 本系统使用的中医药知识来源于公开资料，如涉及侵权，请联系我们处理。
              </Text>
            </View>
          </View>

          {/* 7. 免责条款 */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-red-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                七、免责条款
              </Text>
            </View>
            <View className="space-y-3">
              <Text className="block text-base text-gray-700 leading-relaxed">
                7.1 本系统不对使用者的健康咨询结果承担任何责任。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                7.2 本系统不对因使用本系统而导致的任何损失、损害、责任承担赔偿责任。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                7.3 本系统不对调理方案的有效性、安全性、适用性提供任何保证。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                7.4 本系统不对因网络故障、系统故障、技术故障等原因导致的服务中断承担任何责任。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                7.5 本系统不对因使用者违规操作、不当使用、误用等原因导致的后果承担任何责任。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                7.6 本系统不对因不可抗力（如自然灾害、战争、政府行为等）导致的服务中断承担任何责任。
              </Text>
            </View>
          </View>

          {/* 8. 法律适用和争议解决 */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-gray-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                八、法律适用和争议解决
              </Text>
            </View>
            <View className="space-y-3">
              <Text className="block text-base text-gray-700 leading-relaxed">
                8.1 本免责声明的解释和适用均适用中华人民共和国法律。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                8.2 因使用本系统而产生的任何争议，应通过友好协商解决；协商不成的，任何一方均有权向本系统所有者所在地人民法院提起诉讼。
              </Text>
            </View>
          </View>

          {/* 9. 声明更新 */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-yellow-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                九、声明更新
              </Text>
            </View>
            <View className="space-y-3">
              <Text className="block text-base text-gray-700 leading-relaxed">
                9.1 本系统保留随时修改本免责声明的权利。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                9.2 本免责声明的修改将在本系统上公布，自公布之日起生效。
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                9.3 使用者继续使用本系统即表示同意修改后的免责声明。
              </Text>
            </View>
          </View>

          {/* 10. 联系方式 */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <View className="flex items-center mb-4">
              <View className="w-1 h-6 bg-blue-600 rounded mr-3"></View>
              <Text className="block text-xl font-bold text-gray-900">
                十、联系方式
              </Text>
            </View>
            <View className="space-y-3">
              <Text className="block text-base text-gray-700 leading-relaxed">
                如对本免责声明有任何疑问或建议，请通过以下方式联系我们：
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                邮箱：269329230@qq.com
              </Text>
              <Text className="block text-base text-gray-700 leading-relaxed">
                电话：400-XXX-XXXX
              </Text>
            </View>
          </View>

          {/* 确认按钮 */}
          <View className="bg-blue-600 rounded-xl py-4 mt-6">
            <Text
              className="block text-lg font-medium text-white text-center"
              onClick={handleGoBack}
            >
              我已阅读并理解上述内容
            </Text>
          </View>

          {/* 底部提示 */}
          <View className="mt-8">
            <Text className="block text-sm text-gray-400 text-center">
              本声明最后更新日期：2025-01-01
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
