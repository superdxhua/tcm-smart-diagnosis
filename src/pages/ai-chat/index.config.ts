export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: 'AI 助手对话' })
  : { navigationBarTitleText: 'AI 助手对话' }
