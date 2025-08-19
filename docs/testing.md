# Testing Guide

This guide covers testing strategies, best practices, and implementation details for the File Explorer project.

## Overview

The project uses a comprehensive testing strategy covering:
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Load and stress testing

## Testing Stack

### Frontend
- **Jest**: JavaScript testing framework
- **Vue Test Utils**: Vue.js testing utilities
- **Testing Library**: Additional testing utilities
- **MSW**: API mocking for tests

### Backend
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library
- **Test Database**: Separate PostgreSQL instance for testing

## Test Structure

```
packages/
├── frontend/
│   └── src/
│       └── tests/
│           ├── components/
│           │   ├── FolderTree.test.ts
│           │   ├── FolderContents.test.ts
│           │   └── FolderTreeNode.test.ts
│           ├── composables/
│           │   └── useFileExplorer.test.ts
│           ├── services/
│           │   └── api.test.ts
│           └── setup.ts
└── backend/
    └── src/
        └── tests/
            ├── controllers/
            │   ├── folders.test.ts
            │   ├── files.test.ts
            │   └── search.test.ts
            ├── services/
            │   ├── search.test.ts
            │   └── folders.test.ts
            ├── repositories/
            │   └── folders.test.ts
            └── setup.ts
```

## Frontend Testing

### Component Testing

#### Basic Component Test
```typescript
// src/tests/components/FolderTree.test.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import FolderTree from '@/components/FolderTree.vue';
import type { Folder } from '@/types';

const mockFolders: Folder[] = [
  {
    id: '1',
    name: 'Documents',
    parentId: null,
    path: '/Documents',
    createdAt: new Date('2024-01-01'),
    modifiedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Pictures',
    parentId: null,
    path: '/Pictures',
    createdAt: new Date('2024-01-01'),
    modifiedAt: new Date('2024-01-01'),
  },
];

describe('FolderTree', () => {
  it('renders folders correctly', () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders,
        isLoading: false,
        selectedFolderId: null,
      },
    });

    expect(wrapper.text()).toContain('Documents');
    expect(wrapper.text()).toContain('Pictures');
  });

  it('shows loading state', () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: [],
        isLoading: true,
        selectedFolderId: null,
      },
    });

    expect(wrapper.find('.loading-skeleton')).toBeTruthy();
  });

  it('emits folder-selected event when folder is clicked', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders,
        isLoading: false,
        selectedFolderId: null,
      },
    });

    await wrapper.find('[data-testid="folder-1"]').trigger('click');

    expect(wrapper.emitted('folder-selected')).toBeTruthy();
    expect(wrapper.emitted('folder-selected')?.[0]).toEqual(['1']);
  });

  it('highlights selected folder', () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders,
        isLoading: false,
        selectedFolderId: '1',
      },
    });

    const selectedFolder = wrapper.find('[data-testid="folder-1"]');
    expect(selectedFolder.classes()).toContain('selected');
  });
});
```

