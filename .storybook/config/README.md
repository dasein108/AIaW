# Storybook Configuration Modules

This directory contains modular configuration files for Storybook setup, extracted from the original `preview.ts` file for better organization and maintainability.

## Module Structure

### 📁 `config/` Directory

```
.storybook/config/
├── README.md           # This documentation file
├── setup.ts            # Main orchestration module
├── i18n.ts            # Internationalization setup
├── mocks.ts           # Mock database and stores
├── quasar.ts          # Quasar framework configuration
├── theme-setup.ts     # Theme system initialization
└── story-decorator.ts # Story decorator logic
```

## Module Details

### 🎯 `setup.ts` - Main Orchestration
**Purpose**: Central coordination of all Storybook configurations
- Imports and applies all CSS styles
- Sets up Pinia state management
- Configures i18n system
- Initializes Quasar UI framework
- Registers global components
- Sets up mock systems
- Initializes theme system

### 🌐 `i18n.ts` - Internationalization
**Purpose**: Handles translation setup for Storybook stories
- Defines translation messages for story components
- Creates and exports i18n instance factory
- Supports easy addition of new languages

### 🧪 `mocks.ts` - Test Mocks
**Purpose**: Provides mock implementations for testing environment
- **Mock Database**: IndexedDB mock for components that require database access
- **Mock Stores**: Provides mock store data for components dependent on Pinia stores

### 🎨 `quasar.ts` - UI Framework
**Purpose**: Configures Quasar UI framework and global components
- Sets up Quasar plugins (Dialog, Notify, Loading, Dark mode)
- Configures icon sets and theme defaults
- Registers global components (AInput, VarsInput)

### 🎭 `theme-setup.ts` - Theme System
**Purpose**: Manages theme initialization and switching
- **`initializeThemeSystem()`**: Main theme system initialization for Storybook
- **`setupStoryTheme()`**: Individual story theme setup with event handling
- Handles theme change events and cleanup

### 🎬 `story-decorator.ts` - Story Wrapper
**Purpose**: Provides consistent story wrapping and theme handling
- Wraps stories in consistent layout (`q-pa-md` padding)
- Handles theme setup for each story
- Manages component lifecycle and cleanup

## Benefits of Modular Structure

### ✅ **Separation of Concerns**
Each module handles a specific aspect of Storybook configuration:
- UI framework setup separate from mocking
- Theme handling isolated from i18n
- Story decoration decoupled from core setup

### ✅ **Maintainability**
- Easy to locate and modify specific functionality
- Clear dependencies between modules
- Reduced cognitive load when making changes

### ✅ **Reusability**
- Individual modules can be imported and used independently
- Easy to share configuration between different Storybook setups
- Modules can be tested in isolation

### ✅ **Extensibility**
- New configuration modules can be easily added
- Existing modules can be extended without affecting others
- Clear interface contracts between modules

## Usage Example

```typescript
// Before (preview.ts - 190+ lines)
import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";
// ... 50+ imports and 150+ lines of setup code

// After (preview.ts - 19 lines)
import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";
import { setupStorybook } from "./config/setup";
import { createStoryDecorator } from "./config/story-decorator";

setup(setupStorybook);
```

## Adding New Modules

To add a new configuration module:

1. Create a new file in `.storybook/config/`
2. Export setup functions following the pattern:
   ```typescript
   export const setupFeature = (app: App) => {
     // Configuration logic
   };
   ```
3. Import and call in `setup.ts`
4. Update this README with module documentation

## File Size Comparison

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| `preview.ts` | 190 lines | 19 lines | **90% reduction** |
| Total (modules) | 190 lines | 180 lines | **Organized across 6 modules** |

The modular approach maintains the same functionality while dramatically improving code organization and maintainability.
