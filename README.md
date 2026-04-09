# 哈哈二维码 (Haha Code)

二维码管理更快一步。基于 React + Semi Design 构建的二维码生成与管理工具。

## 技术栈

- React 18 + TypeScript
- Vite 7
- Semi Design（自定义主题 `@semi-bot/semi-theme-haha-code`）
- React Router v7
- Sass

## 开发

```bash
# 安装依赖（会自动通过 patch-package 修复 vite-plugin-semi-theme 的路径兼容问题）
npm install

# 启动开发服务器
npm run dev
```

默认访问 http://localhost:3000/haha-code/

## 构建与发布

```bash
# 构建生产包（输出到 dist/）
npm run build

# 本地预览构建产物
npm run preview

# 发布到 GitHub Pages
npm run deploy
```

`npm run deploy` 会先执行 `npm run build`，然后通过 `gh-pages` 将 `dist/` 目录发布。

## 代码规范

```bash
# ESLint 检查
npm run lint

# ESLint 自动修复
npm run lint:fix

# Prettier 格式化
npm run format
```

## 项目结构

```
├── configs/          # 应用配置（名称、描述等）
├── patches/          # patch-package 补丁文件
├── public/           # 静态资源
├── src/
│   ├── assets/       # 字体、图标、图片、音视频
│   ├── components/   # 公共组件（Navbar、Empty 等）
│   ├── router/       # 路由配置
│   ├── styles/       # 全局样式
│   ├── utils/        # 工具函数
│   └── views/        # 页面
│       ├── control/  # 主页 - 二维码生成与管理
│       └── setting/  # 设置页
└── vite.config.ts    # Vite 配置
```
