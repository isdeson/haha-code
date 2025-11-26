import { useEffect, useState } from 'react'
import appSetting from '@configs'
import styles from './index.module.scss'

const THEME_MODE = {
  /** 浅色模式 */
  LIGHT: 'light',
  /** 深色模式 */
  DARK: 'dark',
}

const THEME_CACHE_KEY = `${appSetting.nameKey}-theme`

/** 切换主题模式 */
const changeThemeMode = (theme: string) => {
  const { DARK } = THEME_MODE
  if (theme === DARK) {
    window.document.body.setAttribute('theme-mode', DARK)
  } else {
    window.document.body.removeAttribute('theme-mode')
  }
}

const Theme = () => {
  // 当前主题
  const [currentTheme, setCurrentTheme] = useState('')

  /** 获取当前主题色 */
  const getCurrentTheme = () => {
    const { DARK, LIGHT } = THEME_MODE
    const _theme = localStorage.getItem(THEME_CACHE_KEY)
    if (_theme) {
      return _theme
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT
  }

  /** 获取当前主题色 */
  useEffect(() => {
    setCurrentTheme(() => getCurrentTheme())
  }, [])

  /** 手动切换主题色 */
  const handleManualChangeTheme = () => {
    const { DARK, LIGHT } = THEME_MODE
    const _theme = currentTheme === DARK ? LIGHT : DARK
    setCurrentTheme(() => _theme)
    localStorage.setItem(THEME_CACHE_KEY, _theme)
  }

  /** 监听当前主题色变化-设置相应样式 */
  useEffect(() => {
    changeThemeMode(currentTheme)
  }, [currentTheme])

  /** 监听系统主题色变化 */
  const listenSystemThemeChange = () => {
    const _theme = getCurrentTheme()
    setCurrentTheme(() => _theme)
  }

  /** 监听系统主题变化 */
  useEffect(() => {
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    themeQuery.addEventListener('change', listenSystemThemeChange)
    return () => {
      themeQuery.removeEventListener('change', listenSystemThemeChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={styles['theme-control']}>
      <div className={`${styles['theme-switcher']}`} onClick={() => handleManualChangeTheme()}>
        <i className={`iconfont haha-qiansemoshi ${styles['icon']}`} />
      </div>
    </div>
  )
}

export default Theme
