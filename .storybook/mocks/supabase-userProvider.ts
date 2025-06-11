import { ref } from 'vue'
import type { Profile } from './supabase-types'

// Mock UserProvider for Storybook
export interface UserProvider {
  isLoggedIn: ReturnType<typeof ref<boolean>>
  currentUserId: ReturnType<typeof ref<string | null>>
  currentUser: ReturnType<typeof ref<Profile | null>>
}

export const mockUserProvider: UserProvider = {
  isLoggedIn: ref(true),
  currentUserId: ref('mock-user-id'),
  currentUser: ref({
    id: 'mock-user-id',
    name: 'Mock User',
    created_at: '2024-01-01T00:00:00Z',
    description: 'Mock user for Storybook'
  })
}
