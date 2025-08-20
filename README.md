# File Explorer - Windows Explorer Clone

A modern, responsive file explorer built with Vue 3, TypeScript, and Node.js that mimics the functionality and design of Windows Explorer.

## 🚀 Features

### Core Functionality
- **📁 Folder Tree Navigation** - Hierarchical folder structure with expand/collapse
- **📄 File Browsing** - View files and folders in grid or list view
- **🔍 Advanced Search** - Search files and folders with SOLID principles implementation
- **🎨 Elegant Design** - Clean, professional interface without gradients
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices
- **⚡ Real-time Updates** - Instant UI feedback without blinking/loading states

### Technical Features
- **TypeScript** - Full type safety across frontend and backend
- **SOLID Principles** - Properly architected search functionality
- **Database Integration** - PostgreSQL with Drizzle ORM
- **API Architecture** - RESTful API with comprehensive error handling
- **Modern UI/UX** - Smooth animations and transitions
- **Scalable Structure** - Monorepo with separate frontend/backend packages

## 🏗️ Architecture

```
test-asessment-infokes/
├── packages/
│   ├── frontend/          # Vue 3 + TypeScript frontend
│   │   ├── src/
│   │   │   ├── components/    # Reusable Vue components
│   │   │   ├── composables/   # Vue composables for state management
│   │   │   ├── services/      # API services
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── App.vue        # Main application component
│   │   └── package.json
│   └── backend/           # Node.js + TypeScript backend
│       ├── src/
│       │   ├── controllers/   # API route handlers
│       │   ├── services/      # Business logic (SOLID principles)
│       │   ├── repositories/  # Data access layer
│       │   ├── database/      # Database schema and migrations
│       │   └── index.ts       # Application entry point
│       └── package.json
├── bun.lock              # Bun lockfile
├── package.json          # Root package.json
└── README.md            # This file
```

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with flexbox and grid

### Backend
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **Elysia** - Fast web framework
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Relational database

### Development Tools
- **Bun** - Fast package manager and runtime
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Drizzle Kit** - Database migrations

## 🚀 Quick Start

### Prerequisites
- **Bun** (recommended) or Node.js 18+
- **PostgreSQL** database
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Frasydi/infokes-file-explorer.git
   cd infokes-file-explorer
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cp packages/backend/.env.example packages/backend/.env
   # Edit packages/backend/.env with your database credentials
   ```

4. **Set up the database**
   ```bash
   cd packages/backend
   bun run db:migrate
   bun run db:seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd packages/backend
   bun run dev

   # Terminal 2 - Frontend
   cd packages/frontend
   bun run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📖 Documentation

### Component Documentation
- [FolderTree Component](./docs/components/FolderTree.md)
- [FolderContents Component](./docs/components/FolderContents.md)
- [Search System](./docs/components/Search.md)

### API Documentation
- [REST API Endpoints](./docs/api/README.md)
- [Database Schema](./docs/database/schema.md)

### Development Guides
- [Contributing Guidelines](./docs/contributing.md)
- [Code Style Guide](./docs/style-guide.md)
- [Testing Guide](./docs/testing.md)

## 🎯 Key Features Explained

### SOLID Principles Implementation
The search functionality is built following SOLID principles:

- **S**ingle Responsibility: Each search class has one specific purpose
- **O**pen/Closed: Easy to extend with new search criteria
- **L**iskov Substitution: Search criteria are interchangeable
- **I**nterface Segregation: Focused, minimal interfaces
- **D**ependency Inversion: Depends on abstractions, not concretions

### Responsive Design
- **Grid View**: Adaptable columns based on screen size
- **List View**: Stacks vertically on mobile devices
- **Touch-friendly**: Larger touch targets on mobile
- **Smooth Transitions**: No jarring layout shifts

### Performance Optimizations
- **Separate Loading States**: Tree and content loading are independent
- **Debounced Search**: Prevents excessive API calls
- **Efficient Rendering**: Only re-renders necessary components
- **Optimistic UI Updates**: Immediate visual feedback

## 🧪 Testing

### Frontend Tests
```bash
cd packages/frontend
bun run test
```

### Backend Tests
```bash
cd packages/backend
bun run test
```

### Run All Tests
```bash
bun run test
```

## 🏗️ Building for Production

### Build Frontend
```bash
cd packages/frontend
bun run build
```

### Build Backend
```bash
cd packages/backend
bun run build
```

### Build All
```bash
bun run build
```

## 🐳 Docker Support

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

- Inspired by Windows Explorer design
- Built with modern web technologies
- Follows industry best practices for code architecture

#support@example.com

Made with ❤️ by [Frasydi](https://github.com/Frasydi)
