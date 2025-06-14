# Assistants Module

## Overview

The Assistants module manages AI assistants within the AIaW application. It handles the creation, configuration, and customization of assistants with different capabilities, personalities, and specialized knowledge areas.

## Responsibilities

- Managing assistant profiles and configurations
- Storing and retrieving assistant data
- Handling assistant prompt templates and variables
- Supporting custom model settings for each assistant
- Providing UI components for assistant management
- Enabling assistant importing and exporting
- Managing the assistant marketplace

## Directory Structure

```
assistants/
├── components/        # UI components for assistant management
├── composables/       # Functional composition utilities
├── consts.ts          # Constants and default values
├── store/             # Pinia store for assistant state management
├── utils/             # Utility functions for assistant operations
└── views/             # Page-level components for assistant pages
```

## Key Files

- `consts.ts`: Default settings and configurations for assistants
- `store/index.ts`: State management for assistants
- `utils/assistantUtils.ts`: Helper functions for assistant operations
- `components/AssistantItem.vue`: UI representation of an assistant
- `views/AssistantView.vue`: Detailed view of an assistant
- `views/AssistantsMarket.vue`: Interface for the assistant marketplace

## Assistant Structure

Each assistant includes:

- Name and avatar for identification
- Prompt template defining its behavior and knowledge
- Prompt variables for customization
- Model configuration (which model to use)
- Model settings (temperature, max tokens, etc.)
- Metadata (author, description, homepage)
- Associated workspace

## Dependencies

The Assistants module integrates with several other modules:

- **Dialogs**: Assistants are used in dialog conversations
- **Plugins**: Assistants can use plugins for extended capabilities
- **Providers**: For model selection and configuration
- **Workspaces**: Assistants belong to workspaces
- **Prompt**: For template and variable management

## Usage Examples

### Creating an Assistant

```typescript
import { useAssistantsStore } from '@/features/assistants/store';

const assistantsStore = useAssistantsStore();
const newAssistant = await assistantsStore.add({
  name: 'Research Assistant',
  prompt: 'You are a helpful research assistant...',
  prompt_template: '{{system}}\n\n{{history}}',
  prompt_vars: [],
  workspace_id: currentWorkspaceId,
  model: 'gpt-4',
  model_settings: { temperature: 0.7, max_tokens: 2000 }
});
```

### Using an Assistant in a Dialog

```typescript
import { useDialogModel } from '@/features/dialogs/composables';

const { setAssistant } = useDialogModel(dialogId);
await setAssistant(assistantId);
```

### Importing an Assistant from the Marketplace

```typescript
import { useAssistantActions } from '@/features/workspaces/composables';

const { add } = useAssistantActions();
add(marketplaceAssistant, workspaceId);
```

## Marketplace

The assistant marketplace provides pre-configured assistants for various tasks:

- Code assistants for different programming languages
- Writing assistants for different content types
- Research assistants for various fields
- Creative assistants for ideation and brainstorming
- Specialized assistants for domain-specific tasks

## Flow Diagram

```
Assistant Creation/Import → Assistant Configuration → 
Model Selection → Prompt Template Customization →
Workspace Association → Dialog Usage
```