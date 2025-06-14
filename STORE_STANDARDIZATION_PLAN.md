# Store Standardization Plan

## Current Patterns

### Feature Stores

1. **Main Pattern**: 
   - File: `src/features/[module]/store/index.ts`
   - Export: `export const use[Module]Store = defineStore("[module]", () => { ... })`
   - Import: `import { use[Module]Store } from "@/features/[module]/store"`

2. **Secondary Stores Pattern**:
   - File: `src/features/[module]/store/[substore].ts`
   - Export: `export const use[Substore]Store = defineStore("[substore]", () => { ... })`
   - Import: `import { use[Substore]Store } from "@/features/[module]/store/[substore]"`

### Shared Stores

1. **Current Pattern**:
   - File: `src/shared/store/[name]Store.ts`
   - Export: `export const use[Name]Store = defineStore("[name]", () => { ... })`
   - Import: `import { use[Name]Store } from "@/shared/store/[name]Store"`

## Issues

1. Inconsistent file naming between feature stores and shared stores
2. Some feature modules may have duplicated stores with different naming
3. Imports are inconsistent based on file location

## Standardization Rules

### For Feature Modules

1. **Main Store**:
   - File: `src/features/[module]/store/index.ts`
   - Export: `export const use[Module]Store = defineStore("[module]", () => { ... })`
   - This file should re-export any secondary stores

2. **Secondary Stores**:
   - File: `src/features/[module]/store/[substore].ts`
   - Export: `export const use[Substore]Store = defineStore("[module].[substore]", () => { ... })`
   - Store ID should use dot notation for namespace (e.g., "dialogs.messages")

### For Shared Stores

1. **Main Pattern**:
   - File: `src/shared/store/[name].ts` (remove "Store" suffix)
   - Export: `export const use[Name]Store = defineStore("[name]", () => { ... })`
   - Update `src/shared/store/index.ts` to re-export all stores

### General Rules

1. Store IDs should be kebab-case (e.g., "ui-state")
2. Store function names should be camelCase with "use" prefix and "Store" suffix (e.g., `useUiStateStore`)
3. Each feature module should have only one main store file with secondary stores as needed
4. All stores should be re-exported through their module's `index.ts`

## Implementation Steps

1. Rename shared store files to remove "Store" suffix
2. Update imports for shared stores
3. Standardize feature store file structure
4. Update feature store imports
5. Fix any store ID inconsistencies
6. Ensure proper re-exports in index files