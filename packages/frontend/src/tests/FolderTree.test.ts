import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FolderTree from '@/components/FolderTree.vue'
import type { FolderNode, FileSystemItem } from '@/types'

// Mock the FolderTreeNode component
vi.mock('@/components/FolderTreeNode.vue', () => ({
  default: {
    name: 'FolderTreeNode',
    template: '<div class="mock-folder-tree-node">{{ folder.name }}</div>',
    props: ['folder', 'selectedFolderId'],
    emits: ['select', 'toggle']
  }
}))

describe('FolderTree', () => {
  const mockFolderTree: FolderNode[] = [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      parentId: null,
      path: '/Documents',
      modifiedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      children: [],
      isExpanded: false,
      hasSubfolders: true
    },
    {
      id: '2',
      name: 'Pictures',
      type: 'folder',
      parentId: null,
      path: '/Pictures',
      modifiedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      children: [],
      isExpanded: false,
      hasSubfolders: false
    }
  ]

  const mockSearchResults: FileSystemItem[] = [
    {
      id: '3',
      name: 'test.txt',
      type: 'file',
      parentId: '1',
      path: '/Documents/test.txt',
      modifiedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      size: 1024
    }
  ]

  const defaultProps = {
    folderTree: mockFolderTree,
    selectedFolderId: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    searchResults: [],
    isSearching: false,
    showSearch: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders folder tree when not loading', () => {
    const wrapper = mount(FolderTree, {
      props: defaultProps
    })

    expect(wrapper.find('.folder-tree').exists()).toBe(true)
    expect(wrapper.find('.tree-container').exists()).toBe(true)
    expect(wrapper.findAll('.mock-folder-tree-node')).toHaveLength(2)
  })

  it('shows loading state', () => {
    const wrapper = mount(FolderTree, {
      props: {
        ...defaultProps,
        isLoading: true
      }
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.loading').text()).toBe('Loading folders...')
  })

  it('shows error state with retry button', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        ...defaultProps,
        error: 'Failed to load folders'
      }
    })

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.find('.error').text()).toContain('Failed to load folders')
    
    const retryButton = wrapper.find('.retry-button')
    expect(retryButton.exists()).toBe(true)
    
    await retryButton.trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('shows empty state when no folders', () => {
    const wrapper = mount(FolderTree, {
      props: {
        ...defaultProps,
        folderTree: []
      }
    })

    expect(wrapper.find('.empty').exists()).toBe(true)
    expect(wrapper.find('.empty').text()).toBe('No folders found')
  })

  it('handles search functionality', async () => {
    const wrapper = mount(FolderTree, {
      props: defaultProps
    })

    const searchInput = wrapper.find('.search-input')
    const searchButton = wrapper.find('.search-button')

    await searchInput.setValue('test')
    await searchButton.trigger('click')

    expect(wrapper.emitted('search')).toHaveLength(1)
    expect(wrapper.emitted('search')?.[0]).toEqual(['test'])
  })

  it('shows search results when available', () => {
    const wrapper = mount(FolderTree, {
      props: {
        ...defaultProps,
        searchQuery: 'test',
        searchResults: mockSearchResults
      }
    })

    expect(wrapper.find('.search-results').exists()).toBe(true)
    expect(wrapper.find('.search-results h4').text()).toBe('Search Results (1)')
    expect(wrapper.findAll('.search-item')).toHaveLength(1)
  })

  it('handles clear search', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        ...defaultProps,
        searchQuery: 'test'
      }
    })

    const clearButton = wrapper.find('.clear-button')
    await clearButton.trigger('click')

    expect(wrapper.emitted('clear-search')).toHaveLength(1)
  })

  it('emits select event when search item is clicked', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        ...defaultProps,
        searchQuery: 'test',
        searchResults: mockSearchResults
      }
    })

    const searchItem = wrapper.find('.search-item')
    await searchItem.trigger('click')

    // Should not emit select for files, only folders
    expect(wrapper.emitted('select')).toBeUndefined()

    // Test with folder in search results
    const folderSearchResults = [mockFolderTree[0]]
    await wrapper.setProps({
      searchResults: folderSearchResults
    })

    const folderSearchItem = wrapper.find('.search-item')
    await folderSearchItem.trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')?.[0]).toEqual(['1'])
  })

  it('disables search button when searching', () => {
    const wrapper = mount(FolderTree, {
      props: {
        ...defaultProps,
        isSearching: true
      }
    })

    const searchButton = wrapper.find('.search-button')
    expect(searchButton.attributes('disabled')).toBeDefined()
    expect(searchButton.text()).toBe('Searching...')
  })

  it('handles search on Enter key', async () => {
    const wrapper = mount(FolderTree, {
      props: defaultProps
    })

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test')
    await searchInput.trigger('keyup.enter')

    expect(wrapper.emitted('search')).toHaveLength(1)
    expect(wrapper.emitted('search')?.[0]).toEqual(['test'])
  })

  it('hides search when showSearch is false', () => {
    const wrapper = mount(FolderTree, {
      props: {
        ...defaultProps,
        showSearch: false
      }
    })

    expect(wrapper.find('.search-container').exists()).toBe(false)
  })
})
