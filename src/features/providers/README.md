# Providers Module

## Overview

The Providers module manages connections to various AI model providers (like OpenAI, Anthropic, etc.) and handles model configurations. It abstracts the differences between providers and offers a unified interface for model selection and usage throughout the AIaW application.

## Responsibilities

- Managing connections to AI model providers
- Handling provider API keys and authentication
- Providing model selection interfaces
- Supporting custom provider configurations
- Managing model settings (temperature, max tokens, etc.)
- Offering platform-specific provider availability
- Enabling provider and model overrides

## Directory Structure

```
providers/
├── components/        # UI components for provider and model management
├── composables/       # Functional composition utilities
├── store/             # Pinia store for provider state management
├── utils/             # Utility functions and middleware
└── views/             # Page-level components for provider configuration
```

## Key Files

- `composables/getModel.ts`: Core functionality for retrieving model configurations
- `store/index.ts`: State management for providers and models
- `utils/middlewares.ts`: Middleware functions for provider API requests
- `components/ModelOptionsBtn.vue`: UI for model option configuration
- `components/CustomProviders.vue`: Interface for custom provider setup
- `views/CustomProvider.vue`: Detailed view for custom provider configuration

## Supported Providers

The module supports multiple AI providers:

- OpenAI (GPT models)
- Anthropic (Claude models)
- Google (Gemini models)
- Local models (via Ollama)
- Custom providers through API configuration

## Dependencies

The Providers module is a foundational service that integrates with:

- **Dialogs**: For model selection in conversations
- **Assistants**: For assistant-specific model configurations
- **Platform**: For platform-specific provider availability
- **Settings**: For global provider configuration

## Provider Configuration

Each provider configuration includes:

- API endpoint URLs
- Authentication credentials
- Available models
- Default and custom settings
- Platform compatibility

## Usage Examples

### Getting a Model Configuration

```typescript
import { useGetModel } from '@/features/providers/composables';

const { getModel } = useGetModel();
const modelConfig = await getModel('gpt-4');
```

### Setting Custom Provider

```typescript
import { useProvidersStore } from '@/features/providers/store';

const providersStore = useProvidersStore();
await providersStore.addCustomProvider({
  name: 'Custom OpenAI',
  baseUrl: 'https://custom-openai-endpoint.com/v1',
  apiKey: 'sk-...',
  models: ['gpt-4', 'gpt-3.5-turbo']
});
```

### Overriding Model Settings

```typescript
import { useProvidersStore } from '@/features/providers/store';

const providersStore = useProvidersStore();
providersStore.setModelOverride('gpt-4', {
  temperature: 0.8,
  max_tokens: 4000
});
```

## Model Settings

The module manages various model settings:

- Temperature (creativity level)
- Max tokens (response length)
- Top P (diversity of responses)
- Frequency penalty (repetition reduction)
- Presence penalty (topic coverage)
- System prompt (default instructions)

## Flow Diagram

```
Provider Configuration → Model Selection → 
Settings Customization → Middleware Processing →
API Connection → Model Response Handling
```