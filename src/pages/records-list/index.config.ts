export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '病历列表' })
  : { navigationBarTitleText: '病历列表' }
