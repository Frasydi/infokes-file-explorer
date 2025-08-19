# Contributing Guidelines

Thank you for your interest in contributing to the File Explorer project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- **Bun** (recommended) or Node.js 18+
- **PostgreSQL** database
- **Git** version control
- Code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/infokes-file-explorer.git
   cd infokes-file-explorer
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   # Edit the .env file with your database credentials
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

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with the following prefixes:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

Examples:
- `feature/advanced-search`
- `bugfix/folder-selection-blinking`
- `docs/api-documentation`

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(search): implement SOLID principles search system

Add comprehensive search functionality with:
- Modular search criteria classes
- Dependency injection pattern
- Interface segregation
- Open/closed principle compliance

Closes #123
```

```
fix(frontend): resolve folder selection blinking issue

Separate loading states for tree and contents to prevent
UI blinking when selecting folders.

Fixes #456
```

## Coding Standards

### TypeScript Guidelines

1. **Use strict TypeScript configuration**
   ```json
   {
     "strict": true,
     "noImplicitAny": true,
     "noImplicitReturns": true,
     "noUnusedLocals": true,
     "noUnusedParameters": true
   }
   ```

2. **Define proper interfaces and types**
   ```typescript
   // Good
   interface Folder {
     id: string;
     name: string;
     parentId: string | null;
     path: string;
     createdAt: Date;
     modifiedAt: Date;
   }

   // Avoid
   const folder: any = { ... };
   ```

3. **Use meaningful variable and function names**
   ```typescript
   // Good
   const selectedFolderId = ref<string | null>(null);
   const loadFolderContents = async (folderId: string) => { ... };

   // Avoid
   const id = ref<string | null>(null);
   const load = async (id: string) => { ... };
   ```

### Vue.js Guidelines

1. **Use Composition API with `<script setup>`**
   ```vue
   <script setup lang="ts">
   import { ref, computed, onMounted } from 'vue';
   import type { Folder } from '@/types';

   const folders = ref<Folder[]>([]);
   const isLoading = ref(false);

   const sortedFolders = computed(() => 
     folders.value.sort((a, b) => a.name.localeCompare(b.name))
   );

   onMounted(async () => {
     await loadFolders();
   });
   </script>
   ```

2. **Use proper prop definitions**
   ```vue
   <script setup lang="ts">
   interface Props {
     folders: Folder[];
     isLoading?: boolean;
     selectedFolderId?: string | null;
   }

   const props = withDefaults(defineProps<Props>(), {
     isLoading: false,
     selectedFolderId: null,
   });
   </script>
   ```

3. **Emit events with proper typing**
   ```vue
   <script setup lang="ts">
   interface Emits {
     'folder-selected': [folderId: string];
     'folder-expanded': [folderId: string, isExpanded: boolean];
   }

   const emit = defineEmits<Emits>();
   </script>
   ```

### CSS Guidelines

1. **Use consistent naming conventions (BEM)**
   ```css
   .folder-tree {
     /* Block */
   }

   .folder-tree__item {
     /* Element */
   }

   .folder-tree__item--selected {
     /* Modifier */
   }
   ```

2. **Use CSS custom properties for theming**
   ```css
   .component {
     --primary-color: #1e293b;
     --hover-color: #334155;
     --text-color: #64748b;
     
     background-color: var(--primary-color);
   }
   ```

3. **Prefer flexbox and grid for layouts**
   ```css
   .folder-contents {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
     gap: 16px;
   }
   ```

### Backend Guidelines

1. **Follow SOLID principles**
   ```typescript
   // Single Responsibility
   class FolderRepository {
     async findAll(): Promise<Folder[]> { ... }
     async findById(id: string): Promise<Folder | null> { ... }
   }

   // Dependency Inversion
   class FolderService {
     constructor(private folderRepo: IFolderRepository) {}
   }
   ```

2. **Use proper error handling**
   ```typescript
   try {
     const folder = await folderRepository.findById(id);
     if (!folder) {
       throw new NotFoundError(`Folder with id ${id} not found`);
     }
     return folder;
   } catch (error) {
     logger.error('Failed to find folder', { id, error });
     throw error;
   }
   ```

3. **Implement proper validation**
   ```typescript
   const createFolderSchema = z.object({
     name: z.string().min(1).max(255),
     parentId: z.string().optional(),
   });

   export const createFolder = async (data: unknown) => {
     const validData = createFolderSchema.parse(data);
     // Process valid data...
   };
   ```

## Testing Guidelines

### Frontend Testing

1. **Unit tests for components**
   ```typescript
   import { mount } from '@vue/test-utils';
   import FolderTree from '@/components/FolderTree.vue';

   describe('FolderTree', () => {
     it('should render folders correctly', () => {
       const folders = [
         { id: '1', name: 'Documents', parentId: null, path: '/Documents' }
       ];
       
       const wrapper = mount(FolderTree, {
         props: { folders }
       });
       
       expect(wrapper.text()).toContain('Documents');
     });
   });
   ```

2. **Integration tests for composables**
   ```typescript
   import { useFileExplorer } from '@/composables/useFileExplorer';

   describe('useFileExplorer', () => {
     it('should load folders on mount', async () => {
       const { folders, loadFolders } = useFileExplorer();
       
       await loadFolders();
       
       expect(folders.value).toHaveLength(3);
     });
   });
   ```

### Backend Testing

1. **Unit tests for services**
   ```typescript
   describe('SearchService', () => {
     it('should find folders by name', async () => {
       const mockRepo = {
         findAll: jest.fn().mockResolvedValue([
           { id: '1', name: 'Documents' },
           { id: '2', name: 'Pictures' }
         ])
       };
       
       const service = new SearchService(mockRepo, new SearchEngine());
       const criteria = [new NameCriteria('Doc')];
       
       const results = await service.searchFolders(criteria);
       
       expect(results).toHaveLength(1);
       expect(results[0].name).toBe('Documents');
     });
   });
   ```

2. **Integration tests for API endpoints**
   ```typescript
   describe('GET /api/folders', () => {
     it('should return all folders', async () => {
       const response = await request(app)
         .get('/api/folders')
         .expect(200);
       
       expect(response.body.success).toBe(true);
       expect(response.body.data).toBeInstanceOf(Array);
     });
   });
   ```

### Test Coverage Requirements

- Maintain at least 80% code coverage
- Write tests for all new features
- Include edge cases and error scenarios
- Test both success and failure paths

## Pull Request Process

### Before Submitting

1. **Run all tests**
   ```bash
   bun run test
   ```

2. **Check linting**
   ```bash
   bun run lint
   bun run lint:fix
   ```

3. **Build successfully**
   ```bash
   bun run build
   ```

4. **Update documentation** if needed

### Pull Request Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Include screenshots for UI changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated checks** must pass
2. **At least one approval** from a maintainer
3. **All conversations resolved**
4. **Up-to-date with main branch**

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 11]
- Browser [e.g. Chrome, Safari]
- Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Recognition

Contributors will be recognized in:
- README.md acknowledgments
- CHANGELOG.md for significant contributions
- GitHub releases for version contributions

## Questions?

If you have questions about contributing:
- Check existing [GitHub Issues](https://github.com/Frasydi/infokes-file-explorer/issues)
- Join our [GitHub Discussions](https://github.com/Frasydi/infokes-file-explorer/discussions)
- Contact maintainers directly

Thank you for contributing to make this project better! 🚀
