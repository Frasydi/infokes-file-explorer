import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FolderContents from '@/components/FolderContents.vue'
import type { FileSystemItem } from '@/types'

describe('FolderContents', () => {
  const mockFolder: FileSystemItem = {
    id: '1',
    name: 'Documents',
    type: 'folder',
    parentId: null,
    path: '/Documents',
    modifiedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z'
  }

  const mockItems: FileSystemItem[] = [
    {
      id: '2',
      name: 'Subfolder',
      type: 'folder',
      parentId: '1',
      path: '/Documents/Subfolder',
      modifiedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'document.txt',
      type: 'file',
      parentId: '1',
      path: '/Documents/document.txt',
      modifiedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      size: 1024
    },
    {
      id: '4',
      name: 'image.jpg',
      type: 'file',
      parentId: '1',
      path: '/Documents/image.jpg',
      modifiedAt: '2023-01-02T00:00:00Z',
      createdAt: '2023-01-02T00:00:00Z',
      size: 2048
    }
  ]

  const defaultProps = {
    items: mockItems,
    selectedFolder: mockFolder,
    isLoading: false,
    error: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders folder contents when not loading', () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    expect(wrapper.find('.folder-contents').exists()).toBe(true)
    expect(wrapper.find('.contents-header h3').text()).toBe('Documents')
    expect(wrapper.find('.folder-path').text()).toBe('/Documents')
    expect(wrapper.findAll('.item')).toHaveLength(3)
  })

  it('shows loading state', () => {
    const wrapper = mount(FolderContents, {
      props: {
        ...defaultProps,
        isLoading: true
      }
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.loading').text()).toContain('Loading contents...')
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })

  it('shows error state with retry button', async () => {
    const wrapper = mount(FolderContents, {
      props: {
        ...defaultProps,
        error: 'Failed to load contents'
      }
    })

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Failed to load contents')
    
    const retryButton = wrapper.find('.retry-button')
    expect(retryButton.exists()).toBe(true)
    
    await retryButton.trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('shows empty state when no folder selected', () => {
    const wrapper = mount(FolderContents, {
      props: {
        ...defaultProps,
        selectedFolder: null
      }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-message').text()).toBe('Select a folder from the left panel to view its contents')
  })

  it('shows empty contents when folder is empty', () => {
    const wrapper = mount(FolderContents, {
      props: {
        ...defaultProps,
        items: []
      }
    })

    expect(wrapper.find('.empty-contents').exists()).toBe(true)
    expect(wrapper.find('.empty-message').text()).toBe('This folder is empty')
  })

  it('displays correct item count', () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    expect(wrapper.find('.items-count').text()).toBe('3 items (1 folders, 2 files)')
  })

  it('sorts items correctly by name', async () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    // Items should be sorted with folders first, then by name
    const items = wrapper.findAll('.item-name')
    expect(items[0].text()).toBe('Subfolder') // folder first
    expect(items[1].text()).toBe('document.txt') // files sorted alphabetically
    expect(items[2].text()).toBe('image.jpg')
  })

  it('switches between grid and list view', async () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    // Default should be grid view
    expect(wrapper.find('.items-container.grid').exists()).toBe(true)
    expect(wrapper.find('.items-container.list').exists()).toBe(false)

    // Switch to list view
    const listButton = wrapper.findAll('.view-button')[1]
    await listButton.trigger('click')

    expect(wrapper.find('.items-container.list').exists()).toBe(true)
    expect(wrapper.find('.items-container.grid').exists()).toBe(false)
  })

  it('sorts by different criteria', async () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    const sortSelect = wrapper.find('.sort-select')
    
    // Sort by size
    await sortSelect.setValue('size')
    await sortSelect.trigger('change')

    // Folders should still be first, then files sorted by size
    const items = wrapper.findAll('.item-name')
    expect(items[0].text()).toBe('Subfolder') // folder first
    expect(items[1].text()).toBe('document.txt') // smaller file (1024)
    expect(items[2].text()).toBe('image.jpg') // larger file (2048)
  })

  it('toggles sort order', async () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    const sortOrderButton = wrapper.find('.sort-order-button')
    
    // Should start with ascending order
    expect(sortOrderButton.text()).toBe('↑')
    expect(sortOrderButton.classes()).not.toContain('active')

    // Toggle to descending
    await sortOrderButton.trigger('click')
    
    expect(sortOrderButton.text()).toBe('↓')
    expect(sortOrderButton.classes()).toContain('active')
  })

  it('emits select-folder event on folder double-click', async () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    const folderItem = wrapper.findAll('.item')[0] // First item should be the folder
    await folderItem.trigger('dblclick')

    expect(wrapper.emitted('select-folder')).toHaveLength(1)
    expect(wrapper.emitted('select-folder')?.[0]).toEqual(['2'])
  })

  it('does not emit select-folder event on file double-click', async () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    const fileItem = wrapper.findAll('.item')[1] // Second item should be a file
    await fileItem.trigger('dblclick')

    expect(wrapper.emitted('select-folder')).toBeUndefined()
  })

  it('formats file sizes correctly', () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    // Find file items and check their size display
    const items = wrapper.findAll('.item')
    const fileItems = items.filter(item => item.find('.item-size').exists())
    
    expect(fileItems).toHaveLength(2)
    // The exact text might vary based on formatting, but should contain size info
    expect(fileItems[0].find('.item-size').text()).toMatch(/\d+(\.\d+)?\s*(B|KB|MB|GB)/)
  })

  it('displays correct file type icons', () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    const icons = wrapper.findAll('.item-icon')
    expect(icons[0].text()).toBe('📁') // folder icon
    expect(icons[1].text()).toBe('📄') // text file icon
    expect(icons[2].text()).toBe('🖼️') // image file icon
  })

  it('formats dates correctly', () => {
    const wrapper = mount(FolderContents, {
      props: defaultProps
    })

    const modifiedDates = wrapper.findAll('.item-modified')
    expect(modifiedDates).toHaveLength(3)
    
    // Should contain formatted date strings
    modifiedDates.forEach(dateElement => {
      expect(dateElement.text()).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}/)
    })
  })
})