#### Component with Complex Interactions
```typescript
// src/tests/components/FolderContents.test.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FolderContents from '@/components/FolderContents.vue';
import type { Folder, File } from '@/types';

describe('FolderContents', () => {
  const mockFolders: Folder[] = [
    {
      id: '2',
      name: 'Subfolder',
      parentId: '1',
      path: '/Documents/Subfolder',
      createdAt: new Date('2024-01-01'),
      modifiedAt: new Date('2024-01-01'),
    },
  ];

  const mockFiles: File[] = [
    {
      id: '1',
      name: 'document.pdf',
      folderId: '1',
      path: '/Documents/document.pdf',
      size: 1024576,
      extension: 'pdf',
      mimeType: 'application/pdf',
      createdAt: new Date('2024-01-01'),
      modifiedAt: new Date('2024-01-01'),
    },
  ];

  it('displays grid view by default', () => {
    const wrapper = mount(FolderContents, {
      props: {
        folders: mockFolders,
        files: mockFiles,
        isLoading: false,
        viewMode: 'grid',
      },
    });

    expect(wrapper.find('.contents-grid')).toBeTruthy();
    expect(wrapper.find('.contents-list')).toBeFalsy();
  });

  it('switches to list view when prop changes', async () => {
    const wrapper = mount(FolderContents, {
      props: {
        folders: mockFolders,
        files: mockFiles,
        isLoading: false,
        viewMode: 'grid',
      },
    });

    await wrapper.setProps({ viewMode: 'list' });

    expect(wrapper.find('.contents-list')).toBeTruthy();
    expect(wrapper.find('.contents-grid')).toBeFalsy();
  });

  it('shows empty state when no content', () => {
    const wrapper = mount(FolderContents, {
      props: {
        folders: [],
        files: [],
        isLoading: false,
        viewMode: 'grid',
      },
    });

    expect(wrapper.text()).toContain('No items found');
  });
});
```

### Composables Testing

```typescript
// src/tests/composables/useFileExplorer.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFileExplorer } from '@/composables/useFileExplorer';
import * as api from '@/services/api';

// Mock the API
vi.mock('@/services/api', () => ({
  getAllFolders: vi.fn(),
  getFolderContents: vi.fn(),
}));

describe('useFileExplorer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads folders on initialization', async () => {
    const mockFolders = [
      { id: '1', name: 'Documents', parentId: null, path: '/Documents' },
    ];

    vi.mocked(api.getAllFolders).mockResolvedValue({
      success: true,
      data: mockFolders,
    });

    const { folders, loadFolders } = useFileExplorer();

    await loadFolders();

    expect(folders.value).toEqual(mockFolders);
    expect(api.getAllFolders).toHaveBeenCalledOnce();
  });

  it('handles folder selection', async () => {
    const mockContents = {
      folders: [],
      files: [
        { id: '1', name: 'file.txt', folderId: '1', path: '/Documents/file.txt' },
      ],
    };

    vi.mocked(api.getFolderContents).mockResolvedValue({
      success: true,
      data: mockContents,
    });

    const { selectedFolderId, folderContents, selectFolder } = useFileExplorer();

    await selectFolder('1');

    expect(selectedFolderId.value).toBe('1');
    expect(folderContents.value).toEqual(mockContents);
    expect(api.getFolderContents).toHaveBeenCalledWith('1');
  });

  it('manages separate loading states', async () => {
    const { isLoadingTree, isLoadingContents, loadFolders, selectFolder } = useFileExplorer();

    // Mock slow API responses
    vi.mocked(api.getAllFolders).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: [] }), 100))
    );
    vi.mocked(api.getFolderContents).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: { folders: [], files: [] } }), 100))
    );

    // Start loading folders
    const foldersPromise = loadFolders();
    expect(isLoadingTree.value).toBe(true);
    expect(isLoadingContents.value).toBe(false);

    // Start loading contents
    const contentsPromise = selectFolder('1');
    expect(isLoadingTree.value).toBe(true);
    expect(isLoadingContents.value).toBe(true);

    await Promise.all([foldersPromise, contentsPromise]);

    expect(isLoadingTree.value).toBe(false);
    expect(isLoadingContents.value).toBe(false);
  });
});
```

### API Service Testing

