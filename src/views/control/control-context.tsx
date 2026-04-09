import { createContext, useContext, useEffect, type ReactNode } from 'react'
import type { IControlContext, IQRCode, IQRCodeGroup, IQrCodeSetting } from './types'
import { useLocalStorageState } from 'ahooks'
import dayjs from 'dayjs'
import { generateUUID } from './utils'
import { Modal, Toast } from '@douyinfe/semi-ui'

export const ControlContext = createContext<IControlContext | undefined>(undefined)

interface ControlProviderProps {
  children: ReactNode
}

export const ControlProvider = ({ children }: ControlProviderProps) => {
  const [codeList, setCodeList] = useLocalStorageState<IQRCode[]>('haha-qr-code-code-list', {
    defaultValue: [
      {
        id: 'example',
        name: '示例二维码',
        content: 'https://www.baidu.com/hello-haha?container=flutter&showSafeArea=true',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
    ],
  })

  const [groupList, setGroupList] = useLocalStorageState<IQRCodeGroup[]>(
    'haha-qr-code-group-list',
    {
      defaultValue: [],
    },
  )

  const [setting, setSetting] = useLocalStorageState<IQrCodeSetting>('haha-qr-code-setting', {
    defaultValue: {
      viewMode: 'single',
      activeQrCodeId: codeList?.[0]?.id,
    },
  })

  const activeQrCode = codeList.find((item) => item.id === setting.activeQrCodeId)

  // 过滤逻辑：先按分组筛选，再按关键词搜索
  const filteredCodeList = codeList?.filter((item) => {
    const keyword = setting?.searchKeyWords?.trim()
    const groupId = setting?.activeGroupId
    const matchGroup = groupId ? item.groupId === groupId : true
    const matchKeyword = keyword ? item.name?.includes(keyword) : true
    return matchGroup && matchKeyword
  })

  // 当前选中的二维码不在过滤结果中时，自动切换到第一个
  useEffect(() => {
    if (
      filteredCodeList?.length > 0 &&
      !filteredCodeList.some((item) => item.id === setting?.activeQrCodeId)
    ) {
      setSetting((prev) => ({ ...prev, activeQrCodeId: filteredCodeList[0].id }))
    }
  }, [filteredCodeList?.length, setting?.searchKeyWords, setting?.activeGroupId])

  /** 导入旧版数据 */
  const importOldDatas = () => {
    Modal.confirm({
      title: '导入旧版二维码数据',
      content: '导入旧版二维码数据会覆盖现有数据，确定要导入吗？',
      centered: true,
      onOk: () => {
        try {
          const oldCodeList = JSON.parse(localStorage.getItem('qr_codes_data') || '{}')
          if (oldCodeList) {
            const codeList = oldCodeList?.map((item: Record<string, string>) => {
              return {
                id: generateUUID(),
                name: item.name,
                content: item.url,
                createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              }
            })
            setCodeList(() => codeList)
            setTimeout(() => {
              setSetting((prev) => {
                return {
                  ...prev,
                  activeQrCodeId: codeList?.[0]?.id,
                }
              })
            })
            Toast.success('导入旧版数据成功')
          } else {
            Toast.error('导入旧版数据失败，未找到旧版数据')
          }
        } catch (error) {
          console.error('导入旧版数据失败', error)
          Toast.error('导入旧版数据失败，未找到旧版数据')
        }
      },
    })
  }

  const [quickParams, setQuickParams] = useLocalStorageState<[string, string][]>(
    'haha-qr-code-quick-params',
    {
      defaultValue: [
        ['container', 'flutter'],
        ['showSafeArea', 'true'],
        ['nativeWeb', 'true'],
        ['debug', 'true'],
        ['env', 'fat'],
        ['timestamp', ''],
      ],
    },
  )

  return (
    <ControlContext.Provider
      value={{
        codeList,
        filteredCodeList,
        setCodeList,
        groupList,
        setGroupList,
        setting,
        setSetting,
        activeQrCode,
        importOldDatas,
        quickParams,
        setQuickParams,
      }}
    >
      {children}
    </ControlContext.Provider>
  )
}

export const useControlContext = () => {
  const context = useContext(ControlContext)
  if (context === undefined) {
    throw new Error('useControlContext must be used within ControlProvider')
  }
  return context
}
