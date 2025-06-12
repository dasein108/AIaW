# Modular Refactoring Tasks

## Instructions

1. Complete each task in order
2. After completing a task, run `pnpm eslint:fix` to fix any linter errors
3. Then run `pnpm dev` to verify there are no compiler errors
4. Get explicit confirmation (ACCEPT) from team members before proceeding to the next task
5. Check off tasks as they are completed
6. If any task introduces errors, fix them before continuing

## Phase 1: Create Base Structure

- [x] **Task 1.1**: Create `src/features` directory
- [x] **Task 1.2**: Create feature subdirectories:
  ```
  src/features/auth/components
  src/features/auth/composables
  src/features/auth/store
  src/features/auth/views
  src/features/dialogs/components
  src/features/dialogs/composables
  src/features/dialogs/store
  src/features/dialogs/views
  src/features/assistants/components
  src/features/assistants/composables
  src/features/assistants/store
  src/features/assistants/views
  src/features/workspaces/components
  src/features/workspaces/composables
  src/features/workspaces/store
  src/features/workspaces/views
  src/features/plugins/components
  src/features/plugins/composables
  src/features/plugins/store
  src/features/plugins/views
  ```
- [x] **Task 1.3**: Create `src/shared` directory with subdirectories:
  ```
  src/shared/components
  src/shared/composables
  src/shared/utils
  ```
- [x] **Task 1.4**: Update `tsconfig.json` with path aliases:
  ```json
  "paths": {
    "@/*": ["./src/*"],
    "@features/*": ["./src/features/*"],
    "@shared/*": ["./src/shared/*"],
    "@services/*": ["./src/services/*"]
  }
  ```
- [x] **Task 1.5**: Run `pnpm dev` to verify there are no errors

## Phase 2: Auth Feature Migration

- [x] **Task 2.1**: Identify auth components in `src/components/auth` and `src/components` related to auth
- [x] **Task 2.2**: Move auth components to `src/features/auth/components`
- [x] **Task 2.3**: Update imports in the moved components
- [x] **Task 2.4**: Identify auth composables in `src/composables/auth`
- [x] **Task 2.5**: Move auth composables to `src/features/auth/composables`
- [x] **Task 2.6**: Update imports in the moved composables
- [x] **Task 2.7**: Move auth store (`src/stores/auth.ts`) to `src/features/auth/store`
- [x] **Task 2.8**: Update any imports that reference the moved auth store
- [x] **Task 2.9**: Run `pnpm dev` to verify there are no errors

## Phase 3: Dialog Feature Migration

- [x] **Task 3.1**: Identify dialog components in `src/components`
- [x] **Task 3.2**: Move dialog components to `src/features/dialogs/components`
- [x] **Task 3.3**: Update imports in the moved components
- [x] **Task 3.4**: Identify dialog composables in `src/composables/dialog`
- [x] **Task 3.5**: Move dialog composables to `src/features/dialogs/composables`
- [x] **Task 3.6**: Update imports in the moved composables
- [x] **Task 3.7**: Move dialog stores (`src/stores/dialogs.ts`, `src/stores/dialogMessages.ts`) to `src/features/dialogs/store`
- [x] **Task 3.8**: Update any imports that reference the moved dialog stores
- [x] **Task 3.9**: Run `pnpm dev` to verify there are no errors

## Phase 4: Assistants Feature Migration

- [x] **Task 4.1**: Identify assistant components in `src/components`
- [x] **Task 4.2**: Move assistant components to `src/features/assistants/components`
- [x] **Task 4.3**: Update imports in the moved components
- [x] **Task 4.4**: Identify assistant composables (if any)
- [x] **Task 4.5**: Move assistant composables to `src/features/assistants/composables`
- [x] **Task 4.6**: Update imports in the moved composables
- [x] **Task 4.7**: Move assistants store (`src/stores/assistants.ts`) to `src/features/assistants/store`
- [x] **Task 4.8**: Update any imports that reference the moved assistants store
- [x] **Task 4.9**: Run `pnpm dev` to verify there are no errors

## Phase 5: Workspace Feature Migration

