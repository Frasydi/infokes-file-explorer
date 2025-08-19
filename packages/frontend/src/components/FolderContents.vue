<template>
  <div class="folder-contents">
    <div class="contents-header">
      <h3>
        {{ selectedFolder ? selectedFolder.name : 'Select a folder' }}
      </h3>
      <div v-if="selectedFolder" class="folder-path">
        {{ selectedFolder.path }}
      </div>
    </div>

    <div class="contents-body">
      <!-- Content loading overlay - subtle, non-intrusive -->
      <div v-if="isLoading && selectedFolder" class="content-loading-overlay">
        <div class="loading-indicator">
          <div class="loading-spinner-small"></div>
        </div>
      </div>

      <div v-if="isLoading && !selectedFolder" class="loading">
        <div class="loading-spinner"></div>
        <span>Loading contents...</span>
      </div>

      <div v-else-if="error" class="error">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ error }}</div>
        <button @click="$emit('retry')" class="retry-button">Retry</button>
      </div>

      <div v-else-if="!selectedFolder" class="empty-state">
        <div class="empty-icon">📁</div>
        <div class="empty-message">Select a folder from the left panel to view its contents</div>
      </div>

      <div v-else-if="items.length === 0 && !isLoading" class="empty-contents">
        <div class="empty-icon">📂</div>
        <div class="empty-message">This folder is empty</div>
      </div>

      <div v-else-if="!isLoading || items.length > 0" class="contents-grid" :class="{ 'loading-content': isLoading }">
        <!-- View controls -->
        <div class="view-controls">
          <div class="view-options">
            <button
              @click="viewMode = 'grid'"
              :class="{ active: viewMode === 'grid' }"
              class="view-button"
              title="Grid view"
            >
              ⊞
            </button>
            <button
              @click="viewMode = 'list'"
              :class="{ active: viewMode === 'list' }"
              class="view-button"
              title="List view"
            >
              ☰
            </button>
          </div>
          
          <div class="sort-options">
            <select v-model="sortBy" @change="onSortChange" class="sort-select">
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
              <option value="size">Sort by Size</option>
              <option value="modified">Sort by Modified</option>
            </select>
            <button
              @click="toggleSortOrder"
              :class="{ active: sortOrder === 'desc' }"
              class="sort-order-button"
              :title="sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'"
            >
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>

          <div class="items-count">
            {{ sortedItems.length }} items
            <template v-if="folderCount > 0 && fileCount > 0">
              ({{ folderCount }} folders, {{ fileCount }} files)
            </template>
            <template v-else-if="folderCount > 0">
              ({{ folderCount }} folders)
            </template>
            <template v-else-if="fileCount > 0">
              ({{ fileCount }} files)
            </template>
          </div>
        </div>

        <!-- Items display -->
        <div class="items-container" :class="viewMode">
          <div
            v-for="item in sortedItems"
            :key="item.id"
            @click="onItemClick(item)"
            @dblclick="onItemDoubleClick(item)"
            class="item"
            :class="{ 
              'item-folder': item.type === 'folder',
              'item-file': item.type === 'file'
            }"
          >
            <div class="item-icon">
              {{ getItemIcon(item) }}
            </div>
            <div class="item-details">
              <div class="item-name" :title="item.name">
                {{ item.name }}
              </div>
              <div class="item-meta">
                <span class="item-type">{{ item.type }}</span>
                <span v-if="item.size !== undefined" class="item-size">
                  {{ formatFileSize(item.size) }}
                </span>
                <span class="item-modified">
                  {{ formatDate(item.modifiedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FileSystemItem } from '@/types'

interface Props {
  items: FileSystemItem[]
  selectedFolder: FileSystemItem | null
  isLoading: boolean
  error: string | null
}

interface Emits {
  (e: 'select-folder', folderId: string): void
  (e: 'retry'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref<'name' | 'type' | 'size' | 'modified'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const folderCount = computed(() => 
  props.items.filter(item => item.type === 'folder').length
)

const fileCount = computed(() => 
  props.items.filter(item => item.type === 'file').length
)

const sortedItems = computed(() => {
  const sorted = [...props.items].sort((a, b) => {
    // Folders first, then files
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }

    let compareValue = 0
    
    switch (sortBy.value) {
      case 'name':
        compareValue = a.name.localeCompare(b.name)
        break
      case 'type':
        compareValue = a.type.localeCompare(b.type)
        break
      case 'size':
        compareValue = (a.size || 0) - (b.size || 0)
        break
      case 'modified':
        compareValue = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime()
        break
    }

    return sortOrder.value === 'asc' ? compareValue : -compareValue
  })

  return sorted
})

const onItemClick = (item: FileSystemItem) => {
  // Single click selection (could be used for highlighting)
  console.log('Selected item:', item.name)
}

const onItemDoubleClick = (item: FileSystemItem) => {
  if (item.type === 'folder') {
    emit('select-folder', item.id)
  }
  // For files, could open in a viewer/editor
}

const onSortChange = () => {
  // Sort change handled by reactive computed property
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const getItemIcon = (item: FileSystemItem): string => {
  if (item.type === 'folder') {
    return '📁'
  }
  
  // File type icons based on extension
  const extension = item.name.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'txt':
    case 'md':
    case 'readme':
      return '📄'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return '🖼️'
    case 'pdf':
      return '📕'
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return '📜'
    case 'html':
    case 'htm':
      return '🌐'
    case 'css':
    case 'scss':
    case 'sass':
      return '🎨'
    case 'json':
    case 'xml':
      return '⚙️'
    case 'zip':
    case 'rar':
    case '7z':
      return '📦'
    case 'exe':
    case 'msi':
      return '⚡'
    default:
      return '📄'
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.folder-contents {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.contents-header {
  padding: 16px 24px;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.contents-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #343a40;
}

.folder-path {
  font-size: 12px;
  color: #6c757d;
  font-family: monospace;
}

.contents-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
  color: #6c757d;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 12px;
  color: #dc3545;
}

.error-icon {
  font-size: 32px;
}

.error-message {
  text-align: center;
  font-size: 14px;
}

.retry-button {
  padding: 8px 16px;
  border: 1px solid #dc3545;
  background-color: #dc3545;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-button:hover {
  background-color: #c82333;
}

.empty-state,
.empty-contents {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-message {
  text-align: center;
  font-size: 16px;
}

.contents-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.view-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
  gap: 16px;
}

.view-options {
  display: flex;
  gap: 4px;
}

.view-button {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  background-color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.15s ease-in-out;
}

.view-button:hover {
  background-color: #e9ecef;
}

.view-button.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-select {
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.sort-order-button {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  background-color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.15s ease-in-out;
}

.sort-order-button:hover {
  background-color: #e9ecef;
}

.sort-order-button.active {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.items-count {
  font-size: 12px;
  color: #6c757d;
  white-space: nowrap;
}

.items-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.items-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.items-container.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  background-color: #ffffff;
}

.item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.items-container.grid .item {
  flex-direction: column;
  text-align: center;
  min-height: 120px;
  justify-content: center;
}

.items-container.list .item {
  flex-direction: row;
  gap: 12px;
}

.item-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.items-container.list .item-icon {
  font-size: 24px;
  margin-bottom: 0;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.items-container.list .item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.items-container.grid .item-name {
  text-align: center;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  color: #6c757d;
}

.items-container.list .item-meta {
  flex-direction: row;
  gap: 12px;
  align-items: center;
}

.item-type {
  text-transform: capitalize;
}

.item-size {
  font-family: monospace;
}

.item-modified {
  font-family: monospace;
}

.items-container.grid .item-meta {
  text-align: center;
}

/* File/folder specific styling */
.item-folder:hover {
  border-color: #ffc107;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
}

.item-file:hover {
  border-color: #17a2b8;
  box-shadow: 0 2px 4px rgba(23, 162, 184, 0.2);
}

/* Content loading overlay - subtle and non-intrusive */
.content-loading-overlay {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100;
  pointer-events: none;
}

.loading-indicator {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 8px 12px;
  margin: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #0d6efd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-content {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.contents-body {
  position: relative;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
