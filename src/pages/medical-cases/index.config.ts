export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '经方医案库',
      navigationBarBackgroundColor: '#4CAF50',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '经方医案库',
      navigationBarBackgroundColor: '#4CAF50',
      navigationBarTextStyle: 'white',
    };
