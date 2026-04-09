import {
  Form,
  Select,
  Collapsible,
  Tag,
  Input,
  Modal,
  Toast,
  Switch,
  Radio,
  RadioGroup,
  Button,
} from '@douyinfe/semi-ui'
import {
  IconCopy,
  IconChevronDown,
  IconChevronUp,
  IconUndo,
  IconSync,
  IconClose,
  IconPlusStroked,
} from '@douyinfe/semi-icons'
import { useControlContext } from '../../control-context'
import type { IQRCode, IQRCodeConfig } from '../../types'
import dayjs from 'dayjs'
import linePng from '@/assets/images/line.png'
import defaultLogoPng from '@/assets/images/logo.png'
import './index.scss'
import { useEffect, useRef, useState, useMemo } from 'react'

const parseUrlBase = (url: string) => {
  try {
    const u = new URL(url)
    const isHash = u.hash.includes('?') || u.hash.includes('/')
    let pathname = u.pathname
    if (isHash) {
      const h = u.hash.slice(1)
      const q = h.indexOf('?')
      pathname = q >= 0 ? h.slice(0, q) : h
    }
    return {
      protocol: u.protocol.replace(':', ''),
      hostname: u.hostname,
      port: u.port,
      pathname,
      isHash,
      valid: true,
    }
  } catch {
    return { protocol: '', hostname: '', port: '', pathname: '', isHash: false, valid: false }
  }
}

const extractParams = (url: string): [string, string, boolean][] => {
  try {
    const u = new URL(url)
    const isHash = u.hash.includes('?') || u.hash.includes('/')
    let search = u.search
    if (isHash) {
      const h = u.hash.slice(1)
      const q = h.indexOf('?')
      search = q >= 0 ? h.slice(q) : ''
    }
    const entries: [string, string, boolean][] = []
    new URLSearchParams(search).forEach((v, k) => entries.push([k, v, true]))
    return entries
  } catch {
    return []
  }
}

const buildUrl = (
  protocol: string,
  hostname: string,
  port: string,
  pathname: string,
  params: [string, string, boolean][],
  isHash: boolean,
) => {
  const origin = `${protocol}://${hostname}${port ? ':' + port : ''}`
  const enabled = params.filter(([k, , e]) => e && k)
  const qs =
    enabled.length > 0 ? '?' + enabled.map(([k, v]) => (v ? `${k}=${v}` : k)).join('&') : ''
  return isHash ? `${origin}/#${pathname}${qs}` : `${origin}${pathname}${qs}`
}

const LEVEL_OPTIONS = ['L', 'M', 'Q', 'H']
const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss')

