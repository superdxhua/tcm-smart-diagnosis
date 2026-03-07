// 扩展 Window 接口，添加 PWA 安装相关的类型
declare global {
  interface Window {
    deferredPrompt?: Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
    };
  }
}

export {};
