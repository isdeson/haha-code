import { Form } from '@douyinfe/semi-ui'
import { useControlContext } from '../../control-context'
import type { IQRCode } from '../../types'
import dayjs from 'dayjs'

import './index.scss'
import { useEffect, useRef } from 'react'

const CodeSetting: React.FC = () => {
  const { setting, activeQrCode, setCodeList } = useControlContext()
  const { activeQrCodeId } = setting || {}

  const handleFormValueChange = (value: IQRCode) => {
    setCodeList((prev) => {
      return (prev || [])?.map((item) => {
        if (item.id === activeQrCodeId) {
          item.name = value.name
          item.content = value.content
          item.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
        return item
      })
    })
  }

  const formRef = useRef<Form>(null)
  useEffect(() => {
    const currentForm = formRef.current
    if (currentForm && activeQrCode?.id) {
      currentForm?.formApi.setValues({ ...activeQrCode })
    }
  }, [activeQrCode])

  return (
    <div className="code-setting">
      <div className="module-title">
        <div className="module-title-text">二维码配置</div>
      </div>
      <Form className="code-setting-form" ref={formRef} onValueChange={handleFormValueChange}>
        <Form.TextArea
          className="form-item"
          autosize
          rows={2}
          label="二维码名称"
          field="name"
          placeholder="请输入"
        />
        <Form.TextArea
          className="form-item"
          autosize
          rows={8}
          label="二维码内容"
          field="content"
          placeholder="请输入"
        />
      </Form>
    </div>
  )
}

export default CodeSetting