```typescript
// src/tests/services/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { getAllFolders, getFolderContents, searchFiles } from '@/services/api';

const server = setupServer(
  rest.get('http://localhost:3001/api/folders', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          { id: '1', name: 'Documents', parentId: null, path: '/Documents' },
        ],
      })
    );
  }),

  rest.get('http://localhost:3001/api/folders/:id/contents', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          folders: [],
          files: [{ id: '1', name: 'file.txt', folderId: '1' }],
        },
      })
    );
  }),

  rest.get('http://localhost:3001/api/search', (req, res, ctx) => {
    const query = req.url.searchParams.get('q');
    return res(
      ctx.json({
        success: true,
        data: {
          folders: [],
          files: query ? [{ id: '1', name: 'matching-file.txt' }] : [],
        },
      })
    );
  })
);

beforeEach(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Service', () => {
  it('fetches all folders', async () => {
    const result = await getAllFolders();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Documents');
  });

  it('fetches folder contents', async () => {
    const result = await getFolderContents('1');

    expect(result.success).toBe(true);
    expect(result.data.files).toHaveLength(1);
    expect(result.data.files[0].name).toBe('file.txt');
  });

  it('performs search', async () => {
    const result = await searchFiles('matching');

    expect(result.success).toBe(true);
    expect(result.data.files).toHaveLength(1);
    expect(result.data.files[0].name).toBe('matching-file.txt');
  });

  it('handles API errors', async () => {
    server.use(
      rest.get('http://localhost:3001/api/folders', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ success: false, error: 'Server error' }));
      })
    );

    await expect(getAllFolders()).rejects.toThrow();
  });
});
```

## Backend Testing

### Controller Testing

