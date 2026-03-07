export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '扫码注册' })
  : { navigationBarTitleText: '扫码注册' }
