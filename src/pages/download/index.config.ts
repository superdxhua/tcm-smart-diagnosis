export default typeof definePageConfig === 'function'
  ? definePageConfig({
    navigationBarTitleText: '下载 APP',
    navigationBarBackgroundColor: '#667eea',
    navigationBarTextStyle: 'white'
    })
  : {
    navigationBarTitleText: '下载 APP',
    navigationBarBackgroundColor: '#667eea',
    navigationBarTextStyle: 'white'
    }
