# Database Schema Documentation

This document describes the database schema for the File Explorer application using PostgreSQL with Drizzle ORM.

## Overview

The database uses PostgreSQL as the primary database engine with Drizzle ORM for type-safe database operations. The schema follows a hierarchical structure suitable for file system representation.

## Tables

### folders

Stores folder information with hierarchical relationships.

```sql
CREATE TABLE folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_folders_path ON folders(path);
CREATE INDEX idx_folders_name ON folders(name);
```

**Columns:**
- `id` (SERIAL, Primary Key): Unique identifier for the folder
- `name` (VARCHAR(255), NOT NULL): Display name of the folder
- `parent_id` (INTEGER, Foreign Key): Reference to parent folder (NULL for root folders)
- `path` (TEXT, NOT NULL, UNIQUE): Full file system path of the folder
- `created_at` (TIMESTAMP WITH TIME ZONE): Timestamp when folder was created
- `modified_at` (TIMESTAMP WITH TIME ZONE): Timestamp when folder was last modified

**Constraints:**
- Primary Key: `id`
- Foreign Key: `parent_id` references `folders(id)` with CASCADE delete
- Unique: `path`
- Check: Ensure path starts with '/'

### files

Stores file information linked to folders.

```sql
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL UNIQUE,
  size BIGINT NOT NULL DEFAULT 0,
  extension VARCHAR(10),
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_files_folder_id ON files(folder_id);
CREATE INDEX idx_files_path ON files(path);
CREATE INDEX idx_files_name ON files(name);
CREATE INDEX idx_files_extension ON files(extension);
CREATE INDEX idx_files_size ON files(size);
CREATE INDEX idx_files_created_at ON files(created_at);
CREATE INDEX idx_files_modified_at ON files(modified_at);
```

**Columns:**
- `id` (SERIAL, Primary Key): Unique identifier for the file
- `name` (VARCHAR(255), NOT NULL): Display name of the file
- `folder_id` (INTEGER, NOT NULL, Foreign Key): Reference to containing folder
- `path` (TEXT, NOT NULL, UNIQUE): Full file system path of the file
- `size` (BIGINT, NOT NULL): File size in bytes
- `extension` (VARCHAR(10)): File extension (e.g., 'pdf', 'txt')
- `mime_type` (VARCHAR(100)): MIME type of the file
- `created_at` (TIMESTAMP WITH TIME ZONE): Timestamp when file was created
- `modified_at` (TIMESTAMP WITH TIME ZONE): Timestamp when file was last modified

**Constraints:**
- Primary Key: `id`
- Foreign Key: `folder_id` references `folders(id)` with CASCADE delete
- Unique: `path`
- Check: Ensure size >= 0

## Drizzle Schema Definition

```typescript
// database/schema.ts
import { pgTable, serial, varchar, integer, text, bigint, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const folders = pgTable('folders', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  parentId: integer('parent_id').references(() => folders.id, { onDelete: 'cascade' }),
  path: text('path').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  modifiedAt: timestamp('modified_at', { withTimezone: true }).defaultNow(),
});

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  folderId: integer('folder_id').notNull().references(() => folders.id, { onDelete: 'cascade' }),
  path: text('path').notNull().unique(),
  size: bigint('size', { mode: 'number' }).notNull().default(0),
  extension: varchar('extension', { length: 10 }),
  mimeType: varchar('mime_type', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  modifiedAt: timestamp('modified_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
  }),
  children: many(folders),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
}));
```

## Relationships

### Folder Hierarchy
- **Self-referencing relationship**: Folders can contain other folders through `parent_id`
- **Cascade deletion**: When a parent folder is deleted, all child folders are automatically deleted
- **Root folders**: Folders with `parent_id = NULL` are root-level folders

### File-Folder Relationship
- **One-to-many**: Each folder can contain multiple files
- **Required relationship**: Every file must belong to a folder
- **Cascade deletion**: When a folder is deleted, all contained files are automatically deleted

## Indexes

### Performance Indexes
```sql
-- Folder hierarchy queries
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_folders_path ON folders(path);

-- File lookup queries
CREATE INDEX idx_files_folder_id ON files(folder_id);
CREATE INDEX idx_files_path ON files(path);

-- Search optimization
CREATE INDEX idx_folders_name ON folders(name);
CREATE INDEX idx_files_name ON files(name);
CREATE INDEX idx_files_extension ON files(extension);

-- Size and date filtering
CREATE INDEX idx_files_size ON files(size);
CREATE INDEX idx_files_created_at ON files(created_at);
CREATE INDEX idx_files_modified_at ON files(modified_at);

-- Composite indexes for complex queries
CREATE INDEX idx_files_folder_extension ON files(folder_id, extension);
CREATE INDEX idx_files_name_extension ON files(name, extension);
```

### Search Optimization
For full-text search capabilities:

```sql
-- Add full-text search indexes
CREATE INDEX idx_folders_name_fts ON folders USING gin(to_tsvector('english', name));
CREATE INDEX idx_files_name_fts ON files USING gin(to_tsvector('english', name));
```

## Triggers

### Auto-update modified_at
```sql
-- Function to update modified_at timestamp
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating modified_at
CREATE TRIGGER update_folders_modified_at 
    BEFORE UPDATE ON folders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_files_modified_at 
    BEFORE UPDATE ON files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_at_column();
```

