# Artifacts Module

## Overview

The Artifacts module manages code snippets, documents, and other textual artifacts generated during AI conversations. It provides versioning, editing capabilities, and organization for reusable content created in the AIaW application.

## Responsibilities

- Creating and storing artifacts from dialog content
- Managing artifact versioning and history
- Providing editing capabilities for artifacts
- Supporting conversion between different artifact types
- Handling artifact metadata and organization
- Offering UI components for artifact interaction

## Directory Structure

```
artifacts/
├── components/        # UI components for artifact management
├── composables/       # Functional composition utilities
├── store/             # Pinia store for artifact state management
├── utils/             # Utility functions for artifact operations
└── views/             # Page-level components for artifact pages
```

## Key Files

- `composables/createArtifact.ts`: Functionality for creating new artifacts
- `composables/closeArtifact.ts`: Handling artifact closure and saving
- `utils/docParse.ts`: Utilities for parsing document content
- `components/ArtifactItemMenu.vue`: Menu options for artifacts
- `components/ConvertArtifactDialog.vue`: UI for artifact conversion
- `views/EditArtifact.vue`: Interface for editing artifacts

## Artifact Structure

Each artifact includes:

- Content (code, text, documentation)
- Version history with timestamps
- Metadata (name, description, type)
- Associated workspace and dialog
- MIME type and language information
- Creation and modification timestamps

## Dependencies

The Artifacts module integrates with several other modules:

- **Dialogs**: Artifacts are created from dialog content
- **Plugins**: The artifactsPlugin enables artifact creation
- **Workspaces**: Artifacts are organized by workspace
- **Media**: For handling different content types

## Versioning System

Artifacts maintain a complete version history:

- Each edit creates a new version
- Users can navigate between versions
- Current version index tracks the active version
- Temporary content buffer for unsaved changes

## Usage Examples

### Creating an Artifact

```typescript
import { useCreateArtifact } from '@/features/artifacts/composables';

const { createFromText } = useCreateArtifact();
const newArtifact = await createFromText({
  name: 'Example Code',
  text: 'function example() { return "Hello World"; }',
  dialogId,
  workspaceId
});
```

### Saving Artifact Changes

```typescript
import { useArtifactsStore } from '@/features/artifacts/store';
import { saveArtifactChanges } from '@/shared/utils/functions';

const artifactsStore = useArtifactsStore();
await artifactsStore.update(artifactId, saveArtifactChanges(artifact));
```

### Converting an Artifact

```typescript
import { useArtifactsStore } from '@/features/artifacts/store';

const artifactsStore = useArtifactsStore();
await artifactsStore.update(artifactId, {
  type: 'javascript',
  mime_type: 'application/javascript'
});
```

## Flow Diagram

```
Dialog Interaction → Artifact Creation → 
Content Editing → Version Management → 
Artifact Organization → Reuse in Dialogs
```