import type { IFolderRepository, IFileRepository } from "../repositories";
import type { ISearchDataProvider } from "./search";
import type { Folder, File } from "../database/schema";

// Dependency Inversion Principle - Data provider implementation
export class RepositorySearchDataProvider implements ISearchDataProvider {
  constructor(
    private folderRepository: IFolderRepository,
    private fileRepository: IFileRepository
  ) {}

  async getFolders(): Promise<Folder[]> {
    return await this.folderRepository.findAll();
  }

  async getFiles(): Promise<File[]> {
    return await this.fileRepository.findAll();
  }
}
