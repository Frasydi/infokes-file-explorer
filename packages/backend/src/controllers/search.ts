import { Elysia, t } from "elysia";
import { 
  SearchService, 
  NameSearchCriteria, 
  PathSearchCriteria, 
  TypeSearchCriteria,
  AndSearchCriteria,
  OrSearchCriteria,
  type ISearchResult,
  type ISearchCriteria
} from "../services/search";
import { RepositorySearchDataProvider } from "../services/searchDataProvider";
import { FolderRepository, FileRepository } from "../repositories";

// Single Responsibility Principle - Controller only handles HTTP concerns
export class SearchController {
  private searchService: SearchService;

  constructor() {
    // Dependency Inversion - Injecting dependencies
    const folderRepository = new FolderRepository();
    const fileRepository = new FileRepository();
    const dataProvider = new RepositorySearchDataProvider(folderRepository, fileRepository);
    this.searchService = new SearchService(dataProvider);
  }

  routes() {
    return new Elysia({ prefix: "/api/v1/search" })
      // Basic search endpoint
      .get("/", async ({ query }) => {
        try {
          const searchQuery = query.q as string;
          const includeFiles = query.files !== 'false';
          const includeFolders = query.folders !== 'false';
          const searchInPath = query.path !== 'false';

          if (!searchQuery || searchQuery.trim().length === 0) {
            return {
              success: false,
              error: "Search query is required and cannot be empty",
            };
          }

          const results = await this.searchService.search(searchQuery, {
            includeFiles,
            includeFolders,
            searchInPath
          });

          return {
            success: true,
            data: results,
          };
        } catch (error) {
          console.error('Search error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Search failed",
          };
        }
      }, {
        query: t.Object({
          q: t.String({ description: "Search query" }),
          files: t.Optional(t.String({ description: "Include files (true/false)" })),
          folders: t.Optional(t.String({ description: "Include folders (true/false)" })),
          path: t.Optional(t.String({ description: "Search in path (true/false)" }))
        })
      })

      // Advanced search endpoint with multiple criteria
      .post("/advanced", async ({ body }) => {
        try {
          const { criteria } = body as { criteria: any[] };

          if (!criteria || !Array.isArray(criteria) || criteria.length === 0) {
            return {
              success: false,
              error: "Search criteria are required",
            };
          }

          const searchCriteria = this.buildSearchCriteria(criteria);
          const results = await this.searchService.advancedSearch(searchCriteria);

          return {
            success: true,
            data: results,
          };
        } catch (error) {
          console.error('Advanced search error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Advanced search failed",
          };
        }
      }, {
        body: t.Object({
          criteria: t.Array(t.Object({
            type: t.String({ description: "Criteria type: name, path, type, and, or" }),
            value: t.Optional(t.String({ description: "Search value" })),
            children: t.Optional(t.Array(t.Any(), { description: "Child criteria for and/or operations" }))
          }))
        })
      })

      // Search by type endpoint
      .get("/by-type/:type", async ({ params, query }) => {
        try {
          const { type } = params;
          const searchQuery = query.q as string;

          if (type !== 'file' && type !== 'folder') {
            return {
              success: false,
              error: "Type must be 'file' or 'folder'",
            };
          }

          let criteria: ISearchCriteria;

          if (searchQuery && searchQuery.trim().length > 0) {
            // Search by type AND name/path
            criteria = new AndSearchCriteria([
              new TypeSearchCriteria(type as 'file' | 'folder'),
              new OrSearchCriteria([
                new NameSearchCriteria(searchQuery),
                new PathSearchCriteria(searchQuery)
              ])
            ]);
          } else {
            // Search by type only
            criteria = new TypeSearchCriteria(type as 'file' | 'folder');
          }

          const results = await this.searchService.advancedSearch(criteria);

          return {
            success: true,
            data: results,
          };
        } catch (error) {
          console.error('Type search error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Type search failed",
          };
        }
      }, {
        params: t.Object({
          type: t.String({ description: "Type to search for: file or folder" })
        }),
        query: t.Object({
          q: t.Optional(t.String({ description: "Optional search query" }))
        })
      });
  }

  // Open/Closed Principle - Extensible criteria building
  private buildSearchCriteria(criteriaData: any[]): ISearchCriteria {
    const buildCriteria = (data: any): ISearchCriteria => {
      switch (data.type) {
        case 'name':
          return new NameSearchCriteria(data.value);
        case 'path':
          return new PathSearchCriteria(data.value);
        case 'type':
          return new TypeSearchCriteria(data.value);
        case 'and':
          return new AndSearchCriteria(
            data.children.map((child: any) => buildCriteria(child))
          );
        case 'or':
          return new OrSearchCriteria(
            data.children.map((child: any) => buildCriteria(child))
          );
        default:
          throw new Error(`Unknown criteria type: ${data.type}`);
      }
    };

    if (criteriaData.length === 1) {
      return buildCriteria(criteriaData[0]);
    }

    // Multiple criteria - combine with AND by default
    return new AndSearchCriteria(
      criteriaData.map(criteria => buildCriteria(criteria))
    );
  }
}
