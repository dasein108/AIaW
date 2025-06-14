# Component Consolidation Plan

This document outlines the specific components to consolidate and the steps to follow for each.

## Components to Consolidate

### 1. AAvatar.vue

**Action:** Remove duplicate `/src/shared/components/AAvatar.vue` and use only `/src/shared/components/avatar/AAvatar.vue`

**Import Updates Needed:**
- Check 31 files that import AAvatar
- Update imports to use `@shared/components/avatar/AAvatar.vue`

### 2. AccountBtn.vue

**Action:** Move `/src/features/auth/components/AccountBtn.vue` to `/src/shared/components/layout/AccountBtn.vue`

**Import Updates Needed:**
- Update import in `/src/shared/components/layout/SettingsArea.vue`

### 3. SelectFileBtn.vue

**Action:** Move `/src/features/files/components/SelectFileBtn.vue` to `/src/shared/components/file/SelectFileBtn.vue`

**Import Updates Needed:**
- Update import in `/src/features/artifacts/components/ArtifactsExpansion.vue`
- Update reference in `/src/i18n/en-US/components.ts`

### 4. ViewImageDialog.vue and ViewFileDialog.vue

**Action:** Move both from `/src/features/media/components/` to `/src/shared/components/media/`

**Import Updates Needed:**
- Update imports in `/src/features/media/components/MessageImage.vue`
- Update imports in `/src/features/media/components/MessageFile.vue`
- Update reference in `/src/i18n/en-US/components.ts`

### 5. DragableSeparator.vue

**Action:** Rename `/src/shared/components/DragableSeparator.vue` to `/src/shared/components/DraggableSeparator.vue`

**Import Updates Needed:**
- Update import in `/src/pages/WorkspacePage.vue`

## Step-by-Step Implementation

For each component consolidation:

1. **Create any needed directories**:
   ```bash
   mkdir -p /src/shared/components/file
   mkdir -p /src/shared/components/media
   ```

2. **Move the component to its new location**:
   ```bash
   # Example
   mv /src/features/files/components/SelectFileBtn.vue /src/shared/components/file/
   ```

3. **Update all imports in the codebase**:
   ```typescript
   // Before
   import SelectFileBtn from "@features/files/components/SelectFileBtn.vue"
   
   // After
   import SelectFileBtn from "@shared/components/file/SelectFileBtn.vue"
   ```

4. **Delete duplicate components after confirming all imports are updated**

5. **Verify the application works correctly**:
   - Run type checking: `vue-tsc --noEmit`
   - Run the application in development mode: `npm run dev`
   - Test the affected components

## Implementation Notes

- Update imports one component at a time to avoid confusion
- Batch related changes together for a cleaner git history
- Use the eslint autofix feature to ensure proper formatting after changes
- Consider adding comments where component imports are updated to explain the refactoring
- Update the corresponding tests if applicable