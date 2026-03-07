export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '每日签到',
      navigationBarBackgroundColor: '#3B82F6',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '每日签到',
      navigationBarBackgroundColor: '#3B82F6',
      navigationBarTextStyle: 'white'
    }
