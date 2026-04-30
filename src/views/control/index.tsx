import React from 'react'
import { Button } from '@douyinfe/semi-ui'
import { IconPlusStroked, IconSync, IconUndo, IconGridStroked } from '@douyinfe/semi-icons'
import { ControlProvider, useControlContext } from './control-context'
import CodeList from './components/code-list'
import CodeSetting from './components/code-setting'
import logo from '@/assets/images/logo-text.png'
import { IconDoubleChevronLeft, IconDoubleChevronRight } from '@douyinfe/semi-icons'
import CodePreview from './components/code-preview'
import GroupSidebar from './components/group-sidebar'
import BatchCodeGenerator from './components/batch-code-generator'
import { generateUUID } from './utils'
import dayjs from 'dayjs'
import Guide from './components/guide'
import Changelog from '@/components/changelog'

import './index.scss'

const ControlContent: React.FC = () => {
  const { setCodeList, setGroupList, setting, setSetting, activeQrCode, importOldDatas } = useControlContext()
  const { isFold, isBatchMode } = setting || {}

  const handleFold = () => {
    setSetting((prev) => ({
      ...prev,
      isFold: !(prev || {}).isFold,
    }))
  }

  /**
   * 添加单个二维码
   */
  const handleAddCode = () => {
    const newCode = {
      id: generateUUID(),
      name: '',
      content: '',
      groupId: setting?.activeGroupId || undefined,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    setCodeList((prev) => [newCode, ...(prev || [])])
    setSetting((prev) => ({
      ...prev,
      activeQrCodeId: newCode.id,
      searchKeyWords: '',
    }))
    const qrCodeParent = document.querySelector('.code-list')
    qrCodeParent?.scrollTo({ top: 0 })
  }

  /**
   * 进入批量生码模式
   * 全部分组时新建分组，选中分组时直接编辑当前分组
   */
  const handleEnterBatchMode = () => {
    const currentGroupId = setting?.activeGroupId

    if (currentGroupId) {
      // 已选中分组，直接编辑当前分组
      setSetting((prev) => ({
        ...prev,
        isBatchMode: true,
        batchGroupId: currentGroupId,
        batchModeType: 'edit',
      }))
    } else {
      // 全部分组，新建分组
      const newGroupId = generateUUID()
      const batchGroupName = `批量生码 ${dayjs().format('MM-DD')}`

      setGroupList((prev) => [
        ...(prev || []),
        {
          id: newGroupId,
          name: batchGroupName,
          color: '#3370ff',
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        },
      ])

      setCodeList((prev) => [
        ...(prev || []),
        {
          id: generateUUID(),
          name: '',
          content: '',
          groupId: newGroupId,
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        },
      ])

      setSetting((prev) => ({
        ...prev,
        activeGroupId: newGroupId,
        isBatchMode: true,
        batchGroupId: newGroupId,
        batchModeType: 'add',
      }))
    }
  }

  return (
    <div className="control-container">
      <div className="setting-wrapper">
        <div className="app-logo">
          <img src={logo} alt="app-logo" />
        </div>
        <div className="app-settings">
          <div className="app-settings-tool-buttons">
            <Button
              className="back-old-version-button"
              size="large"
              block
              type="tertiary"
              icon={<IconUndo />}
              onClick={() => (window.location.href = 'https://isdeson.github.io/easy-code/')}
              title="回到旧版"
            />
            <Button
              className="import-code-button"
              size="large"
              block
              type="tertiary"
              icon={<IconSync />}
              onClick={importOldDatas}
              title="导入旧版数据"
            />
          </div>
        </div>
      </div>
      <GroupSidebar />
      <div className={`code-list-wrapper ${isBatchMode ? 'code-list-wrapper--batch-mode' : ''}`}>
        {isBatchMode ? (
          <BatchCodeGenerator />
        ) : (
          <>
            <CodeList />
            <div className="add-code-buttons">
              <Button
                className="add-code-button"
                theme="solid"
                type="primary"
                size="large"
                block
                icon={<IconPlusStroked />}
                onClick={handleAddCode}
                title="添加二维码"
              >
                添加二维码
              </Button>
              <Button
                className="batch-code-button"
                theme="solid"
                type="secondary"
                size="large"
                block
                icon={<IconGridStroked />}
                onClick={handleEnterBatchMode}
                title="批量生/编码"
              >
                {setting?.activeGroupId ? '批量编辑' : '批量生码'}
              </Button>
            </div>
          </>
        )}
      </div>
      {/* 非批量模式下显示二维码配置和预览 */}
      {!isBatchMode && (
        <>
          {activeQrCode?.id && (
            <div className={`code-setting-wrapper ${isFold ? 'code-setting-wrapper__fold' : ''}`}>
              <div className="fold-button" onClick={handleFold}>
                {!isFold ? <IconDoubleChevronLeft /> : <IconDoubleChevronRight />}
              </div>
              <CodeSetting />
            </div>
          )}
          <div className="code-preview-wrapper">
            <CodePreview />
          </div>
        </>
      )}

    </div>
  )
}

const Control: React.FC = () => {
  return (
    <ControlProvider>
      <ControlContent />
      <Guide />
      <Changelog />
    </ControlProvider>
  )
}

export default Control
