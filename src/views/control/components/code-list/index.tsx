import { type FC } from 'react'
import { useControlContext } from '../../control-context'
import { IconDeleteStroked } from '@douyinfe/semi-icons'
import { Modal } from '@douyinfe/semi-ui'
import type { IQRCode } from '../../types'
import { useSyncScroll } from '../../use-sync-scroll'
import Empty from '@/components/empty'
import { formatTime } from '../../utils'

import './index.scss'

const CodeList: FC = () => {
  const { codeList, setCodeList, filteredCodeList, setSetting, activeQrCode } = useControlContext()

  const handleItemClick = (qrCode: IQRCode) => {
    setSetting((prev) => {
      return {
        ...prev,
        activeQrCodeId: qrCode.id,
      }
    })
  }

  const { qrCodeParentRef, qrCodeRefs } = useSyncScroll()

  const handleDelete = async (e: React.MouseEvent<HTMLDivElement>, id?: string) => {
    e.stopPropagation()
    Modal.confirm({
      title: '确定要删除该二维码吗？',
      content: '删除后无法恢复，请谨慎操作',
      centered: true,
      onOk: () => {
        const newActiveId = filteredCodeList?.filter((item) => item.id !== id)?.[0]?.id
        setCodeList((prev) => (prev || []).filter((item) => item.id !== id))
        if (activeQrCode?.id === id) {
          setSetting((prev) => {
            return {
              ...prev,
              activeQrCodeId: newActiveId,
            }
          })
        }
      },
    })
  }

  return (
    <div className="code-list" ref={qrCodeParentRef}>
      {filteredCodeList?.length === 0 && (
        <Empty
          text={
            codeList.length === 0
              ? '暂无二维码，点击左下角“+”添加一个吧'
              : '没找到相关二维码，换个关键词试试吧'
          }
        />
      )}
      {filteredCodeList?.length > 0 &&
        filteredCodeList.map((item, itemIndex) => {
          const itemKey = item.id || itemIndex
          return (
            <div
              className={`code-list-item ${item.id === activeQrCode?.id ? 'code-list-item-active' : ''}`}
              key={item.id}
              onClick={() => handleItemClick(item)}
              // 为每个二维码元素绑定独立的ref
              ref={(el) => {
                qrCodeRefs.current[itemKey] = el
              }}
            >
              <div className="code-list-item__content">
                <div className="code-list-item__name overflow-ellipsis">
                  {item.name || '未命名二维码'}
                </div>
                <div className="code-list-item__time">
                  {formatTime(item.updatedAt || item.createdAt || '')}更新
                </div>
              </div>
              <div className="code-list-item__actions" onClick={(e) => handleDelete(e, item.id)}>
                <IconDeleteStroked />
              </div>
            </div>
          )
        })}
    </div>
  )
}

export default CodeList
