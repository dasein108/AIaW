# Dialogs Module

## Overview

The Dialogs module is a central part of the AIaW application, responsible for managing conversations with LLM providers. It handles the creation, storage, retrieval, and rendering of dialog messages, as well as the streaming of responses from AI models.

## Responsibilities

- Creating and managing dialog sessions
- Storing and retrieving dialog messages
- Streaming LLM responses from various providers
- Handling dialog templates and prompting
- Managing message content including text, images, and files
- Integrating with plugins for extended functionality
- Supporting tool calls and function execution

## Directory Structure

```
dialogs/
├── components/          # UI components for dialogs
│   └── AddPlugin/       # Component for adding plugins to dialogs
├── composables/         # Functional composition utilities
│   ├── utils/           # Helper utilities for composables
│   └── ...              # Various composables for dialog functionality
├── store/               # Pinia stores for dialog state management
├── utils/               # Utility functions
└── views/               # Page-level components
```

## Key Files

- `composables/useLlmDialog.ts`: Core functionality for interacting with LLM providers
- `composables/useDialogMessages.ts`: Manages the dialog messages
- `composables/useDialogInput.ts`: Handles user input in dialogs
- `utils/dialogMessageUtils.ts`: Utilities for message processing
- `utils/dialogTemplateDefinitions.ts`: Template definitions for different dialog types
- `store/dialogs.ts`: Manages the dialog sessions
- `store/dialogMessages.ts`: Manages the individual messages

## Dependencies

The Dialogs module integrates with several other modules:

- **Artifacts**: For code snippet extraction and management
- **Assistants**: For model settings and assistant information
- **Media**: For displaying images and files
- **Plugins**: For extending AI capabilities
- **Prompt**: For variable input
- **Providers**: For model selection and configuration
- **Workspaces**: For organizational structure

## Usage Examples

### Creating a Dialog

```typescript
import { useCreateDialog } from '@/features/dialogs/composables';

const { createDialog } = useCreateDialog();
const newDialog = await createDialog({
  name: 'New Conversation',
  workspaceId: currentWorkspaceId
});
```

### Sending a Message

```typescript
import { useLlmDialog } from '@/features/dialogs/composables';

const { sendMessage } = useLlmDialog(dialogId);
await sendMessage('Hello, how can you help me today?');
```

### Streaming a Response

```typescript
import { useLlmDialog } from '@/features/dialogs/composables';

const { streamLlmResponse } = useLlmDialog(dialogId);
await streamLlmResponse({
  messageId,
  model: selectedModel,
  settings: modelSettings
});
```

## Flow Diagram

```
User Input → useDialogInput → useDialogMessages → useLlmDialog → LLM API → 
Response Streaming → Message Update → UI Rendering
```