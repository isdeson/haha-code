import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import './App.scss'
import appSetting from '@configs'
import { setWebTitle } from './utils'
import Navbar from './components/navbar'

function App() {
  useEffect(() => {
    setWebTitle(appSetting.name + ' | ' + appSetting.desc)
  }, [])

  return (
    <div className="app">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App
