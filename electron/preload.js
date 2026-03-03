const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getVersion: () => ipcRenderer.invoke('get-version'),

  // 显示关于对话框
  showAbout: () => ipcRenderer.invoke('show-about'),

  // 监听来自主进程的消息
  onMessage: (callback) => ipcRenderer.on('message', callback),

  // 发送消息到主进程
  sendMessage: (message) => ipcRenderer.send('message', message)
})

// 暴露平台信息
contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
  platform: process.platform,
  arch: process.arch
})