- [x] **Task 5.1**: Identify workspace components in `src/components`
- [x] **Task 5.2**: Move workspace components to `src/features/workspaces/components`
- [x] **Task 5.3**: Update imports in the moved components
- [x] **Task 5.4**: Identify workspace composables in `src/composables/workspaces`
- [x] **Task 5.5**: Move workspace composables to `src/features/workspaces/composables`
- [x] **Task 5.6**: Update imports in the moved composables
- [x] **Task 5.7**: Move workspaces store (`src/stores/workspaces.ts`) to `src/features/workspaces/store`
- [x] **Task 5.8**: Update any imports that reference the moved workspaces store
- [x] **Task 5.9**: Run `pnpm dev` to verify there are no errors

## Phase 6: Plugins Feature Migration

- [x] **Task 6.1**: Identify plugin components in `src/components`
- [x] **Task 6.2**: Move plugin components to `src/features/plugins/components`
- [x] **Task 6.3**: Update imports in the moved components
- [x] **Task 6.4**: Identify plugin composables (if any)
- [x] **Task 6.5**: Move plugin composables to `src/features/plugins/composables`
- [x] **Task 6.6**: Update imports in the moved composables
- [x] **Task 6.7**: Move plugins store (`src/stores/plugins.ts`, `src/stores/user-plugins.ts`) to `src/features/plugins/store`
- [x] **Task 6.8**: Update any imports that reference the moved plugins store
- [x] **Task 6.9**: Run `pnpm dev` to verify there are no errors

## Phase 7: Shared Components and Composables

- [x] **Task 7.1**: Identify shared/common components used across features
- [x] **Task 7.2**: Move shared components to `src/shared/components`
- [x] **Task 7.3**: Update imports for the moved shared components
- [x] **Task 7.4**: Identify shared/common composables used across features
- [x] **Task 7.5**: Move shared composables to `src/shared/composables`
- [x] **Task 7.6**: Update imports for the moved shared composables
- [x] **Task 7.7**: Run `pnpm dev` to verify there are no errors

## Phase 8: Services Organization

- [x] **Task 8.1**: Create service subdirectories in `src/services`
- [x] **Task 8.2**: Group related services in their respective directories
- [x] **Task 8.3**: Update imports for the reorganized services
- [x] **Task 8.4**: Run `pnpm dev` to verify there are no errors

## Phase 9: Chats Feature Extraction

- [x] **Task 9.1**: Create feature subdirectories for chats:
  ```
  src/features/chats/components
  src/features/chats/composables
  src/features/chats/store
  src/features/chats/views
  ```
- [x] **Task 9.2**: Identify chat components in `src/components/chats` and related components
- [x] **Task 9.3**: Move chat components to `src/features/chats/components`
- [x] **Task 9.4**: Update imports in the moved components
- [x] **Task 9.5**: Identify chat composables in `src/composables/chats`
- [x] **Task 9.6**: Move chat composables to `src/features/chats/composables`
- [x] **Task 9.7**: Update imports in the moved composables
- [x] **Task 9.8**: Move chat stores (`src/stores/chats.ts`, `src/stores/chat-messages.ts`) to `src/features/chats/store`
- [x] **Task 9.9**: Update any imports that reference the moved chat stores
- [x] **Task 9.10**: Run `pnpm dev` to verify there are no errors

## Phase 10: Artifacts Feature Extraction

- [x] **Task 10.1**: Create feature subdirectories for artifacts:
  ```
  src/features/artifacts/components
  src/features/artifacts/composables
  src/features/artifacts/store
  src/features/artifacts/views
  ```
- [x] **Task 10.2**: Identify artifact components in `src/components` related to artifacts
- [x] **Task 10.3**: Move artifact components to `src/features/artifacts/components`
- [x] **Task 10.4**: Update imports in the moved components
- [x] **Task 10.5**: Identify artifact composables (if any)
- [x] **Task 10.6**: Move artifact composables to `src/features/artifacts/composables`
- [x] **Task 10.7**: Update imports in the moved composables
- [x] **Task 10.8**: Move artifacts store (`src/stores/artifacts.ts`) to `src/features/artifacts/store`
- [x] **Task 10.9**: Update any imports that reference the moved artifacts store
- [x] **Task 10.10**: Run `pnpm dev` to verify there are no errors

## Phase 11: Providers Feature Extraction

