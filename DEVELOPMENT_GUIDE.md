# AIaW Development Guide

This guide outlines the architecture, patterns, and conventions used in the AIaW (AI as Workspace) project. It serves as a reference for developers to understand the codebase and maintain consistency when contributing.

## Table of Contents

- [Project Overview](#project-overview)
- [Technical Stack](#technical-stack)
- [Architecture](#architecture)
- [Feature-Based Structure](#feature-based-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [State Management](#state-management)
- [Component Development](#component-development)
- [Cross-Platform Development](#cross-platform-development)
- [Testing](#testing)
- [Internationalization](#internationalization)
- [Documentation](#documentation)

## Project Overview

AIaW is a next-generation, multi-user AI workspace platform designed for real-time collaboration, team chat, and extensibility. It integrates with various AI providers and offers a plugin system to extend functionality.

### Key Features

- Multi-user collaboration with real-time chat
- Supabase backend for authentication, roles, and data storage
- Support for multiple AI providers
- Plugin system for extensibility
- Cross-platform support (Web, Desktop, Mobile)
- Web3 layer for decentralized features

## Technical Stack

- **Frontend Framework**: Vue 3 with Composition API
- **UI Framework**: Quasar Framework (Material Design)
- **Build System**: Vite (via Quasar CLI)
- **State Management**: Pinia
- **Database/Backend**: Supabase
- **Desktop**: Tauri
- **Mobile**: Capacitor
- **Typing**: TypeScript
- **Internationalization**: Vue-i18n
- **Testing**: Jest
- **Documentation**: VitePress
- **Component Showcase**: Storybook

## Architecture

AIaW follows a **feature-based modular architecture** with a clear separation of concerns. Each feature is self-contained with its own components, logic, and state management.

### Directory Structure

```
src/
├── app/               # App-specific setup
├── assets/            # Static assets
├── boot/              # Initialization scripts
├── css/               # Global styles
├── features/          # Feature modules (main code organization)
├── i18n/              # Internationalization resources
├── layouts/           # Layout components
├── pages/             # Page components (routing entry points)
├── router/            # Routing configuration
├── services/          # Service layers for external integrations
├── shared/            # Shared components and utilities
├── utils/             # Global utility functions
```

## Feature-Based Structure

The `features/` directory is the core of the application, where most business logic and UI components reside. Each feature follows a consistent structure:

```
features/
├── feature-name/
│   ├── components/    # UI components specific to the feature
│   ├── composables/   # Vue composables (hooks) for feature logic
│   ├── store/         # Pinia store for feature state
│   ├── utils/         # Utility functions
│   ├── views/         # Routable view components
│   └── types.ts       # TypeScript types and interfaces (optional)
```

### Current Features

- **artifacts**: Manages AI-generated artifacts
- **assistants**: Assistant configuration and management
- **auth**: Authentication and authorization
- **chats**: Real-time chat functionality
- **cyber**: Web3/blockchain integrations
- **dialogs**: AI conversation dialogs
- **files**: File management
- **llm**: Language model integrations
- **media**: Media handling (images, audio)
- **plugins**: Plugin system
- **profile**: User profile management
- **providers**: AI provider configuration
- **settings**: Application settings
- **workspaces**: Workspace management

## Development Workflow

### Setup and Installation

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Set up Supabase (local or cloud)
4. Start the development server with `npm run dev` or `quasar dev`

### Commands

- **Development**: `npm run dev` or `quasar dev`
- **Build**: `npm run build` or `quasar build`
- **Lint**: `npm run lint` or `npm run eslint:fix`
- **Type Check**: `vue-tsc --noEmit`
- **Test**: `npm test` or `jest [testFilePath]`
- **Storybook**: `npm run storybook`
- **Documentation**: `npm run docs:dev`

## Coding Standards

### General Guidelines

- **TypeScript**: Use TypeScript for all new code
- **Vue 3 Composition API**: Use `<script setup lang="ts">` for Vue components
- **ESLint**: Follow the ESLint configuration
- **Naming Conventions**:
  - PascalCase for components, interfaces, and types
  - camelCase for variables, functions, and methods
  - kebab-case for file names (except Vue components)

### File Organization

- One component per file
- Import order: builtin, external, internal, parent, sibling, index (alphabetized)
- Group related functionality in appropriate feature directories

### Component Structure

```vue
<script setup lang="ts">
// Imports from Vue/Quasar
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

// Imports from other packages
import { someUtility } from 'external-package'

// Imports from internal modules
import { useFeatureStore } from '../store'
import { someHelper } from '../utils/helpers'

// Types
interface Props {
  propName: string
}

// Props, emits definition
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update', value: string): void
}>()

// Composables
const featureStore = useFeatureStore()
const $q = useQuasar()

// Reactive state
const localState = ref('')

// Computed properties
const derivedValue = computed(() => {
  return someHelper(localState.value, props.propName)
})

// Methods
function handleEvent() {
  emit('update', derivedValue.value)
}
</script>

<template>
  <q-card class="my-component">
    <q-card-section>
      {{ derivedValue }}
    </q-card-section>
    <q-card-actions>
      <q-btn @click="handleEvent">Update</q-btn>
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.my-component {
  // Component-specific styles
}
</style>
```

## State Management

AIaW uses Pinia for state management with the following patterns:

### Store Structure

```typescript
// features/feature-name/store/index.ts
import { defineStore } from 'pinia'

export const useFeatureStore = defineStore('feature', {
  state: () => ({
    // State properties
    items: [],
    isLoading: false
  }),
  
  getters: {
    // Computed values derived from state
    filteredItems: (state) => state.items.filter(/* condition */)
  },
  
  actions: {
    // Methods to change state
    async fetchItems() {
      this.isLoading = true
      try {
        // API calls or other logic
        this.items = await someApiCall()
      } catch (error) {
        console.error(error)
      } finally {
        this.isLoading = false
      }
    }
  },
  
  // Optional: persistence configuration
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'feature-storage',
        storage: localStorage
      }
    ]
  }
})
```

### Store Usage in Components

```typescript
import { useFeatureStore } from '../store'

// In component setup
const featureStore = useFeatureStore()

// Access state
const items = computed(() => featureStore.filteredItems)

// Call actions
function loadData() {
  featureStore.fetchItems()
}
```

## Component Development

### UI Components

- Use Quasar components (`q-*`) whenever possible
- Follow Material Design patterns for consistency
- Use Quasar's responsive classes for layout

### Composables

Extract reusable logic into composables following the naming convention `use[Feature]`:

```typescript
// features/feature-name/composables/useFeatureAction.ts
import { ref, computed } from 'vue'

export function useFeatureAction(initialValue: string) {
  const state = ref(initialValue)
  
  const derivedValue = computed(() => {
    return state.value.toUpperCase()
  })
  
  function updateState(newValue: string) {
    state.value = newValue
  }
  
  return {
    state,
    derivedValue,
    updateState
  }
}
```

## Cross-Platform Development

AIaW supports multiple platforms:

### Web (PWA)

- Use responsive design principles
- Use Quasar's responsive utilities (`$q.screen`)
- Test on different screen sizes

### Desktop (Tauri)

- Import Tauri API from `@tauri-apps/api`
- Use conditional imports for platform-specific code
- Use feature detection for platform capabilities

### Mobile (Capacitor)

- Use Capacitor plugins for native functionality
- Test on both Android and iOS
- Be mindful of touch interactions and screen sizes

## Testing

AIaW uses Jest for testing:

### Component Tests

```typescript
import { mount } from '@vue/test-utils'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        propName: 'test'
      }
    })
    
    expect(wrapper.text()).toContain('test')
  })
  
  it('emits update event when button is clicked', async () => {
    const wrapper = mount(MyComponent)
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('update')).toBeTruthy()
  })
})
```

### Unit Tests

```typescript
import { someUtility } from '../utils'

describe('someUtility', () => {
  it('returns expected result', () => {
    expect(someUtility('input')).toBe('expected result')
  })
})
```

## Internationalization

AIaW supports multiple languages using Vue-i18n:

### Translation Files

Organize translations by feature:

```typescript
// i18n/en-US/feature-name.ts
export default {
  title: 'Feature Title',
  actions: {
    save: 'Save',
    cancel: 'Cancel'
  },
  messages: {
    success: 'Operation completed successfully',
    error: 'An error occurred'
  }
}
```

### Usage in Components

```vue
<template>
  <div>
    <h1>{{ $t('feature-name.title') }}</h1>
    <q-btn>{{ $t('feature-name.actions.save') }}</q-btn>
  </div>
</template>
```

## Documentation

### Code Documentation

- Use JSDoc comments for public APIs and complex functions
- Document props, emits, and return values

```typescript
/**
 * Performs a specific action with the given input
 * @param {string} input - The input string to process
 * @returns {string} The processed result
 */
function processInput(input: string): string {
  // Implementation
}
```

### Component Documentation

- Use Storybook for component documentation
- Include examples and variants

```typescript
// MyComponent.stories.ts
import MyComponent from './MyComponent.vue'

export default {
  title: 'Components/MyComponent',
  component: MyComponent,
  argTypes: {
    propName: { control: 'text' }
  }
}

export const Default = {
  args: {
    propName: 'Default value'
  }
}

export const Variant = {
  args: {
    propName: 'Variant value'
  }
}
```

## Best Practices

1. **Performance**
   - Use `v-memo` for expensive renders
   - Memoize expensive computations
   - Lazy load components and routes

2. **Security**
   - Never expose API keys in client-side code
   - Validate all user inputs
   - Use HTTPS for all external requests

3. **Accessibility**
   - Use semantic HTML elements
   - Ensure proper keyboard navigation
   - Provide ARIA attributes when needed

4. **Error Handling**
   - Use try/catch blocks for async operations
   - Provide user-friendly error messages
   - Log errors for debugging

5. **Code Organization**
   - Keep components focused and small
   - Extract complex logic to composables
   - Use TypeScript interfaces for complex data structures

## Conclusion

By following this development guide, we can maintain a consistent, high-quality codebase that is easy to understand and extend. The feature-based architecture allows for scalability while keeping related code together, making it easier to reason about and maintain.

For any questions or clarifications, refer to the team leads or open a discussion in the project repository.