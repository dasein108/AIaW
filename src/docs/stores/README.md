# AIaW Store Documentation

This directory contains detailed documentation about the store system in the AIaW application.

## Overview

AIaW uses Pinia for state management with a feature-based modular architecture. The store system follows these principles:

1. **Modularity**: Stores are organized by feature to maintain separation of concerns
2. **Persistence**: Many stores automatically persist data to Supabase
3. **Reactivity**: All stores use Vue's reactivity system for state management
4. **Real-time**: Stores use Supabase subscriptions for real-time updates where needed

## Documentation Structure

- [Core Stores](./CORE_STORES.md) - Documentation for shared, foundational stores
- [Feature Stores](./FEATURE_STORES.md) - Documentation for feature-specific stores
- [Store Patterns](./STORE_PATTERNS.md) - Common patterns and best practices

Additional documentation:
- [Store Relationships](../../STORE_RELATIONSHIPS.md) - Overview of store dependencies and relationships
- [Store Diagrams](../STORE_DIAGRAM.md) - Visual representations of store relationships

## Store Organization

Stores are organized into the following categories:

### Shared Stores
Located in `/src/shared/store/`:
- `userStore.ts` - User authentication state
- `uiStateStore.ts` - UI state (theme, layout, etc.)
- `userDataStore.ts` - User-specific application data
- `userPrefsStore.ts` - User preferences

### Feature Stores
Located in `/src/features/*/store/`:
- `assistants/store/index.ts` - AI assistant configurations
- `artifacts/store/index.ts` - Code and document artifacts
- `chats/store/index.ts` - User-to-user chat sessions
- `dialogs/store/dialogs.ts` - AI conversation dialogs
- `dialogs/store/dialogMessages.ts` - Messages within dialogs
- `plugins/store/index.ts` - Plugin management
- `plugins/store/userPlugins.ts` - User-installed plugins
- `profile/store/profile.ts` - User profiles
- `workspaces/store/index.ts` - Workspace organization

### Utility Stores and Factory Functions
Located in `/src/shared/store/utils/`:
- `createKeyValueDbStore.ts` - Factory function for database-backed key-value stores

## Store Usage Guidelines

1. **Import from index.ts**: Always import stores from their module's index.ts file
2. **Minimize dependencies**: Keep store dependencies to a minimum
3. **Document relationships**: Use JSDoc to document store dependencies
4. **Error handling**: Always handle and log database errors
5. **Throttle updates**: Use throttling for frequent database updates
6. **Initialize with useUserLoginCallback**: Use for stores that need initialization after login
7. **Reset state before fetching**: Clear state before fetching new data
8. **Type safety**: Use TypeScript types for all store state and methods

For detailed guidelines and patterns, see [Store Patterns](./STORE_PATTERNS.md).