import { Toast } from '@douyinfe/semi-ui'
import type { RefObject } from 'react'

/** 二维码图片合成配置 */
export interface QrImageOptions {
  title?: string
  titleFontSize?: number
  titleColor?: string
  padding?: number
  gap?: number
  backgroundColor?: string
  maxTitleWidthRatio?: number
  /** 标题位置：上 / 下 */
  titlePosition?: 'top' | 'bottom'
}

/** 绘制自动换行文本，返回文本高度 */
const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) => {
  const chars = text.split('')
  let line = ''
  let offsetY = 0

  chars.forEach((char, index) => {
    const testLine = line + char
    const { width } = ctx.measureText(testLine)

    if (width > maxWidth && line) {
      ctx.fillText(line, x, y + offsetY)
      line = char
      offsetY += lineHeight
    } else {
      line = testLine
    }

    if (index === chars.length - 1) {
      ctx.fillText(line, x, y + offsetY)
    }
  })

  return offsetY + lineHeight
}

/** SVG 转 PNG Blob（支持标题上下 + 自动换行 + 高清） */
const svgToPngBlob = async (
  svgEl: SVGSVGElement,
  qrSize = 300,
  options?: QrImageOptions,
): Promise<Blob> => {
  const {
    title,
    titleFontSize = 32,
    titleColor = '#111',
    padding = 40,
    gap = 24,
    backgroundColor = '#ffffff',
    maxTitleWidthRatio = 0.9,
    titlePosition = 'top',
  } = options || {}

  /** SVG → Image */
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgEl)

  const svgBlob = new Blob([svgStr], {
    type: 'image/svg+xml;charset=utf-8',
  })

  const svgUrl = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = svgUrl

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
  })

  const dpr = window.devicePixelRatio || 1

  /** 测量标题高度 */
  let titleHeight = 0
  if (title) {
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.font = `bold ${titleFontSize}px system-ui`
    titleHeight = drawWrappedText(
      tempCtx,
      title,
      0,
      0,
      (qrSize + padding * 2) * maxTitleWidthRatio,
      titleFontSize + 8,
    )
  }

  const logicalWidth = qrSize + padding * 2
  const logicalHeight = qrSize + padding * 2 + (title ? titleHeight + gap : 0)

  const canvas = document.createElement('canvas')
  canvas.width = logicalWidth * dpr
  canvas.height = logicalHeight * dpr
  canvas.style.width = `${logicalWidth}px`
  canvas.style.height = `${logicalHeight}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not supported')

  ctx.scale(dpr, dpr)

  /** 背景 */
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, logicalWidth, logicalHeight)

  ctx.font = `bold ${titleFontSize}px system-ui`
  ctx.fillStyle = titleColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  let qrY = padding

  /** 标题在上 */
  if (title && titlePosition === 'top') {
    const realTitleHeight = drawWrappedText(
      ctx,
      title,
      logicalWidth / 2,
      padding,
      logicalWidth * maxTitleWidthRatio,
      titleFontSize + 8,
    )
    qrY += realTitleHeight + gap
  }

  /** 二维码 */
  ctx.drawImage(img, padding, qrY, qrSize, qrSize)

  /** 标题在下 */
  if (title && titlePosition === 'bottom') {
    drawWrappedText(
      ctx,
      title,
      logicalWidth / 2,
      qrY + qrSize + gap,
      logicalWidth * maxTitleWidthRatio,
      titleFontSize + 8,
    )
  }

  URL.revokeObjectURL(svgUrl)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob as Blob), 'image/png')
  })
}

/** qrcode 通用 hook */
const useQrCode = () => {
  const copyQrCode = async (
    svgRef: RefObject<SVGSVGElement>,
    fileName = 'qrcode',
    size = 300,
    options?: QrImageOptions,
  ) => {
    if (!svgRef.current) return

    try {
      const blob = await svgToPngBlob(svgRef.current, size, options)
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      Toast.success('二维码已复制至剪切板')
      console.warn(`【二维码复制成功 ${new Date().toLocaleString()}】`, fileName)
    } catch (e) {
      console.error(e)
      Toast.error('复制失败')
    }
  }

  const downloadQrCode = async (
    svgRef: RefObject<SVGSVGElement>,
    fileName = 'qrcode',
    size = 300,
    options?: QrImageOptions,
  ) => {
    if (!svgRef.current) return

    try {
      const blob = await svgToPngBlob(svgRef.current, size, options)
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.warn(`【二维码下载成功 ${new Date().toLocaleString()}】`)
    } catch (e) {
      console.error(e)
      Toast.error('下载失败')
    }
  }

  return {
    copyQrCode,
    downloadQrCode,
  }
}

export default useQrCode
