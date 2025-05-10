import { Database } from './database.types'

type Message = Database['public']['Tables']['messages']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Chat = Database['public']['Tables']['chats']['Row']

type MessageWithProfile = Message & {
  sender: Profile | null
}

export type { MessageWithProfile, Chat, Profile }
