# Search System Documentation

The search system is built following SOLID principles, providing a flexible and extensible architecture for searching files and folders.

## Architecture Overview

The search system implements the following SOLID principles:

- **S**ingle Responsibility: Each class has one specific purpose
- **O**pen/Closed: Easy to extend with new search criteria without modifying existing code
- **L**iskov Substitution: All search criteria implement the same interface
- **I**nterface Segregation: Focused, minimal interfaces
- **D**ependency Inversion: High-level modules don't depend on low-level modules

## Core Interfaces

### ISearchCriteria
```typescript
interface ISearchCriteria {
  matches(item: SearchableItem): boolean;
}
```

### ISearchEngine
```typescript
interface ISearchEngine {
  search(items: SearchableItem[], criteria: ISearchCriteria[]): SearchableItem[];
}
```

### ISearchService
```typescript
interface ISearchService {
  searchFolders(criteria: ISearchCriteria[]): Promise<Folder[]>;
  searchFiles(criteria: ISearchCriteria[]): Promise<File[]>;
  searchAll(criteria: ISearchCriteria[]): Promise<{ folders: Folder[]; files: File[] }>;
}
```

## Implementation Classes

### SearchableItem Classes

#### SearchableFolder
```typescript
class SearchableFolder implements SearchableItem {
  constructor(private folder: Folder) {}
  
  get name(): string { return this.folder.name; }
  get type(): 'folder' | 'file' { return 'folder'; }
  get size(): number { return 0; }
  get createdAt(): Date { return this.folder.createdAt; }
  get modifiedAt(): Date { return this.folder.modifiedAt; }
  
  getData(): Folder { return this.folder; }
}
```

#### SearchableFile
```typescript
class SearchableFile implements SearchableItem {
  constructor(private file: File) {}
  
  get name(): string { return this.file.name; }
  get type(): 'folder' | 'file' { return 'file'; }
  get size(): number { return this.file.size; }
  get extension(): string { return this.file.extension; }
  get createdAt(): Date { return this.file.createdAt; }
  get modifiedAt(): Date { return this.file.modifiedAt; }
  
  getData(): File { return this.file; }
}
```

### Search Criteria Classes

#### NameCriteria
Searches by name using case-insensitive partial matching:

```typescript
class NameCriteria implements ISearchCriteria {
  constructor(private searchTerm: string) {}
  
  matches(item: SearchableItem): boolean {
    return item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
  }
}
```

#### TypeCriteria
Filters by item type (folder or file):

```typescript
class TypeCriteria implements ISearchCriteria {
  constructor(private itemType: 'folder' | 'file') {}
  
  matches(item: SearchableItem): boolean {
    return item.type === this.itemType;
  }
}
```

#### ExtensionCriteria
Filters files by extension:

```typescript
class ExtensionCriteria implements ISearchCriteria {
  constructor(private extension: string) {}
  
  matches(item: SearchableItem): boolean {
    return item.type === 'file' && 
           (item as SearchableFile).extension.toLowerCase() === this.extension.toLowerCase();
  }
}
```

#### SizeCriteria
Filters by file size with various operators:

```typescript
class SizeCriteria implements ISearchCriteria {
  constructor(
    private size: number,
    private operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' = 'eq'
  ) {}
  
  matches(item: SearchableItem): boolean {
    switch (this.operator) {
      case 'gt': return item.size > this.size;
      case 'lt': return item.size < this.size;
      case 'gte': return item.size >= this.size;
      case 'lte': return item.size <= this.size;
      case 'eq': return item.size === this.size;
      default: return false;
    }
  }
}
```

#### DateRangeCriteria
Filters by creation or modification date ranges:

```typescript
class DateRangeCriteria implements ISearchCriteria {
  constructor(
    private startDate: Date,
    private endDate: Date,
    private field: 'createdAt' | 'modifiedAt' = 'modifiedAt'
  ) {}
  
  matches(item: SearchableItem): boolean {
    const itemDate = item[this.field];
    return itemDate >= this.startDate && itemDate <= this.endDate;
  }
}
```

#### CompositeCriteria
Combines multiple criteria with AND/OR logic:

```typescript
class CompositeCriteria implements ISearchCriteria {
  constructor(
    private criteria: ISearchCriteria[],
    private operator: 'AND' | 'OR' = 'AND'
  ) {}
  
  matches(item: SearchableItem): boolean {
    if (this.operator === 'AND') {
      return this.criteria.every(criterion => criterion.matches(item));
    } else {
      return this.criteria.some(criterion => criterion.matches(item));
    }
  }
}
```

### Search Engine

```typescript
class SearchEngine implements ISearchEngine {
  search(items: SearchableItem[], criteria: ISearchCriteria[]): SearchableItem[] {
    if (criteria.length === 0) return items;
    
    const compositeCriteria = new CompositeCriteria(criteria, 'AND');
    return items.filter(item => compositeCriteria.matches(item));
  }
}
```

### Search Service

