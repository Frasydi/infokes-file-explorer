import { ref, computed, reactive } from 'vue'
import type { FileSystemItem, FolderNode } from '@/types'
import { apiService } from '@/services/api'

export const useFileExplorer = () => {
  // State
  const allFolders = ref<FileSystemItem[]>([])
  const selectedFolderId = ref<string | null>(null)
  const folderContents = ref<FileSystemItem[]>([])
  const isLoadingTree = ref(false) // For initial folder tree loading
  const isLoadingContents = ref(false) // For folder contents loading
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const searchResults = ref<FileSystemItem[]>([])
  const isSearching = ref(false)

  // Reactive state for expanded folders
  const expandedFolders = reactive(new Set<string>())
  
  // Debounce mechanism for folder selection
  let currentLoadingPromise: Promise<void> | null = null

  // Computed properties
  const folderTree = computed(() => {
    if (allFolders.value.length === 0) return []
    return buildFolderTree(allFolders.value)
  })

  const selectedFolder = computed(() => {
    if (!selectedFolderId.value) return null
    return allFolders.value.find(folder => folder.id === selectedFolderId.value) || null
  })

  const folderSubfolders = computed(() => {
    return folderContents.value.filter(item => item.type === 'folder')
  })

  const folderFiles = computed(() => {
    return folderContents.value.filter(item => item.type === 'file')
  })

  // Helper function to build tree structure
  const buildFolderTree = (folders: FileSystemItem[]): FolderNode[] => {
    const folderMap = new Map<string, FolderNode>()
    const rootFolders: FolderNode[] = []

    // Create folder nodes
    folders.forEach(folder => {
      if (folder.type === 'folder') {
        const node: FolderNode = {
          ...folder,
          type: 'folder' as const,
          children: [],
          isExpanded: expandedFolders.has(folder.id),
          hasSubfolders: false
        }
        folderMap.set(folder.id, node)
      }
    })

    // Build tree structure
    folders.forEach(folder => {
      if (folder.type === 'folder') {
        const node = folderMap.get(folder.id)!
        
        if (folder.parentId && folderMap.has(folder.parentId)) {
          const parent = folderMap.get(folder.parentId)!
          parent.children!.push(node)
          parent.hasSubfolders = true
        } else {
          rootFolders.push(node)
        }
      }
    })

    return rootFolders
  }

  // Actions
  const loadAllFolders = async (): Promise<void> => {
    try {
      isLoadingTree.value = true
      error.value = null
      allFolders.value = await apiService.getAllFolders()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load folders'
      console.error('Failed to load folders:', err)
    } finally {
      isLoadingTree.value = false
    }
  }

  const selectFolder = async (folderId: string): Promise<void> => {
    // If already loading this folder, don't start another request
    if (currentLoadingPromise && selectedFolderId.value === folderId) {
      return currentLoadingPromise
    }

    // Set the selected folder immediately for instant UI feedback
    selectedFolderId.value = folderId
    
    // Create the loading promise
    currentLoadingPromise = (async () => {
      try {
        // Only show loading for content, not for the tree selection
        isLoadingContents.value = true
        error.value = null
        
        // Load the folder contents
        folderContents.value = await apiService.getFolderContents(folderId)
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to load folder contents'
        console.error('Failed to load folder contents:', err)
        folderContents.value = []
      } finally {
        isLoadingContents.value = false
        currentLoadingPromise = null
      }
    })()

    return currentLoadingPromise
  }

  const toggleFolder = (folderId: string): void => {
    if (expandedFolders.has(folderId)) {
      expandedFolders.delete(folderId)
    } else {
      expandedFolders.add(folderId)
    }
  }

  const expandFolder = (folderId: string): void => {
    expandedFolders.add(folderId)
  }

  const collapseFolder = (folderId: string): void => {
    expandedFolders.delete(folderId)
  }

  const clearSelection = (): void => {
    selectedFolderId.value = null
    folderContents.value = []
  }

  const searchFiles = async (query: string): Promise<void> => {
    if (!query.trim()) {
      searchQuery.value = ''
      searchResults.value = []
      return
    }

    try {
      isSearching.value = true
      error.value = null
      searchQuery.value = query
      searchResults.value = await apiService.searchItems(query)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Search failed'
      console.error('Search failed:', err)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  const clearSearch = (): void => {
    searchQuery.value = ''
    searchResults.value = []
  }

  // Initialize
  const initialize = async (): Promise<void> => {
    await loadAllFolders()
  }

  return {
    // State
    allFolders,
    selectedFolderId,
    folderContents,
    isLoadingTree,
    isLoadingContents,
    error,
    searchQuery,
    searchResults,
    isSearching,
    expandedFolders,

    // Computed
    folderTree,
    selectedFolder,
    folderSubfolders,
    folderFiles,

    // Actions
    loadAllFolders,
    selectFolder,
    toggleFolder,
    expandFolder,
    collapseFolder,
    clearSelection,
    searchFiles,
    clearSearch,
    initialize,
  }
}
