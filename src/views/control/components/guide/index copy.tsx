import { useEffect, useRef, useState } from 'react'
import { Modal, Button } from '@douyinfe/semi-ui'
import audioSrc from '@/assets/sounds/haha-guide-start.mp3'
import videoSrc from '@/assets/movies/haha-hi.mov'
import './index.scss'

const Guide = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [modalVisible, setModalVisible] = useState(false)
  // 标记是否已经让用户完成交互并播放
  const [hasPlayed, setHasPlayed] = useState(false)

  // 组件挂载后显示Modal（确保DOM渲染完成）
  useEffect(() => {
    const timer = setTimeout(() => {
      setModalVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // 核心：处理音视频播放的函数（仅在用户交互后调用）
  const handlePlayMedia = () => {
    if (hasPlayed) return // 避免重复播放

    // 1. 处理音频播放（此时有用户交互，即使不静音也能播放）
    const audio = audioRef.current
    if (audio) {
      // 这里可以选择是否取消静音，根据需求调整
      audio.muted = false // 现在可以取消静音了
      audio
        .play()
        .then(() => {
          console.log('音频播放成功')
          setHasPlayed(true)
        })
        .catch((err) => console.error('音频播放失败：', err))
    }

    // 2. 处理视频播放
    const video = videoRef.current
    if (video) {
      video.load()
      video
        .play() // 有用户交互，视频也能自动播放（可选）
        .then(() => console.log('视频播放成功'))
        .catch((err) => console.error('视频播放失败：', err))
    }
  }

  return (
    <Modal centered header={null} visible={modalVisible} footer={false}>
      <div className="guide-modal">
        {/* 音视频元素（先隐藏或仅渲染不播放） */}
        <audio ref={audioRef} src={audioSrc} preload="auto" style={{ display: 'none' }}></audio>
        <video
          ref={videoRef}
          src={videoSrc}
          preload="metadata"
          width="50%"
          playsInline
          loop
          muted
        ></video>

        {/* 核心：用户交互按钮（必须点击后才能播放） */}
        {!hasPlayed ? (
          <Button type="primary" onClick={handlePlayMedia} style={{ width: '100%' }}>
            点击开始播放音视频
          </Button>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '8px' }}>音视频已开始播放 🎵</p>
        )}
      </div>
    </Modal>
  )
}

export default Guide
