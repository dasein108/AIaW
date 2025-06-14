# Plugins Module

## Overview

The Plugins module provides extensibility to the AIaW application by allowing integration with external tools and services. It enables AI assistants to perform actions beyond text generation, such as searching the web, managing artifacts, and interacting with blockchain wallets.

## Responsibilities

- Managing plugin installation and configuration
- Validating plugin manifests and schemas
- Executing plugin functions during AI conversations
- Providing UI components for plugin management
- Supporting different plugin formats (Gradio, HuggingFace, Lobe, MCP)
- Offering built-in plugins for common functionality

## Directory Structure

```
plugins/
├── buildin/           # Built-in plugins that come with the application
├── components/        # UI components for plugin management
├── composables/       # Functional composition utilities
├── store/             # Pinia stores for plugin state management
├── utils/             # Utility functions for plugin operations
└── views/             # Page-level components for plugin pages
```

## Key Files

- `buildin/*.ts`: Built-in plugin implementations
- `composables/useInstallPlugin.ts`: Functionality for installing plugins
- `store/userPlugins.ts`: Manages user-installed plugins
- `utils/plugins.ts`: Core utilities for plugin management
- `utils/mcpClient.ts`: Client for Multi-modal Content Processing plugins

## Built-in Plugins

The module includes several built-in plugins:

1. **artifactsPlugin**: Enables creating and managing code artifacts
2. **cosmosAuthz**: Provides authorization for Cosmos blockchain operations
3. **keplerPlugin**: Integrates with Kepler wallet for blockchain transactions
4. **webSearchPlugin**: Enables web search capabilities

## Dependencies

The Plugins module integrates with several other modules:

- **Auth**: For wallet authentication and user credentials
- **Artifacts**: For the artifacts plugin functionality
- **Assistants**: For associating plugins with specific assistants
- **Platform**: For platform-specific functionality
- **Prompt**: For variable input in plugin configurations

## Plugin Types

The module supports several plugin formats:

- **Gradio**: Plugins based on Gradio API
- **HuggingFace**: Plugins from the HuggingFace ecosystem
- **Lobe**: Plugins using the Lobe Chat format
- **MCP**: Multi-modal Content Processing plugins

## Usage Examples

### Installing a Plugin

```typescript
import { useInstallPlugin } from '@/features/plugins/composables';

const { install } = useInstallPlugin();
await install('https://example.com/plugin-manifest.json');
```

### Using a Plugin in a Dialog

```typescript
import { useAssistantTools } from '@/features/dialogs/composables';

const { callToolFunction } = useAssistantTools(dialogId);
const result = await callToolFunction(plugin, toolName, parameters);
```

### Enabling Plugins for an Assistant

```typescript
import { usePluginsStore } from '@/features/plugins/store';

const pluginsStore = usePluginsStore();
await pluginsStore.enablePluginForAssistant(pluginId, assistantId);
```

## Flow Diagram

```
Plugin Installation → Plugin Validation → Plugin Storage →
Assistant Integration → Tool Invocation → Result Processing
```