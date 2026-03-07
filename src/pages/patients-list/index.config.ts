export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '用户列表' })
  : { navigationBarTitleText: '用户列表' }
