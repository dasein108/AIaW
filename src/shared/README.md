# Shared Module

## Overview

The Shared module provides common utilities, components, and functionality that are used across multiple features in the AIaW application. It serves as a foundation for shared code to prevent duplication and ensure consistency throughout the application.

## Responsibilities

- Providing reusable UI components
- Offering common utility functions
- Managing global state through stores
- Supplying shared composables for common operations
- Defining common types and interfaces
- Handling application-wide themes and styles

## Directory Structure

```
shared/
├── components/        # Reusable UI components
│   ├── avatar/        # Avatar-related components
│   ├── layout/        # Layout components
│   ├── ui/            # Generic UI components
│   └── ...            # Other component categories
├── composables/       # Reusable functional composition utilities
│   ├── storage/       # Storage-related composables
│   └── ...            # Other composable categories
├── store/             # Global state management
├── types.ts           # Common type definitions
├── utils/             # Utility functions
│   ├── template/      # Template-related utilities
│   └── ...            # Other utility categories
└── views/             # Shared page-level components
```

## Key Components

- **UI Components**: Buttons, inputs, dialogs, and other reusable UI elements
- **Layout Components**: Structural components for consistent page layouts
- **Avatar Components**: User and assistant avatar handling

## Key Composables

- **useStorage**: File storage operations
- **useCallApi**: API call handling with validation
- **useListenKey**: Keyboard shortcut management
- **setTheme**: Theme management

## Key Utilities

- **functions.ts**: General utility functions for common operations
- **platformApi.ts**: Platform-specific API wrappers
- **localData.ts**: Local data management
- **templateEngine.ts**: Template processing

## Global Stores

- **userStore**: User information and preferences
- **userDataStore**: User data management
- **uiStateStore**: UI state tracking

## Common Types

The module defines shared TypeScript interfaces and types:

- Dialog and message structures
- User and authentication types
- Plugin and API types
- Platform configuration types

## Usage Examples

### Using a Shared Component

```vue
<template>
  <AAvatar :avatar="userAvatar" size="md" />
</template>

<script setup lang="ts">
import { AAvatar } from '@/shared/components/avatar';
</script>
```

### Using a Shared Composable

```typescript
import { useStorage } from '@/shared/composables/storage';
import { FILES_BUCKET } from '@/shared/composables/storage/utils';

const storage = useStorage(FILES_BUCKET);
const filePath = await storage.uploadFile(file);
```

### Using Utility Functions

```typescript
import { genId, escapeHtml, wrapCode } from '@/shared/utils/functions';

const id = genId();
const sanitizedText = escapeHtml(userInput);
const formattedCode = wrapCode(code, 'javascript');
```

## Dependencies

The Shared module is intentionally designed to have minimal dependencies on feature-specific modules, maintaining a unidirectional dependency flow:

```
Feature Modules → Shared Module → External Libraries
```

This ensures that the shared code remains reusable and doesn't create circular dependencies.