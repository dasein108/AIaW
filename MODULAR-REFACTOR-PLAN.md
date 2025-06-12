# Modular Design Refactoring Plan for AIaW

## 1. Objectives

- Create a clear, modular project structure
- Organize code by feature and responsibility
- Minimize code changes while improving architecture
- Improve maintainability and developer experience
- Enable easier feature development and bug fixing

## 2. New Project Structure

```
src/
├─ app/
│  ├─ router/          # Application routing
│  ├─ i18n/            # Internationalization
│  └─ assets/          # Global assets
│
├─ boot/               # Application bootstrap code
│
├─ css/                # Global CSS and styling
│
├─ features/           # Feature modules
│  ├─ auth/            # Authentication feature
│  │  ├─ components/   # Feature-specific components
│  │  ├─ composables/  # Feature-specific composables
│  │  ├─ store/        # Feature state management
│  │  └─ views/        # Feature views/pages
│  │
│  ├─ chats/           # Chat management feature
│  ├─ dialogs/         # Dialog feature
│  ├─ assistants/      # AI assistants feature
│  ├─ artifacts/       # Artifacts feature
│  ├─ plugins/         # Plugin system feature
│  └─ workspaces/      # Workspace management feature
│
├─ shared/             # Shared/common code
│  ├─ components/      # Common components
│  ├─ composables/     # Common composables
│  └─ utils/           # Utility functions
│
├─ services/           # Core services
│  ├─ supabase/        # Supabase integration
│  ├─ llm/             # LLM providers integration
│  ├─ encryption/      # Encryption services
│  ├─ cosmos/          # Cosmos wallet integration
│  └─ kepler/          # Kepler services
│
├─ stores/             # Global state management
│
├─ types/              # Type definitions
│  ├─ common.ts        # Shared types
│  ├─ dialog.ts        # Dialog-related types
│  └─ ...              # Other type definitions
│
└─ pages/              # Application pages
```

## 3. Implementation Strategy

### Phase 1: Create Base Structure (Minimal Changes)

1. **Create New Directories**
   - Create the base folder structure while keeping existing files in place
   - Add `.gitkeep` files to maintain empty directories

2. **Update Path Aliases**
   - Ensure path aliases are configured correctly in tsconfig.json
   - Example:
     ```json
     "paths": {
       "@/*": ["./src/*"],
       "@features/*": ["./src/features/*"],
       "@shared/*": ["./src/shared/*"],
       "@services/*": ["./src/services/*"]
     }
     ```

### Phase 2: Move Files (Incremental Approach)

#### Feature Organization

1. **Auth Feature**
   - Move auth-related components to `features/auth/components/`
   - Move auth-related composables to `features/auth/composables/`
   - Move auth-related store to `features/auth/store/`

2. **Assistants Feature**
   - Move assistant components to `features/assistants/components/`
   - Move assistant composables to `features/assistants/composables/`
   - Move assistant store to `features/assistants/store/`

3. **Dialogs Feature**
   - Follow same pattern for dialog-related code

4. **Other Features**
   - Organize remaining features following the same pattern

#### Shared Code Organization

1. **Identify Shared Components**
   - Components used across multiple features
   - Move to `shared/components/`

2. **Identify Shared Composables**
   - Composables used across multiple features
   - Move to `shared/composables/`

3. **Utility Functions**
   - Move helper functions to `shared/utils/`

#### Service Organization

1. **Group Related Services**
   - Group related services in subdirectories
   - Update imports accordingly

### Phase 3: Update Imports (Incremental Approach)

1. **Update Import Paths**
   - Update imports in moved files
   - Use path aliases for cleaner imports

2. **Fix Build Issues**
   - Resolve any build issues that arise from file movements
   - Ensure all imports are correct

## 4. Example Changes

### Before
```typescript
// src/composables/auth/useAuth.ts
import { useUserStore } from '../../stores/user'

export function useAuth() {
  const userStore = useUserStore()
  // ...
}
```

### After
```typescript
// src/features/auth/composables/useAuth.ts
import { useUserStore } from '@/stores/user'

export function useAuth() {
  const userStore = useUserStore()
  // ...
}
```

## 5. Migration Guidelines

1. **One Feature at a Time**
   - Focus on moving one feature module at a time
   - Test thoroughly after each feature migration

2. **Maintain Working Application**
   - Application should remain functional during entire refactoring
   - After each change, run `pnpm eslint:fix` to fix any linter errors
   - Then run `pnpm dev` to verify no compiler errors were introduced

3. **Update Documentation**
   - Update component documentation with new paths
   - Document new project structure

4. **No Logic Changes**
   - Focus only on restructuring, not rewriting
   - Avoid changing implementation details

## 6. Implementation Plan

### Immediate Actions
1. Create the new directory structure
2. Set up path aliases
3. Move feature-specific components to their respective directories
4. Update imports

### Short-term (1-2 weeks)
1. Complete restructuring of all feature modules
2. Reorganize shared components and utilities
3. Ensure all tests pass with new structure

### Medium-term (2-4 weeks)
1. Refine service organization
2. Improve documentation
3. Address any issues discovered during restructuring

## 7. Benefits

- **Improved Developer Experience**: Clear organization makes it easier to find code
- **Better Separation of Concerns**: Features are isolated and self-contained
- **Easier Onboarding**: New developers can quickly understand codebase
- **Maintainability**: Modular structure makes maintenance easier
- **Scalability**: New features can be added without affecting existing ones