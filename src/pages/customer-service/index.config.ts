export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '客服中心',
      navigationBarBackgroundColor: '#1677ff',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '客服中心',
      navigationBarBackgroundColor: '#1677ff',
      navigationBarTextStyle: 'white'
    }
