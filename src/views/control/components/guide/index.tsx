import { useEffect, useState } from 'react'
import { Button, Modal, UserGuide } from '@douyinfe/semi-ui'
import videoSrc from '@/assets/movies/haha-hi.mp4'
import { useLocalStorageState } from 'ahooks'
import { useControlContext } from '../../control-context'

import './index.scss'

const Guide = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [guideVisible, setGuideVisible] = useState(false)
  const [isFinishTipGuide, setIsFinishTipGuide] = useState(false)
  const [isFinishGuide, setIsFinishGuide] = useLocalStorageState('haha-qr-code-guide', {
    defaultValue: false,
  })

  // 组件挂载后显示Modal（确保DOM渲染完成）
  useEffect(() => {
    const timer = setTimeout(() => {
      setModalVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const { setSetting } = useControlContext()

  return (
    <>
      <Modal
        className="guide-modal"
        centered
        header={null}
        visible={!isFinishGuide && (modalVisible || isFinishTipGuide)}
        footer={false}
      >
        <div className={`guide-modal-content ${isFinishTipGuide ? 'success' : ''}`}>
          <video
            className="guide-video"
            src={videoSrc}
            preload="metadata"
            width="50%"
            playsInline
            loop
            muted
            autoPlay
          />
          {isFinishTipGuide ? (
            <>
              <h1>恭喜你, 完成新手引导啦</h1>
              <h2>快去创建你的二维码吧</h2>
            </>
          ) : (
            <h1>
              Hi,
              <span className="flow-text"> 哈哈二维码 2.0 </span>
              全新升级啦
            </h1>
          )}
          <div className="footer-buttons">
            {!isFinishTipGuide ? (
              <>
                <Button
                  block
                  theme="solid"
                  size="large"
                  type="primary"
                  onClick={() => {
                    setModalVisible(false)
                    setIsFinishTipGuide(false)
                    setGuideVisible(true)
                    setSetting((prev) => {
                      return {
                        ...prev,
                        viewMode: 'multi',
                      }
                    })
                  }}
                >
                  了解详情
                </Button>
                <Button
                  block
                  theme="borderless"
                  size="large"
                  type="primary"
                  onClick={() => {
                    setModalVisible(false)
                    setIsFinishGuide(true)
                  }}
                >
                  知道了
                </Button>
              </>
            ) : (
              <>
                <Button
                  block
                  theme="solid"
                  size="large"
                  type="primary"
                  onClick={() => {
                    setIsFinishGuide(true)
                  }}
                >
                  去创建
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
      <UserGuide
        mode="popup"
        mask={true}
        visible={guideVisible}
        steps={[
          {
            target: document.querySelector('.add-code-button') as HTMLElement,
            title: '新增二维码',
            description: '点击“+”，即可新增二维码',
            position: 'right',
          },
          {
            target: document.querySelector('.import-code-button') as HTMLElement,
            title: '导入旧版本二维码',
            description:
              '点击即可导入旧版本二维码，注意导入旧版二维码数据会覆盖现有二维码数据，请谨慎操作',
            position: 'right',
          },
          {
            target: document.querySelector('.back-old-version-button') as HTMLElement,
            title: '回到旧版二维码',
            description: '使用不满意？点击即可回到旧版二维码',
            position: 'right',
          },
          {
            target: document.querySelector('.code-list-search') as HTMLElement,
            title: '搜索二维码',
            description: '输入关键词，可进行二维码搜索，快速找到目标二维码',
            position: 'left',
          },
          {
            target: document.querySelector('.code-list') as HTMLElement,
            title: '二维码列表',
            description: '这里展示了所有已创建的二维码',
            position: 'right',
          },
          {
            target: document.querySelector('.code-setting-form') as HTMLElement,
            title: '编辑二维码',
            description: '在左侧二维码列表区域，选中需要编辑的二维码，即可在此实时编辑二维码信息',
            position: 'right',
          },
          {
            target: document.querySelector('.group-sidebar') as HTMLElement,
            title: '分组管理',
            description: '支持创建分组对二维码进行分类管理，拖拽二维码到分组即可归类',
            position: 'right',
          },
          {
            target: document.querySelector('.code-setting-url__header') as HTMLElement,
            title: 'URL 管理',
            description:
              '当二维码内容为 URL 时，可在此管理协议、域名、端口、路径和参数，支持快捷参数一键添加',
            position: 'bottom',
          },
          {
            target: document.querySelector('.code-setting-advanced__header') as HTMLElement,
            title: '高级设置',
            description:
              '可自定义二维码前景色、背景色、纠错等级，以及 Logo 图片、大小和挖空背景等样式配置',
            position: 'bottom',
          },
          {
            target: document.querySelector('.fold-button') as HTMLElement,
            title: '展开/折叠二维码编辑',
            description: '点击此按钮可展开或折叠二维码编辑区域',
            position: 'right',
          },
          {
            target: document.querySelector('.code-preview__content') as HTMLElement,
            title: '二维码预览',
            description: '左侧编辑的二维码信息会实时预览在该区域',
            position: 'left',
          },
          {
            target: document.querySelector('.code-preview-mode-switch') as HTMLElement,
            title: '二维码预览模式切换',
            description: '支持单码/多码预览模式切换，可根据实际需求选择预览模式',
            position: 'left',
          },
          // {
          //   target: document.querySelector(
          //     '.code-preview__multi .qrcode:first-of-type .qrcode-tools-item:nth-of-type(1) .iconfont',
          //   ) as HTMLElement,
          //   title: '放大二维码',
          //   description: '点击可放大查看二维码信息',
          //   position: 'bottom',
          // },
          // {
          //   target: document.querySelector(
          //     '.code-preview__multi .qrcode:first-of-type .qrcode-tools-item:nth-of-type(2) .iconfont',
          //   ) as HTMLElement,
          //   title: '复制二维码',
          //   description: '点击可将二维码复制至剪切板',
          //   position: 'bottom',
          // },
          // {
          //   target: document.querySelector(
          //     '.code-preview__multi .qrcode:first-of-type .qrcode-tools-item:nth-of-type(3) .iconfont',
          //   ) as HTMLElement,
          //   title: '下载二维码',
          //   description: '点击可下载二维码',
          //   position: 'bottom',
          // },
        ].filter((step) => step.target) as React.ComponentProps<typeof UserGuide>['steps']}
        onFinish={() => {
          setGuideVisible(false)
          setIsFinishTipGuide(true)
        }}
        onSkip={() => {
          setGuideVisible(false)
          setIsFinishTipGuide(true)
        }}
      />
    </>
  )
}

export default Guide
