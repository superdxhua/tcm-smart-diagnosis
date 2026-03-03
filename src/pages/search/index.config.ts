export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '联网搜索'
    })
  : { navigationBarTitleText: '联网搜索' }
