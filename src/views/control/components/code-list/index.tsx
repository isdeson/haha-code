import { type FC, useState } from 'react'
import { useControlContext } from '../../control-context'
import { IconDeleteStroked, IconSearch, IconEditStroked } from '@douyinfe/semi-icons'
import { Modal, Tag, Input, Button, Checkbox } from '@douyinfe/semi-ui'
import type { IQRCode } from '../../types'
import { useSyncScroll } from '../../use-sync-scroll'
import Empty from '@/components/empty'
import { formatTime } from '../../utils'
import linePng from '@/assets/images/line.png'

import './index.scss'

const CodeList: FC = () => {
  const { codeList, setCodeList, filteredCodeList, setSetting, setting, activeQrCode, groupList } =
    useControlContext()

  const activeGroup = groupList?.find((g) => g.id === setting?.activeGroupId)

  const handleItemClick = (qrCode: IQRCode) => {
    if (batchMode) {
      toggleSelect(qrCode.id!)
      return
    }
    setSetting((prev) => ({
      ...prev,
      activeQrCodeId: qrCode.id,
    }))
  }

  const { qrCodeParentRef, qrCodeRefs } = useSyncScroll()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchDeleteVisible, setBatchDeleteVisible] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isAllSelected =
    filteredCodeList?.length > 0 && filteredCodeList.every((item) => selectedIds.has(item.id!))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredCodeList?.map((item) => item.id!)))
    }
  }

  const confirmBatchDelete = () => {
    const ids = selectedIds
    const newActiveId = filteredCodeList?.find((item) => !ids.has(item.id!))?.id
    setCodeList((prev) => (prev || []).filter((item) => !ids.has(item.id!)))
    if (activeQrCode?.id && ids.has(activeQrCode.id)) {
      setSetting((prev) => ({ ...prev, activeQrCodeId: newActiveId }))
    }
    setSelectedIds(new Set())
    setBatchDeleteVisible(false)
    setBatchMode(false)
  }

  const exitBatchMode = () => {
    setBatchMode(false)
    setSelectedIds(new Set())
  }

  const handleDelete = (e: React.MouseEvent<HTMLDivElement>, id?: string) => {
    e.stopPropagation()
    if (id) setDeleteId(id)
  }

  const confirmDelete = () => {
    if (!deleteId) return
    const newActiveId = filteredCodeList?.filter((item) => item.id !== deleteId)?.[0]?.id
    setCodeList((prev) => (prev || []).filter((item) => item.id !== deleteId))
    if (activeQrCode?.id === deleteId) {
      setSetting((prev) => ({
        ...prev,
        activeQrCodeId: newActiveId,
      }))
    }
    setDeleteId(null)
  }

  const handleDragStart = (e: React.DragEvent, qrCode: IQRCode) => {
    e.dataTransfer.setData('qrcode-id', qrCode.id || '')
    e.dataTransfer.effectAllowed = 'move'
    // 克隆元素作为拖拽预览，确保圆角生效
    const el = e.currentTarget as HTMLElement
    const clone = el.cloneNode(true) as HTMLElement
    const rect = el.getBoundingClientRect()
    clone.style.position = 'fixed'
    clone.style.top = '-9999px'
    clone.style.left = '-9999px'
    clone.style.width = rect.width + 'px'
    clone.style.borderRadius = '8px'
    clone.style.overflow = 'hidden'
    clone.style.backgroundColor = '#fff'
    clone.style.opacity = '0.95'
    document.body.appendChild(clone)
    e.dataTransfer.setDragImage(clone, rect.width / 2, rect.height / 2)
    requestAnimationFrame(() => document.body.removeChild(clone))
  }

  const getGroupName = (groupId?: string) => {
    if (!groupId) return null
    return groupList?.find((g) => g.id === groupId)?.name
  }

  return (
    <div className="code-list-container">
      <div className="code-list-title">
        <div className="code-list-title__left">
          <div className="code-list-title__text">
            {activeGroup?.name ? `「${activeGroup.name}」二维码` : '全部二维码'}
          </div>
          <img className="code-list-title__line" src={linePng} alt="" />
        </div>
        {!batchMode && (
          <IconEditStroked
            className="code-list-title__action"
            onClick={() => setBatchMode(true)}
          />
        )}
      </div>
      <Input
        className="code-list-search"
        prefix={<IconSearch />}
        showClear
        size="large"
        placeholder="输入关键词搜索二维码"
        onChange={(value) => setSetting((prev) => ({ ...prev, searchKeyWords: value }))}
        value={setting?.searchKeyWords}
      />
      <div className="code-list" ref={qrCodeParentRef}>
        {filteredCodeList?.length === 0 && (
          <Empty
            text={
              codeList.length === 0
                ? '暂无二维码，点击底部"+"添加一个吧'
                : setting?.searchKeyWords?.trim()
                  ? '没找到相关二维码，换个关键词试试吧'
                  : setting?.activeGroupId
                    ? '该分组暂无二维码，拖拽二维码到分组即可添加'
                    : '暂无二维码，点击底部"+"添加一个吧'
            }
          />
        )}
        {filteredCodeList?.length > 0 &&
          filteredCodeList.map((item, itemIndex) => {
            const itemKey = item.id || itemIndex
            const groupName = getGroupName(item.groupId)
            return (
              <div
                className={`code-list-item ${item.id === activeQrCode?.id ? 'code-list-item-active' : ''}`}
                key={item.id}
                onClick={() => handleItemClick(item)}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                ref={(el) => {
                  qrCodeRefs.current[itemKey] = el
                }}
              >
                {batchMode && (
                  <Checkbox
                    className="code-list-item__checkbox"
                    checked={selectedIds.has(item.id!)}
                    onChange={() => toggleSelect(item.id!)}
                  />
                )}
                {groupName && !setting?.activeGroupId && !batchMode && (
                  <Tag
                    className="code-list-item__group-tag"
                    size="small"
                    type="ghost"
                  >
                    {groupName.slice(0, 2)}
                  </Tag>
                )}
                <div
                  className="code-list-item__content"
                  style={batchMode ? { paddingLeft: 34 } : undefined}
                >
                  <div className="code-list-item__name overflow-ellipsis">
                    {item.name || '未命名二维码'}
                  </div>
                  <div className="code-list-item__meta">
                    <span className="code-list-item__time">
                      {formatTime(item.updatedAt || item.createdAt || '')}更新
                    </span>
                  </div>
                </div>
                {!batchMode && (
                  <div className="code-list-item__actions" onClick={(e) => handleDelete(e, item.id)}>
                    <IconDeleteStroked />
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {/* 删除二维码确认弹窗 */}
      <Modal
        title="删除二维码"
        visible={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        centered
        footer={
          <div className="group-modal__footer-split">
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              onClick={() => setDeleteId(null)}
            >
              取消
            </Button>
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              theme="solid"
              type="danger"
              onClick={confirmDelete}
            >
              确认删除
            </Button>
          </div>
        }
      >
        <div className="group-modal">
          <p style={{ fontSize: 14, color: 'var(--semi-color-text-1)', textAlign: 'center' }}>
            删除后无法恢复，确定要删除该二维码吗？
          </p>
        </div>
      </Modal>

      {/* 批量操作栏 */}
      {batchMode && filteredCodeList?.length > 0 && (
        <div className="code-list-batch-bar">
          <div className="code-list-batch-bar__left">
            <Checkbox checked={isAllSelected} onChange={toggleSelectAll}>
              全选
            </Checkbox>
            <span className="code-list-batch-bar__cancel" onClick={exitBatchMode}>
              取消
            </span>
          </div>
          <Button
            size="small"
            type="danger"
            theme="solid"
            disabled={selectedIds.size === 0}
            onClick={() => setBatchDeleteVisible(true)}
          >
            删除({selectedIds.size})
          </Button>
        </div>
      )}

      {/* 批量删除确认弹窗 */}
      <Modal
        title="批量删除二维码"
        visible={batchDeleteVisible}
        onCancel={() => setBatchDeleteVisible(false)}
        centered
        footer={
          <div className="group-modal__footer-split">
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              onClick={() => setBatchDeleteVisible(false)}
            >
              取消
            </Button>
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              theme="solid"
              type="danger"
              onClick={confirmBatchDelete}
            >
              确认删除
            </Button>
          </div>
        }
      >
        <div className="group-modal">
          <p style={{ fontSize: 14, color: 'var(--semi-color-text-1)', textAlign: 'center' }}>
            确定要删除选中的 {selectedIds.size} 个二维码吗？删除后无法恢复。
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default CodeList
