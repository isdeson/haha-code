import { useSize } from 'ahooks'
import { QRCodeSVG } from 'qrcode.react'
import { useRef, type FC } from 'react'
import useQrCode from '../../use-qrcode'
import { LOGO_BASE64 } from '@/views/control/constants'
import type { IQRCode } from '@/views/control/types'
import { formatTime } from '@/views/control/utils'

import './index.scss'
import { useControlContext } from '@/views/control/control-context'

export interface IQrCodeProps {
  onPreview: () => void
  qrCode?: IQRCode
}

const QrCode: FC<IQrCodeProps> = ({ qrCode, onPreview }) => {
  const containerRef = useRef(null)
  const containerSize = useSize(containerRef)
  const qrCodeSize = Math.max(125, Number(containerSize?.width || '') - 14 * 2)

  const qrCodeRef = useRef(null)
  const { copyQrCode, downloadQrCode } = useQrCode()

  const { name, content, updatedAt = '', createdAt = '' } = qrCode || {}
  const qrConfig = qrCode?.qrConfig || {}
  const { activeQrCode, setSetting } = useControlContext()

  const handleItemClick = () => {
    setSetting((prev) => ({ ...prev, activeQrCodeId: qrCode?.id }))
  }

  return (
    <div
      className={`qrcode ${qrCode?.id === activeQrCode?.id ? 'active' : ''}`}
      ref={containerRef}
      onClick={() => handleItemClick()}
    >
      <div className="qrcode-content">
        {qrCodeSize && (
          <QRCodeSVG
            key={JSON.stringify(qrConfig)}
            ref={qrCodeRef}
            value={content || ''}
            size={qrCodeSize}
            bgColor={qrConfig.bgColor || '#ffffff'}
            fgColor={qrConfig.fgColor || '#111111'}
            level={qrConfig.level || 'H'}
            imageSettings={{
              src: qrConfig.logo || LOGO_BASE64.haha || '',
              height: Number(qrConfig.logoSize) || 35,
              width: Number(qrConfig.logoSize) || 35,
              excavate: qrConfig.logoExcavate ?? true,
            }}
          />
        )}
      </div>
      <div className="qrcode-title overflow-ellipsis">{name || '未命名二维码'}</div>
      <div className="qrcode-desc overflow-ellipsis">{content || '暂无内容'}</div>
      <div className="qrcode-time overflow-ellipsis">
        {formatTime(updatedAt || createdAt)}更新
      </div>
      <div className="qrcode-tools">
        <div className="qrcode-tools-item" title="放大" onClick={() => onPreview?.()}>
          <i className="iconfont haha-a-ziyuan837"></i>
        </div>
        <div className="qrcode-tools-item" title="复制" onClick={() => copyQrCode(qrCodeRef, name, 300, { title: name, titlePosition: 'bottom' })}>
          <i className="iconfont haha-fuzhi1"></i>
        </div>
        <div className="qrcode-tools-item" title="下载" onClick={() => downloadQrCode?.(qrCodeRef, name, 300, { title: name, titlePosition: 'bottom' })}>
          <i className="iconfont haha-xiazai"></i>
        </div>
      </div>
    </div>
  )
}

export default QrCode
