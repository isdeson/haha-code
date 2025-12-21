import React from 'react'
import { Button, Input } from '@douyinfe/semi-ui'
import { IconDownload, IconPlusStroked, IconSearch } from '@douyinfe/semi-icons'
import { ControlProvider, useControlContext } from './control-context'
import CodeList from './components/code-list'
import CodeSetting from './components/code-setting'
import logo from '@/assets/images/logo.png'
import { IconDoubleChevronLeft, IconDoubleChevronRight } from '@douyinfe/semi-icons'
import CodePreview from './components/code-preview'
import { generateUUID } from './utils'
import dayjs from 'dayjs'
import Guide from './components/guide'

import './index.scss'

const ControlContent: React.FC = () => {
  const { setCodeList, setting, setSetting, activeQrCode, importOldDatas } = useControlContext()
  const { isFold, searchKeyWords } = setting || {}
  const handleFold = () => {
    setSetting((prev) => {
      return {
        ...prev,
        isFold: !(prev || {}).isFold,
      }
    })
  }

  const handleSearch = (value: string) => {
    setSetting((prev) => {
      return {
        ...prev,
        searchKeyWords: value.trim(),
      }
    })
  }

  const handleAddCode = () => {
    const newCode = {
      id: generateUUID(),
      name: '',
      content: '',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    setCodeList((prev) => {
      return [newCode, ...(prev || [])]
    })
    setSetting((prev) => {
      return {
        ...prev,
        activeQrCodeId: newCode.id,
      }
    })
    // 滚动列表到顶部
    const qrCodeParent = document.querySelector('.code-list')
    qrCodeParent?.scrollTo({
      top: 0,
      // behavior: 'smooth',
    })
  }

  return (
    <div className="control-container">
      <div className="setting-wrapper">
        <div className="app-logo">
          <img src={logo} alt="app-logo" />
        </div>
        <div className="app-settings">
          <Button
            className="import-code-button"
            size="large"
            block
            icon={<IconDownload size="large" />}
            onClick={importOldDatas}
          />
          <Button
            className="add-code-button"
            theme="solid"
            type="primary"
            size="large"
            block
            icon={<IconPlusStroked />}
            onClick={handleAddCode}
          />
        </div>
      </div>
      <div className="code-list-wrapper">
        <Input
          className="searcher-input"
          prefix={<IconSearch />}
          showClear
          size="large"
          placeholder="输入关键词搜索二维码"
          onChange={(value) => handleSearch(value)}
          value={searchKeyWords}
        />
        <CodeList />
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
    </ControlProvider>
  )
}

export default Control
