type LocalStorageSetState<T> = (value: T | ((prevState: T | undefined) => T)) => void

export interface IQRCodeConfig {
  /** 前景色 */
  fgColor?: string
  /** 背景色 */
  bgColor?: string
  /** 纠错等级 */
  level?: 'L' | 'M' | 'Q' | 'H'
  /** 自定义 logo 图片 base64 */
  logo?: string
  /** logo 尺寸 */
  logoSize?: number
  /** 是否挖空 logo 背景 */
  logoExcavate?: boolean
}

export interface IQRCode {
  /** id */
  id?: string
  /** 名称 */
  name?: string
  /** 内容 */
  content?: string
  /** 所属分组id */
  groupId?: string
  /** 二维码配置 */
  qrConfig?: IQRCodeConfig
  /** URL 参数列表 [key, value, enabled] */
  urlParams?: [string, string, boolean][]
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

export interface IQRCodeGroup {
  /** 分组id */
  id: string
  /** 分组名称 */
  name: string
  /** 自定义图标图片URL */
  icon?: string
  /** 头像背景色 */
  color?: string
  /** 创建时间 */
  createdAt?: string
}

export interface IQrCodeSetting {
  /** 预览模式 */
  viewMode?: string
  /** 是否折叠编辑栏 */
  isFold?: boolean
  /** 搜索关键词 */
  searchKeyWords?: string
  activeQrCodeId?: string
  /** 当前选中的分组id，undefined 表示"全部" */
  activeGroupId?: string
}

export interface IControlContext {
  codeList: IQRCode[]
  filteredCodeList: IQRCode[]
  setCodeList: LocalStorageSetState<IQRCode[]>
  groupList: IQRCodeGroup[]
  setGroupList: LocalStorageSetState<IQRCodeGroup[]>
  setting: IQrCodeSetting
  setSetting: LocalStorageSetState<IQrCodeSetting>
  activeQrCode?: IQRCode
  importOldDatas: () => void
  quickParams: [string, string][]
  setQuickParams: LocalStorageSetState<[string, string][]>
}
