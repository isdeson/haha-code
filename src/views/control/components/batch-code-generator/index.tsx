import React, { useRef, useState, useCallback } from 'react'
import { Button, Modal, TextArea, Toast } from '@douyinfe/semi-ui'
import {
  IconPlusStroked,
  IconDeleteStroked,
  IconCopyStroked,
  IconDownloadStroked,
  IconReplyStroked,
  IconLanguage,
} from '@douyinfe/semi-icons'
import { useControlContext } from '../../control-context'
import { generateUUID } from '../../utils'
import dayjs from 'dayjs'
import { QRCodeSVG } from 'qrcode.react'
import { LOGO_BASE64 } from '@/views/control/constants'
import PreviewModal, { type IPreviewModalInstance } from '../code-preview/components/preview-modal/'
import useQrCode from '../code-preview/use-qrcode'
import type { IQRCode } from '../../types'

import './index.scss'
import Empty from '@/components/empty'
import emptyImage from '@/assets/images/empty.png'

/**
 * 可编辑单元格组件
 * 使用 contentEditable div 实现自动换行的文本编辑
 */
const EditableCell: React.FC<{
  value: string
  placeholder: string
  onChange: (value: string) => void
}> = ({ value, placeholder, onChange }) => {
  const divRef = useRef<HTMLDivElement>(null)

  /** 处理输入事件，同步文本内容到外部状态 */
  const handleInput = useCallback(() => {
    if (divRef.current) {
      const text = divRef.current.innerText || ''
      onChange(text)
    }
  }, [onChange])

  /** 处理粘贴事件，只保留纯文本 */
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }, [])

  return (
    <div
      ref={divRef}
      className="editable-cell"
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      data-placeholder={placeholder}
    >
      {value}
    </div>
  )
}

/**
 * 批量生码组件
 * Excel风格的编辑界面，实时保存到二维码列表，退出仅关闭视图
 */
