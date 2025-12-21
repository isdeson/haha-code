import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@douyinfe/semi-ui/dist/css/semi.min.css'
import './styles/reset.css'
import '@/assets/iconfont/iconfont.css'
import './styles/common.scss'
import './index.scss'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <RouterProvider router={router} />,
  // </StrictMode>,
)
