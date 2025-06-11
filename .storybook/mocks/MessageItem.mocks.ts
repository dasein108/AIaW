import { fn } from '@storybook/test'
import type { DialogMessageMapped, Assistant, StoredItemMapped } from '../../src/services/supabase/types'
import type { Avatar } from '../../src/utils/types'

// Create alias for backward compatibility
type Message = DialogMessageMapped

// Mock sessions
export const mockSessions = {
  ping: async (sessionId: string) => true
}

// Mock db
export const mockDb = {
  messages: {
    update: fn()
  }
}

// Default model settings
export const defaultModelSettings = {
  temperature: 0.6,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  maxSteps: 4,
  maxRetries: 1
}

// Mock assistants
export const mockAssistants: Assistant[] = [
  {
    id: 'assistant-1',
    name: 'Claude Assistant',
    avatar: {
      type: 'text',
      text: 'C',
      hue: 200
    } as Avatar,
    workspaceId: 'workspace-1',
    prompt: 'You are a helpful AI assistant.',
    promptTemplate: 'You are a helpful AI assistant.',
    promptVars: [],
    provider: null,
    model: null,
    modelSettings: { ...defaultModelSettings },
    plugins: {},
    promptRole: 'system',
    stream: true
  },
  {
    id: 'assistant-2',
    name: 'GPT Assistant',
    avatar: {
      type: 'icon',
      icon: 'smart_toy',
      hue: 120
    } as Avatar,
    workspaceId: 'workspace-1',
    prompt: 'You are GPT, a large language model.',
    promptTemplate: 'You are GPT, a large language model.',
    promptVars: [],
    provider: null,
    model: null,
    modelSettings: { ...defaultModelSettings },
    plugins: {},
    promptRole: 'system',
    stream: true
  }
]

// Mock items
export const mockItems: StoredItemMapped[] = [
  {
    id: 'item-1',
    dialogId: 'dialog-1',
    type: 'file',
    name: 'example.txt',
    mimeType: 'text/plain',
    contentText: 'This is a sample text file content.',
    contentBuffer: null,
    references: 1
  },
  {
    id: 'item-2',
    dialogId: 'dialog-1',
    type: 'quote',
    name: 'Important Quote',
    contentText: 'This is an important quote from the conversation.',
    contentBuffer: null,
    references: 1
  }
]

// Mock messages
export const userMessage: Message = {
  id: 'msg-1',
  type: 'user',
  dialogId: 'dialog-1',
  workspaceId: 'workspace-1',
  message_contents: [
    {
      type: 'user-message',
      text: 'Hello! Can you help me understand how Vue 3 composition API works?',
      stored_items: mockItems.filter(item => item.id === 'item-1')
    }
  ],
  status: 'default',
  modelName: 'gpt-4'
}

export const assistantMessage: Message = {
  id: 'msg-2',
  type: 'assistant',
  assistantId: 'assistant-1',
  dialogId: 'dialog-1',
  workspaceId: 'workspace-1',
  message_contents: [
    {
      type: 'assistant-message',
      text: `# Vue 3 Composition API

The Vue 3 Composition API is a powerful way to organize and reuse logic in Vue components. Here's a comprehensive overview:

## Key Concepts

### 1. Setup Function
The \`setup()\` function is the entry point for using the Composition API:

\`\`\`javascript
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)

    onMounted(() => {
      console.log('Component mounted!')
    })

    return {
      count,
      doubleCount
    }
  }
}
\`\`\`

### 2. Reactivity
- **ref()**: Creates reactive references for primitive values
- **reactive()**: Creates reactive objects
- **computed()**: Creates computed properties

### 3. Lifecycle Hooks
- \`onMounted()\`
- \`onUpdated()\`
- \`onUnmounted()\`
- And many more...

## Benefits
1. **Better TypeScript support**
2. **Improved code organization**
3. **Enhanced reusability**
4. **Tree-shaking friendly**

Would you like me to explain any specific part in more detail?`,
      reasoning: 'The user is asking about Vue 3 Composition API, so I should provide a comprehensive overview covering the key concepts, syntax, and benefits. I\'ll include code examples to make it practical and easy to understand.'
    }
  ],
  status: 'default',
  modelName: 'claude-3-5-sonnet'
}

export const streamingMessage: Message = {
  id: 'msg-4',
  type: 'assistant',
  assistantId: 'assistant-1',
  dialogId: 'dialog-1',
  workspaceId: 'workspace-1',
  message_contents: [
    {
      type: 'assistant-message',
      text: 'I\'m currently thinking about your question and will provide a detailed response...'
    }
  ],
  status: 'streaming',
  generatingSession: 'session-123',
  modelName: 'claude-3-5-sonnet'
}

