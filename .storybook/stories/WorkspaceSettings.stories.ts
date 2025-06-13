import type { Meta, StoryObj } from '@storybook/vue3'
import { ref, provide } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { QLayout } from 'quasar'
import { vueRouter } from 'storybook-vue3-router'
import WorkspaceSettings from '../../src/views/WorkspaceSettings.vue'
import { useWorkspacesStore } from '../../src/features/workspaces/store'
import { useAssistantsStore } from '../../src/features/assistants/store'
import { useUiStateStore } from '../../src/shared/store/uiState'
import { useUserStore } from '../../src/shared/store/user'
import { useUserDataStore } from '../../src/shared/store/userData'
import type { WorkspaceMapped, AssistantMapped } from '../../src/services/supabase/types'

// Mock the useUserLoginCallback to prevent automatic store initialization
globalThis.useUserLoginCallback = (callback: Function) => {
  // Don't automatically call the callback in Storybook
  console.log('useUserLoginCallback mocked, not calling:', callback)
}

// Routes for the router
const routes = [
  {
    path: '/',
    name: 'home',
    component: { template: '<div>Home</div>' }
  },
  {
    path: '/workspace/:workspaceId/settings',
    name: 'workspace-settings',
    component: { template: '<div>Workspace Settings</div>' }
  },
  {
    path: '/assistants/:assistantId',
    name: 'assistant',
    component: { template: '<div>Assistant</div>' }
  }
]

// Mock data
const mockWorkspace: WorkspaceMapped = {
  id: 'workspace-1',
  name: 'My Workspace',
  avatar: {
    type: 'icon',
    icon: 'sym_o_work',
    hue: 200,
    title: 'Work Icon'
  },
  type: 'workspace',
  parent_id: 'root',
  vars: {
    API_KEY: 'sk-1234567890',
    PROJECT_NAME: 'My Project',
    ENVIRONMENT: 'development'
  },
  index_content: 'Welcome to my workspace! This is the home content that appears when you first enter the workspace.',
  created_at: '2024-01-01T00:00:00Z',
  owner_id: 'user-1',
  description: null,
  is_public: false
}

const mockAssistants: AssistantMapped[] = [
  {
    id: 'assistant-1',
    name: 'Code Assistant',
    avatar: {
      type: 'icon',
      icon: 'sym_o_code',
      hue: 120,
      title: 'Code Icon'
    },
    prompt: 'You are a helpful coding assistant.',
    prompt_vars: [],
    prompt_template: 'You are a helpful coding assistant.',
    provider: {
      type: 'openai',
      settings: {}
    },
    model_settings: {
      temperature: 0.7,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
      maxSteps: 10,
      maxRetries: 3,
      maxTokens: 4000
    },
    workspace_id: 'workspace-1',
    plugins: {},
    prompt_role: 'system',
    context_num: 10,
    stream: true,
    description: 'A helpful assistant for coding tasks',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 'user-1',
    model: null,
    author: null,
    homepage: null
  },
  {
    id: 'assistant-2',
    name: 'Writing Assistant',
    avatar: {
      type: 'icon',
      icon: 'sym_o_edit',
      hue: 280,
      title: 'Edit Icon'
    },
    prompt: 'You are a helpful writing assistant.',
    prompt_vars: [],
    prompt_template: 'You are a helpful writing assistant.',
    provider: {
      type: 'openai',
      settings: {}
    },
    model_settings: {
      temperature: 0.8,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
      maxSteps: 10,
      maxRetries: 3,
      maxTokens: 4000
    },
    workspace_id: 'workspace-1',
    plugins: {},
    prompt_role: 'system',
    context_num: 10,
    stream: true,
    description: 'A helpful assistant for writing tasks',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 'user-1',
    model: null,
    author: null,
    homepage: null
  },
  {
    id: 'assistant-global',
    name: 'Global Assistant',
    avatar: {
      type: 'icon',
      icon: 'sym_o_public',
      hue: 60,
      title: 'Global Icon'
    },
    prompt: 'You are a global assistant.',
    prompt_vars: [],
    prompt_template: 'You are a global assistant.',
    provider: {
      type: 'openai',
      settings: {}
    },
    model_settings: {
      temperature: 0.7,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
      maxSteps: 10,
      maxRetries: 3,
      maxTokens: 4000
    },
    workspace_id: null, // Global assistants have null workspace_id
    plugins: {},
    prompt_role: 'system',
    context_num: 10,
    stream: true,
    description: 'A global assistant available in all workspaces',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 'user-1',
    model: null,
    author: null,
    homepage: null
  }
]

