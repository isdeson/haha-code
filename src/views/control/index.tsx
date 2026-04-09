import React from 'react'
import { Button } from '@douyinfe/semi-ui'
import { IconPlusStroked, IconSync, IconUndo } from '@douyinfe/semi-icons'
import { ControlProvider, useControlContext } from './control-context'
import CodeList from './components/code-list'
import CodeSetting from './components/code-setting'
import logo from '@/assets/images/logo-text.png'
import { IconDoubleChevronLeft, IconDoubleChevronRight } from '@douyinfe/semi-icons'
import CodePreview from './components/code-preview'
import GroupSidebar from './components/group-sidebar'
import { generateUUID } from './utils'
import dayjs from 'dayjs'
import Guide from './components/guide'
import Changelog from '@/components/changelog'

import './index.scss'

const ControlContent: React.FC = () => {
  const { setCodeList, setting, setSetting, activeQrCode, importOldDatas } = useControlContext()
  const { isFold } = setting || {}

  const handleFold = () => {
    setSetting((prev) => ({
      ...prev,
      isFold: !(prev || {}).isFold,
    }))
  }

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
      <div className="code-list-wrapper">
        <CodeList />
        <Button
          className="add-code-button"
          theme="solid"
          type="primary"
          size="large"
          block
          icon={<IconPlusStroked />}
          onClick={handleAddCode}
          title="添加二维码"
        />
      </div>
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
