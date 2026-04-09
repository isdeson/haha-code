/** 更新日志条目 */
export interface IChangelogItem {
  version: string
  date: string
  title: string
  features: string[]
  image?: string
}

/** 应用设置 */
export interface IAppSetting {
  nameKey: string
  name: string
  desc: string
  changelog: IChangelogItem[]
}
