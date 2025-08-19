# File Explorer Frontend

A Vue 3 + TypeScript frontend application that provides a Windows Explorer-like interface for browsing file systems.

## Features

### Core Features
- **Dual-panel layout**: Left panel shows folder tree, right panel shows folder contents
- **Folder navigation**: Click folders in the tree to view their contents
- **Expandable tree**: Click arrow icons to expand/collapse folders with subfolders
- **Search functionality**: Search for files and folders across the entire file system
- **Responsive design**: Adapts to different screen sizes

### UI Features
- **Multiple view modes**: Grid and list views for folder contents
- **Sorting options**: Sort by name, type, size, or modification date
- **File type icons**: Visual icons for different file types
- **Loading states**: User-friendly loading indicators
- **Error handling**: Graceful error states with retry options
- **Resizable panels**: Drag to resize the left panel

### Technical Features
- **Vue 3 Composition API**: Modern reactive programming
- **TypeScript**: Full type safety and better development experience
- **Component architecture**: Modular, reusable components
- **Axios**: HTTP client for API communication
- **Vitest**: Unit testing framework
- **Bun runtime**: Fast JavaScript runtime and package manager

## Getting Started

### Prerequisites
- Node.js 18+ or Bun 1.0+
- Access to the backend API

### Installation

```sh
bun install
```

### Compile and Hot-Reload for Development

```sh
bun dev
```

### Compile and Minify for Production

```sh
bun run build
```

### Run Tests

```sh
bun run test
```

### Type Checking

```sh
bun run type-check
```

## Environment Setup

The application expects the backend API to be running on `http://localhost:3001`. This is configured in the Vite proxy settings.
