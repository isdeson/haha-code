import dayjs from 'dayjs'

/** 生成 UUID */
export const generateUUID = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })

/**
 * 格式化时间为精准的相对时间或日期（秒、分钟级显示具体数值）
 * @param time 目标时间（支持时间戳、字符串、Date对象、dayjs.Dayjs）
 * @returns 格式化后的字符串（如：5秒前、3分钟前、1小时前、05-20、2024-05-20）
 */
export const formatTime = (time: string | number | Date | dayjs.Dayjs): string => {
  if (!time) {
    return ''
  }

  // 统一转换为dayjs对象（使用local本地时间，避免时区偏差）
  const targetTime = dayjs(time)
  const now = dayjs()

  // 计算时间差（毫秒）
  const diffMs = now.diff(targetTime)
  // 转换为秒、分钟、小时、天、年
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffYears = Math.floor(diffDays / 365)

  // 优先级：秒 → 分钟 → 小时 → 天 → 年
  if (diffSeconds < 60) {
    if (diffSeconds === 0) {
      return '刚刚'
    }
    // 小于1分钟，显示xx秒前（包括0秒前，可改为"刚刚"）
    return `${diffSeconds}秒前`
  } else if (diffMinutes < 60) {
    // 小于1小时，显示xx分钟前
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    // 小于1天，显示xx小时前
    return `${diffHours}小时前`
  } else if (diffYears < 1) {
    // 大于等于1天，小于1年，显示月-日（补零）
    return targetTime.format('MM-DD')
  } else {
    // 大于等于1年，显示年-月-日（补零）
    return targetTime.format('YYYY-MM-DD')
  }
}

/**
 * 将元素滚动到父容器的视口内（解决已滚动后定位不准的问题）
 * @param {HTMLElement} childElement 子元素
 * @param {HTMLElement} parentElement 父容器（需设置overflow: auto/scroll）
 * @param {boolean} isSmooth 是否平滑滚动
 * @param {string} align 对齐方式：'top'（顶部）| 'center'（居中）| 'bottom'（底部），默认'top'
 */
export function scrollToParentView(
  childElement: HTMLElement,
  parentElement: HTMLElement,
  isSmooth = false,
  align = 'top',
) {
  if (!childElement || !parentElement) {
    console.error('滚动失败：子元素或父容器不存在')
    return
  }

  // 获取元素和父容器的视口位置（相对于浏览器视口）
  const childRect = childElement.getBoundingClientRect()
  const parentRect = parentElement.getBoundingClientRect()

  // 计算子元素相对于父容器的偏移量（top/left）
  // 这一步消除了父容器已滚动的影响，得到的是元素在父容器内的真实位置
  const relativeTop = childRect.top - parentRect.top + parentElement.scrollTop
  const relativeLeft = childRect.left - parentRect.left + parentElement.scrollLeft

  // 根据对齐方式计算最终的滚动位置
  let targetScrollTop = 0
  switch (align) {
    case 'center':
      // 居中：父容器滚动位置 = 元素相对顶部 - 父容器可视高度/2 + 元素高度/2
      targetScrollTop = relativeTop - parentElement.clientHeight / 2 + childElement.clientHeight / 2
      break
    case 'bottom':
      // 底部：父容器滚动位置 = 元素相对顶部 - 父容器可视高度 + 元素高度
      targetScrollTop = relativeTop - parentElement.clientHeight + childElement.clientHeight
      break
    default: // top
      // 顶部：父容器滚动位置 = 元素相对顶部
      targetScrollTop = relativeTop
      break
  }

  // 执行滚动（限制滚动位置在合法范围内，避免超出父容器滚动区域）
  const maxScrollTop = parentElement.scrollHeight - parentElement.clientHeight
  const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop))

  if (isSmooth) {
    parentElement.scrollTo({
      top: finalScrollTop,
      left: relativeLeft,
      behavior: 'smooth',
    })
  } else {
    parentElement.scrollTop = finalScrollTop
    parentElement.scrollLeft = relativeLeft
  }
}

/** 判断元素是否在视口 */
export const isElementInViewport = (el: HTMLElement, parentEl: HTMLElement) => {
  const elRect = el.getBoundingClientRect()
  const parentRect = parentEl.getBoundingClientRect()
  // 判断元素是否完全在父容器视口内（可改为部分可见：elRect.bottom > parentRect.top && elRect.top < parentRect.bottom）
  return elRect.top >= parentRect.top && elRect.bottom <= parentRect.bottom
}
