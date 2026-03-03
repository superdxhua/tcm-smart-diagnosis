/**
 * 设备检测工具
 * 用于检测用户设备类型（移动端、平板、PC端）
 */

import { useState, useEffect } from 'react'

/**
 * 获取设备类型信息
 * @returns 设备类型信息对象
 */
export interface DeviceInfo {
  isMobile: boolean      // 是否为移动设备
  isTablet: boolean      // 是否为平板设备
  isDesktop: boolean     // 是否为PC端设备
  deviceType: 'mobile' | 'tablet' | 'desktop'  // 设备类型
  screenWidth: number    // 屏幕宽度
  screenHeight: number   // 屏幕高度
}

export const getDeviceType = (): DeviceInfo => {
  // 获取屏幕尺寸
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 375
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 667

  // 通过 User-Agent 判断设备类型
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''

  // 移动设备检测
  const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

  // 平板检测
  const isTablet = /iPad/i.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
    (screenWidth >= 768 && screenWidth <= 1024)

  // PC端检测
  const isDesktop = !isMobile && !isTablet

  // 根据屏幕宽度进行二次判断（更准确）
  let finalDeviceType: 'mobile' | 'tablet' | 'desktop' = 'mobile'

  if (screenWidth >= 1024) {
    finalDeviceType = 'desktop'
  } else if (screenWidth >= 768) {
    finalDeviceType = 'tablet'
  } else {
    finalDeviceType = 'mobile'
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType: finalDeviceType,
    screenWidth,
    screenHeight
  }
}

/**
 * React Hook：获取设备类型
 * 会监听窗口大小变化，自动更新设备类型
 */
export const useDevice = () => {
  const [device, setDevice] = useState<DeviceInfo>(getDeviceType())

  useEffect(() => {
    const handleResize = () => {
      setDevice(getDeviceType())
    }

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)

    // 清理监听器
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return device
}

/**
 * 判断是否为 Taro H5 环境
 */
export const isTaroH5 = (): boolean => {
  return typeof window !== 'undefined' &&
    (window as any).__TARO_ENV === 'h5'
}

/**
 * 判断是否为 Taro 微信小程序环境
 */
export const isWeapp = (): boolean => {
  return typeof window !== 'undefined' &&
    (window as any).__TARO_ENV === 'weapp'
}

/**
 * 判断是否为 Retina 屏幕（高DPI）
 */
export const isRetina = (): boolean => {
  return typeof window !== 'undefined' &&
    window.devicePixelRatio >= 2
}

/**
 * 获取设备像素比
 */
export const getDevicePixelRatio = (): number => {
  return typeof window !== 'undefined' ? window.devicePixelRatio : 1
}

/**
 * 判断是否支持触摸事件
 */
export const isTouchSupported = (): boolean => {
  return typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0)
}

/**
 * 获取设备的方向（横屏/竖屏）
 */
export const getOrientation = (): 'portrait' | 'landscape' => {
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 375
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 667

  return screenWidth > screenHeight ? 'landscape' : 'portrait'
}

/**
 * 监听设备方向变化
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(getOrientation())

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(getOrientation())
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}
