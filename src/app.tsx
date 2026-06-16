import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useAppStore } from './store/useAppStore';
// 全局样式
import './app.scss';

function App(props) {
  const { hydrateFromStorage } = useAppStore();

  useEffect(() => {
    console.log('[App] 应用启动，恢复本地存储状态');
    hydrateFromStorage();
  }, []);

  // 对应 onShow
  useDidShow(() => {
    console.log('[App] 应用显示，重新加载状态');
    hydrateFromStorage();
  });

  // 对应 onHide
  useDidHide(() => {});

  return props.children;
}

export default App;
