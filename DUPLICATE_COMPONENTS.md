# Duplicate Components Analysis

This document lists components that are duplicated or should be relocated in the codebase, along with recommendations for consolidation.

## 1. AAvatar.vue

**Current Locations:**
- `/src/shared/components/AAvatar.vue`
- `/src/shared/components/avatar/AAvatar.vue`

**Analysis:**
- Both components are identical and render an avatar with different types (text, image, icon, url, svg)
- They use the same props, style calculations, and rendering logic
- The only slight difference is in the import path for ImageAvatar.vue

**Recommendation:**
- Keep only the version in `/src/shared/components/avatar/AAvatar.vue`
- Update all imports to use the namespaced version
- Delete the duplicate at `/src/shared/components/AAvatar.vue`

## 2. AccountBtn.vue

**Current Locations:**
- `/src/features/auth/components/AccountBtn.vue`
- There are references to a duplicate in profile features but it doesn't exist in the codebase

**Analysis:**
- The component shows either a user avatar or a login button depending on authentication state
- It imports from both auth and profile features, suggesting shared functionality
- It handles user authentication flow and routing to the account page

**Recommendation:**
- Move to `/src/shared/components/layout/AccountBtn.vue` since it's used across features
- Update imports to use the shared component

## 3. SelectFileBtn.vue

**Current Locations:**
- `/src/features/files/components/SelectFileBtn.vue`
- There are references to a shared version but it doesn't exist in the codebase

**Analysis:**
- This component handles file selection, drag-and-drop, and paste functionality
- It's a generic UI element not tied to any specific feature

**Recommendation:**
- Move to `/src/shared/components/file/SelectFileBtn.vue` as it's generic file selection functionality
- Update all imports to use the shared component

## 4. ViewImageDialog.vue and ViewFileDialog.vue

**Current Locations:**
- `/src/features/media/components/ViewImageDialog.vue`
- `/src/features/media/components/ViewFileDialog.vue`
- The shared versions were mentioned but don't exist in the codebase

**Analysis:**
- These components handle displaying images and files in dialogs
- ViewImageDialog is simple and displays an image in a maximized dialog
- ViewFileDialog is more complex, handling different file types, download functionality, and previews
- These are generic UI components not tied to specific features

**Recommendation:**
- Move both to `/src/shared/components/media/` directory
- They should be in the shared directory since viewing files and images is common functionality

## 5. DragableSeparator.vue

**Current Location:**
- `/src/shared/components/DragableSeparator.vue`

**Analysis:**
- The component name has a typo ("Dragable" instead of "Draggable")
- It's a UI utility component for resizing panels
- Already located in the shared components directory which is appropriate

**Recommendation:**
- Rename to `/src/shared/components/DraggableSeparator.vue` to fix the typo
- Update all imports to reference the new name

## Implementation Plan

When consolidating these components:

1. Create or ensure the target directories exist:
   - `/src/shared/components/avatar/`
   - `/src/shared/components/file/`
   - `/src/shared/components/layout/`
   - `/src/shared/components/media/`

2. Move components to their new locations

3. Update all imports throughout the codebase

4. Remove duplicate components once all references have been updated

5. Verify the application still works correctly after these changes