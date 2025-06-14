# Detailed Component Consolidation Plan

This document provides specific steps for each component consolidation, including code examples and verification steps.

## 1. AAvatar Component

### Current Situation
- `/src/shared/components/AAvatar.vue` (duplicate)
- `/src/shared/components/avatar/AAvatar.vue` (keep this one)

### Implementation Steps

1. **Verify both components are identical**:
   - Confirmed both have same template and functionality
   - The avatar/AAvatar.vue component is imported by other components in the avatar directory

2. **Update any imports using the root-level AAvatar**:
   ```typescript
   // Before
   import AAvatar from "@shared/components/AAvatar.vue"
   
   // After
   import AAvatar from "@shared/components/avatar/AAvatar.vue"
   ```

3. **Delete the duplicate component**:
   ```bash
   rm /src/shared/components/AAvatar.vue
   ```

4. **Verification**:
   - Ensure all components using AAvatar still render correctly
   - Check for any type errors

## 2. AccountBtn Component

### Current Situation
- `/src/features/auth/components/AccountBtn.vue` (move this)
- No duplicate found, but should be in shared components

### Implementation Steps

1. **Create the directory if it doesn't exist**:
   ```bash
   mkdir -p /src/shared/components/layout
   ```

2. **Move the component**:
   ```bash
   mv /src/features/auth/components/AccountBtn.vue /src/shared/components/layout/
   ```

3. **Update the imports in AccountBtn.vue if needed**:
   - Check if any relative imports need adjustment after moving

4. **Update imports in other files**:
   ```typescript
   // Before
   import AccountBtn from "@features/auth/components/AccountBtn.vue"
   
   // After
   import AccountBtn from "@shared/components/layout/AccountBtn.vue"
   ```

5. **Verification**:
   - Ensure the account button still works correctly
   - Test both authenticated and unauthenticated states

## 3. SelectFileBtn Component

### Current Situation
- `/src/features/files/components/SelectFileBtn.vue` (move this)
- Generic file selection functionality should be in shared components

### Implementation Steps

1. **Create the directory if it doesn't exist**:
   ```bash
   mkdir -p /src/shared/components/file
   ```

2. **Move the component**:
   ```bash
   mv /src/features/files/components/SelectFileBtn.vue /src/shared/components/file/
   ```

3. **Update imports in other files**:
   ```typescript
   // Before
   import SelectFileBtn from "@features/files/components/SelectFileBtn.vue"
   
   // After
   import SelectFileBtn from "@shared/components/file/SelectFileBtn.vue"
   ```

4. **Update i18n references if needed**:
   - Check and update any references in translation files

5. **Verification**:
   - Test file selection functionality
   - Verify drag and drop still works

## 4. ViewImageDialog and ViewFileDialog Components

### Current Situation
- `/src/features/media/components/ViewImageDialog.vue` (move this)
- `/src/features/media/components/ViewFileDialog.vue` (move this)
- Generic file/image viewers should be in shared components

### Implementation Steps

1. **Create the directory if it doesn't exist**:
   ```bash
   mkdir -p /src/shared/components/media
   ```

2. **Move the components**:
   ```bash
   mv /src/features/media/components/ViewImageDialog.vue /src/shared/components/media/
   mv /src/features/media/components/ViewFileDialog.vue /src/shared/components/media/
   ```

3. **Update imports in other files**:
   ```typescript
   // Before
   import ViewImageDialog from "@features/media/components/ViewImageDialog.vue"
   import ViewFileDialog from "@features/media/components/ViewFileDialog.vue"
   
   // After
   import ViewImageDialog from "@shared/components/media/ViewImageDialog.vue"
   import ViewFileDialog from "@shared/components/media/ViewFileDialog.vue"
   ```

4. **Verification**:
   - Test viewing images and files
   - Verify dialogs open and close correctly

## 5. DragableSeparator Component

### Current Situation
- `/src/shared/components/DragableSeparator.vue` (rename this)
- Component name has a typo: "Dragable" should be "Draggable"

### Implementation Steps

1. **Rename the component file**:
   ```bash
   mv /src/shared/components/DragableSeparator.vue /src/shared/components/DraggableSeparator.vue
   ```

2. **Update imports in other files**:
   ```typescript
   // Before
   import DragableSeparator from "@shared/components/DragableSeparator.vue"
   
   // After
   import DraggableSeparator from "@shared/components/DraggableSeparator.vue"
   ```

3. **Verification**:
   - Ensure drag separation functionality still works
   - Test in WorkspacePage where it's used

## Global Verification Steps

After implementing all changes:

1. **Run type checking**:
   ```bash
   vue-tsc --noEmit
   ```

2. **Run linting**:
   ```bash
   npm run lint
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Verify key functionality**:
   - Test avatar rendering
   - Test account button functionality
   - Test file selection
   - Test file/image viewing
   - Test drag separation

5. **Check for any errors in the console**

## Notes

- Make one change at a time and verify before proceeding to the next
- Commit changes after each component is successfully moved and tested
- Consider adding comments in the components explaining why they were moved