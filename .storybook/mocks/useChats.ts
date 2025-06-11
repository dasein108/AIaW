import { ref, readonly } from 'vue'
import type { Chat } from './supabase-types'

// Mock chats data
const mockChats: Chat[] = [
  {
    id: 'chat-1',
    name: 'John Doe',
    created_at: '2024-01-15T10:30:00Z',
    is_group: false,
    is_public: false,
    owner_id: 'user-1'
  },
  {
    id: 'chat-2',
    name: 'Development Team',
    created_at: '2024-01-14T14:20:00Z',
    is_group: true,
    is_public: true,
    owner_id: 'user-1'
  },
  {
    id: 'chat-3',
    name: 'Jane Smith',
    created_at: '2024-01-13T09:15:00Z',
    is_group: false,
    is_public: false,
    owner_id: 'user-2'
  },
  {
    id: 'chat-4',
    name: 'Project Discussion',
    created_at: '2024-01-12T16:45:00Z',
    is_group: true,
    is_public: true,
    owner_id: 'user-1'
  },
  {
    id: 'chat-5',
    name: 'Alice Johnson',
    created_at: '2024-01-11T11:30:00Z',
    is_group: false,
    is_public: false,
    owner_id: 'user-3'
  }
]

const chats = ref<Chat[]>(mockChats)

// Mock useChats composable for Storybook
export function useChats() {
  return {
    chats: readonly(chats)
  }
}

// Helper function to set mock chats for specific stories
export function setMockChats(newChats: Chat[]) {
  chats.value = newChats
}
