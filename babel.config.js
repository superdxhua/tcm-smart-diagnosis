// babel-preset-taro 更多选项和默认值：
// https://docs.taro.zone/docs/next/babel-config
module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true,
      compiler: 'vite',
      useBuiltIns: false
    }]
  ],
  // 添加 Node.js 20.x 兼容性配置
  sourceType: 'unambiguous',
  parserOpts: {
    allowAwaitOutsideFunction: true
  }
}