- [x] **Task 11.1**: Create feature subdirectories for providers:
  ```
  src/features/providers/components
  src/features/providers/composables
  src/features/providers/store
  src/features/providers/views
  ```
- [x] **Task 11.2**: Identify provider components in `src/components` related to providers
- [x] **Task 11.3**: Move provider components to `src/features/providers/components`
- [x] **Task 11.4**: Update imports in the moved components
- [x] **Task 11.5**: Identify provider composables (if any)
- [x] **Task 11.6**: Move provider composables to `src/features/providers/composables`
- [x] **Task 11.7**: Update imports in the moved composables
- [x] **Task 11.8**: Move providers store (`src/stores/providers.ts`) to `src/features/providers/store`
- [x] **Task 11.9**: Update any imports that reference the moved providers store
- [x] **Task 11.10**: Run `pnpm dev` to verify there are no errors

## Phase 12: Shared Stores Migration

- [x] **Task 12.1**: Create `src/shared/store` directory
- [x] **Task 12.2**: Create `src/shared/store/utils` directory for store utilities
- [x] **Task 12.3**: Move `src/stores/createUserDataStore.ts` to `src/shared/store/utils/createUserDataStore.ts`
- [x] **Task 12.4**: Identify shared stores that aren't tied to specific features
- [x] **Task 12.5**: Move identified stores to `src/shared/store`
- [x] **Task 12.6**: Update imports in the moved stores
- [x] **Task 12.7**: Update any imports that reference the moved stores
- [x] **Task 12.8**: Run `pnpm dev` to verify there are no errors

## Phase 13: Profile Feature Extraction

- [x] **Task 13.1**: Create feature subdirectories for profile:
  ```
  src/features/profile/components
  src/features/profile/composables
  src/features/profile/store
  src/features/profile/views
  ```
- [x] **Task 13.2**: Move profile store from `src/shared/store/profile.ts` to `src/features/profile/store/profile.ts`
- [x] **Task 13.3**: Identify profile components in `src/components` related to user profiles
- [x] **Task 13.4**: Move profile components to `src/features/profile/components`
- [x] **Task 13.5**: Update imports in the moved components
- [x] **Task 13.6**: Identify profile composables (if any)
- [x] **Task 13.7**: Move profile composables to `src/features/profile/composables`
- [x] **Task 13.8**: Update imports in the moved composables
- [x] **Task 13.9**: Update the shared store index to remove profile exports
- [x] **Task 13.10**: Update any imports that reference the moved profile store
- [x] **Task 13.11**: Run `pnpm dev` to verify there are no errors

## Phase 14: Clean Up Duplicated Code

- [ ] **Task 14.1**: Identify components in `/components` and `/layouts` that now exist in `/features` or `/shared` directories
- [ ] **Task 14.2**: Remove these duplicate components from `/components`
- [ ] **Task 14.3**: Identify composables in `/composables` that now exist in `/features` or `/shared` directories
- [ ] **Task 14.4**: Remove these duplicate composables from `/composables`
- [ ] **Task 14.5**: Identify utils in `/utils` that now exist in `/features` or `/shared` directories
- [ ] **Task 14.6**: Remove these duplicate utils from `/utils`
- [ ] **Task 14.7**: DO NOT REMOVE code that does not have duplicates in feature directories
- [ ] **Task 14.8**: Update any imports that still reference the old paths
- [ ] **Task 14.9**: Run `pnpm dev` to verify there are no errors

## Phase 15: Filename Standardization

- [ ] **Task 15.1**: Identify files with kebab-case or non-camelCase names
- [ ] **Task 15.2**: Rename these files to camelCase based on code content
- [ ] **Task 15.3**: Update all imports referencing the renamed files
- [ ] **Task 15.4**: Run `pnpm dev` to verify there are no errors

## Phase 16: Final Verification

- [ ] **Task 16.1**: Run comprehensive tests (`npm test`)
- [ ] **Task 16.2**: Verify all features work correctly in the browser
- [ ] **Task 16.3**: Verify build process works (`npm run build`)
- [ ] **Task 16.4**: Document the new project structure
- [ ] **Task 16.5**: Update any relevant documentation

## Completion Checklist

- [ ] All tasks completed successfully
- [ ] No compiler errors
- [ ] All tests passing
- [ ] Project builds successfully
- [ ] Documentation updated