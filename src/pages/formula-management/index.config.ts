export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '方剂管理' })
  : { navigationBarTitleText: '方剂管理' }
