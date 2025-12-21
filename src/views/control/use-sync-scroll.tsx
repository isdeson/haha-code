import { useCallback, useEffect, useRef } from 'react'
import { useControlContext } from './control-context'
import { isElementInViewport, scrollToParentView } from './utils'

export const useSyncScroll = () => {
  const { codeList, setting, activeQrCode } = useControlContext()
  const { viewMode } = setting || {}

  const qrCodeParentRef = useRef<HTMLDivElement>(null)
  const qrCodeRefs = useRef<Record<string | number, HTMLDivElement | null>>({})

  const scrollToTargetQrCode = useCallback(() => {
    if (!activeQrCode || !qrCodeParentRef.current || viewMode !== 'multi') {
      return
    }
    // 根据activeQrCode的id（或索引）获取目标元素
    const targetKey = activeQrCode.id ?? codeList.findIndex((item) => item.id === activeQrCode.id)
    const targetElement = qrCodeRefs.current[targetKey]
    if (targetElement) {
      // 仅当元素不在视口内时执行滚动
      if (!isElementInViewport(targetElement, qrCodeParentRef.current)) {
        scrollToParentView(targetElement, qrCodeParentRef.current, true, 'top')
      }
    }
  }, [activeQrCode, codeList, viewMode])

  // 监听依赖变化触发滚动
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      scrollToTargetQrCode()
    })
    return () => {
      cancelAnimationFrame(raf)
    }
  }, [activeQrCode, viewMode, codeList, scrollToTargetQrCode])

  return {
    qrCodeParentRef,
    qrCodeRefs,
  }
}
