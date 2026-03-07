export default typeof defineAppConfig === 'function'
  ? defineAppConfig({
      pages: [
        'pages/index/index',  // 默认首页：应用页面
        'pages/official/index',  // 官网页面（通过域名检测跳转）
        'pages/login/index',
        'pages/register/index',
        'pages/register-form/index',
        'pages/disclaimer/index',
        'pages/download/index',
        'pages/admin/index',
        'pages/admin-packages/index',
        'pages/admin-recharge/index',
        'pages/patients-list/index',
        'pages/patient-detail/index',
        'pages/records-list/index',
        'pages/record-detail/index',
        'pages/prescription-adjust/index',
        'pages/medication-feedback/index',
        'pages/ai-chat/index',
        'pages/search/index',
        'pages/learning-center/index',
        'pages/sign-in/index',
        'pages/medical-cases/index',
        'pages/recharge/index',
        'pages/formula-management/index',
        'pages/formula-detail/index'
      ],
      window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: '中医智能好帮手',
        navigationBarTextStyle: 'black'
      }
    })
  : {
      pages: [
        'pages/official/index',
        'pages/index/index',
        'pages/login/index',
        'pages/register/index',
        'pages/register-form/index',
        'pages/disclaimer/index',
        'pages/download/index',
        'pages/admin/index',
        'pages/admin-packages/index',
        'pages/admin-recharge/index',
        'pages/patients-list/index',
        'pages/patient-detail/index',
        'pages/records-list/index',
        'pages/record-detail/index',
        'pages/prescription-adjust/index',
        'pages/medication-feedback/index',
        'pages/patient-detail/index',
        'pages/ai-chat/index',
        'pages/search/index',
        'pages/learning-center/index',
        'pages/sign-in/index',
        'pages/medical-cases/index',
        'pages/recharge/index',
        'pages/formula-management/index',
        'pages/formula-detail/index'
      ],
      window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: '中医智能好帮手',
        navigationBarTextStyle: 'black'
      }
    }
