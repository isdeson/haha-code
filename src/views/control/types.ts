type LocalStorageSetState<T> = (value: T | ((prevState: T | undefined) => T)) => void

export interface IQRCode {
  /** id */
  id?: string
  /** 名称 */
  name?: string
  /** 内容 */
  content?: string
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

export interface IQrCodeSetting {
  /** 预览模式 */
  viewMode?: string
  /** 是否折叠编辑栏 */
  isFold?: boolean
  /** 搜索关键词 */
  searchKeyWords?: string
  activeQrCodeId?: string
  // activeQrCode?: IQRCode
}

export interface IControlContext {
  codeList: IQRCode[]
  filteredCodeList: IQRCode[]
  setCodeList: LocalStorageSetState<IQRCode[]>
  setting: IQrCodeSetting
  setSetting: LocalStorageSetState<IQrCodeSetting>
  activeQrCode?: IQRCode
  importOldDatas: () => void
}
