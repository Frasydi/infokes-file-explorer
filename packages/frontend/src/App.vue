<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">File Explorer</h1>
      <div class="app-subtitle">Windows Explorer Clone</div>
    </header>

    <main class="app-main">
      <div class="explorer-container">
        <!-- Left Panel - Folder Tree -->
        <div class="left-panel">
          <FolderTree
            :folder-tree="folderTree"
            :selected-folder-id="selectedFolderId"
            :is-loading="isLoadingTree"
            :error="error"
            :search-query="searchQuery"
            :search-results="searchResults"
            :is-searching="isSearching"
            @select="onFolderSelect"
            @toggle="onFolderToggle"
            @search="onSearch"
            @clear-search="onClearSearch"
            @retry="onRetry"
          />
        </div>

        <!-- Resizer -->
        <div class="resizer" @mousedown="startResize"></div>

        <!-- Right Panel - Folder Contents -->
        <div class="right-panel" ref="rightPanel">
          <FolderContents
            :items="folderContents"
            :selected-folder="selectedFolder"
            :is-loading="isLoadingContents"
            :error="error"
            @select-folder="onFolderSelect"
            @retry="onRetry"
          />
        </div>
      </div>
    </main>

    <!-- Loading Overlay -->
    <div v-if="isInitializing" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div>Loading file system...</div>
      </div>
    </div>

    <!-- Error Toast -->
    <div v-if="showErrorToast" class="error-toast" @click="hideErrorToast">
      <div class="toast-content">
        <span class="toast-icon">⚠️</span>
        <span class="toast-message">{{ error }}</span>
        <button class="toast-close" @click.stop="hideErrorToast">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import FolderTree from '@/components/FolderTree.vue'
import FolderContents from '@/components/FolderContents.vue'
import { useFileExplorer } from '@/composables/useFileExplorer'

// File explorer composable
const {
  folderTree,
  selectedFolderId,
  selectedFolder,
  folderContents,
  isLoadingTree,
  isLoadingContents,
  error,
  searchQuery,
  searchResults,
  isSearching,
  selectFolder,
  toggleFolder,
  searchFiles,
  clearSearch,
  initialize,
} = useFileExplorer()

// Local state
const isInitializing = ref(true)
const showErrorToast = ref(false)
const rightPanel = ref<HTMLElement>()
const leftPanelWidth = ref(300)

// Watch for errors to show toast
watch(error, (newError) => {
  if (newError) {
    showErrorToast.value = true
    // Auto-hide after 5 seconds
    setTimeout(() => {
      showErrorToast.value = false
    }, 5000)
  } else {
    showErrorToast.value = false
  }
})

// Event handlers
const onFolderSelect = async (folderId: string) => {
  try {
    await selectFolder(folderId)
  } catch (err) {
    console.error('Failed to select folder:', err)
  }
}

const onFolderToggle = (folderId: string) => {
  toggleFolder(folderId)
}

const onSearch = async (query: string) => {
  try {
    await searchFiles(query)
  } catch (err) {
    console.error('Search failed:', err)
  }
}

const onClearSearch = () => {
  clearSearch()
}

const onRetry = async () => {
  try {
    if (selectedFolderId.value) {
      await selectFolder(selectedFolderId.value)
    } else {
      await initialize()
    }
  } catch (err) {
    console.error('Retry failed:', err)
  }
}

const hideErrorToast = () => {
  showErrorToast.value = false
}

// Resizer functionality
let isResizing = false
let startX = 0
let startWidth = 0

const startResize = (e: MouseEvent) => {
  isResizing = true
  startX = e.clientX
  startWidth = leftPanelWidth.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing) return
  
  const deltaX = e.clientX - startX
  const newWidth = Math.max(200, Math.min(600, startWidth + deltaX))
  leftPanelWidth.value = newWidth
  
  // Update CSS custom property
  document.documentElement.style.setProperty('--left-panel-width', `${newWidth}px`)
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Initialize app
onMounted(async () => {
  try {
    await initialize()
  } catch (err) {
    console.error('Failed to initialize app:', err)
  } finally {
    isInitializing.value = false
  }
  
  // Set initial CSS custom property
  document.documentElement.style.setProperty('--left-panel-width', `${leftPanelWidth.value}px`)
})
</script>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #343a40;
  background-color: #f8f9fa;
}

#app {
  height: 100vh;
  overflow: hidden;
}

/* CSS custom properties */
:root {
  --left-panel-width: 300px;
}
</style>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  padding: 12px 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.app-subtitle {
  margin: 2px 0 0 0;
  font-size: 12px;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  overflow: hidden;
}

.explorer-container {
  height: 100%;
  display: flex;
}

.left-panel {
  width: var(--left-panel-width);
  flex-shrink: 0;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  overflow: hidden;
}

.resizer {
  width: 4px;
  background-color: #dee2e6;
  cursor: col-resize;
  flex-shrink: 0;
  position: relative;
  transition: background-color 0.15s ease-in-out;
}

.resizer:hover {
  background-color: #007bff;
}

.resizer::after {
  content: '';
  position: absolute;
  top: 0;
  left: -2px;
  right: -2px;
  bottom: 0;
}

.right-panel {
  flex: 1;
  overflow: hidden;
  background-color: #ffffff;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #dc3545;
  color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  z-index: 1000;
  cursor: pointer;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  min-width: 300px;
  max-width: 500px;
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  word-break: break-word;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.15s ease-in-out;
}

.toast-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Responsive design */
@media (max-width: 768px) {
  .explorer-container {
    flex-direction: column;
  }
  
  .left-panel {
    width: 100%;
    height: 40%;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }
  
  .resizer {
    width: 100%;
    height: 4px;
    cursor: row-resize;
  }
  
  .right-panel {
    height: 60%;
  }
  
  .toast-content {
    min-width: auto;
    max-width: calc(100vw - 40px);
  }
}
</style>
