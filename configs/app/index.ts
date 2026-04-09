import type { IAppSetting } from './index.d'
export * from './index.d'

export default {
  nameKey: 'hahacode',
  name: '哈哈二维码',
  desc: '二维码管理更快一步',
  changelog: [
    {
      version: '2.0.0',
      date: '2025-07-15',
      title: 'V2.0.0 版本更新',
      features: [
        '新增更新日志弹窗，每次发布后自动展示更新内容',
        '支持分组管理，拖拽二维码到分组即可归类',
        '优化二维码预览体验，支持单码/多码模式切换',
        '新增高级设置，可自定义前景色、背景色、纠错等级等',
      ],
    },
  ],
} as IAppSetting
