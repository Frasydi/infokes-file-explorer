import { Elysia, t } from "elysia";
import { FolderService, FileService, type IFolderService, type IFileService } from "../services";
import { FolderRepository, FileRepository } from "../repositories";

export { SearchController } from "./search";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class FolderController {
  private folderService: IFolderService;

  constructor() {
    this.folderService = new FolderService(new FolderRepository());
  }

  routes() {
    return new Elysia({ prefix: "/api/v1/folders" })
      .get("/", async (): Promise<ApiResponse> => {
        try {
          const folders = await this.folderService.getAllFolders();
          // Convert numeric IDs to strings for frontend compatibility
          const formattedFolders = folders.map(folder => ({
            id: folder.id.toString(),
            name: folder.name,
            type: 'folder' as const,
            parentId: folder.parentId?.toString() || null,
            path: folder.path,
            modifiedAt: folder.updatedAt.toISOString(),
            createdAt: folder.createdAt.toISOString(),
          }));
          
          return {
            success: true,
            data: {
              folders: formattedFolders,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
      .get("/tree", async (): Promise<ApiResponse> => {
        try {
          const tree = await this.folderService.getFolderTree();
          return {
            success: true,
            data: tree,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
      .get("/root", async (): Promise<ApiResponse> => {
        try {
          const rootFolders = await this.folderService.getRootFolders();
          return {
            success: true,
            data: rootFolders,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
      .get("/:id", async ({ params }): Promise<ApiResponse> => {
        try {
          const folder = await this.folderService.getFolderById(parseInt(params.id));
          if (!folder) {
            return {
              success: false,
              error: "Folder not found",
            };
          }
          return {
            success: true,
            data: folder,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
      .get("/:id/subfolders", async ({ params }): Promise<ApiResponse> => {
        try {
          const parentId = params.id === "null" ? null : parseInt(params.id);
          const subFolders = await this.folderService.getSubFolders(parentId);
          return {
            success: true,
            data: subFolders,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
      .get("/:id/contents", async ({ params }): Promise<ApiResponse> => {
        try {
          const folderId = parseInt(params.id);
          const [subFolders, files] = await Promise.all([
            this.folderService.getSubFolders(folderId),
            new FileService(new FileRepository()).getFilesByFolderId(folderId)
          ]);
          
          // Combine folders and files into a single array with consistent format
          const items = [
            ...subFolders.map(folder => ({
              id: folder.id.toString(),
              name: folder.name,
              type: 'folder' as const,
              parentId: folder.parentId?.toString() || null,
              path: folder.path,
              modifiedAt: folder.updatedAt,
              createdAt: folder.createdAt,
            })),
            ...files.map(file => ({
              id: file.id.toString(),
              name: file.name,
              type: 'file' as const,
              parentId: file.folderId?.toString() || null,
              path: file.path,
              size: file.size,
              modifiedAt: file.updatedAt,
              createdAt: file.createdAt,
            }))
          ];
          
          return {
            success: true,
            data: {
              items: items,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
      .post("/", async ({ body }): Promise<ApiResponse> => {
        try {
          const folder = await this.folderService.createFolder(body as any);
          return {
            success: true,
            data: folder,
            message: "Folder created successfully",
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }, {
        body: t.Object({
          name: t.String(),
          parentId: t.Optional(t.Union([t.Number(), t.Null()])),
        }),
      })
      .put("/:id", async ({ params, body }): Promise<ApiResponse> => {
        try {
          const folder = await this.folderService.updateFolder(parseInt(params.id), body as any);
          if (!folder) {
            return {
              success: false,
              error: "Folder not found",
            };
          }
          return {
            success: true,
            data: folder,
            message: "Folder updated successfully",
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }, {
        body: t.Object({
          name: t.Optional(t.String()),
          parentId: t.Optional(t.Union([t.Number(), t.Null()])),
        }),
      })
      .delete("/:id", async ({ params }): Promise<ApiResponse> => {
        try {
          const deleted = await this.folderService.deleteFolder(parseInt(params.id));
          if (!deleted) {
            return {
              success: false,
              error: "Folder not found",
            };
          }
          return {
            success: true,
            message: "Folder deleted successfully",
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });
  }
}

export class FileController {
  private fileService: IFileService;

  constructor() {
    this.fileService = new FileService(new FileRepository());
  }

  routes() {
    return new Elysia({ prefix: "/api/v1/files" })
      .get("/", async (): Promise<ApiResponse> => {
        try {
          const files = await this.fileService.getAllFiles();
          return {
            success: true,
            data: files,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
      .get("/:id", async ({ params }): Promise<ApiResponse> => {
        try {
          const file = await this.fileService.getFileById(parseInt(params.id));
          if (!file) {
            return {
              success: false,
              error: "File not found",
            };
          }
          return {
            success: true,
            data: file,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
      .get("/folder/:folderId", async ({ params }): Promise<ApiResponse> => {
        try {
          const files = await this.fileService.getFilesByFolderId(parseInt(params.folderId));
          return {
            success: true,
            data: files,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
      .post("/", async ({ body }): Promise<ApiResponse> => {
        try {
          const file = await this.fileService.createFile(body as any);
          return {
            success: true,
            data: file,
            message: "File created successfully",
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }, {
        body: t.Object({
          name: t.String(),
          folderId: t.Number(),
          size: t.Optional(t.Number()),
          extension: t.Optional(t.String()),
        }),
      })
      .put("/:id", async ({ params, body }): Promise<ApiResponse> => {
        try {
          const file = await this.fileService.updateFile(parseInt(params.id), body as any);
          if (!file) {
            return {
              success: false,
              error: "File not found",
            };
          }
          return {
            success: true,
            data: file,
            message: "File updated successfully",
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }, {
        body: t.Object({
          name: t.Optional(t.String()),
          folderId: t.Optional(t.Number()),
          size: t.Optional(t.Number()),
          extension: t.Optional(t.String()),
        }),
      })
      .delete("/:id", async ({ params }): Promise<ApiResponse> => {
        try {
          const deleted = await this.fileService.deleteFile(parseInt(params.id));
          if (!deleted) {
            return {
              success: false,
              error: "File not found",
            };
          }
          return {
            success: true,
            message: "File deleted successfully",
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });
  }
}
