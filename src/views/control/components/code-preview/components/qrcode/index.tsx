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
  /** 预览 */
  onPreview: () => void
  qrCode?: IQRCode
}

const QrCode: FC<IQrCodeProps> = ({ qrCode, onPreview }) => {
  const containerRef = useRef(null)
  const containerSize = useSize(containerRef)
  const qrCodeSize = Math.max(125, Number(containerSize?.width || '') - 14 * 2)

  const qrCodeRef = useRef(null)
  const { copyQrCode, downloadQrCode } = useQrCode()

  // const [logoBase64, setLogoBase64] = useState<string>()
  // useEffect(() => {
  //   imageToBase64(
  //     'https://appimg-drcn.dbankcdn.com/application/icon144/2918b1f593954efba781d54072bcfa75.png',
  //   ).then(setLogoBase64)
  // }, [])

  const { name, content, updatedAt = '', createdAt = '' } = qrCode || {}
  const { activeQrCode, setSetting } = useControlContext()
  const handleItemClick = () => {
    setSetting((prev) => {
      return {
        ...prev,
        activeQrCodeId: qrCode?.id,
      }
    })
  }

  return (
    <>
      <div
        className={`qrcode ${qrCode?.id === activeQrCode?.id ? 'active' : ''}`}
        ref={containerRef}
        onClick={() => handleItemClick()}
      >
        <div className="qrcode-content">
          {qrCodeSize && (
            <QRCodeSVG
              ref={qrCodeRef}
              value={content || ''}
              size={qrCodeSize}
              bgColor={'#ffffff'}
              fgColor={'#111111'}
              level={'H'}
              imageSettings={{
                src: LOGO_BASE64.haha || '',
                height: 35,
                width: 35,
                excavate: false,
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
          <div
            className="qrcode-tools-item"
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
            className="qrcode-tools-item"
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
    </>
  )
}

export default QrCode