// Helper function to set up mocked stores for all stories
const setupMockedStores = () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const workspacesStore = useWorkspacesStore()
  const assistantsStore = useAssistantsStore()
  const userStore = useUserStore()
  const userDataStore = useUserDataStore()

  // Initialize stores with mock data directly
  assistantsStore.assistants = mockAssistants
  assistantsStore.isLoaded = true

  // Mock store methods to prevent any unwanted side effects
  workspacesStore.putItem = async (workspace: WorkspaceMapped) => {
    console.log('Workspace updated:', workspace)
    return 'mocked-id'
  }

  workspacesStore.isUserWorkspaceAdmin = async (workspaceId: string, userId: string) => {
    return 'admin'
  }

  workspacesStore.getWorkspaceMembers = async (workspaceId: string) => {
    return [
      {
        user_id: 'member-1',
        workspace_id: workspaceId,
        role: 'member',
        joined_at: '2024-01-01T00:00:00Z',
        profile: {
          id: 'member-1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: { type: 'text', text: 'JD' },
          created_at: '2024-01-01T00:00:00Z',
          description: null
        }
      },
      {
        user_id: 'member-2',
        workspace_id: workspaceId,
        role: 'admin',
        joined_at: '2024-01-01T00:00:00Z',
        profile: {
          id: 'member-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: { type: 'text', text: 'JS' },
          created_at: '2024-01-01T00:00:00Z',
          description: null
        }
      }
    ] as any[]
  }

  workspacesStore.addWorkspaceMember = async (workspaceId: string, userId: string, role: any) => {
    console.log('Adding workspace member:', { workspaceId, userId, role })
    return {
      user_id: userId,
      workspace_id: workspaceId,
      role,
      joined_at: new Date().toISOString(),
      profile: {
        id: userId,
        name: 'New Member',
        email: 'new@example.com',
        avatar: { type: 'text', text: 'NM' },
        created_at: new Date().toISOString(),
        description: null
      }
    } as any
  }

  workspacesStore.removeWorkspaceMember = async (workspaceId: string, userId: string) => {
    console.log('Removing workspace member:', { workspaceId, userId })
    return true
  }

  workspacesStore.updateWorkspaceMember = async (workspaceId: string, userId: string, role: any) => {
    console.log('Updating workspace member:', { workspaceId, userId, role })
    return true
  }

  // Mock assistants store methods
  assistantsStore.init = async () => {
    console.log('Mocked assistants init')
    // Data is already set above
  }

  assistantsStore.add = async (props: any = {}) => {
    console.log('Mocked assistant add:', props)
    const newAssistant = { id: 'mock-id-' + Date.now(), ...props }
    assistantsStore.assistants.push(newAssistant)
    return newAssistant
  }

  assistantsStore.update = async (id: string, changes: any) => {
    console.log('Mocked assistant update:', { id, changes })
    const index = assistantsStore.assistants.findIndex(a => a.id === id)
    if (index !== -1) {
      assistantsStore.assistants[index] = { ...assistantsStore.assistants[index], ...changes }
    }
    return { id, ...changes }
  }

  assistantsStore.put = async (assistant: any) => {
    console.log('Mocked assistant put:', assistant)
    if (assistant.id) {
      return assistantsStore.update(assistant.id, assistant)
    } else {
      return assistantsStore.add(assistant)
    }
  }

  assistantsStore.delete = async (id: string) => {
    console.log('Mocked assistant delete:', id)
    assistantsStore.assistants = assistantsStore.assistants.filter(a => a.id !== id)
    return null
  }

  // Mock user store
  userStore.init = async () => {
    console.log('Mocked user init')
    userStore.isInitialized = true
  }

  userStore.currentUser = {
    id: 'mock-user-id',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z'
  } as any
  userStore.isInitialized = true

  // Mock user data store
  userDataStore.data = {
    lastWorkspaceId: 'workspace-1',
    noobAlertDismissed: false,
    lastDialogIds: {},
    defaultAssistantIds: {
      'workspace-1': 'assistant-1'
    },
    openedArtifacts: [],
    listOpen: {},
    tipDismissed: {},
    prodExpiredNotifiedTimestamp: 0,
    evalExpiredNotified: false
  }

  return { workspacesStore, assistantsStore, userStore, userDataStore }
}

const meta = {
  title: 'Views/WorkspaceSettings',
  component: WorkspaceSettings,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The WorkspaceSettings view allows users to configure workspace-specific settings including default assistant, workspace icon, home content, and workspace variables.'
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    vueRouter(routes, { initialRoute: '/workspace/workspace-1/settings' }),
    (story, context) => ({
      components: { story, QLayout },
      setup() {
        // Set up mocked stores
        const stores = setupMockedStores()

        // Provide workspace as injection
        const workspaceRef = ref(mockWorkspace)
        provide('workspace', workspaceRef)
        provide('rightDrawerAbove', false)

        return {}
      },
      template: `
        <q-layout view="lHh Lpr lFf">
          <story />
        </q-layout>
      `
    })
  ]
} satisfies Meta<typeof WorkspaceSettings>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default State',
  parameters: {
    docs: {
      description: {
        story: 'The default state of the workspace settings with a workspace that has all fields populated.'
      }
    }
  }
}

