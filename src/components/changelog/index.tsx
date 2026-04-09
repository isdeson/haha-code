import { useMemo } from 'react'
import { Modal, Button } from '@douyinfe/semi-ui'
import { useLocalStorageState } from 'ahooks'
import appSetting from '@configs'

import './index.scss'

const STORAGE_KEY = 'haha-qr-code-changelog-version'

const Changelog = () => {
  const latestLog = useMemo(() => appSetting.changelog?.[0], [])

  const [readVersion, setReadVersion] = useLocalStorageState<string>(STORAGE_KEY, {
    defaultValue: '',
  })

  const visible = !!latestLog && readVersion !== latestLog.version

  const handleClose = () => {
    if (latestLog) setReadVersion(latestLog.version)
  }

  if (!latestLog) return null

  return (
    <Modal
      className="changelog-modal"
      centered
      header={null}
      visible={visible}
      footer={false}
      closeOnEsc
      onCancel={handleClose}
      maskClosable
    >
      <div className="changelog-modal-content">
        <div className="changelog-gradient-top" />
        <h1>{latestLog.title}</h1>
        <span className="changelog-date">{latestLog.date}</span>
        <ul className="changelog-features">
          {latestLog.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <div className="footer-buttons">
          <Button block theme="solid" size="large" type="primary" onClick={handleClose}>
            立即体验
          </Button>
          <Button block theme="borderless" size="large" type="primary" onClick={handleClose}>
            知道了
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default Changelog
