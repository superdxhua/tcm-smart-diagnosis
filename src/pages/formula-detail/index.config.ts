export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '方剂详情' })
  : { navigationBarTitleText: '方剂详情' }
