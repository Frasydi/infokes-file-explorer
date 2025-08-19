export interface FileSystemItem {
  id: string
  name: string
  type: 'folder' | 'file'
  parentId: string | null
  path: string
  size?: number
  modifiedAt: string
  createdAt: string
}

export interface FolderNode extends FileSystemItem {
  type: 'folder'
  children?: FolderNode[]
  isExpanded?: boolean
  hasSubfolders?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface GetFoldersResponse {
  folders: FileSystemItem[]
}

export interface GetSubItemsResponse {
  items: FileSystemItem[]
}
