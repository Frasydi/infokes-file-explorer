<template>
  <div class="folder-node">
    <div
      class="folder-item"
      :class="{ 
        'selected': selectedFolderId === folder.id,
        'has-children': folder.hasSubfolders 
      }"
      @click="onSelect"
    >
      <div class="folder-content">
        <button
          v-if="folder.hasSubfolders"
          @click.stop="onToggle"
          class="expand-button"
          :class="{ 'expanded': folder.isExpanded }"
        >
          <span class="expand-icon">▶</span>
        </button>
        <div class="folder-icon">📁</div>
        <span class="folder-name">{{ folder.name }}</span>
      </div>
    </div>

    <div 
      v-if="folder.isExpanded && folder.children && folder.children.length > 0"
      class="folder-children"
    >
      <FolderTreeNode
        v-for="child in folder.children"
        :key="child.id"
        :folder="child"
        :selected-folder-id="selectedFolderId"
        @select="onChildSelect"
        @toggle="onChildToggle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FolderNode } from '@/types'

interface Props {
  folder: FolderNode
  selectedFolderId: string | null
}

interface Emits {
  (e: 'select', folderId: string): void
  (e: 'toggle', folderId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const onSelect = () => {
  emit('select', props.folder.id)
}

const onToggle = () => {
  emit('toggle', props.folder.id)
}

const onChildSelect = (folderId: string) => {
  emit('select', folderId)
}

const onChildToggle = (folderId: string) => {
  emit('toggle', folderId)
}
</script>

<style scoped>
.folder-node {
  user-select: none;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  margin: 1px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease-in-out; /* Smooth transition for all properties */
  min-height: 32px;
  position: relative;
}

.folder-item:hover {
  background-color: #e9ecef;
  transform: translateX(2px); /* Subtle slide effect on hover */
}

.folder-item.selected {
  background-color: #007bff;
  color: white;
  transform: translateX(2px);
  box-shadow: 0 1px 3px rgba(0, 123, 255, 0.3); /* Subtle shadow for selected */
}

.folder-item.selected:hover {
  background-color: #0056b3;
  transform: translateX(3px); /* Slightly more movement when selected and hovered */
}

.folder-content {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.expand-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s ease-in-out;
  flex-shrink: 0;
}

.expand-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.folder-item.selected .expand-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.expand-icon {
  font-size: 10px;
  transition: transform 0.15s ease-in-out;
  color: #6c757d;
}

.expand-button.expanded .expand-icon {
  transform: rotate(90deg);
}

.folder-item.selected .expand-icon {
  color: white;
}

.folder-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.folder-name {
  font-size: 14px;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.folder-children {
  margin-left: 20px;
  position: relative;
}

.folder-children::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #dee2e6;
}

/* Indentation for nested levels */
.folder-node .folder-node .folder-item {
  padding-left: 12px;
}

.folder-node .folder-node .folder-node .folder-item {
  padding-left: 16px;
}

.folder-node .folder-node .folder-node .folder-node .folder-item {
  padding-left: 20px;
}

/* Animation for expanding/collapsing */
.folder-children {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
