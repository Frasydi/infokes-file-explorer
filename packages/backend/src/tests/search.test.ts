import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  SearchService, 
  SearchEngine,
  NameSearchCriteria,
  PathSearchCriteria,
  TypeSearchCriteria,
  AndSearchCriteria,
  OrSearchCriteria,
  SearchableFolder,
  SearchableFile,
  type ISearchDataProvider,
  type ISearchable,
  type ISearchCriteria
} from '../services/search';
import type { Folder, File } from '../database/schema';

// Mock data
const mockFolders: Folder[] = [
  {
    id: 1,
    name: 'Documents',
    path: '/Documents',
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Images',
    path: '/Documents/Images',
    parentId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    name: 'Videos',
    path: '/Videos',
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockFiles: File[] = [
  {
    id: 1,
    name: 'document.pdf',
    path: '/Documents/document.pdf',
    folderId: 1,
    size: 1024,
    extension: 'pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'photo.jpg',
    path: '/Documents/Images/photo.jpg',
    folderId: 2,
    size: 2048,
    extension: 'jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    name: 'video.mp4',
    path: '/Videos/video.mp4',
    folderId: 3,
    size: 4096,
    extension: 'mp4',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock data provider (Dependency Inversion Principle)
class MockSearchDataProvider implements ISearchDataProvider {
  async getFolders(): Promise<Folder[]> {
    return mockFolders;
  }

  async getFiles(): Promise<File[]> {
    return mockFiles;
  }
}

describe('Search Service - SOLID Principles', () => {
  let searchService: SearchService;
  let mockDataProvider: MockSearchDataProvider;

  beforeEach(() => {
    mockDataProvider = new MockSearchDataProvider();
    searchService = new SearchService(mockDataProvider);
  });

  describe('Single Responsibility Principle', () => {
    it('SearchEngine only handles search logic', () => {
      const searchEngine = new SearchEngine();
      const items: ISearchable[] = [
        new SearchableFolder(mockFolders[0]),
        new SearchableFile(mockFiles[0])
      ];
      const criteria = new NameSearchCriteria('document');

      const results = searchEngine.search(items, criteria);
      expect(results).toHaveLength(2); // Both contain 'document'
    });

    it('SearchService only orchestrates search operations', async () => {
      const result = await searchService.search('document');
      expect(result.items).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.query).toBe('document');
    });
  });

  describe('Open/Closed Principle', () => {
    it('can extend search criteria without modifying existing code', () => {
      // Custom criteria extending the system
      class CustomExtensionCriteria implements ISearchCriteria {
        constructor(private extension: string) {}

        execute(item: ISearchable): boolean {
          if (item instanceof SearchableFile) {
            return item.getName().endsWith(`.${this.extension}`);
          }
          return false;
        }
      }

      const searchEngine = new SearchEngine();
      const items: ISearchable[] = [
        new SearchableFile(mockFiles[0]), // .pdf
        new SearchableFile(mockFiles[1]), // .jpg
        new SearchableFile(mockFiles[2])  // .mp4
      ];

      const pdfCriteria = new CustomExtensionCriteria('pdf');
      const results = searchEngine.search(items, pdfCriteria);
      
      expect(results).toHaveLength(1);
      expect(results[0].getName()).toBe('document.pdf');
    });

    it('can combine criteria using composite pattern', () => {
      const searchEngine = new SearchEngine();
      const items: ISearchable[] = [
        new SearchableFolder(mockFolders[0]), // Documents
        new SearchableFolder(mockFolders[1]), // Images
        new SearchableFile(mockFiles[1])      // photo.jpg
      ];

      // Find items that are folders AND contain 'Documents' in path
      const criteria = new AndSearchCriteria([
        new TypeSearchCriteria('folder'),
        new PathSearchCriteria('Documents')
      ]);

      const results = searchEngine.search(items, criteria);
      expect(results).toHaveLength(2); // Documents folder and Images folder
    });
  });

  describe('Liskov Substitution Principle', () => {
    it('SearchableFolder and SearchableFile can be used interchangeably', () => {
      const searchableFolder = new SearchableFolder(mockFolders[0]);
      const searchableFile = new SearchableFile(mockFiles[0]);

      // Both implement ISearchable and can be used the same way
      expect(typeof searchableFolder.getId()).toBe('string');
      expect(typeof searchableFolder.getName()).toBe('string');
      expect(typeof searchableFolder.getPath()).toBe('string');
      expect(['folder', 'file']).toContain(searchableFolder.getType());

      expect(typeof searchableFile.getId()).toBe('string');
      expect(typeof searchableFile.getName()).toBe('string');
      expect(typeof searchableFile.getPath()).toBe('string');
      expect(['folder', 'file']).toContain(searchableFile.getType());
    });

    it('different criteria implementations can be substituted', () => {
      const searchEngine = new SearchEngine();
      const items: ISearchable[] = [new SearchableFolder(mockFolders[0])];

      // All criteria implement ISearchCriteria
      const nameCriteria = new NameSearchCriteria('Documents');
      const pathCriteria = new PathSearchCriteria('Documents');
      const typeCriteria = new TypeSearchCriteria('folder');

      expect(searchEngine.search(items, nameCriteria)).toHaveLength(1);
      expect(searchEngine.search(items, pathCriteria)).toHaveLength(1);
      expect(searchEngine.search(items, typeCriteria)).toHaveLength(1);
    });
  });

  describe('Interface Segregation Principle', () => {
    it('ISearchable interface is focused and minimal', () => {
      const searchableFolder = new SearchableFolder(mockFolders[0]);
      
      // ISearchable only exposes what's needed for searching
      expect(searchableFolder.getId).toBeDefined();
      expect(searchableFolder.getName).toBeDefined();
      expect(searchableFolder.getPath).toBeDefined();
      expect(searchableFolder.getType).toBeDefined();
      
      // No unnecessary methods exposed
      expect((searchableFolder as any).folder).toBeUndefined();
    });

    it('ISearchCriteria interface is focused on one responsibility', () => {
      const criteria = new NameSearchCriteria('test');
      
      // Only has execute method - single responsibility
      expect(criteria.execute).toBeDefined();
      expect(Object.keys(criteria).filter(key => typeof (criteria as any)[key] === 'function')).toHaveLength(1);
    });
  });

  describe('Dependency Inversion Principle', () => {
    it('SearchService depends on abstraction (ISearchDataProvider)', async () => {
      // Can substitute different data providers
      class AlternativeDataProvider implements ISearchDataProvider {
        async getFolders(): Promise<Folder[]> {
          return [mockFolders[0]]; // Return only first folder
        }

        async getFiles(): Promise<File[]> {
          return [mockFiles[0]]; // Return only first file
        }
      }

      const alternativeProvider = new AlternativeDataProvider();
      const alternativeSearchService = new SearchService(alternativeProvider);

      const result = await alternativeSearchService.search('document');
      expect(result.items).toHaveLength(2); // Only items from alternative provider
    });

    it('SearchService can work with any SearchEngine implementation', async () => {
      // Custom search engine that limits results
      class LimitedSearchEngine extends SearchEngine {
        search(items: ISearchable[], criteria: any): ISearchable[] {
          const results = super.search(items, criteria);
          return results.slice(0, 1); // Limit to 1 result
        }
      }

      const limitedEngine = new LimitedSearchEngine();
      const limitedSearchService = new SearchService(mockDataProvider, limitedEngine);

      const result = await limitedSearchService.search('document');
      expect(result.items).toHaveLength(1); // Limited by custom engine
    });
  });

  describe('Integration Tests', () => {
    it('performs basic search correctly', async () => {
      const result = await searchService.search('document');
      
      expect(result.items).toHaveLength(2);
      expect(result.items.some(item => item.name === 'Documents')).toBe(true);
      expect(result.items.some(item => item.name === 'document.pdf')).toBe(true);
    });

    it('supports search options', async () => {
      const result = await searchService.search('photo', {
        includeFiles: true,
        includeFolders: false,
        searchInPath: true
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].type).toBe('file');
      expect(result.items[0].name).toBe('photo.jpg');
    });

    it('performs advanced search with complex criteria', async () => {
      const criteria = new OrSearchCriteria([
        new AndSearchCriteria([
          new TypeSearchCriteria('folder'),
          new NameSearchCriteria('Images')
        ]),
        new AndSearchCriteria([
          new TypeSearchCriteria('file'),
          new PathSearchCriteria('Videos')
        ])
      ]);

      const result = await searchService.advancedSearch(criteria);
      
      expect(result.items).toHaveLength(2);
      expect(result.items.some(item => item.name === 'Images' && item.type === 'folder')).toBe(true);
      expect(result.items.some(item => item.name === 'video.mp4' && item.type === 'file')).toBe(true);
    });
  });
});
