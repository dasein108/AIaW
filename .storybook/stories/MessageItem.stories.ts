import type { Meta, StoryObj } from '@storybook/vue3'
import { nextTick } from 'vue'
import { vueRouter } from 'storybook-vue3-router'
import MessageItem from '@features/dialogs/components/MessageItem.vue'
import {
  userMessage,
  assistantMessage,
  streamingMessage,
  errorMessage,
  userMessageWithFiles,
  assistantMessageWithCode
} from '../mocks/MessageItem.mocks'
import { createMessageItemDecorator, createCompactMessageItemDecorator } from './MessageItem.decorators'

// Define basic routes for the router
const routes = [
  {
    path: '/',
    name: 'home',
    component: { template: '<div>Home</div>' }
  },
  {
    path: '/workspaces/:workspaceId/dialogs/:dialogId',
    name: 'dialog',
    component: { template: '<div>Dialog</div>' }
  }
]

const meta = {
  title: 'Components/MessageItem',
  component: MessageItem,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'The MessageItem component displays individual messages in a conversation. It supports both user and assistant messages, with features like markdown rendering, file attachments, tool calls, and interactive elements like copy, edit, and regenerate buttons.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      description: 'The message object containing content, type, and metadata',
      control: { type: 'object' }
    },
    childNum: {
      description: 'Number of child messages (for pagination)',
      control: { type: 'number' }
    },
    scrollContainer: {
      description: 'The scroll container element for catalog positioning',
      control: false
    }
  },
  decorators: [
    vueRouter(routes),
    createMessageItemDecorator()
  ]
} satisfies Meta<typeof MessageItem>

export default meta
type Story = StoryObj<typeof meta>

export const UserMessage: Story = {
  args: {
    message: userMessage,
    childNum: 1,
    scrollContainer: document.createElement('div')
  },
  parameters: {
    docs: {
      description: {
        story: 'A basic user message with text content and a file attachment.'
      }
    }
  }
}

export const AssistantMessage: Story = {
  args: {
    message: assistantMessage,
    childNum: 1,
    scrollContainer: document.createElement('div')
  },
  parameters: {
    docs: {
      description: {
        story: 'An assistant message with rich markdown content including code blocks, headers, and lists. Also shows reasoning content in a collapsible section.'
      }
    }
  }
}

export const StreamingMessage: Story = {
  args: {
    message: streamingMessage,
    childNum: 1,
    scrollContainer: document.createElement('div')
  },
  parameters: {
    docs: {
      description: {
        story: 'A message that is currently being streamed from the AI, showing the loading state with a progress indicator.'
      }
    }
  }
}

export const ErrorMessage: Story = {
  args: {
    message: errorMessage,
    childNum: 1,
    scrollContainer: document.createElement('div')
  },
  parameters: {
    docs: {
      description: {
        story: 'A message that failed to generate, showing error state with error message and warnings.'
      }
    }
  }
}

export const UserMessageWithFiles: Story = {
  args: {
    message: userMessageWithFiles,
    childNum: 1,
    scrollContainer: document.createElement('div')
  },
  parameters: {
    docs: {
      description: {
        story: 'A user message with multiple file attachments, demonstrating how files are displayed in the message.'
      }
    }
  }
}

export const MessageWithBranches: Story = {
  args: {
    message: assistantMessage,
    childNum: 3,
    scrollContainer: document.createElement('div')
  },
  parameters: {
    docs: {
      description: {
        story: 'A message with multiple branches/alternatives, showing pagination controls for navigating between different response variants.'
      }
    }
  }
}

export const CompactMode: Story = {
  args: {
    message: assistantMessage,
    childNum: 1,
    scrollContainer: document.createElement('div')
  },
  decorators: [
    vueRouter(routes),
    createCompactMessageItemDecorator()
  ],
  parameters: {
    docs: {
      description: {
        story: 'The message component in compact/dense mode, typically used on smaller screens or when artifacts panel is open.'
      }
    }
  }
}

export const InteractiveFeatures: Story = {
  args: {
    message: assistantMessage,
    childNum: 1,
    scrollContainer: document.createElement('div')
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates interactive features like text selection, copy buttons, regenerate, and context menu options. Try selecting text to see the floating action buttons.'
      }
    }
  },
  play: async ({ canvasElement }) => {
    // Add some interactive demonstration
    await nextTick()

    // You could add interactions here to demonstrate features
    console.log('MessageItem story loaded with interactive features')
  }
}

export const AssistantWithCodeSnippet: Story = {
  args: {
    message: assistantMessageWithCode,
    childNum: 1,
    scrollContainer: document.createElement('div')
  },
  parameters: {
    docs: {
      description: {
        story: 'An assistant message featuring multiple code snippets in different languages (JSX and CSS), demonstrating syntax highlighting and code block formatting.'
      }
    }
  }
}
