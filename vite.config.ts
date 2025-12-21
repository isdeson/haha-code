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
  // 新增构建相关配置，解决chunk体积过大问题
  build: {
    // 可选：调整chunk大小警告阈值（单位：kB），如果不想看到警告可设置更大值
    chunkSizeWarningLimit: 1000,
    // 配置rollup的输出选项，实现chunk拆分
    rollupOptions: {
      output: {
        // 手动拆分chunk，减小单个文件体积
        manualChunks(id) {
          // 1. 将node_modules中的依赖拆分为单独的vendor chunk
          if (id.includes('node_modules')) {
            // 可以进一步细分：将SemiUI、React相关依赖分别拆分
            if (id.includes('@douban/semi') || id.includes('semi')) {
              return 'vendor-semi' // SemiUI相关依赖打包到vendor-semi.js
            } else if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'vendor-react' // React相关依赖打包到vendor-react.js
            } else {
              return 'vendor-other' // 其他第三方依赖打包到vendor-other.js
            }
          }
          // 2. 可选：将src下的特定目录拆分为独立chunk（比如工具类、配置类）
          if (id.includes('src/utils')) {
            return 'utils'
          }
          if (id.includes('src/configs')) {
            return 'configs'
          }
        },
        // 可选：给打包后的文件命名更规范（可选配置，不影响体积，仅优化命名）
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