```typescript
class SearchService implements ISearchService {
  constructor(
    private folderRepository: IFolderRepository,
    private fileRepository: IFileRepository,
    private searchEngine: ISearchEngine
  ) {}

  async searchFolders(criteria: ISearchCriteria[]): Promise<Folder[]> {
    const folders = await this.folderRepository.findAll();
    const searchableFolders = folders.map(folder => new SearchableFolder(folder));
    const results = this.searchEngine.search(searchableFolders, criteria);
    return results.map(item => item.getData() as Folder);
  }

  async searchFiles(criteria: ISearchCriteria[]): Promise<File[]> {
    const files = await this.fileRepository.findAll();
    const searchableFiles = files.map(file => new SearchableFile(file));
    const results = this.searchEngine.search(searchableFiles, criteria);
    return results.map(item => item.getData() as File);
  }

  async searchAll(criteria: ISearchCriteria[]): Promise<{ folders: Folder[]; files: File[] }> {
    const [folders, files] = await Promise.all([
      this.searchFolders(criteria),
      this.searchFiles(criteria)
    ]);
    
    return { folders, files };
  }
}
```

## API Endpoints

### Basic Search
```
GET /api/search?q=searchTerm
```

Example:
```bash
curl "http://localhost:3001/api/search?q=document"
```

### Advanced Search
```
POST /api/search/advanced
Content-Type: application/json

{
  "name": "document",
  "type": "file",
  "extension": "pdf",
  "minSize": 1024,
  "maxSize": 10485760,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Search by Type
```
GET /api/search/type/:type
```

Examples:
```bash
curl "http://localhost:3001/api/search/type/folder"
curl "http://localhost:3001/api/search/type/file"
```

## Frontend Integration

### Using the Search Service

```typescript
// In your Vue component
import { searchService } from '@/services/api'

const searchFiles = async (query: string) => {
  try {
    const results = await searchService.basicSearch(query)
    // Handle results...
  } catch (error) {
    console.error('Search failed:', error)
  }
}

const advancedSearch = async (criteria: SearchCriteria) => {
  try {
    const results = await searchService.advancedSearch(criteria)
    // Handle results...
  } catch (error) {
    console.error('Advanced search failed:', error)
  }
}
```

### Search Component Example

```vue
<template>
  <div class="search-container">
    <input
      v-model="searchQuery"
      @input="onSearchInput"
      placeholder="Search files and folders..."
      class="search-input"
    />
    
    <div v-if="searchResults.length > 0" class="search-results">
      <div v-for="item in searchResults" :key="item.id" class="search-result-item">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { debounce } from 'lodash-es'
import { searchService } from '@/services/api'

const searchQuery = ref('')
const searchResults = ref([])
const isLoading = ref(false)

const debouncedSearch = debounce(async (query: string) => {
  if (!query.trim()) {
    searchResults.value = []
    return
  }
  
  isLoading.value = true
  try {
    const results = await searchService.basicSearch(query)
    searchResults.value = results
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    isLoading.value = false
  }
}, 300)

const onSearchInput = () => {
  debouncedSearch(searchQuery.value)
}
</script>
```

## Extending the Search System

### Adding New Criteria

To add a new search criterion, simply create a class implementing `ISearchCriteria`:

```typescript
class MimeTypeCriteria implements ISearchCriteria {
  constructor(private mimeType: string) {}
  
  matches(item: SearchableItem): boolean {
    return item.type === 'file' && 
           (item as SearchableFile).mimeType === this.mimeType;
  }
}
```

### Custom Search Engines

You can create custom search engines for specific use cases:

```typescript
class FuzzySearchEngine implements ISearchEngine {
  search(items: SearchableItem[], criteria: ISearchCriteria[]): SearchableItem[] {
    // Implement fuzzy search logic
    // Could use libraries like Fuse.js
  }
}
```

## Performance Considerations

### Indexing
For large datasets, consider implementing indexing:

```typescript
class IndexedSearchEngine implements ISearchEngine {
  private nameIndex = new Map<string, SearchableItem[]>();
  
  buildIndex(items: SearchableItem[]) {
    // Build search indexes
  }
  
  search(items: SearchableItem[], criteria: ISearchCriteria[]): SearchableItem[] {
    // Use indexes for faster searches
  }
}
```

### Caching
Implement caching for frequently used searches:

```typescript
class CachedSearchService implements ISearchService {
  private cache = new Map<string, any>();
  
  async searchFolders(criteria: ISearchCriteria[]): Promise<Folder[]> {
    const cacheKey = this.generateCacheKey(criteria);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const results = await this.baseSearchService.searchFolders(criteria);
    this.cache.set(cacheKey, results);
    return results;
  }
}
```

## Testing

The search system includes comprehensive tests:

```typescript
describe('SearchService', () => {
  it('should find files by name', async () => {
    const criteria = [new NameCriteria('test')];
    const results = await searchService.searchFiles(criteria);
    expect(results).toHaveLength(2);
    expect(results[0].name).toContain('test');
  });
  
  it('should combine multiple criteria with AND logic', async () => {
    const criteria = [
      new NameCriteria('document'),
      new ExtensionCriteria('pdf')
    ];
    const results = await searchService.searchFiles(criteria);
    results.forEach(file => {
      expect(file.name).toContain('document');
      expect(file.extension).toBe('pdf');
    });
  });
});
```

## Benefits of SOLID Implementation

1. **Maintainability**: Easy to modify and extend
2. **Testability**: Each component can be tested in isolation
3. **Flexibility**: New search criteria can be added without changing existing code
4. **Reusability**: Components can be reused in different contexts
5. **Reliability**: Well-defined interfaces reduce bugs and inconsistencies
