import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import './App.scss'
import appSetting from '@configs'
import { setWebTitle } from './utils'

import './App.scss'

function App() {
  useEffect(() => {
    setWebTitle(appSetting.name + ' | ' + appSetting.desc)
  }, [])

  return (
    <div className="app">
      <nav>{/* <Navbar /> */}</nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App
