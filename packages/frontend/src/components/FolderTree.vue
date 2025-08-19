<template>
  <div class="folder-tree">
    <div class="folder-tree-header">
      <h3>Folders</h3>
      <div class="search-container" v-if="showSearch">
        <input
          v-model="localSearchQuery"
          @input="onSearchInput"
          @keyup.enter="onSearch"
          type="text"
          placeholder="Search files and folders..."
          class="search-input"
        />
        <button 
          @click="onSearch" 
          :disabled="isSearching"
          class="search-button"
        >
          {{ isSearching ? 'Searching...' : 'Search' }}
        </button>
        <button 
          @click="onClearSearch"
          v-if="searchQuery"
          class="clear-button"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchQuery && searchResults.length > 0" class="search-results">
      <h4>Search Results ({{ searchResults.length }})</h4>
      <div class="search-items">
        <div
          v-for="item in searchResults"
          :key="`search-${item.id}`"
          @click="onItemClick(item)"
          class="search-item"
          :class="{ 'selected': selectedFolderId === item.id }"
        >
          <span class="item-icon">
            {{ item.type === 'folder' ? '📁' : '📄' }}
          </span>
          <span class="item-name">{{ item.name }}</span>
          <span class="item-path">{{ item.path }}</span>
        </div>
      </div>
    </div>

    <!-- Folder Tree -->
    <div v-else class="tree-container">
      <div v-if="isLoading" class="loading">
        Loading folders...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
        <button @click="$emit('retry')" class="retry-button">Retry</button>
      </div>

      <div v-else-if="folderTree.length === 0" class="empty">
        No folders found
      </div>

      <div v-else class="tree-nodes">
        <FolderTreeNode
          v-for="folder in folderTree"
          :key="folder.id"
          :folder="folder"
          :selected-folder-id="selectedFolderId"
          @select="onFolderSelect"
          @toggle="onFolderToggle"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FolderNode, FileSystemItem } from '@/types'
import FolderTreeNode from './FolderTreeNode.vue'

interface Props {
  folderTree: FolderNode[]
  selectedFolderId: string | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  searchResults: FileSystemItem[]
  isSearching: boolean
  showSearch?: boolean
}

interface Emits {
  (e: 'select', folderId: string): void
  (e: 'toggle', folderId: string): void
  (e: 'search', query: string): void
  (e: 'clear-search'): void
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  showSearch: true
})

const emit = defineEmits<Emits>()

const localSearchQuery = ref('')

// Watch for external search query changes
watch(() => props.searchQuery, (newQuery) => {
  localSearchQuery.value = newQuery
})

const onFolderSelect = (folderId: string) => {
  emit('select', folderId)
}

const onFolderToggle = (folderId: string) => {
  emit('toggle', folderId)
}

const onSearchInput = () => {
  // Debounce search input if needed
}

const onSearch = () => {
  if (localSearchQuery.value.trim()) {
    emit('search', localSearchQuery.value.trim())
  }
}

const onClearSearch = () => {
  localSearchQuery.value = ''
  emit('clear-search')
}

const onItemClick = (item: FileSystemItem) => {
  if (item.type === 'folder') {
    emit('select', item.id)
  }
}
</script>

<style scoped>
.folder-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
}

.folder-tree-header {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.folder-tree-header h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
}

.search-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 14px;
  color: #475569;
}

.search-input:focus {
  outline: none;
  border-color: #1e293b;
  box-shadow: 0 0 0 2px rgba(30, 41, 59, 0.1);
}

.search-button,
.clear-button,
.retry-button {
  padding: 8px 12px;
  border: 1px solid #1e293b;
  background-color: #1e293b;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.search-button:hover,
.retry-button:hover {
  background-color: #0056b3;
}

.search-button:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

.clear-button {
  background-color: #6c757d;
  border-color: #6c757d;
}

.clear-button:hover {
  background-color: #545b62;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.search-results h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #6c757d;
}

.search-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.search-item:hover {
  background-color: #e9ecef;
}

.search-item.selected {
  background-color: #007bff;
  color: white;
}

.item-icon {
  flex-shrink: 0;
  font-size: 16px;
}

.item-name {
  font-weight: 500;
  min-width: 0;
}

.item-path {
  font-size: 12px;
  color: #6c757d;
  margin-left: auto;
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-item.selected .item-path {
  color: rgba(255, 255, 255, 0.8);
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.loading,
.error,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.error {
  color: #dc3545;
}

.tree-nodes {
  display: flex;
  flex-direction: column;
}
</style>
