import { Modal } from '@douyinfe/semi-ui'
import { QRCodeSVG } from 'qrcode.react'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { ForwardedRef } from 'react'
import { LOGO_BASE64 } from '../../../../constants'
import useQrCode from '../../use-qrcode'
import type { IQRCode } from '@/views/control/types'
import { formatTime } from '@/views/control/utils'

import './index.scss'

export interface IPreviewModalInstance {
  show: (qrCode?: IQRCode) => void
}

const PreviewModal = forwardRef<IPreviewModalInstance>(
  (_props, ref: ForwardedRef<IPreviewModalInstance>) => {
    const [visible, setVisible] = useState(false)
    const qrCodeRef = useRef(null)
    const { copyQrCode, downloadQrCode } = useQrCode()

    const [qrCode, setQrCode] = useState<IQRCode>()
    const { name, content, updatedAt = '', createdAt = '' } = qrCode || {}

    const show = (qrCode?: IQRCode) => {
      setQrCode(qrCode)
      setVisible(true)
    }

    const hide = () => {
      setQrCode(undefined)
      setVisible(false)
    }

    useImperativeHandle(ref, () => ({
      show,
      hide,
    }))

    return (
      <Modal
        title="二维码预览"
        visible={visible}
        centered
        footer={false}
        onCancel={hide}
        width={800}
      >
        <div className="preview-modal">
          <div className="preview-modal-code">
            <QRCodeSVG
              ref={qrCodeRef}
              value={content || ''}
              size={350}
              bgColor={'#ffffff'}
              fgColor={'#111111'}
              level={'H'}
              imageSettings={{
                src: LOGO_BASE64.haha || '',
                height: 60,
                width: 60,
                excavate: false,
              }}
            />
          </div>
          <div className="preview-modal-info">
            <div className="qrcode-info">
              <div className="qrcode-title">{name || '未命名二维码'}</div>
              <div className="qrcode-desc">{content || '暂无内容'}</div>
              <div className="qrcode-time">{formatTime(updatedAt || createdAt)}更新</div>
            </div>
            <div className="qrcode-tools">
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
        </div>
      </Modal>
    )
  },
)

PreviewModal.displayName = 'PreviewModal'
export default PreviewModal
