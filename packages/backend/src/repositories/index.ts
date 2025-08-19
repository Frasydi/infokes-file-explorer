import { eq, isNull } from "drizzle-orm";
import { db } from "../database/connection";
import { folders, files, type Folder, type File } from "../database/schema";

// Repository input types (require path since it should be set before reaching repository)
export type CreateFolderInput = {
  name: string;
  parentId?: number | null;
  path: string;
};

export type CreateFileInput = {
  name: string;
  folderId: number;
  path: string;
  size?: number | null;
  extension?: string | null;
};

export interface IFolderRepository {
  findAll(): Promise<Folder[]>;
  findById(id: number): Promise<Folder | undefined>;
  findByParentId(parentId: number | null): Promise<Folder[]>;
  findRootFolders(): Promise<Folder[]>;
  create(folder: CreateFolderInput): Promise<Folder>;
  update(id: number, folder: Partial<CreateFolderInput>): Promise<Folder | undefined>;
  delete(id: number): Promise<boolean>;
}

export interface IFileRepository {
  findAll(): Promise<File[]>;
  findById(id: number): Promise<File | undefined>;
  findByFolderId(folderId: number): Promise<File[]>;
  create(file: CreateFileInput): Promise<File>;
  update(id: number, file: Partial<CreateFileInput>): Promise<File | undefined>;
  delete(id: number): Promise<boolean>;
}

export class FolderRepository implements IFolderRepository {
  async findAll(): Promise<Folder[]> {
    return await db.select().from(folders);
  }

  async findById(id: number): Promise<Folder | undefined> {
    const result = await db.select().from(folders).where(eq(folders.id, id));
    return result[0];
  }

  async findByParentId(parentId: number | null): Promise<Folder[]> {
    if (parentId === null) {
      return await db.select().from(folders).where(isNull(folders.parentId));
    }
    return await db.select().from(folders).where(eq(folders.parentId, parentId));
  }

  async findRootFolders(): Promise<Folder[]> {
    return await db.select().from(folders).where(isNull(folders.parentId));
  }

  async create(folder: CreateFolderInput): Promise<Folder> {
    const result = await db.insert(folders).values(folder).returning();
    return result[0];
  }

  async update(id: number, folder: Partial<CreateFolderInput>): Promise<Folder | undefined> {
    const result = await db
      .update(folders)
      .set({ ...folder, updatedAt: new Date() })
      .where(eq(folders.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(folders).where(eq(folders.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export class FileRepository implements IFileRepository {
  async findAll(): Promise<File[]> {
    return await db.select().from(files);
  }

  async findById(id: number): Promise<File | undefined> {
    const result = await db.select().from(files).where(eq(files.id, id));
    return result[0];
  }

  async findByFolderId(folderId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.folderId, folderId));
  }

  async create(file: CreateFileInput): Promise<File> {
    const result = await db.insert(files).values(file).returning();
    return result[0];
  }

  async update(id: number, file: Partial<CreateFileInput>): Promise<File | undefined> {
    const result = await db
      .update(files)
      .set({ ...file, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
