import { createContext, useContext, type ReactNode } from 'react'
import type { IControlContext, IQRCode, IQrCodeSetting } from './types'
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
        content: 'https://www.baidu.com',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
    ],
  })
  const [setting, setSetting] = useLocalStorageState<IQrCodeSetting>('haha-qr-code-setting', {
    defaultValue: {
      viewMode: 'single',
      activeQrCodeId: codeList?.[0]?.id,
    },
  })

  const activeQrCode = codeList.find((item) => item.id === setting.activeQrCodeId)

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

  return (
    <ControlContext.Provider
      value={{
        codeList,
        filteredCodeList: codeList?.filter((item) =>
          setting?.searchKeyWords ? item.name?.includes(setting?.searchKeyWords || '') : true,
        ),
        setCodeList,
        setting,
        setSetting,
        activeQrCode,
        importOldDatas,
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
