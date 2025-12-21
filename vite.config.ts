import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import SemiPlugin from 'vite-plugin-semi-theme'

export default defineConfig({
  base: '/haha-code/',
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
    host: '0.0.0.0',
    port: 3000,
    open: true,
    strictPort: false,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 简化：所有第三方依赖合并为一个vendor chunk
        manualChunks(id) {
          // 所有node_modules中的依赖都放到vendor
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          // 临时注释业务代码的拆分（如果仍有错误，可直接删除这部分）
          // if (id.includes('src/utils')) {
          //   return 'utils';
          // }
          // if (id.includes('src/configs')) {
          //   return 'configs';
          // }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
