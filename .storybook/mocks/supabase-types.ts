// Mock Supabase types for Storybook

export interface Profile {
  id: string
  name: string
  created_at: string | null
  description: string | null
}

export interface Chat {
  id: string
  name: string | null
  created_at: string | null
  is_group: boolean
  is_public: boolean | null
  owner_id: string | null
}

export interface ChatMember {
  chat_id: string
  user_id: string
  joined_at: string | null
}

export interface MessageWithProfile {
  id: string
  content: string
  created_at: string | null
  chat_id: string | null
  sender_id: string | null
  sender: Profile | null
}
