export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '账户充值' })
  : { navigationBarTitleText: '账户充值' }