```typescript
// src/tests/controllers/folders.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '@/index';
import { db } from '@/database/connection';
import { folders } from '@/database/schema';

describe('Folders Controller', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.delete(folders);
  });

  afterEach(async () => {
    // Clean up after each test
    await db.delete(folders);
  });

  describe('GET /api/folders', () => {
    it('should return empty array when no folders exist', async () => {
      const response = await request(app)
        .get('/api/folders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all folders', async () => {
      // Seed test data
      await db.insert(folders).values([
        { name: 'Documents', parentId: null, path: '/Documents' },
        { name: 'Pictures', parentId: null, path: '/Pictures' },
      ]);

      const response = await request(app)
        .get('/api/folders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Documents');
    });
  });

  describe('POST /api/folders', () => {
    it('should create a new folder', async () => {
      const folderData = {
        name: 'New Folder',
        parentId: null,
      };

      const response = await request(app)
        .post('/api/folders')
        .send(folderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Folder');
      expect(response.body.data.path).toBe('/New Folder');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/folders')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate parent folder exists', async () => {
      const folderData = {
        name: 'Subfolder',
        parentId: 'non-existent-id',
      };

      const response = await request(app)
        .post('/api/folders')
        .send(folderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Parent folder not found');
    });
  });

  describe('GET /api/folders/:id', () => {
    it('should return folder by id', async () => {
      const [folder] = await db.insert(folders).values({
        name: 'Test Folder',
        parentId: null,
        path: '/Test Folder',
      }).returning();

      const response = await request(app)
        .get(`/api/folders/${folder.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Folder');
    });

    it('should return 404 for non-existent folder', async () => {
      const response = await request(app)
        .get('/api/folders/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
```

### Service Testing

```typescript
// src/tests/services/search.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SearchService } from '@/services/search';
import { NameCriteria, TypeCriteria, ExtensionCriteria, SizeCriteria } from '@/services/search';
import type { IFolderRepository, IFileRepository } from '@/repositories';

const mockFolderRepository: IFolderRepository = {
  async findAll() {
    return [
      { id: '1', name: 'Documents', parentId: null, path: '/Documents' },
      { id: '2', name: 'Pictures', parentId: null, path: '/Pictures' },
      { id: '3', name: 'My Documents', parentId: null, path: '/My Documents' },
    ];
  },
  async findById(id: string) {
    const folders = await this.findAll();
    return folders.find(f => f.id === id) || null;
  },
  async create(data: any) { return data; },
  async update(id: string, data: any) { return data; },
  async delete(id: string) { return true; },
};

const mockFileRepository: IFileRepository = {
  async findAll() {
    return [
      { id: '1', name: 'document.pdf', folderId: '1', size: 1024, extension: 'pdf' },
      { id: '2', name: 'image.jpg', folderId: '2', size: 2048, extension: 'jpg' },
      { id: '3', name: 'document.docx', folderId: '1', size: 512, extension: 'docx' },
    ];
  },
  async findById(id: string) {
    const files = await this.findAll();
    return files.find(f => f.id === id) || null;
  },
  async create(data: any) { return data; },
  async update(id: string, data: any) { return data; },
  async delete(id: string) { return true; },
};

describe('SearchService', () => {
  let searchService: SearchService;

  beforeEach(() => {
    searchService = new SearchService(
      mockFolderRepository,
      mockFileRepository,
      new SearchEngine()
    );
  });

  describe('searchFolders', () => {
    it('should find folders by name', async () => {
      const criteria = [new NameCriteria('Document')];
      const results = await searchService.searchFolders(criteria);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Documents');
      expect(results[1].name).toBe('My Documents');
    });

    it('should find folders by type', async () => {
      const criteria = [new TypeCriteria('folder')];
      const results = await searchService.searchFolders(criteria);

      expect(results).toHaveLength(3);
    });
  });

  describe('searchFiles', () => {
    it('should find files by name', async () => {
      const criteria = [new NameCriteria('document')];
      const results = await searchService.searchFiles(criteria);

      expect(results).toHaveLength(2);
      expect(results.every(f => f.name.toLowerCase().includes('document'))).toBe(true);
    });

    it('should find files by extension', async () => {
      const criteria = [new ExtensionCriteria('pdf')];
      const results = await searchService.searchFiles(criteria);

      expect(results).toHaveLength(1);
      expect(results[0].extension).toBe('pdf');
    });

    it('should find files by size range', async () => {
      const criteria = [new SizeCriteria(1000, 'gt')];
      const results = await searchService.searchFiles(criteria);

      expect(results).toHaveLength(2);
      expect(results.every(f => f.size > 1000)).toBe(true);
    });

    it('should combine multiple criteria', async () => {
      const criteria = [
        new NameCriteria('document'),
        new ExtensionCriteria('pdf')
      ];
      const results = await searchService.searchFiles(criteria);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('document.pdf');
    });
  });
});
```

### Repository Testing

```typescript
// src/tests/repositories/folders.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FolderRepository } from '@/repositories';
import { db } from '@/database/connection';
import { folders } from '@/database/schema';

describe('FolderRepository', () => {
  let folderRepository: FolderRepository;

  beforeEach(async () => {
    folderRepository = new FolderRepository();
    await db.delete(folders);
  });

  afterEach(async () => {
    await db.delete(folders);
  });

  describe('findAll', () => {
    it('should return empty array when no folders exist', async () => {
      const result = await folderRepository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all folders', async () => {
      await db.insert(folders).values([
        { name: 'Documents', parentId: null, path: '/Documents' },
        { name: 'Pictures', parentId: null, path: '/Pictures' },
      ]);

      const result = await folderRepository.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return folder when it exists', async () => {
      const [inserted] = await db.insert(folders).values({
        name: 'Test Folder',
        parentId: null,
        path: '/Test Folder',
      }).returning();

      const result = await folderRepository.findById(inserted.id.toString());
      expect(result?.name).toBe('Test Folder');
    });

    it('should return null when folder does not exist', async () => {
      const result = await folderRepository.findById('999');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new folder', async () => {
      const folderData = {
        name: 'New Folder',
        parentId: null,
      };

      const result = await folderRepository.create(folderData);
      expect(result.name).toBe('New Folder');
      expect(result.path).toBe('/New Folder');
    });

    it('should create nested folder with correct path', async () => {
      const [parent] = await db.insert(folders).values({
        name: 'Parent',
        parentId: null,
        path: '/Parent',
      }).returning();

      const folderData = {
        name: 'Child',
        parentId: parent.id.toString(),
      };

      const result = await folderRepository.create(folderData);
      expect(result.path).toBe('/Parent/Child');
    });
  });
});
```

## E2E Testing

### Playwright Setup

```typescript
// tests/e2e/setup.ts
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  // Add custom fixtures here
});

export { expect };
```

### E2E Test Examples

```typescript
// tests/e2e/file-explorer.spec.ts
import { test, expect } from './setup';

test.describe('File Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should display folder tree on load', async ({ page }) => {
    await expect(page.locator('.folder-tree')).toBeVisible();
    await expect(page.locator('[data-testid="folder-Documents"]')).toBeVisible();
  });

  test('should load folder contents when folder is selected', async ({ page }) => {
    await page.click('[data-testid="folder-Documents"]');
    
    await expect(page.locator('.folder-contents')).toBeVisible();
    await expect(page.locator('[data-testid="file-document.pdf"]')).toBeVisible();
  });

  test('should search files and folders', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'document');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('.search-results')).toBeVisible();
    await expect(page.locator('[data-testid="search-result"]')).toHaveCount(2);
  });

  test('should switch between grid and list view', async ({ page }) => {
    await page.click('[data-testid="folder-Documents"]');
    
    // Default is grid view
    await expect(page.locator('.contents-grid')).toBeVisible();
    
    // Switch to list view
    await page.click('[data-testid="list-view-button"]');
    await expect(page.locator('.contents-list')).toBeVisible();
    
    // Switch back to grid view
    await page.click('[data-testid="grid-view-button"]');
    await expect(page.locator('.contents-grid')).toBeVisible();
  });
});
```

## Performance Testing

### Load Testing

```typescript
// tests/performance/load.test.ts
import { describe, it } from 'vitest';
import autocannon from 'autocannon';

