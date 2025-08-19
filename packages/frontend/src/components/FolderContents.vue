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
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.contents-header h3 {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 500;
  color: #1e293b;
}

.folder-path {
  font-size: 12px;
  color: #64748b;
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
  color: #64748b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #1e293b;
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
  color: #ef4444;
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
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
  gap: 16px;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.view-options {
  display: flex;
  gap: 4px;
  flex-shrink: 0; /* Prevent shrinking */
}

.view-button {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.15s ease-in-out;
  min-width: 36px; /* Ensure minimum width */
  color: #475569;
}

.view-button:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.view-button.active {
  background-color: #1e293b;
  border-color: #1e293b;
  color: white;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0; /* Prevent shrinking */
}

.sort-select {
  padding: 6px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 14px;
  min-width: 140px; /* Ensure minimum width */
  color: #475569;
  background-color: #ffffff;
}

.sort-order-button {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.15s ease-in-out;
  min-width: 36px; /* Ensure minimum width */
  color: #475569;
}

.sort-order-button:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.sort-order-button.active {
  background-color: #64748b;
  border-color: #64748b;
  color: white;
}

.items-count {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  flex: 1; /* Take remaining space */
  text-align: right; /* Align to right */
  min-width: 0; /* Allow shrinking if needed */
}

.items-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.items-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Increased from 180px */
  gap: 20px; /* Increased gap to prevent collision */
}

.items-container.list {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Increased gap for better separation */
}

.item {
  display: flex;
  align-items: center;
  padding: 16px; /* Increased padding */
  border: 1px solid #e2e8f0;
  border-radius: 8px; /* Slightly more rounded */
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  background-color: #ffffff;
  position: relative; /* For better stacking context */
}

.item:hover {
  border-color: #1e293b;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.08);
  transform: translateY(-1px);
}

.items-container.grid .item {
  flex-direction: column;
  text-align: center;
  min-height: 140px; /* Increased height to prevent cramping */
  justify-content: center;
  max-width: 100%; /* Prevent overflow */
}

.items-container.list .item {
  flex-direction: row;
  gap: 16px; /* Increased gap */
  min-height: 56px; /* Ensure consistent height */
}

.item-icon {
  font-size: 36px; /* Increased icon size */
  margin-bottom: 10px; /* More space */
  flex-shrink: 0; /* Prevent shrinking */
}

.items-container.list .item-icon {
  font-size: 28px; /* Larger in list view */
  margin-bottom: 0;
  flex-shrink: 0;
  width: 40px; /* Fixed width to prevent collision */
  text-align: center;
}

.item-details {
  flex: 1;
  min-width: 0; /* Allow shrinking */
  overflow: hidden; /* Prevent overflow */
}

.items-container.list .item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%; /* Ensure full width usage */
  min-width: 0; /* Allow shrinking */
}

.item-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 6px; /* Increased margin */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%; /* Ensure it doesn't exceed container */
  line-height: 1.3; /* Better line height */
}

.items-container.grid .item-name {
  text-align: center;
  max-width: 180px; /* Limit width in grid view */
  margin: 0 auto; /* Center align */
}

.items-container.list .item-name {
  flex: 1; /* Take available space */
  margin-right: 16px; /* Space before metadata */
  margin-bottom: 0; /* No bottom margin in list view */
  min-width: 120px; /* Minimum width to prevent cramping */
  max-width: 300px; /* Maximum width to prevent collision */
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 3px; /* Slightly more gap */
  font-size: 11px;
  color: #64748b;
  flex-shrink: 0; /* Prevent shrinking */
}

.items-container.list .item-meta {
  flex-direction: row;
  gap: 16px; /* Increased gap to prevent collision */
  align-items: center;
  white-space: nowrap; /* Prevent wrapping */
  min-width: 0; /* Allow shrinking if needed */
}

.items-container.list .item-meta > span {
  flex-shrink: 0; /* Prevent individual items from shrinking */
}

.item-type {
  text-transform: capitalize;
  min-width: 40px; /* Minimum width for type */
}

.item-size {
  font-family: monospace;
  min-width: 60px; /* Minimum width for size */
  text-align: right; /* Right align for better appearance */
}

.item-modified {
  font-family: monospace;
  min-width: 120px; /* Minimum width for date */
  text-align: right; /* Right align for better appearance */
}

.items-container.grid .item-meta {
  text-align: center;
}

/* File/folder specific styling */
.item-folder:hover {
  border-color: #0f766e;
  box-shadow: 0 2px 8px rgba(15, 118, 110, 0.12);
}

.item-file:hover {
  border-color: #0369a1;
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.12);
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
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f1f5f9;
  border-top: 2px solid #1e293b;
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

/* Responsive design fixes */
@media (max-width: 768px) {
  .view-controls {
    padding: 8px 16px;
    gap: 8px;
  }
  
  .sort-select {
    min-width: 120px;
    font-size: 13px;
  }
  
  .items-count {
    font-size: 11px;
  }
  
  .items-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
    padding: 12px 16px;
  }
  
  .items-container.list {
    padding: 12px 16px;
  }
  
  .item {
    padding: 12px;
  }
  
  .items-container.grid .item {
    min-height: 120px;
  }
  
  .item-icon {
    font-size: 28px;
  }
  
  .items-container.list .item-icon {
    font-size: 24px;
    width: 32px;
  }
  
  .items-container.list .item-meta {
    gap: 8px;
    font-size: 10px;
  }
  
  .item-size,
  .item-modified {
    min-width: auto;
  }
  
  .items-container.list .item-name {
    min-width: 80px;
    max-width: 150px;
  }
}

@media (max-width: 480px) {
  .view-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .view-controls > div {
    justify-content: center;
  }
  
  .items-count {
    text-align: center;
    order: -1; /* Move to top */
  }
  
  .sort-select {
    min-width: auto;
    flex: 1;
  }
  
  .items-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .items-container.list .item-meta {
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
  }
  
  .items-container.list .item-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .items-container.list .item-name {
    margin-right: 0;
    max-width: 100%;
  }
}
</style>
