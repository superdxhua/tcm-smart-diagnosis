import React, { PropsWithChildren } from 'react';
import { useLaunch, useDidShow } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { injectH5Styles } from '@/utils/h5-styles';
import { enableWxDebugIfNeeded } from '@/utils/wx-debug';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import '@/app.css';

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    enableWxDebugIfNeeded();
    injectH5Styles();

    // 注意：域名检测逻辑已移至 src/pages/index/index.tsx
    // 这样可以确保主域名和子域名的访问逻辑完全分离
    console.log('App launch, hostname:', typeof window !== 'undefined' ? window.location.hostname : 'unknown');
  });

  // 每次页面显示时，检查 PWA 安装提示
  useDidShow(() => {
    // 检查是否已安装（仅在 H5 环境）
    const isH5 = typeof window !== 'undefined' && window.location?.protocol?.startsWith('http');
    if (isH5) {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
      if (!isInstalled) {
        // 如果已安装，不显示提示
        console.log('PWA is not installed, may show install prompt');
      }
    }
  });

  const isH5 = typeof window !== 'undefined' && window.location?.protocol?.startsWith('http');
  return React.createElement(View, { className: 'app-container' },
    children,
    isH5 && React.createElement(PWAInstallPrompt)
  );
}

export default App;
