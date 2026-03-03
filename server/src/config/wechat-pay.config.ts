/**
 * 微信支付配置
 */
export const wechatPayConfig = {
  appId: process.env.WECHAT_PAY_APP_ID || '',
  mchId: process.env.WECHAT_PAY_MCH_ID || '',
  apiKey: process.env.WECHAT_PAY_API_KEY || '',
  certPath: process.env.WECHAT_PAY_CERT_PATH || '',
  certPassword: process.env.WECHAT_PAY_CERT_PASSWORD || '',
  notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '',
  apiUrl: process.env.WECHAT_PAY_API_URL || 'https://api.mch.weixin.qq.com',
}

/**
 * 验证配置是否完整
 */
export function validateWeChatPayConfig(): boolean {
  const { appId, mchId, apiKey, notifyUrl } = wechatPayConfig

  if (!appId || !mchId || !apiKey || !notifyUrl) {
    console.error('微信支付配置不完整，请检查环境变量：')
    console.error('- WECHAT_PAY_APP_ID:', appId ? '已设置' : '未设置')
    console.error('- WECHAT_PAY_MCH_ID:', mchId ? '已设置' : '未设置')
    console.error('- WECHAT_PAY_API_KEY:', apiKey ? '已设置' : '未设置')
    console.error('- WECHAT_PAY_NOTIFY_URL:', notifyUrl ? '已设置' : '未设置')
    return false
  }

  return true
}

/**
 * 获取配置状态
 */
export function getWeChatPayConfigStatus() {
  const { appId, mchId, apiKey, notifyUrl, certPath, certPassword, apiUrl } = wechatPayConfig

  return {
    complete: validateWeChatPayConfig(),
    isSandbox: apiUrl.includes('sandboxnew'),
    config: {
      appId: appId ? '已设置' : '未设置',
      mchId: mchId ? '已设置' : '未设置',
      apiKey: apiKey ? '已设置' : '未设置',
      notifyUrl: notifyUrl ? '已设置' : '未设置',
      certPath: certPath ? '已设置' : '未设置',
      certPassword: certPassword ? '已设置' : '未设置',
      apiUrl: apiUrl,
    }
  }
}