const BatchCodeGenerator: React.FC = () => {
  const { codeList, setCodeList, setting, setSetting, groupList } = useControlContext()

  const batchGroupId = setting?.batchGroupId
  const batchGroup = groupList?.find((g) => g.id === batchGroupId)
  // 通过 setting.batchModeType 区分新建或编辑已有分组
  const isNewBatchGroup = setting?.batchModeType === 'add'
  const titleText = isNewBatchGroup
    ? batchGroup?.name || '批量生码'
    : `批量编辑${batchGroup?.name ? ` - ${batchGroup.name}` : ''}`
  // 二维码放大预览弹窗引用
  const previewModalInstance = useRef<IPreviewModalInstance>(null)
  // 每行二维码 SVG 的 ref
  const qrRefMap = useRef<Map<string, { current: SVGSVGElement | null }>>(new Map())
  const { downloadQrCode, copyQrCode } = useQrCode()

  // 文本解析弹窗状态
  const [parseTextVisible, setParseTextVisible] = useState(false)
  const [parseTextValue, setParseTextValue] = useState('')

  // 获取当前批量分组中的二维码
  const batchQRCodeList = batchGroupId
    ? codeList.filter((item) => item.groupId === batchGroupId)
    : []

  /** 获取或创建某行的二维码 ref */
  const getQrRef = (id: string) => {
    if (!qrRefMap.current.has(id)) {
      qrRefMap.current.set(id, { current: null })
    }
    return qrRefMap.current.get(id)!
  }

  /**
   * 处理添加新行
   * 实时创建二维码到批量分组
   */
  const handleAddRow = () => {
    if (!batchGroupId) return

    const newQRCode: IQRCode = {
      id: generateUUID(),
      name: '',
      content: '',
      groupId: batchGroupId,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    setCodeList((prev) => [newQRCode, ...(prev || [])])
  }

  /**
   * 处理删除行
   * 实时从二维码列表删除
   */
  const handleDeleteRow = (id: string) => {
    setCodeList((prev) => (prev || []).filter((item) => item.id !== id))
  }

  /**
   * 更新行数据
   * 实时同步到二维码列表
   */
  const handleUpdateRow = (id: string, field: 'name' | 'content', value: string) => {
    setCodeList((prev) =>
      (prev || []).map((item) =>
        item.id === id
          ? { ...item, [field]: value, updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') }
          : item,
      ),
    )
  }

  /**
   * 处理二维码点击预览
   */
  const handlePreviewQRCode = (qrCode: IQRCode) => {
    previewModalInstance.current?.show(qrCode)
  }

  /**
   * 复制二维码图片到剪切板
   */
  const handleCopyQR = (item: IQRCode) => {
    const ref = getQrRef(item.id!)
    if (!ref.current) {
      Toast.error('二维码未就绪')
      return
    }
    copyQrCode(ref, item.name || 'qrcode', 300, {
      title: item.name || undefined,
      titlePosition: 'bottom',
    })
  }

  /**
   * 下载二维码图片
   */
  const handleDownloadQR = (item: IQRCode) => {
    const ref = getQrRef(item.id!)
    if (!ref.current) {
      Toast.error('二维码未就绪')
      return
    }
    downloadQrCode(ref, item.name || 'qrcode', 300, {
      title: item.name || undefined,
      titlePosition: 'bottom',
    })
  }

  /**
   * 退出批量生码模式
   * 仅关闭视图，数据已实时保存
   */
  const handleExitBatchMode = () => {
    // 切换到批量分组并退出批量模式
    setSetting((prev) => ({
      ...prev,
      activeGroupId: batchGroupId || prev?.activeGroupId,
      isBatchMode: false,
      batchGroupId: undefined,
      batchModeType: undefined,
      activeQrCodeId: batchQRCodeList[0]?.id || prev?.activeQrCodeId,
    }))
  }

  /**
   * 解析多行文本，批量生成二维码
   * 每行文本作为一个二维码的内容，自动截取前20字符作为名称
   */
  const handleParseText = () => {
    if (!batchGroupId) return
    const lines = parseTextValue
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
    if (lines.length === 0) {
      Toast.warning('请输入至少一行内容')
      return
    }
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const newCodes: IQRCode[] = lines.map((line) => ({
      id: generateUUID(),
      name: line.length > 20 ? line.slice(0, 20) + '...' : line,
      content: line,
      groupId: batchGroupId,
      createdAt: now,
      updatedAt: now,
    }))
    setCodeList((prev) => [...newCodes, ...(prev || [])])
    setParseTextVisible(false)
    setParseTextValue('')
    Toast.success(`已生成 ${newCodes.length} 个二维码`)
  }

  return (
    <div className="batch-code-generator">
      {/* 标题栏 - 与外部样式保持一致 */}
      <div className="batch-generator-title-bar">
        <div className="batch-generator-title-left">
          <Button
            icon={<IconReplyStroked />}
            onClick={handleExitBatchMode}
            className="batch-generator-action-exit"
          />
          <div className="batch-generator-title-info">
            <div className="batch-generator-title-text">{titleText}</div>
            {/* <img className="batch-generator-title-line" src={linePng} alt="" /> */}
          </div>
        </div>
        <div className="batch-generator-title-actions">
          <Button
            type="primary"
            icon={<IconLanguage />}
            onClick={() => setParseTextVisible(true)}
            size="large"
            className="batch-generator-action-parse"
          >
            文本解析生码
          </Button>
          <Button
            theme="solid"
            type="primary"
            icon={<IconPlusStroked />}
            onClick={handleAddRow}
            size="large"
          >
            添加行
          </Button>
        </div>
      </div>

      {/* Excel风格编辑区 */}
      <div className="batch-generator-excel-container">
        {/* 表头 */}
        <div className="batch-generator-excel-header">
          <div className="excel-col excel-col-index">序号</div>
          <div className="excel-col excel-col-name">名称</div>
          <div className="excel-col excel-col-content">内容</div>
          <div className="excel-col excel-col-preview">预览</div>
          <div className="excel-col excel-col-action">操作</div>
        </div>

        {/* 表格内容 - 可滚动区域 */}
        <div className="batch-generator-excel-body">
          {batchQRCodeList.length === 0 && (
            <div className="batch-generator-empty">
              <Empty text="暂无数据，点击「添加行」进行新增" image={emptyImage} imageSize={130} />
            </div>
          )}

          {batchQRCodeList.map((item: IQRCode, index: number) => (
            <div key={item.id} className="batch-generator-excel-row">
              <div className="excel-cell excel-cell-index">{index + 1}</div>
              <div className="excel-cell excel-cell-preview">
                {item.content ? (
                  <div
                    className="batch-generator-qrcode-large"
                    onClick={() => handlePreviewQRCode(item)}
                    title="点击放大查看"
                  >
                    <QRCodeSVG
                      ref={(el) => {
                        getQrRef(item.id!).current = el
                      }}
                      value={item.content}
                      size={150}
                      bgColor="#ffffff"
                      fgColor="#111111"
                      level="H"
                      imageSettings={{
                        src: LOGO_BASE64.haha || '',
                        height: 24,
                        width: 24,
                        excavate: true,
                      }}
                    />
                  </div>
                ) : (
                  <div className="batch-generator-qrcode-empty">编辑后生成预览</div>
                )}
              </div>
              <div className="excel-cell excel-cell-name">
                <EditableCell
                  value={item.name || ''}
                  placeholder="输入名称"
                  onChange={(value) => handleUpdateRow(item.id!, 'name', value)}
                />
              </div>
              <div className="excel-cell excel-cell-content">
                <EditableCell
                  value={item.content || ''}
                  placeholder="输入内容（URL或文本）"
                  onChange={(value) => handleUpdateRow(item.id!, 'content', value)}
                />
              </div>
              <div className="excel-cell excel-cell-action">
                <Button
                  theme="borderless"
                  icon={<IconCopyStroked />}
                  onClick={() => handleCopyQR(item)}
                  title="复制二维码"
                  size="small"
                />
                <Button
                  theme="borderless"
                  icon={<IconDownloadStroked />}
                  onClick={() => handleDownloadQR(item)}
                  title="下载二维码"
                  size="small"
                />
                <Button
                  theme="borderless"
                  icon={<IconDeleteStroked />}
                  onClick={() => handleDeleteRow(item.id!)}
                  title="删除"
                  size="small"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部提示 */}
      {batchQRCodeList.length > 0 && (
        <div className="batch-generator-footer">
          <span className="batch-generator-count">共 {batchQRCodeList.length} 行</span>
        </div>
      )}

      {/* 二维码预览弹窗 */}
      <PreviewModal ref={previewModalInstance} />

      {/* 文本解析弹窗 - 粘贴多行文本批量生成二维码 */}
      <Modal
        title="文本解析生码"
        visible={parseTextVisible}
        onCancel={() => {
          setParseTextVisible(false)
          setParseTextValue('')
        }}
        centered
        width={500}
        footer={
          <div className="group-modal__footer-split">
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              onClick={() => {
                setParseTextVisible(false)
                setParseTextValue('')
              }}
            >
              取消
            </Button>
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              theme="solid"
              type="primary"
              onClick={handleParseText}
            >
              立即生成 {parseTextValue.split('\n').filter((l) => l.trim()).length} 个二维码
            </Button>
          </div>
        }
      >
        <div className="batch-parse-text-modal">
          <TextArea
            placeholder={
              '每行一个二维码内容，支持 URL 或纯文本，空行将被自动忽略\nhttps://example.com/page1\nhttps://example.com/page2\nhttps://example.com/page3'
            }
            value={parseTextValue}
            onChange={setParseTextValue}
            autosize={{ minRows: 8, maxRows: 16 }}
          />
        </div>
      </Modal>
    </div>
  )
}

export default BatchCodeGenerator