describe('API Load Tests', () => {
  it('should handle concurrent folder requests', async () => {
    const result = await autocannon({
      url: 'http://localhost:3001/api/folders',
      connections: 10,
      duration: 10,
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.throughput.average).toBeGreaterThan(100);
  });

  it('should handle search requests under load', async () => {
    const result = await autocannon({
      url: 'http://localhost:3001/api/search?q=document',
      connections: 5,
      duration: 5,
    });

    expect(result.errors).toBe(0);
    expect(result.latency.average).toBeLessThan(100);
  });
});
```

## Running Tests

### Frontend Tests
```bash
# Run all frontend tests
cd packages/frontend
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run specific test file
bun run test FolderTree.test.ts
```

### Backend Tests
```bash
# Run all backend tests
cd packages/backend
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run integration tests only
bun run test:integration
```

### E2E Tests
```bash
# Run E2E tests
bun run test:e2e

# Run E2E tests in headed mode
bun run test:e2e:headed

# Run E2E tests in specific browser
bun run test:e2e -- --project=chromium
```

### All Tests
```bash
# Run all tests from root
bun run test

# Run all tests with coverage
bun run test:coverage
```

## Test Coverage

### Coverage Requirements
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Viewing Coverage Reports
```bash
# Generate and open coverage report
bun run test:coverage
open coverage/lcov-report/index.html
```

### Coverage Configuration
```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

## Best Practices

### Test Organization
1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain what is being tested
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent** - each test should be able to run in isolation

### Mocking Guidelines
1. **Mock external dependencies** but not the code under test
2. **Use jest.fn()** for function mocks
3. **Mock at the module level** for consistent behavior
4. **Reset mocks** between tests

### Assertion Tips
1. **Use specific assertions** - prefer `toEqual` over `toBeTruthy`
2. **Test both positive and negative cases**
3. **Assert on the exact data structure** you expect
4. **Use custom matchers** for domain-specific assertions

### Common Pitfalls
1. **Don't test implementation details** - test behavior
2. **Avoid testing third-party libraries**
3. **Don't make tests dependent on each other**
4. **Avoid hardcoded delays** - use proper waiting mechanisms

This comprehensive testing guide ensures your File Explorer project maintains high quality and reliability through thorough testing practices.