export const errorMessage: Message = {
  id: 'msg-5',
  type: 'assistant',
  assistantId: 'assistant-1',
  dialogId: 'dialog-1',
  workspaceId: 'workspace-1',
  message_contents: [
    {
      type: 'assistant-message',
      text: 'I was trying to help you with that request, but encountered an issue.'
    }
  ],
  status: 'failed',
  error: 'API rate limit exceeded. Please try again in a few minutes.',
  warnings: ['This model has limited context window', 'Response may be truncated'],
  modelName: 'gpt-4'
}

export const userMessageWithFiles: Message = {
  id: 'msg-6',
  type: 'user',
  dialogId: 'dialog-1',
  workspaceId: 'workspace-1',
  message_contents: [
    {
      type: 'user-message',
      text: 'Here are some files I\'d like you to review:',
      stored_items: mockItems.filter(item => ['item-1', 'item-2'].includes(item.id))
    }
  ],
  status: 'default',
  modelName: 'gpt-4'
}

export const assistantMessageWithCode: Message = {
  id: 'msg-code-snippet',
  type: 'assistant',
  assistantId: 'assistant-2',
  dialogId: 'dialog-1',
  workspaceId: 'workspace-1',
  message_contents: [
    {
      type: 'assistant-message',
      text: `I'll help you create a simple React component with hooks. Here's an example:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [isEven, setIsEven] = useState(true);

  useEffect(() => {
    setIsEven(count % 2 === 0);
  }, [count]);

  const increment = () => {
    setCount(prevCount => prevCount + 1);
  };

  const decrement = () => {
    setCount(prevCount => prevCount - 1);
  };

  const reset = () => {
    setCount(0);
  };

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <p>The number is {isEven ? 'even' : 'odd'}</p>

      <div className="buttons">
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

export default Counter;
\`\`\`

This component demonstrates:
- **useState** for managing state
- **useEffect** for side effects
- **Event handlers** for user interactions
- **Conditional rendering** based on state

You can also add some CSS to make it look better:

\`\`\`css
.counter {
  text-align: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 300px;
  margin: 0 auto;
}

.buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

.buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.buttons button:hover {
  background-color: #0056b3;
}
\`\`\`

This creates a fully functional counter component with styling!`
    }
  ],
  status: 'default',
  modelName: 'gpt-4'
}

// Mock user preferences
export const mockUserPerfs = {
  darkMode: false,
  themeHue: 300,
  provider: null,
  model: {
    name: 'gpt-4',
    inputTypes: {
      user: ['text/*', 'image/*'],
      assistant: ['text/*'],
      tool: ['text/*']
    }
  },
  systemProvider: null,
  systemModel: {
    name: 'gpt-4o-mini',
    inputTypes: {
      user: ['text/*'],
      assistant: ['text/*'],
      tool: ['text/*']
    }
  },
  userAvatar: {
    type: 'text',
    text: 'U',
    hue: 300
  },
  commonModelOptions: ['gpt-4', 'gpt-4o-mini', 'claude-3-5-sonnet'],
  autoGenTitle: true,
  sendKey: 'ctrl+enter',
  messageSelectionBtn: true,
  codePasteOptimize: true,
  dialogScrollBtn: 'always',
  enableShortcutKey: 'desktop-only',
  scrollUpKeyV2: { key: 'ArrowUp', withCtrl: true },
  scrollDownKeyV2: { key: 'ArrowDown', withCtrl: true },
  scrollTopKey: { key: 'Home' },
  scrollBottomKey: { key: 'End' },
  switchPrevKeyV2: { key: 'ArrowLeft', withCtrl: true },
  switchNextKeyV2: { key: 'ArrowRight', withCtrl: true },
  switchFirstKey: { key: 'Home', withShift: true },
  switchLastKey: { key: 'End', withShift: true },
  regenerateCurrKey: null,
  editCurrKey: null,
  createDialogKey: null,
  createSocialKey: null,
  focusDialogInputKey: null,
  saveArtifactKey: { key: 'KeyS', withCtrl: true },
  searchDialogKey: null,
  searchChatsKey: null,
  autoFocusDialogInput: 'desktop-only',
  artifactsEnabled: 'desktop-only',
  artifactsAutoExtract: false,
  artifactsAutoName: false,
  artifactsReserveOriginal: false,
  mdPreviewTheme: 'vuepress',
  mdCodeTheme: 'atom',
  mdNoMermaid: false,
  mdAutoFoldThreshold: null,
  streamingLockBottom: true,
  messageCatalog: true,
  showWarnings: true
}

// Set up global mocks
export const setupGlobalMocks = () => {
  ;(globalThis as any).db = mockDb
  ;(globalThis as any).sessions = mockSessions
}
