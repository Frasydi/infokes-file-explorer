import { 
  FolderRepository, 
  FileRepository, 
  type IFolderRepository, 
  type IFileRepository,
  type CreateFolderInput,
  type CreateFileInput
} from "../repositories";
import type { Folder, File, NewFolder, NewFile } from "../database/schema";

export interface IFolderService {
  getAllFolders(): Promise<Folder[]>;
  getFolderById(id: number): Promise<Folder | null>;
  getSubFolders(parentId: number | null): Promise<Folder[]>;
  getRootFolders(): Promise<Folder[]>;
  createFolder(folder: NewFolder): Promise<Folder>;
  updateFolder(id: number, folder: Partial<NewFolder>): Promise<Folder | null>;
  deleteFolder(id: number): Promise<boolean>;
  getFolderTree(): Promise<FolderTreeNode[]>;
}

export interface IFileService {
  getAllFiles(): Promise<File[]>;
  getFileById(id: number): Promise<File | null>;
  getFilesByFolderId(folderId: number): Promise<File[]>;
  createFile(file: NewFile): Promise<File>;
  updateFile(id: number, file: Partial<NewFile>): Promise<File | null>;
  deleteFile(id: number): Promise<boolean>;
}

export interface FolderTreeNode {
  id: number;
  name: string;
  path: string;
  parentId: number | null;
  children: FolderTreeNode[];
  hasChildren: boolean;
}

export class FolderService implements IFolderService {
  constructor(private folderRepository: IFolderRepository) {}

  async getAllFolders(): Promise<Folder[]> {
    return await this.folderRepository.findAll();
  }

  async getFolderById(id: number): Promise<Folder | null> {
    const folder = await this.folderRepository.findById(id);
    return folder || null;
  }

  async getSubFolders(parentId: number | null): Promise<Folder[]> {
    return await this.folderRepository.findByParentId(parentId);
  }

  async getRootFolders(): Promise<Folder[]> {
    return await this.folderRepository.findRootFolders();
  }

  async createFolder(folder: NewFolder): Promise<Folder> {
    // Generate path based on parent
    let path = folder.name;
    if (folder.parentId) {
      const parent = await this.folderRepository.findById(folder.parentId);
      if (parent) {
        path = `${parent.path}/${folder.name}`;
      }
    }

    const createInput: CreateFolderInput = {
      name: folder.name,
      parentId: folder.parentId,
      path,
    };

    return await this.folderRepository.create(createInput);
  }

  async updateFolder(id: number, folder: Partial<NewFolder>): Promise<Folder | null> {
    const updatedFolder = await this.folderRepository.update(id, folder);
    return updatedFolder || null;
  }

  async deleteFolder(id: number): Promise<boolean> {
    return await this.folderRepository.delete(id);
  }

  async getFolderTree(): Promise<FolderTreeNode[]> {
    const allFolders = await this.folderRepository.findAll();
    return this.buildFolderTree(allFolders, null);
  }

  private buildFolderTree(folders: Folder[], parentId: number | null): FolderTreeNode[] {
    const children = folders.filter(folder => folder.parentId === parentId);
    
    return children.map(folder => ({
      id: folder.id,
      name: folder.name,
      path: folder.path,
      parentId: folder.parentId,
      children: this.buildFolderTree(folders, folder.id),
      hasChildren: folders.some(f => f.parentId === folder.id),
    }));
  }
}

export class FileService implements IFileService {
  constructor(private fileRepository: IFileRepository) {}

  async getAllFiles(): Promise<File[]> {
    return await this.fileRepository.findAll();
  }

  async getFileById(id: number): Promise<File | null> {
    const file = await this.fileRepository.findById(id);
    return file || null;
  }

  async getFilesByFolderId(folderId: number): Promise<File[]> {
    return await this.fileRepository.findByFolderId(folderId);
  }

  async createFile(file: NewFile): Promise<File> {
    // Generate full path
    const folder = await new FolderRepository().findById(file.folderId);
    const path = folder ? `${folder.path}/${file.name}` : file.name;

    const createInput: CreateFileInput = {
      name: file.name,
      folderId: file.folderId,
      path,
      size: file.size ?? null,
      extension: file.extension ?? null,
    };

    return await this.fileRepository.create(createInput);
  }

  async updateFile(id: number, file: Partial<NewFile>): Promise<File | null> {
    // Convert NewFile partial to CreateFileInput partial
    const updateInput: Partial<CreateFileInput> = {
      name: file.name,
      folderId: file.folderId,
      path: file.path,
      size: file.size ?? null,
      extension: file.extension ?? null,
    };

    const updatedFile = await this.fileRepository.update(id, updateInput);
    return updatedFile || null;
  }

  async deleteFile(id: number): Promise<boolean> {
    return await this.fileRepository.delete(id);
  }
}

// Export search services
export * from "./search";
export * from "./searchDataProvider";
