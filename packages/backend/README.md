# File Explorer Backend

A REST API backend for a Windows Explorer-like file management system built with Elysia, TypeScript, and PostgreSQL.

## Features

- **Clean Architecture**: Implements repository pattern, service layer, and dependency injection
- **REST API**: RESTful endpoints following standard conventions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Testing**: Unit tests with Jest and TypeScript
- **TypeScript**: Full type safety throughout the application
- **CORS**: Configured for frontend integration

## Tech Stack

- **Runtime**: Node.js (Bun-ready)
- **Framework**: Elysia
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Language**: TypeScript
- **Testing**: Jest with ts-jest
- **Architecture**: Clean Architecture with Repository & Service patterns

## API Endpoints

### Folders

- `GET /api/v1/folders` - Get all folders
- `GET /api/v1/folders/tree` - Get complete folder tree structure
- `GET /api/v1/folders/root` - Get root folders
- `GET /api/v1/folders/:id` - Get folder by ID
- `GET /api/v1/folders/:id/subfolders` - Get direct subfolders
- `POST /api/v1/folders` - Create new folder
- `PUT /api/v1/folders/:id` - Update folder
- `DELETE /api/v1/folders/:id` - Delete folder

### Files

- `GET /api/v1/files` - Get all files
- `GET /api/v1/files/:id` - Get file by ID
- `GET /api/v1/files/folder/:folderId` - Get files in folder
- `POST /api/v1/files` - Create new file
- `PUT /api/v1/files/:id` - Update file
- `DELETE /api/v1/files/:id` - Delete file

## Database Schema

### Folders Table
- `id` (serial, primary key)
- `name` (varchar(255), not null)
- `parent_id` (integer, foreign key to folders.id)
- `path` (varchar(1000), not null)
- `created_at` (timestamp, default now)
- `updated_at` (timestamp, default now)

### Files Table
- `id` (serial, primary key)
- `name` (varchar(255), not null)
- `folder_id` (integer, foreign key to folders.id, not null)
- `size` (integer, default 0)
- `extension` (varchar(10))
- `path` (varchar(1000), not null)
- `created_at` (timestamp, default now)
- `updated_at` (timestamp, default now)

## Setup Instructions

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up database:
```bash
npm run db:setup
```

4. Seed database with sample data:
```bash
npm run db:seed
```

### Development

Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Production

Build and start:
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── controllers/           # HTTP request handlers
├── services/             # Business logic layer
├── repositories/         # Data access layer
├── database/
│   ├── schema.ts         # Database schema definitions
│   ├── connection.ts     # Database connection
│   ├── setup.ts          # Database setup script
│   ├── seed.ts           # Sample data seeder
│   └── migrations/       # SQL migration files
└── tests/               # Unit tests
```

## Architecture

This backend follows Clean Architecture principles:

1. **Controllers**: Handle HTTP requests/responses and input validation
2. **Services**: Contain business logic and orchestrate operations
3. **Repositories**: Handle data persistence and database operations
4. **Database**: Schema definitions and connection management

## SOLID Principles Applied

- **Single Responsibility**: Each class has one clear purpose
- **Open/Closed**: Easy to extend without modifying existing code
- **Liskov Substitution**: Interfaces allow for easy substitution
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: High-level modules don't depend on low-level modules

## Scalability Considerations

- Repository pattern allows easy database switching
- Service layer enables horizontal scaling
- Stateless design supports load balancing
- Database indexing on parent_id and folder_id for performance
- Pagination can be added to endpoints for large datasets
