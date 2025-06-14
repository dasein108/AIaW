# Features Architecture

## Overview

The AIaW application follows a feature-based architecture, where functionality is organized into modular feature directories. Each feature module encapsulates related components, logic, and state management, promoting separation of concerns and maintainability.

## Architecture Principles

- **Feature Isolation**: Each feature module contains all necessary code for its functionality
- **Clear Boundaries**: Features communicate through well-defined interfaces
- **Composition Over Inheritance**: Features are composed using Vue's composition API
- **Shared Utilities**: Common functionality is extracted to the shared module
- **State Encapsulation**: Each feature manages its own state with Pinia stores

## Directory Structure

Each feature module follows a consistent structure:

```
feature-name/
├── components/        # UI components specific to the feature
├── composables/       # Functional composition utilities
├── store/             # Pinia store for feature state management
├── utils/             # Utility functions specific to the feature
├── views/             # Page-level components
└── README.md          # Documentation about the feature
```

Optional directories that some features include:

```
feature-name/
├── consts.ts          # Constants and default values
├── types.ts           # TypeScript type definitions specific to the feature
└── buildin/           # Built-in implementations (e.g., plugins)
```

## Core Features

- **artifacts**: Code snippets and document management
- **assistants**: AI assistant configuration and management
- **auth**: Authentication and authorization
- **chats**: User-to-user chat functionality
- **dialogs**: AI conversation management
- **plugins**: Extensibility framework for AI capabilities
- **providers**: AI model provider configuration
- **workspaces**: Organizational structure for content

## Supporting Features

- **cyber**: Cyberlink-related functionality
- **files**: File handling utilities
- **llm**: LLM-specific utilities
- **media**: Media file processing
- **payments**: Payment processing
- **platform**: Platform-specific functionality
- **profile**: User profile management
- **prompt**: Prompt template and variable handling
- **settings**: Application settings
- **ui**: UI-specific components and utilities

## Feature Relationships

Key dependencies between features:

1. **workspaces**: Core organizational unit containing assistants, dialogs, artifacts
2. **dialogs**: Central feature that integrates assistants, plugins, providers
3. **assistants**: Configures providers and plugins for specific use cases
4. **plugins**: Extends capabilities of assistants and dialogs
5. **providers**: Supplies AI models to assistants and dialogs
6. **artifacts**: Stores content generated in dialogs

## Communication Patterns

Features communicate through:

1. **Store Access**: Features can access each other's stores
2. **Composables**: Features expose functionality through composables
3. **Events**: Vue events for component communication
4. **Props/Emits**: Standard Vue component communication

## Guidelines for Feature Development

1. Keep features focused on a specific domain or capability
2. Minimize cross-feature dependencies when possible
3. Extract shared utilities to the shared module
4. Document feature interfaces and dependencies
5. Follow consistent naming conventions
6. Use TypeScript for type safety
7. Create clear boundaries between features

## State Management

Each feature typically has its own Pinia store that:

1. Manages feature-specific state
2. Handles persistence when needed
3. Provides actions for state modification
4. Offers getters for derived state
5. Maintains synchronization with backend services

## Testing Strategy

1. Unit tests for utility functions and composables
2. Component tests for isolated component behavior
3. Integration tests for feature-level functionality
4. End-to-end tests for critical user flows