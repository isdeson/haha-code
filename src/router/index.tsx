import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import App from '@/App'
import Control from '@/views/control'
import Setting from '@/views/setting'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Control />,
      },
      {
        path: 'setting',
        element: <Setting />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes, {
  basename: '/haha-code',
})
