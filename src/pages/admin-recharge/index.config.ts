export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '订单审核'
    })
  : { navigationBarTitleText: '订单审核' }
