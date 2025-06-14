# Refactoring Plan for AIaW

This document outlines a step-by-step refactoring plan to improve code semantics, naming conventions, and LLM-friendliness throughout the codebase.

**IMPORTANT**: After completing each task, stop and wait for the explicit user message "ACCEPT" before proceeding to the next task.

## 1. Standardize File Naming Conventions

### Task 1.1: Composable File Naming
- Convert all composable files to use camelCase
- Ensure all composable files use the `use` prefix
- Example: Rename `avatar-image.ts` to `useAvatarImage.ts`

### Task 1.2: Utility File Naming
- Make utility file names more descriptive about their specific purpose
- Example: Rename `dialog.ts` to `dialogMessageUtils.ts`
- Example: Rename `templates.ts` to `dialogTemplateDefinitions.ts`

## 2. Function Semantics Improvements

### Task 2.1: Rename Generic Functions
- Improve function names to be more descriptive of their purpose
- Examples:
  - `stream()` → `streamLlmResponse()`
  - `onEnter()` → `handleInputEnterKeyPress()`
  - `getModel()` → `retrieveModelConfiguration()`

### Task 2.2: Fix Typos in Function Names
- Correct all typos in function names across the codebase
- Examples:
  - `onMounseDown` → `onMouseDown`
  - Other typos identified during refactoring

## 3. Component Consolidation

### Task 3.1: Identify Duplicate Components
- Identify components with the same name in different feature modules
- Create a list of all duplicate components with their locations

### Task 3.2: Consolidate Duplicate Components
- For each duplicate component, determine the best location
- Move the component to a shared location or refactor to be more specific
- Update all imports to point to the new location

## 4. Code Organization

### Task 4.1: Break Down Complex Functions
- Identify functions over 30 lines that have multiple responsibilities
- Split into smaller single-purpose functions with clear names
- Examples from `useLlmDialog.ts` and other complex areas

### Task 4.2: Standardize Parameter Patterns
- Convert simple parameter lists to object parameters for complex functions
- Add type definitions for parameter objects
- Update function calls to use the new parameter pattern

## 5. Documentation Improvements

### Task 5.1: Add JSDoc to Key Functions
- Add JSDoc comments to all exported functions
- Include parameter and return type descriptions
- Document non-obvious behaviors

### Task 5.2: Create Module Documentation
- Add README.md files to key feature directories
- Document the purpose and responsibilities of each module
- Document relationships between modules

## 6. Store Organization

### Task 6.1: Standardize Store Naming
- Ensure consistent naming patterns for store files
- Remove duplicated store files with different naming patterns

### Task 6.2: Document Store Relationships
- Add clear documentation about store dependencies
- Create diagrams or comments showing store relationships

## 7. Import Pattern Standardization

### Task 7.1: Standardize Import Paths
- Choose between absolute imports with aliases or relative imports
- Update all imports to follow the chosen pattern
- Update path aliases if needed

## Verification and Testing

After completing all refactoring tasks:

1. Run linting: `npm run lint`
2. Run type checking: `vue-tsc --noEmit`
3. Run tests: `npm test`
4. Manually verify key features in development mode: `npm run dev`

## Future Considerations

- Consider creating a code style guide document
- Set up automated checks for naming conventions
- Add more comprehensive test coverage for refactored components