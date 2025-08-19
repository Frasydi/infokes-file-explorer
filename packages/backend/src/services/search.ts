// Search Service following SOLID principles

import type { Folder, File } from "../database/schema";

// Interface Segregation Principle - Focused interfaces
export interface ISearchable {
  getId(): string;
  getName(): string;
  getPath(): string;
  getType(): 'folder' | 'file';
}

export interface ISearchCriteria {
  execute(item: ISearchable): boolean;
}

export interface ISearchResult {
  items: SearchResultItem[];
  totalCount: number;
  query: string;
}

export interface SearchResultItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  parentId: string | null;
  size?: number;
  modifiedAt: Date;
  createdAt: Date;
}

// Data repositories (Dependency Inversion Principle)
export interface ISearchDataProvider {
  getFolders(): Promise<Folder[]>;
  getFiles(): Promise<File[]>;
}

// Single Responsibility Principle - Each class has one reason to change
export class SearchableFolder implements ISearchable {
  constructor(private folder: Folder) {}

  getId(): string {
    return this.folder.id.toString();
  }

  getName(): string {
    return this.folder.name;
  }

  getPath(): string {
    return this.folder.path;
  }

  getType(): 'folder' | 'file' {
    return 'folder';
  }

  toSearchResult(): SearchResultItem {
    return {
      id: this.getId(),
      name: this.getName(),
      type: this.getType(),
      path: this.getPath(),
      parentId: this.folder.parentId?.toString() || null,
      modifiedAt: this.folder.updatedAt,
      createdAt: this.folder.createdAt,
    };
  }
}

export class SearchableFile implements ISearchable {
  constructor(private file: File) {}

  getId(): string {
    return this.file.id.toString();
  }

  getName(): string {
    return this.file.name;
  }

  getPath(): string {
    return this.file.path;
  }

  getType(): 'folder' | 'file' {
    return 'file';
  }

  toSearchResult(): SearchResultItem {
    return {
      id: this.getId(),
      name: this.getName(),
      type: this.getType(),
      path: this.getPath(),
      parentId: this.file.folderId?.toString() || null,
      size: this.file.size || undefined,
      modifiedAt: this.file.updatedAt,
      createdAt: this.file.createdAt,
    };
  }
}

// Open/Closed Principle - Extensible search criteria
export class NameSearchCriteria implements ISearchCriteria {
  constructor(private query: string) {}

  execute(item: ISearchable): boolean {
    return item.getName().toLowerCase().includes(this.query.toLowerCase());
  }
}

export class PathSearchCriteria implements ISearchCriteria {
  constructor(private query: string) {}

  execute(item: ISearchable): boolean {
    return item.getPath().toLowerCase().includes(this.query.toLowerCase());
  }
}

export class TypeSearchCriteria implements ISearchCriteria {
  constructor(private type: 'folder' | 'file') {}

  execute(item: ISearchable): boolean {
    return item.getType() === this.type;
  }
}

// Composite criteria for complex searches
export class AndSearchCriteria implements ISearchCriteria {
  constructor(private criteria: ISearchCriteria[]) {}

  execute(item: ISearchable): boolean {
    return this.criteria.every(criteria => criteria.execute(item));
  }
}

export class OrSearchCriteria implements ISearchCriteria {
  constructor(private criteria: ISearchCriteria[]) {}

  execute(item: ISearchable): boolean {
    return this.criteria.some(criteria => criteria.execute(item));
  }
}

// Search Engine - Single Responsibility
export class SearchEngine {
  search(items: ISearchable[], criteria: ISearchCriteria): ISearchable[] {
    return items.filter(item => criteria.execute(item));
  }
}

// Main Search Service (Dependency Inversion - depends on abstractions)
export class SearchService {
  constructor(
    private dataProvider: ISearchDataProvider,
    private searchEngine: SearchEngine = new SearchEngine()
  ) {}

  async search(query: string, options: {
    includeFiles?: boolean;
    includeFolders?: boolean;
    searchInPath?: boolean;
  } = {}): Promise<ISearchResult> {
    const {
      includeFiles = true,
      includeFolders = true,
      searchInPath = true
    } = options;

    // Get data from providers
    const [folders, files] = await Promise.all([
      includeFolders ? this.dataProvider.getFolders() : Promise.resolve([]),
      includeFiles ? this.dataProvider.getFiles() : Promise.resolve([])
    ]);

    // Convert to searchable items
    const searchableItems: ISearchable[] = [
      ...folders.map(folder => new SearchableFolder(folder)),
      ...files.map(file => new SearchableFile(file))
    ];

    // Build search criteria
    const searchCriteria: ISearchCriteria[] = [
      new NameSearchCriteria(query)
    ];

    if (searchInPath) {
      searchCriteria.push(new PathSearchCriteria(query));
    }

    const criteria = new OrSearchCriteria(searchCriteria);

    // Execute search
    const results = this.searchEngine.search(searchableItems, criteria);

    // Convert to result format
    const items: SearchResultItem[] = results.map(item => {
      if (item instanceof SearchableFolder) {
        return item.toSearchResult();
      } else if (item instanceof SearchableFile) {
        return item.toSearchResult();
      }
      throw new Error('Unknown searchable item type');
    });

    return {
      items,
      totalCount: items.length,
      query
    };
  }

  async advancedSearch(criteria: ISearchCriteria): Promise<ISearchResult> {
    // Get all data
    const [folders, files] = await Promise.all([
      this.dataProvider.getFolders(),
      this.dataProvider.getFiles()
    ]);

    // Convert to searchable items
    const searchableItems: ISearchable[] = [
      ...folders.map(folder => new SearchableFolder(folder)),
      ...files.map(file => new SearchableFile(file))
    ];

    // Execute search
    const results = this.searchEngine.search(searchableItems, criteria);

    // Convert to result format
    const items: SearchResultItem[] = results.map(item => {
      if (item instanceof SearchableFolder) {
        return item.toSearchResult();
      } else if (item instanceof SearchableFile) {
        return item.toSearchResult();
      }
      throw new Error('Unknown searchable item type');
    });

    return {
      items,
      totalCount: items.length,
      query: 'Advanced Search'
    };
  }
}
