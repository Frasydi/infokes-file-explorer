import { describe, it, expect, beforeEach, afterEach, jest } from "bun:test";
import { FolderService } from "../services";
import { FolderRepository } from "../repositories";
import type { Folder, NewFolder } from "../database/schema";

// Mock the repository
const mockFolderRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByParentId: jest.fn(),
  findRootFolders: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any;

describe("FolderService", () => {
  let folderService: FolderService;

  beforeEach(() => {
    folderService = new FolderService(mockFolderRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllFolders", () => {
    it("should return all folders", async () => {
      const mockFolders: Folder[] = [
        {
          id: 1,
          name: "Documents",
          parentId: null,
          path: "Documents",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Pictures",
          parentId: null,
          path: "Pictures",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFolderRepository.findAll.mockResolvedValue(mockFolders);

      const result = await folderService.getAllFolders();

      expect(result).toEqual(mockFolders);
      expect(mockFolderRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("getFolderById", () => {
    it("should return folder when found", async () => {
      const mockFolder: Folder = {
        id: 1,
        name: "Documents",
        parentId: null,
        path: "Documents",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFolderRepository.findById.mockResolvedValue(mockFolder);

      const result = await folderService.getFolderById(1);

      expect(result).toEqual(mockFolder);
      expect(mockFolderRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should return null when folder not found", async () => {
      mockFolderRepository.findById.mockResolvedValue(undefined);

      const result = await folderService.getFolderById(999);

      expect(result).toBeNull();
      expect(mockFolderRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe("getSubFolders", () => {
    it("should return subfolders for given parent", async () => {
      const mockSubFolders: Folder[] = [
        {
          id: 2,
          name: "Work",
          parentId: 1,
          path: "Documents/Work",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFolderRepository.findByParentId.mockResolvedValue(mockSubFolders);

      const result = await folderService.getSubFolders(1);

      expect(result).toEqual(mockSubFolders);
      expect(mockFolderRepository.findByParentId).toHaveBeenCalledWith(1);
    });
  });

  describe("createFolder", () => {
    it("should create folder with correct path for root folder", async () => {
      const newFolder: NewFolder = {
        name: "NewFolder",
        parentId: null,
      };

      const createdFolder: Folder = {
        id: 1,
        name: "NewFolder",
        parentId: null,
        path: "NewFolder",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFolderRepository.create.mockResolvedValue(createdFolder);

      const result = await folderService.createFolder(newFolder);

      expect(result).toEqual(createdFolder);
      expect(mockFolderRepository.create).toHaveBeenCalledWith({
        ...newFolder,
        path: "NewFolder",
      });
    });

    it("should create folder with correct path for subfolder", async () => {
      const parentFolder: Folder = {
        id: 1,
        name: "Documents",
        parentId: null,
        path: "Documents",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newFolder: NewFolder = {
        name: "Work",
        parentId: 1,
      };

      const createdFolder: Folder = {
        id: 2,
        name: "Work",
        parentId: 1,
        path: "Documents/Work",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFolderRepository.findById.mockResolvedValue(parentFolder);
      mockFolderRepository.create.mockResolvedValue(createdFolder);

      const result = await folderService.createFolder(newFolder);

      expect(result).toEqual(createdFolder);
      expect(mockFolderRepository.findById).toHaveBeenCalledWith(1);
      expect(mockFolderRepository.create).toHaveBeenCalledWith({
        ...newFolder,
        path: "Documents/Work",
      });
    });
  });

  describe("getFolderTree", () => {
    it("should build correct folder tree structure", async () => {
      const mockFolders: Folder[] = [
        {
          id: 1,
          name: "Documents",
          parentId: null,
          path: "Documents",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Work",
          parentId: 1,
          path: "Documents/Work",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "Personal",
          parentId: 1,
          path: "Documents/Personal",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFolderRepository.findAll.mockResolvedValue(mockFolders);

      const result = await folderService.getFolderTree();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        name: "Documents",
        hasChildren: true,
      });
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0]).toMatchObject({
        id: 2,
        name: "Work",
        hasChildren: false,
      });
    });
  });
});
