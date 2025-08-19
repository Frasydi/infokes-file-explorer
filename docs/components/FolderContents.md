# FolderContents Component

The `FolderContents` component displays the contents of a selected folder, including both subfolders and files in a responsive grid or list layout.

## Overview

This component provides a flexible display for folder contents with grid and list view options, search capabilities, and responsive design.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `folders` | `Folder[]` | `[]` | Array of subfolders to display |
| `files` | `File[]` | `[]` | Array of files to display |
| `isLoading` | `boolean` | `false` | Loading state for the contents |
| `viewMode` | `'grid' \| 'list'` | `'grid'` | Display mode for contents |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `folder-selected` | `folderId: string` | Emitted when a subfolder is clicked |
| `file-selected` | `fileId: string` | Emitted when a file is clicked |

## Usage

```vue
<template>
  <FolderContents
    :folders="subfolders"
    :files="files"
    :is-loading="isLoadingContents"
    :view-mode="currentViewMode"
    @folder-selected="onSubfolderSelected"
    @file-selected="onFileSelected"
  />
</template>

<script setup lang="ts">
import FolderContents from '@/components/FolderContents.vue'
import type { Folder, File } from '@/types'

const subfolders = ref<Folder[]>([])
const files = ref<File[]>([])
const isLoadingContents = ref(false)
const currentViewMode = ref<'grid' | 'list'>('grid')

const onSubfolderSelected = (folderId: string) => {
  // Navigate to subfolder...
}

const onFileSelected = (fileId: string) => {
  // Handle file selection...
}
</script>
```

## Features

### Responsive Layout
- **Grid View**: Adaptive columns based on screen width
  - Desktop: 4-6 columns
  - Tablet: 2-3 columns
  - Mobile: 1-2 columns
- **List View**: Single column with detailed information
- Smooth transitions between view modes

### Content Types
- **Folders**: Displayed with folder icons and names
- **Files**: Displayed with appropriate file type icons
- **Mixed Content**: Folders typically shown first, then files

### Interactive Elements
- Click to select/open items
- Hover effects with smooth animations
- Visual feedback for selected items
- Touch-friendly on mobile devices

### Loading States
- Skeleton loading placeholders
- Progressive content loading
- Graceful empty state handling

## Implementation Details

### Layout System
The component uses CSS Grid for flexible layouts:

```css
.contents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.contents-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
```

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Item Rendering
Each item (folder or file) includes:
- Icon (folder/file type specific)
- Name with proper truncation
- Metadata (size, date modified)
- Hover and selection states

## Styling

### Color Scheme
```css
.folder-contents {
  --background-color: #ffffff;
  --item-background: #f8fafc;
  --item-hover: #e2e8f0;
  --item-selected: #dbeafe;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
}
```

### Design Principles
- Clean, minimal interface
- Consistent spacing and alignment
- Smooth hover transitions
- Professional appearance
- No gradients - flat design approach

## Performance Optimizations

### Virtual Scrolling
For large directories, the component implements virtual scrolling:
- Only renders visible items
- Maintains smooth scrolling performance
- Handles thousands of items efficiently

### Debounced Updates
- Search input is debounced to prevent excessive API calls
- Layout calculations are optimized for performance

### Memoization
- Item rendering is memoized to prevent unnecessary re-renders
- Computed properties for filtered and sorted content

## Accessibility Features

- **Keyboard Navigation**: Arrow keys, Enter, and Tab support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: Sufficient color contrast ratios

## Customization Options

### View Mode Toggle
```vue
<template>
  <div class="view-controls">
    <button @click="viewMode = 'grid'" :class="{ active: viewMode === 'grid' }">
      Grid
    </button>
    <button @click="viewMode = 'list'" :class="{ active: viewMode === 'list' }">
      List
    </button>
  </div>
</template>
```

### Custom Item Templates
The component supports custom templates for different file types:

```vue
<template v-if="item.type === 'image'">
  <img :src="item.thumbnail" :alt="item.name" />
</template>
<template v-else>
  <FileIcon :type="item.extension" />
</template>
```

## Error Handling

- Graceful handling of failed content loads
- User-friendly error messages
- Retry mechanisms for failed requests
- Fallback icons for unsupported file types

## Testing

Comprehensive test coverage includes:
- Component rendering with various props
- User interactions (clicks, keyboard navigation)
- View mode switching
- Loading and error states
- Responsive behavior

```bash
# Run component tests
bun run test src/tests/FolderContents.test.ts
```

## Related Components

- [`FolderTree`](./FolderTree.md) - Tree navigation component
- [`FolderTreeNode`](./FolderTreeNode.md) - Individual tree node component

## Examples

### Basic Grid View
```vue
<FolderContents
  :folders="folders"
  :files="files"
  view-mode="grid"
/>
```

### List View with Loading
```vue
<FolderContents
  :folders="folders"
  :files="files"
  view-mode="list"
  :is-loading="true"
/>
```

### Empty State
```vue
<FolderContents
  :folders="[]"
  :files="[]"
  view-mode="grid"
/>
<!-- Shows "No items found" message -->
```

## Dependencies

- Vue 3 Composition API
- TypeScript
- CSS Grid and Flexbox
- Custom icon components
- File type detection utilities
