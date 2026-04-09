import { type FC, useState, useRef } from 'react'
import { useControlContext } from '../../control-context'
import {
  IconPlusStroked,
  IconDeleteStroked,
  IconImage,
  IconGridStroked,
  IconEditStroked,
} from '@douyinfe/semi-icons'
import { Input, Modal, Toast, Tooltip, Button } from '@douyinfe/semi-ui'
import { generateUUID } from '../../utils'
import dayjs from 'dayjs'

import './index.scss'

const AVATAR_COLORS = [
  '#3370ff',
  '#f54a45',
  '#ff7d00',
  '#00b42a',
  '#7b61ff',
  '#14c9c9',
  '#f77234',
  '#0fc6c2',
]

const getAvatarColor = (_name: string, index: number) => AVATAR_COLORS[index % AVATAR_COLORS.length]

const GroupSidebar: FC = () => {
  const { codeList, setCodeList, groupList, setGroupList, setting, setSetting } =
    useControlContext()
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editGroupId, setEditGroupId] = useState<string | null>(null)
  const [editGroupName, setEditGroupName] = useState('')
  const [editGroupIcon, setEditGroupIcon] = useState<string | undefined>(undefined)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupIcon, setNewGroupIcon] = useState<string | undefined>(undefined)
  const addIconInputRef = useRef<HTMLInputElement>(null)
  const editIconInputRef = useRef<HTMLInputElement>(null)
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null)
  const [deleteMode, setDeleteMode] = useState<'release' | 'delete'>('release')

  const handleGroupClick = (groupId?: string) => {
    setSetting((prev) => ({ ...prev, activeGroupId: groupId }))
  }

  const openEditModal = (groupId: string) => {
    const group = groupList?.find((g) => g.id === groupId)
    if (!group) return
    setEditGroupId(groupId)
    setEditGroupName(group.name)
    setEditGroupIcon(group.icon)
    setEditModalVisible(true)
  }

  const handleAddGroup = () => {
    const name = newGroupName.trim()
    if (!name) {
      Toast.warning('请输入分组名称')
      return
    }
    if (groupList?.some((g) => g.name === name)) {
      Toast.warning('分组名称已存在')
      return
    }
    setGroupList((prev) => [
      ...(prev || []),
      {
        id: generateUUID(),
        name,
        icon: newGroupIcon,
        color: AVATAR_COLORS[(prev || []).length % AVATAR_COLORS.length],
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
    ])
    setNewGroupName('')
    setNewGroupIcon(undefined)
    setAddModalVisible(false)
    Toast.success('分组已添加')
  }

  const handleEditGroup = () => {
    const name = editGroupName.trim()
    if (!name || !editGroupId) {
      Toast.warning('请输入分组名称')
      return
    }
    if (groupList?.some((g) => g.id !== editGroupId && g.name === name)) {
      Toast.warning('分组名称已存在')
      return
    }
    setGroupList((prev) =>
      (prev || []).map((g) => (g.id === editGroupId ? { ...g, name, icon: editGroupIcon } : g)),
    )
    setEditModalVisible(false)
    setEditGroupId(null)
  }

  const handleDeleteGroup = (groupId: string) => {
    setDeleteGroupId(groupId)
    setDeleteMode('release')
    setDeleteModalVisible(true)
  }

  const confirmDeleteGroup = () => {
    if (!deleteGroupId) return
    setGroupList((prev) => (prev || []).filter((g) => g.id !== deleteGroupId))
    if (deleteMode === 'delete') {
      setCodeList((prev) => (prev || []).filter((item) => item.groupId !== deleteGroupId))
    } else {
      setCodeList((prev) =>
        (prev || []).map((item) =>
          item.groupId === deleteGroupId ? { ...item, groupId: undefined } : item,
        ),
      )
    }
    if (setting?.activeGroupId === deleteGroupId) {
      setSetting((prev) => ({ ...prev, activeGroupId: undefined }))
    }
    setDeleteModalVisible(false)
    setDeleteGroupId(null)
  }

  const handleAddIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setNewGroupIcon(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleEditIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setEditGroupIcon(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const groupCount = (groupId: string) => codeList?.filter((c) => c.groupId === groupId).length || 0

  const handleDragOver = (e: React.DragEvent, groupId: string | null) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverGroupId(groupId)
  }

  const handleDragLeave = () => setDragOverGroupId(null)

  const handleDrop = (e: React.DragEvent, groupId: string | undefined) => {
    e.preventDefault()
    setDragOverGroupId(null)
    const qrcodeId = e.dataTransfer.getData('qrcode-id')
    if (!qrcodeId) return
    setCodeList((prev) =>
      (prev || []).map((item) => (item.id === qrcodeId ? { ...item, groupId } : item)),
    )
    Toast.success(groupId ? '已移入分组' : '已移出分组')
  }

  const renderIconEditor = (
    icon: string | undefined,
    onSelect: () => void,
    onClear: () => void,
  ) => (
    <div className="group-modal__icon">
      {icon ? (
        <div className="group-modal__icon-preview">
          <img src={icon} alt="icon" />
          <div className="group-modal__icon-actions">
            <span onClick={onSelect}>重选</span>
            <span onClick={onClear}>清除</span>
          </div>
        </div>
      ) : (
        <div className="group-modal__icon-placeholder" onClick={onSelect}>
          <IconImage style={{ fontSize: 30, color: '#999' }} />
        </div>
      )}
    </div>
  )

  return (
    <div className="group-sidebar">
      <input
        ref={addIconInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAddIconChange}
      />
      <input
        ref={editIconInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleEditIconChange}
      />

      <div className="group-sidebar__fixed-top">
        <Tooltip content="全部（拖入可移出分组）" position="right">
          <div
            className={`group-sidebar__item ${!setting?.activeGroupId ? 'group-sidebar__item--active' : ''} ${dragOverGroupId === 'all' ? 'group-sidebar__item--dragover' : ''}`}
            onClick={() => handleGroupClick(undefined)}
            onDragOver={(e) => handleDragOver(e, 'all')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, undefined)}
          >
            <div className="group-sidebar__avatar group-sidebar__avatar--all">
              <IconGridStroked style={{ fontSize: 20 }} />
            </div>
            <span className="group-sidebar__badge">{codeList?.length || 0}</span>
          </div>
        </Tooltip>
      </div>

      <div className="group-sidebar__scroll">
        {groupList?.map((group, index) => {
          const count = groupCount(group.id)
          return (
            <Tooltip key={group.id} content={group.name} position="right">
              <div
                className={`group-sidebar__item ${setting?.activeGroupId === group.id ? 'group-sidebar__item--active' : ''} ${dragOverGroupId === group.id ? 'group-sidebar__item--dragover' : ''}`}
                onClick={() => handleGroupClick(group.id)}
                onDoubleClick={() => openEditModal(group.id)}
                onDragOver={(e) => handleDragOver(e, group.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, group.id)}
              >
                {group.icon ? (
                  <img className="group-sidebar__avatar-img" src={group.icon} alt={group.name} />
                ) : (
                  <div
                    className="group-sidebar__avatar"
                    style={{
                      backgroundColor: group.color || getAvatarColor(group.name, index),
                    }}
                  >
                    {group.name.charAt(0)}
                  </div>
                )}
                {count > 0 && <span className="group-sidebar__badge">{count}</span>}
                <div
                  className="group-sidebar__edit-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditModal(group.id)
                  }}
                >
                  <IconEditStroked style={{ fontSize: 10 }} />
                </div>
              </div>
            </Tooltip>
          )
        })}
      </div>

      <div className="group-sidebar__fixed-bottom">
        <Tooltip content="新建分组" position="right">
          <div
            className="group-sidebar__item group-sidebar__item--add"
            onClick={() => setAddModalVisible(true)}
          >
            <IconPlusStroked style={{ fontSize: 16, color: '#999' }} />
          </div>
        </Tooltip>
      </div>

      {/* 新建分组弹框 */}
      <Modal
        title="新建分组"
        visible={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false)
          setNewGroupName('')
          setNewGroupIcon(undefined)
        }}
        centered
        footer={
          <div className="group-modal__footer-split">
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              onClick={() => {
                setAddModalVisible(false)
                setNewGroupName('')
                setNewGroupIcon(undefined)
              }}
            >
              取消
            </Button>
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              theme="solid"
              type="primary"
              onClick={handleAddGroup}
            >
              添加
            </Button>
          </div>
        }
      >
        <div className="group-modal">
          {renderIconEditor(
            newGroupIcon,
            () => addIconInputRef.current?.click(),
            () => setNewGroupIcon(undefined),
          )}
          <Input
            placeholder="请输入分组名称"
            value={newGroupName}
            onChange={setNewGroupName}
            size="large"
            autoFocus
          />
        </div>
      </Modal>

      {/* 编辑分组弹框 */}
      <Modal
        title="编辑分组"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setEditGroupId(null)
        }}
        centered
        footer={
          <>
            <div className="group-modal__footer-split">
              <Button
                className="group-modal__footer-split-btn"
                size="large"
                onClick={() => {
                  setEditModalVisible(false)
                  setEditGroupId(null)
                }}
              >
                取消
              </Button>
              <Button
                className="group-modal__footer-split-btn"
                size="large"
                theme="solid"
                type="primary"
                onClick={handleEditGroup}
              >
                保存
              </Button>
            </div>
            <div className="group-modal__footer-delete">
              <Button
                type="danger"
                theme="borderless"
                icon={<IconDeleteStroked />}
                block
                onClick={() => {
                  setEditModalVisible(false)
                  if (editGroupId) {
                    handleDeleteGroup(editGroupId)
                  }
                }}
              >
                删除分组
              </Button>
            </div>
          </>
        }
      >
        <div className="group-modal">
          {renderIconEditor(
            editGroupIcon,
            () => editIconInputRef.current?.click(),
            () => setEditGroupIcon(undefined),
          )}
          <Input
            placeholder="请输入分组名称"
            value={editGroupName}
            onChange={setEditGroupName}
            size="large"
            autoFocus
          />
        </div>
      </Modal>

      {/* 删除确认弹框 */}
      <Modal
        title="删除分组"
        visible={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false)
          setDeleteGroupId(null)
        }}
        centered
        footer={
          <div className="group-modal__footer-split">
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              onClick={() => {
                setDeleteModalVisible(false)
                setDeleteGroupId(null)
              }}
            >
              取消
            </Button>
            <Button
              className="group-modal__footer-split-btn"
              size="large"
              theme="solid"
              type="danger"
              onClick={confirmDeleteGroup}
            >
              确认删除
            </Button>
          </div>
        }
      >
        <div className="group-modal">
          <p className="group-modal__delete-tip">
            该分组下有 {codeList?.filter((c) => c.groupId === deleteGroupId).length || 0}{' '}
            个二维码，请选择处理方式
          </p>
          <div className="group-modal__delete-options">
            <div
              className={`group-modal__delete-option ${deleteMode === 'release' ? 'group-modal__delete-option--active' : ''}`}
              onClick={() => setDeleteMode('release')}
            >
              释放二维码（移至未分组）
            </div>
            <div
              className={`group-modal__delete-option ${deleteMode === 'delete' ? 'group-modal__delete-option--active' : ''}`}
              onClick={() => setDeleteMode('delete')}
            >
              同时删除二维码
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GroupSidebar
