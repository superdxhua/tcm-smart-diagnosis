export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '病历详情' })
  : { navigationBarTitleText: '病历详情' }
