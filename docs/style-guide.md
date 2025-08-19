# Code Style Guide

This document outlines the coding standards and style guidelines for the File Explorer project to ensure consistency and maintainability across the codebase.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Guidelines](#typescript-guidelines)
- [Vue.js Guidelines](#vue-guidelines)
- [CSS/Styling Guidelines](#cssstyling-guidelines)
- [Backend Guidelines](#backend-guidelines)
- [Naming Conventions](#naming-conventions)
- [Code Organization](#code-organization)
- [Documentation Standards](#documentation-standards)

## General Principles

### Code Quality Standards
1. **Readability First**: Code should be self-documenting and easy to understand
2. **Consistency**: Follow established patterns throughout the codebase
3. **SOLID Principles**: Apply SOLID design principles where applicable
4. **DRY (Don't Repeat Yourself)**: Avoid code duplication
5. **YAGNI (You Aren't Gonna Need It)**: Don't implement features until they're needed

### Code Formatting
- Use **Prettier** for automatic code formatting
- Configure your editor to format on save
- Use consistent indentation (2 spaces for frontend, 2 spaces for backend)
- Maximum line length: 100 characters
- Use trailing commas in multi-line structures

## TypeScript Guidelines

### Type Definitions

#### Explicit Types
```typescript
// ✅ Good - Explicit types for public APIs
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  createdAt: Date;
  modifiedAt: Date;
}

// ✅ Good - Function signatures
const getFolderById = async (id: string): Promise<Folder | null> => {
  // Implementation
};

// ❌ Avoid - Implicit any
const processData = (data: any) => {
  // Avoid using 'any'
};
```

#### Union Types and Literals
```typescript
// ✅ Good - Use union types for restricted values
type ViewMode = 'grid' | 'list';
type FileExtension = 'pdf' | 'txt' | 'jpg' | 'png' | 'docx';

// ✅ Good - Use literal types for constants
const SORT_ORDERS = ['asc', 'desc'] as const;
type SortOrder = typeof SORT_ORDERS[number];
```

#### Generic Types
```typescript
// ✅ Good - Use generics for reusable types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ✅ Good - Generic utility functions
const createRepository = <T, K extends keyof T>(
  tableName: string,
  primaryKey: K
): Repository<T, K> => {
  // Implementation
};
```

### Interface Design
```typescript
// ✅ Good - Interface segregation
interface Readable {
  read(): Promise<string>;
}

interface Writable {
  write(data: string): Promise<void>;
}

interface ReadWritable extends Readable, Writable {}

// ✅ Good - Optional properties
interface CreateFolderRequest {
  name: string;
  parentId?: string;
  description?: string;
}

// ✅ Good - Readonly properties where appropriate
interface ImmutableFolder {
  readonly id: string;
  readonly createdAt: Date;
  name: string;
  modifiedAt: Date;
}
```

### Error Handling
```typescript
// ✅ Good - Custom error types
class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends Error {
  constructor(message: string, public details: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ✅ Good - Result type pattern
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

const safeAsyncOperation = async (): Promise<Result<Folder>> => {
  try {
    const folder = await getFolderById('123');
    return { success: true, data: folder };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};
```

## Vue.js Guidelines

### Component Structure
```vue
<!-- ✅ Good - Consistent component structure -->
<template>
  <div class="folder-tree">
    <div v-if="isLoading" class="loading-skeleton">
      <!-- Loading state -->
    </div>
    
    <div v-else-if="folders.length === 0" class="empty-state">
      No folders found
    </div>
    
    <div v-else class="folder-list">
      <FolderTreeNode
        v-for="folder in folders"
        :key="folder.id"
        :folder="folder"
        :selected="folder.id === selectedFolderId"
        @folder-selected="onFolderSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import FolderTreeNode from './FolderTreeNode.vue';
import type { Folder } from '@/types';

// Props with proper typing
interface Props {
  folders: Folder[];
  isLoading?: boolean;
  selectedFolderId?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  selectedFolderId: null,
});

// Events with proper typing
interface Emits {
  'folder-selected': [folderId: string];
}

const emit = defineEmits<Emits>();

// Reactive state
const localSelectedId = ref<string | null>(props.selectedFolderId);

// Computed properties
const sortedFolders = computed(() => 
  [...props.folders].sort((a, b) => a.name.localeCompare(b.name))
);

// Methods
const onFolderSelected = (folderId: string) => {
  localSelectedId.value = folderId;
  emit('folder-selected', folderId);
};
</script>

<style scoped>
/* Scoped styles */
.folder-tree {
  /* Component styles */
}
</style>
```

### Composables
```typescript
// ✅ Good - Composable structure
import { ref, reactive, computed, onMounted } from 'vue';
import type { Folder, File } from '@/types';
import * as api from '@/services/api';

export function useFileExplorer() {
  // State
  const folders = ref<Folder[]>([]);
  const selectedFolderId = ref<string | null>(null);
  const isLoadingTree = ref(false);
  const isLoadingContents = ref(false);

  // Reactive state for complex objects
  const folderContents = reactive<{
    folders: Folder[];
    files: File[];
  }>({
    folders: [],
    files: [],
  });

  // Computed properties
  const hasSelectedFolder = computed(() => selectedFolderId.value !== null);
  const isLoading = computed(() => isLoadingTree.value || isLoadingContents.value);

  // Methods
  const loadFolders = async () => {
    isLoadingTree.value = true;
    try {
      const response = await api.getAllFolders();
      if (response.success) {
        folders.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
    } finally {
      isLoadingTree.value = false;
    }
  };

  const selectFolder = async (folderId: string) => {
    selectedFolderId.value = folderId;
    isLoadingContents.value = true;
    
    try {
      const response = await api.getFolderContents(folderId);
      if (response.success) {
        Object.assign(folderContents, response.data);
      }
    } catch (error) {
      console.error('Failed to load folder contents:', error);
    } finally {
      isLoadingContents.value = false;
    }
  };

  // Lifecycle
  onMounted(() => {
    loadFolders();
  });

  // Return API
  return {
    // State
    folders: readonly(folders),
    selectedFolderId: readonly(selectedFolderId),
    folderContents: readonly(folderContents),
    isLoadingTree: readonly(isLoadingTree),
    isLoadingContents: readonly(isLoadingContents),
    
    // Computed
    hasSelectedFolder,
    isLoading,
    
    // Methods
    loadFolders,
    selectFolder,
  };
}
```

### Props and Events
```vue
<script setup lang="ts">
// ✅ Good - Comprehensive prop definitions
interface Props {
  // Required props
  folders: Folder[];
  
  // Optional props with defaults
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  selectedFolderId?: string | null;
  
  // Props with validation
  maxItems?: number;
  sortBy?: 'name' | 'createdAt' | 'modifiedAt';
  sortOrder?: 'asc' | 'desc';
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  viewMode: 'grid',
  selectedFolderId: null,
  maxItems: 100,
  sortBy: 'name',
  sortOrder: 'asc',
});

// ✅ Good - Typed events
interface Emits {
  'folder-selected': [folderId: string];
  'folder-expanded': [folderId: string, isExpanded: boolean];
  'view-mode-changed': [mode: 'grid' | 'list'];
  'sort-changed': [sortBy: string, sortOrder: string];
}

const emit = defineEmits<Emits>();
</script>
```

## CSS/Styling Guidelines

### Design System
```css
/* ✅ Good - CSS Custom Properties for design system */
:root {
  /* Colors */
  --color-primary: #1e293b;
  --color-primary-hover: #334155;
  --color-primary-active: #475569;
  --color-secondary: #64748b;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-border: #e2e8f0;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}
```

### Component Styling
```css
/* ✅ Good - BEM methodology */
.folder-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-background);
  border-right: 1px solid var(--color-border);
}

.folder-tree__header {
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.folder-tree__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.folder-tree__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm);
}

.folder-tree__item {
  display: flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.folder-tree__item:hover {
  background-color: var(--color-surface);
}

.folder-tree__item--selected {
  background-color: var(--color-primary);
  color: white;
}

.folder-tree__item--selected:hover {
  background-color: var(--color-primary-hover);
}

.folder-tree__icon {
  width: 1rem;
  height: 1rem;
  margin-right: var(--space-sm);
  color: var(--color-text-secondary);
}

.folder-tree__name {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ✅ Good - Responsive design */
@media (max-width: 768px) {
  .folder-tree {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  
  .folder-tree__item {
    padding: var(--space-md);
  }
  
  .folder-tree__name {
    font-size: var(--font-size-base);
  }
}
```

### Layout Patterns
```css
/* ✅ Good - Grid layouts */
.folder-contents {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.folder-contents--grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.folder-contents--list {
  grid-template-columns: 1fr;
}

/* ✅ Good - Flexbox patterns */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
}

.header__title {
  flex: 1;
  margin: 0;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* ✅ Good - Loading states */
.loading-skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-border) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--radius-md);
  height: 2rem;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Backend Guidelines

### Service Layer
```typescript
// ✅ Good - Service implementation
export class FolderService implements IFolderService {
  constructor(
    private readonly folderRepository: IFolderRepository,
    private readonly logger: ILogger
  ) {}

  async getAllFolders(): Promise<Folder[]> {
    try {
      this.logger.info('Fetching all folders');
      const folders = await this.folderRepository.findAll();
      this.logger.info(`Found ${folders.length} folders`);
      return folders;
    } catch (error) {
      this.logger.error('Failed to fetch folders', { error });
      throw new DatabaseError('Failed to fetch folders');
    }
  }

  async createFolder(data: CreateFolderRequest): Promise<Folder> {
    // Validate input
    const validatedData = createFolderSchema.parse(data);
    
    // Check if parent exists (if provided)
    if (validatedData.parentId) {
      const parent = await this.folderRepository.findById(validatedData.parentId);
      if (!parent) {
        throw new NotFoundError('Parent folder not found');
      }
    }

    // Check for name conflicts
    const existingFolder = await this.folderRepository.findByNameAndParent(
      validatedData.name,
      validatedData.parentId
    );
    if (existingFolder) {
      throw new ConflictError('Folder with this name already exists');
    }

    try {
      const folder = await this.folderRepository.create(validatedData);
      this.logger.info('Folder created successfully', { folderId: folder.id });
      return folder;
    } catch (error) {
      this.logger.error('Failed to create folder', { data: validatedData, error });
      throw new DatabaseError('Failed to create folder');
    }
  }
}
```

### Controller Layer
```typescript
// ✅ Good - Controller implementation
export class FolderController {
  constructor(
    private readonly folderService: IFolderService,
    private readonly logger: ILogger
  ) {}

  getAllFolders = async (context: Context): Promise<void> => {
    try {
      const folders = await this.folderService.getAllFolders();
      
      context.set.status = 200;
      return {
        success: true,
        data: folders,
        message: 'Folders retrieved successfully',
      };
    } catch (error) {
      return this.handleError(context, error);
    }
  };

  createFolder = async (context: Context): Promise<void> => {
    try {
      const body = await context.request.json();
      const folder = await this.folderService.createFolder(body);
      
      context.set.status = 201;
      return {
        success: true,
        data: folder,
        message: 'Folder created successfully',
      };
    } catch (error) {
      return this.handleError(context, error);
    }
  };

  private handleError(context: Context, error: unknown): ErrorResponse {
    if (error instanceof ValidationError) {
      context.set.status = 400;
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.details,
        },
      };
    }

    if (error instanceof NotFoundError) {
      context.set.status = 404;
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      };
    }

    // Log unexpected errors
    this.logger.error('Unexpected error in controller', { error });
    
    context.set.status = 500;
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };
  }
}
```

### Repository Pattern
```typescript
// ✅ Good - Repository implementation
export class FolderRepository implements IFolderRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async findAll(): Promise<Folder[]> {
    const result = await this.db
      .select()
      .from(folders)
      .orderBy(folders.name);

    return result.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Folder | null> {
    const result = await this.db
      .select()
      .from(folders)
      .where(eq(folders.id, parseInt(id)))
      .limit(1);

    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async create(data: CreateFolderData): Promise<Folder> {
    const path = data.parentId 
      ? await this.buildPath(data.name, data.parentId)
      : `/${data.name}`;

    const [result] = await this.db
      .insert(folders)
      .values({
        name: data.name,
        parentId: data.parentId ? parseInt(data.parentId) : null,
        path,
      })
      .returning();

    return this.mapToEntity(result);
  }

  private mapToEntity(row: FolderRow): Folder {
    return {
      id: row.id.toString(),
      name: row.name,
      parentId: row.parentId?.toString() || null,
      path: row.path,
      createdAt: row.createdAt,
      modifiedAt: row.modifiedAt,
    };
  }

  private async buildPath(name: string, parentId: string): Promise<string> {
    const parent = await this.findById(parentId);
    if (!parent) {
      throw new Error('Parent folder not found');
    }
    return `${parent.path}/${name}`;
  }
}
```

## Naming Conventions

### Files and Directories
```
✅ Good
components/
  FolderTree.vue          # PascalCase for components
  FolderContents.vue
  folder-tree-node.vue    # Or kebab-case (be consistent)

composables/
  useFileExplorer.ts      # camelCase with 'use' prefix

services/
  api.ts                  # camelCase for services
  search.service.ts       # Or descriptive naming

types/
  index.ts               # Export all types from index
  folder.types.ts        # Domain-specific types

utils/
  format-file-size.ts    # kebab-case for utilities
  date-helpers.ts
```

### Variables and Functions
```typescript
// ✅ Good - camelCase
const selectedFolderId = ref<string | null>(null);
const isLoadingContents = ref(false);
const folderContents = reactive<FolderContents>({});

// ✅ Good - Descriptive function names
const loadFolderContents = async (folderId: string) => {};
const handleFolderSelection = (folder: Folder) => {};
const formatFileSize = (bytes: number): string => {};

// ✅ Good - Boolean naming
const isLoading = ref(false);
const hasError = ref(false);
const canDelete = computed(() => selectedItems.value.length > 0);

// ✅ Good - Event handlers
const onFolderSelected = (folderId: string) => {};
const onViewModeChanged = (mode: ViewMode) => {};
const handleSearchInput = (query: string) => {};
```

### Constants
```typescript
// ✅ Good - SCREAMING_SNAKE_CASE for constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_PAGE_SIZE = 50;
const API_BASE_URL = 'http://localhost:3001/api';

const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
} as const;

const FILE_EXTENSIONS = {
  PDF: 'pdf',
  IMAGE: ['jpg', 'jpeg', 'png', 'gif'],
  DOCUMENT: ['doc', 'docx', 'txt'],
} as const;
```

### CSS Classes
```css
/* ✅ Good - BEM methodology */
.folder-tree {}
.folder-tree__header {}
.folder-tree__item {}
.folder-tree__item--selected {}
.folder-tree__item--loading {}

/* ✅ Good - Utility classes */
.text-primary {}
.text-secondary {}
.bg-surface {}
.shadow-md {}
.rounded-lg {}

/* ✅ Good - State classes */
.is-loading {}
.is-selected {}
.is-disabled {}
.has-error {}
```

## Code Organization

### Project Structure
```
src/
├── components/           # Reusable Vue components
│   ├── ui/              # Basic UI components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── composables/         # Vue composables
├── services/           # API and business logic
├── stores/             # State management (if using Pinia)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
├── assets/             # Static assets
└── tests/              # Test files
```

### Import Organization
```typescript
// ✅ Good - Import order
// 1. Vue and framework imports
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// 2. Third-party library imports
import axios from 'axios';
import { debounce } from 'lodash-es';

// 3. Internal imports (absolute paths)
import { useFileExplorer } from '@/composables/useFileExplorer';
import { formatFileSize } from '@/utils/format-file-size';
import type { Folder, File } from '@/types';

// 4. Relative imports
import FolderTreeNode from './FolderTreeNode.vue';
import './FolderTree.css';
```

### Export Patterns
```typescript
// ✅ Good - Named exports for utilities
export const formatFileSize = (bytes: number): string => {
  // Implementation
};

export const formatDate = (date: Date): string => {
  // Implementation
};

// ✅ Good - Default export for main component/service
export default class ApiService {
  // Implementation
}

// ✅ Good - Re-exports from index files
// types/index.ts
export type { Folder } from './folder.types';
export type { File } from './file.types';
export type { ApiResponse, ApiError } from './api.types';
```

## Documentation Standards

### JSDoc Comments
```typescript
/**
 * Searches for folders and files based on provided criteria
 * 
 * @param criteria - Array of search criteria to apply
 * @param options - Additional search options
 * @returns Promise that resolves to search results
 * 
 * @example
 * ```typescript
 * const results = await search([
 *   new NameCriteria('document'),
 *   new TypeCriteria('file')
 * ]);
 * ```
 */
export async function search(
  criteria: ISearchCriteria[],
  options?: SearchOptions
): Promise<SearchResults> {
  // Implementation
}

/**
 * Formats file size in bytes to human-readable format
 * 
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 * 
 * @example
 * ```typescript
 * formatFileSize(1024); // "1.00 KB"
 * formatFileSize(1048576, 1); // "1.0 MB"
 * ```
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  // Implementation
};
```

### Component Documentation
```vue
<!--
FolderTree Component

Displays a hierarchical tree structure of folders with the following features:
- Expand/collapse functionality
- Selection highlighting
- Loading states
- Keyboard navigation support

@example
```vue
<FolderTree
  :folders="folders"
  :selected-folder-id="selectedId"
  @folder-selected="handleSelection"
/>
```
-->
<template>
  <!-- Component template -->
</template>

<script setup lang="ts">
/**
 * Props for FolderTree component
 */
interface Props {
  /** Array of folders to display in the tree */
  folders: Folder[];
  /** Whether the tree is currently loading */
  isLoading?: boolean;
  /** ID of the currently selected folder */
  selectedFolderId?: string | null;
}

/**
 * Events emitted by FolderTree component
 */
interface Emits {
  /** Emitted when a folder is selected */
  'folder-selected': [folderId: string];
}
</script>
```

This comprehensive style guide ensures consistency across the File Explorer codebase and makes it easier for new contributors to understand and follow the established patterns.