const CodeSetting: React.FC = () => {
  const { setting, activeQrCode, setCodeList, groupList, quickParams, setQuickParams } =
    useControlContext()
  const { activeQrCodeId } = setting || {}
  const [urlParamsOpen, setUrlParamsOpen] = useState(true)
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<Form>(null)
  const [addQuickParamVisible, setAddQuickParamVisible] = useState(false)
  const [newQuickKey, setNewQuickKey] = useState('')
  const [newQuickVal, setNewQuickVal] = useState('')
  const [deleteQuickParamIndex, setDeleteQuickParamIndex] = useState<number | null>(null)

  const content = activeQrCode?.content || ''
  const qrConfig = activeQrCode?.qrConfig || {}
  const parsed = useMemo(() => parseUrlBase(content), [content])

  // 直接从 activeQrCode 读取，没有则从 URL 提取
  const urlParams: [string, string, boolean][] =
    activeQrCode?.urlParams ?? (parsed.valid ? extractParams(content) : [])

  useEffect(() => {
    if (formRef.current && activeQrCode?.id) {
      formRef.current.formApi.setValues({ ...activeQrCode })
    }
  }, [activeQrCodeId])

  const isInternalUpdate = useRef(false)

  const updateQrCode = (updates: Partial<IQRCode>) => {
    isInternalUpdate.current = true
    setCodeList((prev) =>
      (prev || []).map((item) =>
        item.id === activeQrCodeId ? { ...item, ...updates, updatedAt: now() } : item,
      ),
    )
    if (updates.content !== undefined && formRef.current) {
      const cur = formRef.current.formApi.getValue('content')
      if (cur !== updates.content) formRef.current.formApi.setValue('content', updates.content)
    }
    setTimeout(() => {
      isInternalUpdate.current = false
    }, 0)
  }

  const rebuildAndSync = (
    base: Partial<ReturnType<typeof parseUrlBase>> = {},
    params?: [string, string, boolean][],
  ) => {
    const p = { ...parsed, ...base }
    const ps = params ?? urlParams
    updateQrCode({
      content: buildUrl(p.protocol, p.hostname, p.port, p.pathname, ps, p.isHash),
      urlParams: ps,
    })
  }

  const handleFormValueChange = (value: IQRCode) => {
    if (isInternalUpdate.current) return
    setCodeList((prev) =>
      (prev || []).map((item) =>
        item.id === activeQrCodeId
          ? { ...item, name: value.name, content: value.content, updatedAt: now() }
          : item,
      ),
    )
  }

  const handleConfigChange = (
    key: keyof IQRCodeConfig,
    value: string | number | boolean | undefined,
  ) => {
    updateQrCode({ qrConfig: { ...activeQrCode?.qrConfig, [key]: value } })
  }

  const handleParamChange = (index: number, field: 0 | 1, value: string) => {
    const newParams = urlParams.map((p, i) =>
      i === index
        ? ((field === 0 ? [value, p[1], p[2]] : [p[0], value, p[2]]) as [string, string, boolean])
        : p,
    )
    rebuildAndSync({}, newParams)
  }

  const handleAddParam = (key = '', val = '') => {
    rebuildAndSync({}, [...urlParams, [key, val, true] as [string, string, boolean]])
  }

  const handleRemoveParam = (index: number) => {
    rebuildAndSync(
      {},
      urlParams.filter((_, i) => i !== index),
    )
  }

  const handleQuickParam = (key: string, val: string) => {
    if (urlParams.some(([k]) => k === key)) {
      Toast.warning(`参数 ${key} 已存在`)
      return
    }
    handleAddParam(key, key === 'timestamp' ? String(Date.now()) : val)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => handleConfigChange('logo', ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleAddQuickParam = () => {
    const key = newQuickKey.trim()
    if (!key) {
      Toast.warning('请输入参数名')
      return
    }
    if (quickParams?.some(([k]) => k === key)) {
      Toast.warning('快捷参数已存在')
      return
    }
    setQuickParams((prev) => [...(prev || []), [key, newQuickVal.trim()]])
    setNewQuickKey('')
    setNewQuickVal('')
    setAddQuickParamVisible(false)
    Toast.success('快捷参数已添加')
  }

  const handleRemoveQuickParam = (index: number) => {
    setDeleteQuickParamIndex(index)
  }

  const confirmRemoveQuickParam = () => {
    if (deleteQuickParamIndex !== null) {
      setQuickParams((prev) => (prev || []).filter((_, i) => i !== deleteQuickParamIndex))
      setDeleteQuickParamIndex(null)
      Toast.success('快捷参数已删除')
    }
  }

  return (
    <div className="code-setting">
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleLogoChange}
      />

      <div className="module-title">
        <div className="module-title-text">二维码配置</div>
        <img className="module-title-line" src={linePng} alt="" />
      </div>

      {groupList?.length > 0 && (
        <div className="code-setting-group">
          <label className="code-setting-group__label">所属分组</label>
          <Select
            placeholder="未分组"
            value={
              groupList?.some((g) => g.id === activeQrCode?.groupId)
                ? activeQrCode?.groupId
                : undefined
            }
            onChange={(v) => updateQrCode({ groupId: (v as string) || undefined })}
            showClear
            style={{ width: '100%' }}
          >
            {groupList.map((g) => (
              <Select.Option key={g.id} value={g.id}>
                {g.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}

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
          rows={4}
          label="二维码内容"
          field="content"
          placeholder="请输入"
        />
      </Form>

      {parsed.valid && (
        <div className="code-setting-url">
          <div className="code-setting-url__header">
            <div className="code-setting-url__title">URL 管理</div>
            <Tag
              size="small"
              color="blue"
              type="ghost"
              style={{ cursor: 'pointer' }}
              onClick={() => rebuildAndSync({ isHash: !parsed.isHash })}
            >
              {parsed.isHash ? 'Hash 路由模式' : 'History 路由模式'}
              <IconSync style={{ marginLeft: 4, fontSize: 10 }} />
            </Tag>
          </div>
          <div className="code-setting-url__grid">
            <label>协议</label>
            <div className="code-setting-url__field">
              <RadioGroup
                type="button"
                value={parsed.protocol}
                onChange={(e) => rebuildAndSync({ protocol: (e.target as HTMLInputElement).value })}
              >
                <Radio value="http">http</Radio>
                <Radio value="https">https</Radio>
              </RadioGroup>
              <IconUndo
                className="code-setting-url__reset"
                onClick={() => rebuildAndSync({ protocol: 'http' })}
              />
            </div>
            <label>域名</label>
            <div className="code-setting-url__field">
              <Input
                size="small"
                value={parsed.hostname}
                onChange={(v) => rebuildAndSync({ hostname: v })}
                style={{ flex: 1 }}
              />
              <IconUndo
                className="code-setting-url__reset"
                onClick={() => rebuildAndSync({ hostname: 'localhost' })}
              />
            </div>
            <label>端口</label>
            <div className="code-setting-url__field">
              <Input
                size="small"
                value={parsed.port}
                onChange={(v) => rebuildAndSync({ port: v })}
                placeholder="默认"
                style={{ flex: 1 }}
              />
              <IconUndo
                className="code-setting-url__reset"
                onClick={() => rebuildAndSync({ port: '' })}
              />
            </div>
            <label>路径</label>
            <div className="code-setting-url__field">
              <Input
                size="small"
                value={parsed.pathname}
                onChange={(v) => rebuildAndSync({ pathname: v })}
                style={{ flex: 1 }}
              />
              <IconUndo
                className="code-setting-url__reset"
                onClick={() => rebuildAndSync({ pathname: '/' })}
              />
            </div>
          </div>
          <div
            className="code-setting-url__section-header"
            onClick={() => setUrlParamsOpen(!urlParamsOpen)}
          >
            <span>参数管理（共{urlParams.length}个）</span>
            {urlParamsOpen ? <IconChevronUp size="small" /> : <IconChevronDown size="small" />}
          </div>
          <Collapsible isOpen={urlParamsOpen}>
            <div className="code-setting-url__quick">
              {quickParams?.map(([k, v], i) => (
                <Tag
                  key={k}
                  size="small"
                  type="ghost"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleQuickParam(k, v)}
                >
                  <IconPlusStroked style={{ fontSize: 12, marginRight: 2 }} />
                  {k}
                  <IconClose
                    style={{ fontSize: 10, marginLeft: 4, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveQuickParam(i)
                    }}
                  />
                </Tag>
              ))}
              <Tag
                size="small"
                type="ghost"
                style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                onClick={() => setAddQuickParamVisible(true)}
              >
                <IconPlusStroked style={{ fontSize: 12 }} />
              </Tag>
            </div>
            <div className="code-setting-url__params">
              {urlParams.map(([key, val], i) => (
                <div className="code-setting-url__param-row" key={i}>
                  <Input
                    size="small"
                    value={key}
                    onChange={(v) => handleParamChange(i, 0, v)}
                    placeholder="key"
                    style={{ flex: 1 }}
                  />
                  <span className="code-setting-url__param-eq">=</span>
                  <Input
                    size="small"
                    value={val}
                    onChange={(v) => handleParamChange(i, 1, v)}
                    placeholder="value"
                    style={{ flex: 1 }}
                  />
                  <IconClose
                    className="code-setting-url__param-del"
                    onClick={() => handleRemoveParam(i)}
                  />
                </div>
              ))}
              <div className="code-setting-url__param-add" onClick={() => handleAddParam()}>
                + 添加参数
              </div>
            </div>
          </Collapsible>
        </div>
      )}

      <div className="code-setting-advanced">
        <div
          className="code-setting-advanced__header"
          onClick={() => setAdvancedOpen(!advancedOpen)}
        >
          <span>高级设置</span>
          {advancedOpen ? <IconChevronUp size="small" /> : <IconChevronDown size="small" />}
        </div>
        <Collapsible isOpen={advancedOpen}>
          <div className="code-setting-advanced__content">
            <div className="code-setting-advanced__block">
              <div className="code-setting-advanced__section">二维码样式</div>
              <div className="code-setting-advanced__row">
                <label>前景色</label>
                <div className="code-setting-advanced__right">
                  <div className="code-setting-advanced__color">
                    <input
                      type="color"
                      value={qrConfig.fgColor || '#111111'}
                      onChange={(e) => handleConfigChange('fgColor', e.target.value)}
                    />
                    <span>{qrConfig.fgColor || '#111111'}</span>
                    <IconCopy
                      className="code-setting-advanced__icon-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(qrConfig.fgColor || '#111111')
                        Toast.success('已复制')
                      }}
                    />
                  </div>
                  <IconUndo
                    className="code-setting-advanced__reset-btn"
                    onClick={() => handleConfigChange('fgColor', '#111111')}
                  />
                </div>
              </div>
              <div className="code-setting-advanced__row">
                <label>背景色</label>
                <div className="code-setting-advanced__right">
                  <div className="code-setting-advanced__color">
                    <input
                      type="color"
                      value={qrConfig.bgColor || '#ffffff'}
                      onChange={(e) => handleConfigChange('bgColor', e.target.value)}
                    />
                    <span>{qrConfig.bgColor || '#ffffff'}</span>
                    <IconCopy
                      className="code-setting-advanced__icon-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(qrConfig.bgColor || '#ffffff')
                        Toast.success('已复制')
                      }}
                    />
                  </div>
                  <IconUndo
                    className="code-setting-advanced__reset-btn"
                    onClick={() => handleConfigChange('bgColor', '#ffffff')}
                  />
                </div>
              </div>
              <div className="code-setting-advanced__row">
                <label>纠错等级</label>
                <div className="code-setting-advanced__right">
                  <RadioGroup
                    type="button"
                    value={qrConfig.level || 'H'}
                    onChange={(e) =>
                      handleConfigChange('level', (e.target as HTMLInputElement).value)
                    }
                  >
                    {LEVEL_OPTIONS.map((v) => (
                      <Radio key={v} value={v}>
                        {v}
                      </Radio>
                    ))}
                  </RadioGroup>
                  <IconUndo
                    className="code-setting-advanced__reset-btn"
                    onClick={() => handleConfigChange('level', 'H')}
                  />
                </div>
              </div>
            </div>
            <div className="code-setting-advanced__block">
              <div className="code-setting-advanced__section">Logo 设置</div>
              <div className="code-setting-advanced__row">
                <label>Logo</label>
                <div className="code-setting-advanced__right">
                  <div
                    className="code-setting-advanced__logo-editor"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <img src={qrConfig.logo || defaultLogoPng} alt="logo" />
                    <div className="code-setting-advanced__logo-actions">
                      <span>替换</span>
                    </div>
                  </div>
                  <IconUndo
                    className="code-setting-advanced__reset-btn"
                    onClick={() => handleConfigChange('logo', undefined)}
                  />
                </div>
              </div>
              <div className="code-setting-advanced__row">
                <label>大小</label>
                <div className="code-setting-advanced__right">
                  <Input
                    size="small"
                    type="number"
                    value={String(qrConfig.logoSize || 60)}
                    onChange={(v) => handleConfigChange('logoSize', Number(v) || 60)}
                    style={{ width: 100 }}
                    suffix="px"
                  />
                  <IconUndo
                    className="code-setting-advanced__reset-btn"
                    onClick={() => handleConfigChange('logoSize', 60)}
                  />
                </div>
              </div>
              <div className="code-setting-advanced__row">
                <label>挖空背景</label>
                <div className="code-setting-advanced__right">
                  <Switch
                    size="small"
                    checked={qrConfig.logoExcavate ?? true}
                    onChange={(v) => handleConfigChange('logoExcavate', v)}
                  />
                  <IconUndo
                    className="code-setting-advanced__reset-btn"
                    onClick={() => handleConfigChange('logoExcavate', true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </Collapsible>
      </div>

      {/* 新增快捷参数弹窗 */}
      <Modal
        title="新增快捷参数"
        visible={addQuickParamVisible}
        onCancel={() => {
          setAddQuickParamVisible(false)
          setNewQuickKey('')
          setNewQuickVal('')
        }}
        centered
        footer={
          <div className="group-modal__footer-split">
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              onClick={() => {
                setAddQuickParamVisible(false)
                setNewQuickKey('')
                setNewQuickVal('')
              }}
            >
              取消
            </Button>
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              theme="solid"
              type="primary"
              onClick={handleAddQuickParam}
            >
              添加
            </Button>
          </div>
        }
      >
        <div className="group-modal">
          <Input
            placeholder="参数名（key）"
            value={newQuickKey}
            onChange={setNewQuickKey}
            size="large"
            autoFocus
          />
          <Input
            placeholder="默认值（value，可选）"
            value={newQuickVal}
            onChange={setNewQuickVal}
            size="large"
          />
        </div>
      </Modal>

      {/* 删除快捷参数确认弹窗 */}
      <Modal
        title="删除快捷参数"
        visible={deleteQuickParamIndex !== null}
        onCancel={() => setDeleteQuickParamIndex(null)}
        centered
        footer={
          <div className="group-modal__footer-split">
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              onClick={() => setDeleteQuickParamIndex(null)}
            >
              取消
            </Button>
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              theme="solid"
              type="danger"
              onClick={confirmRemoveQuickParam}
            >
              确认删除
            </Button>
          </div>
        }
      >
        <div className="group-modal">
          <p style={{ fontSize: 14, color: 'var(--semi-color-text-1)', textAlign: 'center' }}>
            确定删除快捷参数「
            {deleteQuickParamIndex !== null ? quickParams?.[deleteQuickParamIndex]?.[0] : ''}」吗？
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default CodeSetting
