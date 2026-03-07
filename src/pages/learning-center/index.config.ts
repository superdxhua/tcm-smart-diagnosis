export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '学习中心' })
  : { navigationBarTitleText: '学习中心' }