### Path Validation
```sql
-- Function to validate and generate paths
CREATE OR REPLACE FUNCTION validate_folder_path()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate path based on parent folder
    IF NEW.parent_id IS NULL THEN
        NEW.path = '/' || NEW.name;
    ELSE
        SELECT path || '/' || NEW.name INTO NEW.path
        FROM folders WHERE id = NEW.parent_id;
    END IF;
    
    -- Validate path format
    IF NEW.path !~ '^/.*' THEN
        RAISE EXCEPTION 'Invalid path format: %', NEW.path;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_folder_path_trigger
    BEFORE INSERT OR UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION validate_folder_path();
```

## Migrations

### Initial Migration (0001_initial.sql)
```sql
-- Create folders table
CREATE TABLE folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER,
  path TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create files table
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  folder_id INTEGER NOT NULL,
  path TEXT NOT NULL UNIQUE,
  size BIGINT NOT NULL DEFAULT 0,
  extension VARCHAR(10),
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE folders ADD CONSTRAINT fk_folders_parent_id 
    FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE;

ALTER TABLE files ADD CONSTRAINT fk_files_folder_id 
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_folders_path ON folders(path);
CREATE INDEX idx_folders_name ON folders(name);
CREATE INDEX idx_files_folder_id ON files(folder_id);
CREATE INDEX idx_files_path ON files(path);
CREATE INDEX idx_files_name ON files(name);
CREATE INDEX idx_files_extension ON files(extension);
CREATE INDEX idx_files_size ON files(size);

-- Create triggers for auto-updating modified_at
-- (Trigger functions and triggers as defined above)
```

## Seed Data

### Sample Data Structure
```sql
-- Root folders
INSERT INTO folders (name, parent_id, path) VALUES
('Documents', NULL, '/Documents'),
('Pictures', NULL, '/Pictures'),
('Downloads', NULL, '/Downloads');

-- Subfolders
INSERT INTO folders (name, parent_id, path) VALUES
('Work', 1, '/Documents/Work'),
('Personal', 1, '/Documents/Personal'),
('Photos', 2, '/Pictures/Photos'),
('Screenshots', 2, '/Pictures/Screenshots');

-- Sample files
INSERT INTO files (name, folder_id, path, size, extension, mime_type) VALUES
('resume.pdf', 4, '/Documents/Work/resume.pdf', 1024576, 'pdf', 'application/pdf'),
('report.docx', 4, '/Documents/Work/report.docx', 2048576, 'docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
('vacation.jpg', 6, '/Pictures/Photos/vacation.jpg', 3145728, 'jpg', 'image/jpeg'),
('notes.txt', 5, '/Documents/Personal/notes.txt', 4096, 'txt', 'text/plain');
```

## Query Examples

### Common Queries

#### Get all root folders
```sql
SELECT * FROM folders WHERE parent_id IS NULL;
```

#### Get folder contents (subfolders and files)
```sql
-- Get subfolders
SELECT * FROM folders WHERE parent_id = $1;

-- Get files in folder
SELECT * FROM files WHERE folder_id = $1;
```

#### Get full folder hierarchy
```sql
WITH RECURSIVE folder_tree AS (
  -- Base case: root folders
  SELECT id, name, parent_id, path, 0 as level
  FROM folders
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case: child folders
  SELECT f.id, f.name, f.parent_id, f.path, ft.level + 1
  FROM folders f
  INNER JOIN folder_tree ft ON f.parent_id = ft.id
)
SELECT * FROM folder_tree ORDER BY level, name;
```

#### Search files by name and extension
```sql
SELECT f.*, fo.name as folder_name, fo.path as folder_path
FROM files f
JOIN folders fo ON f.folder_id = fo.id
WHERE f.name ILIKE '%document%' 
  AND f.extension = 'pdf';
```

#### Get folder size (sum of all files)
```sql
WITH RECURSIVE folder_tree AS (
  SELECT id FROM folders WHERE id = $1
  UNION ALL
  SELECT f.id FROM folders f
  INNER JOIN folder_tree ft ON f.parent_id = ft.id
)
SELECT 
  SUM(f.size) as total_size,
  COUNT(f.id) as file_count
FROM files f
WHERE f.folder_id IN (SELECT id FROM folder_tree);
```

## Performance Considerations

### Index Usage
- Use `EXPLAIN ANALYZE` to verify index usage in queries
- Consider partial indexes for specific query patterns
- Monitor index bloat and rebuild when necessary

### Query Optimization
- Use prepared statements for frequently executed queries
- Implement pagination for large result sets
- Consider materialized views for complex hierarchical queries

### Maintenance
```sql
-- Analyze tables for query planner
ANALYZE folders;
ANALYZE files;

-- Vacuum tables to reclaim space
VACUUM ANALYZE folders;
VACUUM ANALYZE files;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public';
```

## Backup and Recovery

### Backup Strategy
```bash
# Full database backup
pg_dump -h localhost -U username -d file_explorer > backup.sql

# Schema-only backup
pg_dump -h localhost -U username -d file_explorer --schema-only > schema.sql

# Data-only backup
pg_dump -h localhost -U username -d file_explorer --data-only > data.sql
```

### Restore Process
```bash
# Restore full backup
psql -h localhost -U username -d file_explorer < backup.sql

# Restore schema only
psql -h localhost -U username -d file_explorer < schema.sql
```

## Security Considerations

### Access Control
- Use role-based access control (RBAC)
- Implement row-level security (RLS) if needed
- Regular security audits

### Data Protection
- Encrypt sensitive data at rest
- Use SSL/TLS for connections
- Regular security updates

### Audit Trail
Consider adding audit tables to track changes:

```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  user_id INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
