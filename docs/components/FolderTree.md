# FolderTree Component

The `FolderTree` component displays a hierarchical tree structure of folders, allowing users to navigate through the file system.

## Overview

This component provides an interactive folder tree with expand/collapse functionality, smooth animations, and elegant styling.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `folders` | `Folder[]` | `[]` | Array of folder objects to display |
| `isLoading` | `boolean` | `false` | Loading state for the tree |
| `selectedFolderId` | `string \| null` | `null` | ID of the currently selected folder |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `folder-selected` | `folderId: string` | Emitted when a folder is clicked |

## Usage

```vue
<template>
  <FolderTree
    :folders="folders"
    :is-loading="isLoadingTree"
    :selected-folder-id="selectedFolderId"
    @folder-selected="onFolderSelected"
  />
</template>

<script setup lang="ts">
import FolderTree from '@/components/FolderTree.vue'
import type { Folder } from '@/types'

const folders = ref<Folder[]>([])
const isLoadingTree = ref(false)
const selectedFolderId = ref<string | null>(null)

const onFolderSelected = (folderId: string) => {
  selectedFolderId.value = folderId
  // Load folder contents...
}
</script>
```

## Features

### Hierarchical Display
- Shows folders in a tree structure with proper indentation
- Visual indicators for folder hierarchy
- Smooth expand/collapse animations

### Interactive Elements
- Click to select folders
- Hover effects for better UX
- Clear visual feedback for selected items

### Loading States
- Skeleton loading animation
- Graceful handling of empty states
- Non-blocking UI updates

### Styling
- Clean, professional appearance
- Consistent with Windows Explorer design
- Responsive layout for different screen sizes

## Implementation Details

### State Management
The component uses Vue 3's Composition API with the following reactive state:
- `selectedFolderId` - Tracks the currently selected folder
- `isLoading` - Controls loading state display

### Styling Approach
- Uses CSS Grid for layout
- Implements hover states with smooth transitions
- Color scheme based on `#1e293b` primary color
- No gradients - clean, flat design

### Performance Considerations
- Efficient rendering with v-for keys
- Minimal DOM manipulation
- Optimized CSS for smooth animations

## Customization

### Color Scheme
The component uses CSS custom properties for easy theming:

```css
.folder-tree {
  --primary-color: #1e293b;
  --hover-color: #334155;
  --selected-color: #475569;
  --text-color: #64748b;
}
```

### Animation Timing
Animations can be customized by modifying the transition properties:

```css
.folder-item {
  transition: all 0.2s ease;
}
```

## Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- Sufficient color contrast ratios
- Focus indicators for keyboard users

## Related Components

- [`FolderTreeNode`](./FolderTreeNode.md) - Individual tree node component
- [`FolderContents`](./FolderContents.md) - Displays folder contents

## Dependencies

- Vue 3
- TypeScript
- Custom types from `@/types`

## Testing

The component includes comprehensive tests covering:
- Rendering with different props
- Event emission
- Loading states
- User interactions

```bash
# Run component tests
bun run test src/tests/FolderTree.test.ts
```

## Examples

### Basic Usage
```vue
<FolderTree
  :folders="folders"
  @folder-selected="handleFolderSelection"
/>
```

### With Loading State
```vue
<FolderTree
  :folders="folders"
  :is-loading="true"
  @folder-selected="handleFolderSelection"
/>
```

### With Selected Folder
```vue
<FolderTree
  :folders="folders"
  :selected-folder-id="'folder-123'"
  @folder-selected="handleFolderSelection"
/>
```