export const EmptyWorkspace: Story = {
  name: 'Empty Workspace',
  decorators: [
    vueRouter(routes, { initialRoute: '/workspace/workspace-1/settings' }),
    (story) => ({
      components: { story, QLayout },
      setup() {
        const stores = setupMockedStores()

        const emptyWorkspace: WorkspaceMapped = {
          ...mockWorkspace,
          vars: {},
          index_content: '',
        }

        const workspaceRef = ref(emptyWorkspace)
        provide('workspace', workspaceRef)
        provide('rightDrawerAbove', false)

        return {}
      },
      template: `
        <q-layout view="lHh Lpr lFf">
          <story />
        </q-layout>
      `
    })
  ],
  parameters: {
    docs: {
      description: {
        story: 'Workspace settings with empty or minimal configuration.'
      }
    }
  }
}

export const WithManyVariables: Story = {
  name: 'Many Variables',
  decorators: [
    vueRouter(routes, { initialRoute: '/workspace/workspace-1/settings' }),
    (story) => ({
      components: { story, QLayout },
      setup() {
        const stores = setupMockedStores()

        const workspaceWithManyVars: WorkspaceMapped = {
          ...mockWorkspace,
          vars: {
            API_KEY: 'sk-1234567890abcdef',
            PROJECT_NAME: 'Advanced AI Project',
            ENVIRONMENT: 'production',
            DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
            REDIS_URL: 'redis://localhost:6379',
            SECRET_KEY: 'super-secret-key-12345',
            DEBUG_MODE: 'false',
            LOG_LEVEL: 'info',
            MAX_WORKERS: '4',
            TIMEOUT: '30'
          }
        }

        const workspaceRef = ref(workspaceWithManyVars)
        provide('workspace', workspaceRef)
        provide('rightDrawerAbove', false)

        return {}
      },
      template: `
        <q-layout view="lHh Lpr lFf">
          <story />
        </q-layout>
      `
    })
  ],
  parameters: {
    docs: {
      description: {
        story: 'Workspace settings with many variables to test the variables input component.'
      }
    }
  }
}

export const NoAssistants: Story = {
  name: 'No Assistants Available',
  decorators: [
    vueRouter(routes, { initialRoute: '/workspace/workspace-1/settings' }),
    (story) => ({
      components: { story, QLayout },
      setup() {
        const stores = setupMockedStores()

        // Override to have no assistants
        stores.assistantsStore.assistants = []

        const workspaceRef = ref(mockWorkspace)
        provide('workspace', workspaceRef)
        provide('rightDrawerAbove', false)

        return {}
      },
      template: `
        <q-layout view="lHh Lpr lFf">
          <story />
        </q-layout>
      `
    })
  ],
  parameters: {
    docs: {
      description: {
        story: 'Workspace settings when no assistants are available for selection.'
      }
    }
  }
}

export const LongContent: Story = {
  name: 'Long Home Content',
  decorators: [
    vueRouter(routes, { initialRoute: '/workspace/workspace-1/settings' }),
    (story) => ({
      components: { story, QLayout },
      setup() {
        const stores = setupMockedStores()

        const workspaceWithLongContent: WorkspaceMapped = {
          ...mockWorkspace,
          index_content: `# Welcome to My Advanced AI Workspace

This is a comprehensive workspace designed for advanced AI development and research. Here you'll find everything you need to build, test, and deploy cutting-edge AI applications.

## Features

- **Multiple AI Assistants**: Choose from various specialized assistants for different tasks
- **Custom Variables**: Set up workspace-specific variables for your projects
- **Rich Content Support**: Full markdown support for documentation and notes
- **Collaborative Environment**: Share and collaborate with team members

## Getting Started

1. Configure your default assistant
2. Set up your workspace variables
3. Customize your workspace icon
4. Start building amazing AI applications!

## Resources

- [Documentation](https://docs.example.com)
- [API Reference](https://api.example.com)
- [Community Forum](https://forum.example.com)
- [Support](https://support.example.com)

Happy coding! 🚀`
        }

        const workspaceRef = ref(workspaceWithLongContent)
        provide('workspace', workspaceRef)
        provide('rightDrawerAbove', false)

        return {}
      },
      template: `
        <q-layout view="lHh Lpr lFf">
          <story />
        </q-layout>
      `
    })
  ],
  parameters: {
    docs: {
      description: {
        story: 'Workspace settings with long home content to test the autogrow text input.'
      }
    }
  }
}
