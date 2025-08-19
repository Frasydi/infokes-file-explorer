import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FolderTreeNode from '@/components/FolderTreeNode.vue'
import type { FolderNode } from '@/types'

describe('FolderTreeNode', () => {
  const mockFolder: FolderNode = {
    id: '1',
    name: 'Documents',
    type: 'folder',
    parentId: null,
    path: '/Documents',
    modifiedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    children: [
      {
        id: '2',
        name: 'Subfolder',
        type: 'folder',
        parentId: '1',
        path: '/Documents/Subfolder',
        modifiedAt: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        children: [],
        isExpanded: false,
        hasSubfolders: false
      }
    ],
    isExpanded: false,
    hasSubfolders: true
  }

  const defaultProps = {
    folder: mockFolder,
    selectedFolderId: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders folder node correctly', () => {
    const wrapper = mount(FolderTreeNode, {
      props: defaultProps
    })

    expect(wrapper.find('.folder-node').exists()).toBe(true)
    expect(wrapper.find('.folder-name').text()).toBe('Documents')
    expect(wrapper.find('.folder-icon').text()).toBe('📁')
  })

  it('shows expand button when folder has subfolders', () => {
    const wrapper = mount(FolderTreeNode, {
      props: defaultProps
    })

    expect(wrapper.find('.expand-button').exists()).toBe(true)
    expect(wrapper.find('.expand-icon').text()).toBe('▶')
  })

  it('does not show expand button when folder has no subfolders', () => {
    const folderWithoutSubfolders: FolderNode = {
      ...mockFolder,
      hasSubfolders: false,
      children: []
    }

    const wrapper = mount(FolderTreeNode, {
      props: {
        ...defaultProps,
        folder: folderWithoutSubfolders
      }
    })

    expect(wrapper.find('.expand-button').exists()).toBe(false)
  })

  it('applies selected class when folder is selected', () => {
    const wrapper = mount(FolderTreeNode, {
      props: {
        ...defaultProps,
        selectedFolderId: '1'
      }
    })

    expect(wrapper.find('.folder-item').classes()).toContain('selected')
  })

  it('does not apply selected class when folder is not selected', () => {
    const wrapper = mount(FolderTreeNode, {
      props: {
        ...defaultProps,
        selectedFolderId: '2'
      }
    })

    expect(wrapper.find('.folder-item').classes()).not.toContain('selected')
  })

  it('emits select event when folder is clicked', async () => {
    const wrapper = mount(FolderTreeNode, {
      props: defaultProps
    })

    await wrapper.find('.folder-item').trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')?.[0]).toEqual(['1'])
  })

  it('emits toggle event when expand button is clicked', async () => {
    const wrapper = mount(FolderTreeNode, {
      props: defaultProps
    })

    await wrapper.find('.expand-button').trigger('click')

    expect(wrapper.emitted('toggle')).toHaveLength(1)
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['1'])
  })

  it('does not emit select event when expand button is clicked', async () => {
    const wrapper = mount(FolderTreeNode, {
      props: defaultProps
    })

    await wrapper.find('.expand-button').trigger('click')

    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('shows expanded icon when folder is expanded', () => {
    const expandedFolder: FolderNode = {
      ...mockFolder,
      isExpanded: true
    }

    const wrapper = mount(FolderTreeNode, {
      props: {
        ...defaultProps,
        folder: expandedFolder
      }
    })

    expect(wrapper.find('.expand-button').classes()).toContain('expanded')
  })

  it('renders children when folder is expanded and has children', () => {
    const expandedFolder: FolderNode = {
      ...mockFolder,
      isExpanded: true
    }

    const wrapper = mount(FolderTreeNode, {
      props: {
        ...defaultProps,
        folder: expandedFolder
      }
    })

    expect(wrapper.find('.folder-children').exists()).toBe(true)
    // Should render one child component (though it will be mocked in the test environment)
    const childComponents = wrapper.findAllComponents(FolderTreeNode)
    expect(childComponents).toHaveLength(2) // Parent + 1 child
  })

  it('does not render children when folder is collapsed', () => {
    const wrapper = mount(FolderTreeNode, {
      props: defaultProps
    })

    expect(wrapper.find('.folder-children').exists()).toBe(false)
  })

  it('does not render children when folder has no children', () => {
    const folderWithoutChildren: FolderNode = {
      ...mockFolder,
      isExpanded: true,
      children: []
    }

    const wrapper = mount(FolderTreeNode, {
      props: {
        ...defaultProps,
        folder: folderWithoutChildren
      }
    })

    expect(wrapper.find('.folder-children').exists()).toBe(false)
  })

  it('forwards child events correctly', async () => {
    const expandedFolder: FolderNode = {
      ...mockFolder,
      isExpanded: true
    }

    const wrapper = mount(FolderTreeNode, {
      props: {
        ...defaultProps,
        folder: expandedFolder
      }
    })

    // Find the child component and emit events from it
    const childComponents = wrapper.findAllComponents(FolderTreeNode)
    const childComponent = childComponents[1] // The actual child (not the parent)

    // Simulate child emitting select event
    await childComponent.vm.$emit('select', '2')
    
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')?.[0]).toEqual(['2'])

    // Simulate child emitting toggle event
    await childComponent.vm.$emit('toggle', '2')
    
    expect(wrapper.emitted('toggle')).toHaveLength(1)
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['2'])
  })

  it('applies has-children class when folder has subfolders', () => {
    const wrapper = mount(FolderTreeNode, {
      props: defaultProps
    })

    expect(wrapper.find('.folder-item').classes()).toContain('has-children')
  })

  it('does not apply has-children class when folder has no subfolders', () => {
    const folderWithoutSubfolders: FolderNode = {
      ...mockFolder,
      hasSubfolders: false
    }

    const wrapper = mount(FolderTreeNode, {
      props: {
        ...defaultProps,
        folder: folderWithoutSubfolders
      }
    })

    expect(wrapper.find('.folder-item').classes()).not.toContain('has-children')
  })
})
