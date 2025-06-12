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

- [ ] **Task 7.1**: Identify shared/common components used across features
- [ ] **Task 7.2**: Move shared components to `src/shared/components`
- [ ] **Task 7.3**: Update imports for the moved shared components
- [ ] **Task 7.4**: Identify shared/common composables used across features
- [ ] **Task 7.5**: Move shared composables to `src/shared/composables`
- [ ] **Task 7.6**: Update imports for the moved shared composables
- [ ] **Task 7.7**: Run `pnpm dev` to verify there are no errors

## Phase 8: Services Organization

- [ ] **Task 8.1**: Create service subdirectories in `src/services`
- [ ] **Task 8.2**: Group related services in their respective directories
- [ ] **Task 8.3**: Update imports for the reorganized services
- [ ] **Task 8.4**: Run `pnpm dev` to verify there are no errors

## Phase 9: Final Verification

- [ ] **Task 9.1**: Run comprehensive tests (`npm test`)
- [ ] **Task 9.2**: Verify all features work correctly in the browser
- [ ] **Task 9.3**: Verify build process works (`npm run build`)
- [ ] **Task 9.4**: Document the new project structure
- [ ] **Task 9.5**: Update any relevant documentation

## Completion Checklist

- [ ] All tasks completed successfully
- [ ] No compiler errors
- [ ] All tests passing
- [ ] Project builds successfully
- [ ] Documentation updated