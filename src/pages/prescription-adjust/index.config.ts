export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '处方调整' })
  : { navigationBarTitleText: '处方调整' }
