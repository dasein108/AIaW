import { action } from '@storybook/addon-actions'

// Mock data for different tables
const mockAssistants = [
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
    workspace_id: null,
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

// Helper to get mock data for specific tables
const getMockData = (table: string) => {
  switch (table) {
    case 'user_assistants':
      return mockAssistants
    case 'workspaces':
      return []
    case 'dialogs':
      return []
    default:
      return []
  }
}

// Mock Supabase client for Storybook
const mockSupabaseClient = {
  from: (table: string) => {
    const baseQuery = {
      select: (columns?: string) => {
        action(`supabase.from(${table}).select`)(columns)
        return {
          ...baseQuery,
          eq: (column: string, value: any) => ({
            ...baseQuery,
            single: () => Promise.resolve({ data: null, error: null }),
            order: (column: string, options?: any) => Promise.resolve({ data: getMockData(table), error: null })
          }),
          order: (column: string, options?: any) => Promise.resolve({ data: getMockData(table), error: null }),
          anyOf: (values: any[]) => Promise.resolve({ data: getMockData(table), error: null }),
          // Handle direct promise resolution for simple selects
          then: (resolve: Function) => resolve({ data: getMockData(table), error: null })
        }
      },
      insert: (data: any) => {
        action(`supabase.from(${table}).insert`)(data)
        return {
          select: () => ({
            single: () => Promise.resolve({
              data: { id: `mock-${table}-id`, ...data },
              error: null
            })
          })
        }
      },
      update: (data: any) => {
        action(`supabase.from(${table}).update`)(data)
        return {
          eq: (column: string, value: any) => ({
            select: () => ({
              single: () => Promise.resolve({
                data: { id: value, ...data },
                error: null
              })
            })
          })
        }
      },
      delete: () => {
        action(`supabase.from(${table}).delete`)()
        return {
          eq: (column: string, value: any) => ({
            select: () => ({
              single: () => Promise.resolve({
                data: { id: value },
                error: null
              })
            })
          })
        }
      },
      upsert: (data: any) => {
        action(`supabase.from(${table}).upsert`)(data)
        return {
          select: () => ({
            single: () => Promise.resolve({
              data: { id: `mock-${table}-id`, ...data },
              error: null
            })
          })
        }
      }
    }

    return baseQuery
  },

  rpc: (functionName: string, params?: any) => {
    action(`supabase.rpc(${functionName})`)(params)
    return Promise.resolve({ data: 'mock-chat-id', error: null })
  },

  auth: {
    getUser: () => Promise.resolve({
      data: {
        user: {
          id: 'mock-user-id',
          email: 'mock@example.com'
        }
      },
      error: null
    }),
    getSession: () => Promise.resolve({
      data: {
        session: {
          user: {
            id: 'mock-user-id',
            email: 'mock@example.com'
          }
        }
      },
      error: null
    }),
    onAuthStateChange: () => ({ data: { subscription: null } }),
    signInWithPassword: action('supabase.auth.signInWithPassword'),
    signUp: action('supabase.auth.signUp'),
    signOut: action('supabase.auth.signOut')
  },

  channel: (name: string) => ({
    on: (event: string, config: any, callback: Function) => ({
      on: (event: string, config: any, callback: Function) => ({
        on: (event: string, config: any, callback: Function) => ({
          subscribe: (callback?: Function) => {
            if (callback) callback('SUBSCRIBED')
            return {
              unsubscribe: action(`supabase.channel(${name}).unsubscribe`)
            }
          }
        })
      })
    }),
    subscribe: (callback?: Function) => {
      if (callback) callback('SUBSCRIBED')
      return {
        unsubscribe: action(`supabase.channel(${name}).unsubscribe`)
      }
    },
    unsubscribe: action(`supabase.channel(${name}).unsubscribe`)
  }),

  storage: {
    from: (bucket: string) => ({
      upload: action(`supabase.storage.from(${bucket}).upload`),
      download: action(`supabase.storage.from(${bucket}).download`),
      remove: action(`supabase.storage.from(${bucket}).remove`),
      list: () => Promise.resolve({ data: [], error: null })
    })
  }
}

export const supabase = mockSupabaseClient
export default mockSupabaseClient
