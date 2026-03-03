import { View, Text } from '@tarojs/components'
import { useDevice } from '@/utils/device'
import React, { ReactNode } from 'react'

/**
 * 响应式布局组件
 * 根据设备类型自动应用不同的样式
 */

interface ResponsiveLayoutProps {
  children: ReactNode
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
  style?: React.CSSProperties
  mobileStyle?: React.CSSProperties
  tabletStyle?: React.CSSProperties
  desktopStyle?: React.CSSProperties
}

/**
 * 响应式布局容器
 * 根据设备类型自动选择合适的样式
 */
export default function ResponsiveLayout({
  children,
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  style,
  mobileStyle,
  tabletStyle,
  desktopStyle
}: ResponsiveLayoutProps) {
  const { deviceType } = useDevice()

  // 根据设备类型获取类名
  const getClassName = () => {
    switch (deviceType) {
      case 'mobile':
        return mobileClassName
      case 'tablet':
        return tabletClassName || mobileClassName
      case 'desktop':
        return desktopClassName || tabletClassName || mobileClassName
      default:
        return mobileClassName
    }
  }

  // 根据设备类型获取样式
  const getStyle = () => {
    switch (deviceType) {
      case 'mobile':
        return { ...style, ...mobileStyle }
      case 'tablet':
        return { ...style, ...tabletStyle }
      case 'desktop':
        return { ...style, ...desktopStyle }
      default:
        return style
    }
  }

  return (
    <View className={getClassName()} style={getStyle()}>
      {children}
    </View>
  )
}

/**
 * 响应式容器组件
 * 用于创建不同尺寸的容器
 */
interface ResponsiveContainerProps {
  children: ReactNode
  width?: 'full' | 'narrow' | 'wide' | 'auto'
  center?: boolean
  className?: string
}

export function ResponsiveContainer({
  children,
  width = 'full',
  center = false,
  className = ''
}: ResponsiveContainerProps) {
  const { deviceType } = useDevice()

  // 根据设备类型和宽度选项获取类名
  const getContainerClassName = () => {
    const baseClass = 'w-full'

    let widthClass = ''
    switch (width) {
      case 'narrow':
        widthClass = 'max-w-2xl mx-auto'
        break
      case 'wide':
        widthClass = 'max-w-6xl mx-auto'
        break
      case 'auto':
        widthClass = 'w-auto mx-auto'
        break
      case 'full':
      default:
        widthClass = deviceType === 'desktop' ? 'max-w-7xl mx-auto' : 'w-full'
        break
    }

    // 居中处理
    const centerClass = center ? 'flex items-center justify-center' : ''

    return `${baseClass} ${widthClass} ${centerClass} ${className}`
  }

  return (
    <View className={getContainerClassName()}>
      {children}
    </View>
  )
}

/**
 * 响应式栅格组件
 * 用于创建响应式网格布局
 */
interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className = ''
}: ResponsiveGridProps) {
  const { deviceType } = useDevice()

  // 根据设备类型获取列数
  const getCols = () => {
    switch (deviceType) {
      case 'mobile':
        return cols.mobile || 1
      case 'tablet':
        return cols.tablet || 2
      case 'desktop':
        return cols.desktop || 3
      default:
        return 1
    }
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${getCols()}, 1fr)`,
    gap: `${gap * 0.25}rem`
  }

  return (
    <View style={gridStyle} className={className}>
      {children}
    </View>
  )
}

/**
 * 设备可见性组件
 * 根据设备类型控制内容显示
 */
interface DeviceVisibilityProps {
  children: ReactNode
  showOn?: ('mobile' | 'tablet' | 'desktop')[]
  hideOn?: ('mobile' | 'tablet' | 'desktop')[]
}

export function DeviceVisibility({
  children,
  showOn = ['mobile', 'tablet', 'desktop'],
  hideOn = []
}: DeviceVisibilityProps) {
  const { deviceType } = useDevice()

  // 检查是否应该显示
  const shouldShow = () => {
    if (showOn.length > 0 && !showOn.includes(deviceType)) {
      return false
    }
    if (hideOn.length > 0 && hideOn.includes(deviceType)) {
      return false
    }
    return true
  }

  if (!shouldShow()) {
    return null
  }

  return <>{children}</>
}

/**
 * 移动端专属内容组件
 */
export function MobileOnly({ children }: { children: ReactNode }) {
  return (
    <DeviceVisibility showOn={['mobile']}>
      {children}
    </DeviceVisibility>
  )
}

/**
 * PC端专属内容组件
 */
export function DesktopOnly({ children }: { children: ReactNode }) {
  return (
    <DeviceVisibility showOn={['desktop']}>
      {children}
    </DeviceVisibility>
  )
}

/**
 * 平板端专属内容组件
 */
export function TabletOnly({ children }: { children: ReactNode }) {
  return (
    <DeviceVisibility showOn={['tablet']}>
      {children}
    </DeviceVisibility>
  )
}

/**
 * 响应式文本组件
 * 根据设备类型自动调整字号
 */
interface ResponsiveTextProps {
  children: ReactNode
  size?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: string
  className?: string
}

export function ResponsiveText({
  children,
  size = { mobile: 'text-base', tablet: 'text-lg', desktop: 'text-xl' },
  weight = 'normal',
  color = 'text-gray-900',
  className = ''
}: ResponsiveTextProps) {
  const { deviceType } = useDevice()

  // 根据设备类型获取字号类名
  const getSizeClassName = () => {
    switch (deviceType) {
      case 'mobile':
        return size.mobile || 'text-base'
      case 'tablet':
        return size.tablet || size.mobile || 'text-base'
      case 'desktop':
        return size.desktop || size.tablet || size.mobile || 'text-base'
      default:
        return 'text-base'
    }
  }

  // 根据字重获取类名
  const getWeightClassName = () => {
    switch (weight) {
      case 'normal':
        return 'font-normal'
      case 'medium':
        return 'font-medium'
      case 'semibold':
        return 'font-semibold'
      case 'bold':
        return 'font-bold'
      default:
        return 'font-normal'
    }
  }

  return (
    <Text
      className={`${getSizeClassName()} ${getWeightClassName()} ${color} ${className}`}
    >
      {children}
    </Text>
  )
}
