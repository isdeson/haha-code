import { Radio, RadioGroup } from '@douyinfe/semi-ui'
import QrCode from './components/qrcode'
import PreviewModal, { type IPreviewModalInstance } from './components/preview-modal/'
import { useRef } from 'react'
import { useControlContext } from '../../control-context'
import type { IQRCode } from '../../types'
import type { RadioChangeEvent } from '@douyinfe/semi-ui/lib/es/radio'
import QrCodeSingle from './components/qrcode-single'
import emptyImage from '@/assets/images/empty1.png'
import { useSyncScroll } from '../../use-sync-scroll'
import Empty from '@/components/empty'

import './index.scss'

const CodePreview: React.FC = () => {
  const { filteredCodeList, setting, setSetting, activeQrCode } = useControlContext()
  const { viewMode = 'single' } = setting

  const onViewModeRadioChange = (e: RadioChangeEvent) => {
    setSetting((prev) => {
      return { ...prev, viewMode: e.target.value }
    })
  }

  const previewModalInstance = useRef<IPreviewModalInstance>(null)
  /** 预览 */
  const handlePreview = (qrCode?: IQRCode) => {
    previewModalInstance.current?.show(qrCode as IQRCode)
  }

  const { qrCodeParentRef, qrCodeRefs } = useSyncScroll()

  return (
    <div className="code-preview">
      <div className="code-preview__header">
        <div className="code-preview__header-title">
          <span className="view-type">{setting.viewMode === 'single' ? '单码' : '多码'}预览</span>
          <span>
            共<span className="count">{filteredCodeList?.length}</span>个二维码
          </span>
        </div>
        <RadioGroup
          className="code-preview-mode-switch"
          type="button"
          value={setting.viewMode || 'single'}
          onChange={onViewModeRadioChange}
        >
          <Radio value={'single'}>单码</Radio>
          <Radio value={'multi'}>多码</Radio>
        </RadioGroup>
      </div>
      <div className="code-preview__content" ref={qrCodeParentRef}>
        {filteredCodeList?.length === 0 ? (
          <Empty
            text="暂无二维码，点击左侧区域选择需要预览的二维码"
            image={emptyImage}
            imageSize={150}
          />
        ) : (
          <>
            {/* 单码预览 */}
            {viewMode === 'single' && (
              <>
                {activeQrCode?.id && (
                  <div className="code-preview__single">
                    <QrCodeSingle />
                  </div>
                )}
              </>
            )}
            {/* 多码预览 */}
            {viewMode === 'multi' && (
              <div className="code-preview__multi">
                {filteredCodeList?.map((qrCode, qrCodeIndex) => {
                  const itemKey = qrCode.id || qrCodeIndex
                  return (
                    <div
                      key={itemKey}
                      // 为每个二维码元素绑定独立的ref
                      ref={(el) => {
                        qrCodeRefs.current[itemKey] = el
                      }}
                    >
                      <QrCode qrCode={qrCode} onPreview={() => handlePreview(qrCode)} />
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
      <PreviewModal ref={previewModalInstance} />
    </div>
  )
}

export default CodePreview
