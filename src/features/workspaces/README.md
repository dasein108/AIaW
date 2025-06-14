# Workspaces Module

## Overview

The Workspaces module provides organizational structure to the AIaW application, enabling users to group related conversations, assistants, and artifacts. It serves as a fundamental unit for content organization and collaboration.

## Responsibilities

- Managing workspace creation, modification, and deletion
- Handling workspace membership and permissions
- Providing navigation between workspaces
- Supporting workspace-specific settings
- Managing relationships between workspaces and other entities (chats, dialogs, assistants)
- Offering UI components for workspace interaction

## Directory Structure

```
workspaces/
├── components/        # UI components for workspace management
├── composables/       # Functional composition utilities
├── store/             # Pinia store for workspace state management
├── utils/             # Utility functions for workspace operations
└── views/             # Page-level components for workspace pages
```

## Key Files

- `composables/useActiveWorkspace.ts`: Manages the currently active workspace
- `composables/useWorkspacesWithSubscription.ts`: Real-time workspace data subscription
- `composables/useAssistantActions.ts`: Actions for managing assistants within workspaces
- `store/index.ts`: Workspace state management
- `components/WorkspaceSelector.vue`: UI for selecting and switching workspaces
- `views/WorkspaceSettings.vue`: Workspace configuration interface

## Dependencies

The Workspaces module is foundational and integrates with many other modules:

- **Assistants**: Assistants are associated with workspaces
- **Chats**: Chats exist within workspaces
- **Dialogs**: Dialogs are organized by workspace
- **Artifacts**: Artifacts are stored within workspaces
- **Auth**: For workspace access permissions
- **Profile**: For user information in workspace membership

## Workspace Structure

Each workspace contains:

- Assistants configured for specific tasks
- Chats between workspace members
- Dialogs with AI assistants
- Artifacts created within the workspace
- Members with various permission levels

## Usage Examples

### Creating a Workspace

```typescript
import { useWorkspacesStore } from '@/features/workspaces/store';

const workspacesStore = useWorkspacesStore();
const newWorkspace = await workspacesStore.add({
  name: 'Project Alpha',
  description: 'Research and development for Project Alpha'
});
```

### Switching Workspaces

```typescript
import { useActiveWorkspace } from '@/features/workspaces/composables';

const { setActiveWorkspace } = useActiveWorkspace();
await setActiveWorkspace(workspaceId);
```

### Adding an Assistant to a Workspace

```typescript
import { useAssistantActions } from '@/features/workspaces/composables';

const { add } = useAssistantActions();
add(assistantData, workspaceId);
```

## Flow Diagram

```
Workspace Creation → Workspace Configuration → 
Member Management → Resource Association (Assistants, Chats, Artifacts) →
Workspace Interaction
```