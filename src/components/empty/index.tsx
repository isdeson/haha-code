import type { FC } from 'react'
import empty from '@/assets/images/empty.png'

import './index.scss'

interface IProps {
  image?: string
  imageSize?: number
  text?: string
}

const Empty: FC<IProps> = ({ image = empty, text = '暂无数据', imageSize = 70 }) => {
  return (
    <div className="empty">
      <img src={image} className="empty__image" style={{ width: imageSize + 'px' }} />
      {text && <div className="empty__text">{text}</div>}
    </div>
  )
}

export default Empty
