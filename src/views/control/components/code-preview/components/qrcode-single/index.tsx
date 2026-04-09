import { QRCodeSVG } from 'qrcode.react'
import { useRef } from 'react'
import useQrCode from '../../use-qrcode'
import { useSize } from 'ahooks'
import { LOGO_BASE64 } from '../../../../constants'
import { useControlContext } from '../../../../control-context'
import { formatTime } from '@/views/control/utils'

import './index.scss'

const QrCodeSingle = () => {
  const qrCodeRef = useRef(null)
  const { copyQrCode, downloadQrCode } = useQrCode()

  const containerRef = useRef(null)
  const containerSize = useSize(containerRef)
  const qrCodeSize = Math.max(125, Number(containerSize?.width || '') - 14 * 2)

  const { activeQrCode } = useControlContext()
  const { name, content, updatedAt = '', createdAt = '' } = activeQrCode || {}
  const qrConfig = activeQrCode?.qrConfig || {}
  const logoSize = Number(qrConfig.logoSize) || 60

  return (
    <div className="qrcode-single">
      <div className="qrcode-single-main">
        <div className="qrcode-single-code" ref={containerRef}>
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
              height: logoSize,
              width: logoSize,
              excavate: qrConfig.logoExcavate ?? true,
            }}
          />
        </div>
        <div className="qrcode-single-infos">
          <div className="qrcode-single-title">{name || '未命名二维码'}</div>
          <div className="qrcode-single-desc">{content || '暂无内容'}</div>
          <div className="qrcode-single-time">{formatTime(updatedAt || createdAt)}更新</div>
        </div>
      </div>
      <div className="qrcode-single-tools">
        <div
          className="qrcode-single-tools-item"
          title="复制"
          onClick={() =>
            copyQrCode(qrCodeRef, name, 300, {
              title: name,
              titlePosition: 'bottom',
            })
          }
        >
          <i className="iconfont haha-fuzhi1"></i>
        </div>
        <div
          className="qrcode-single-tools-item"
          title="下载"
          onClick={() =>
            downloadQrCode?.(qrCodeRef, name, 300, {
              title: name,
              titlePosition: 'bottom',
            })
          }
        >
          <i className="iconfont haha-xiazai"></i>
        </div>
      </div>
    </div>
  )
}

export default QrCodeSingle
