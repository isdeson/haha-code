import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import SemiPlugin from 'vite-plugin-semi-theme'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    SemiPlugin({
      theme: '@semi-bot/semi-theme-haha-code',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@configs': path.resolve(__dirname, './configs'),
    },
  },
  server: {
    host: '0.0.0.0', // 允许通过内网IP访问
    port: 3000, // 指定端口号
    open: true, // 自动打开浏览器
    strictPort: false, // 端口被占用时自动尝试下一个可用端口
  },
})
