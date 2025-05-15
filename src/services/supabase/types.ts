import { AssistantPlugins, Avatar, Model, ModelSettings, PluginManifest, PromptVar, Provider } from '@/utils/types'
import { Database, Json } from './database.types'

type Message = Database['public']['Tables']['messages']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Chat = Database['public']['Tables']['chats']['Row']
type ChatMember = Database['public']['Tables']['chat_members']['Row']
type UserPlugin = Database['public']['Tables']['user_plugins']['Insert']
type Workspace = Database['public']['Tables']['workspaces']['Row']
type Assistant = Database['public']['Tables']['user_assistants']['Row']

type WorkspaceMapped = Workspace & {
  avatar?: Avatar;
  vars?: Record<string, string>;
  index_content?: string;
};

type MessageWithProfile = Message & {
  sender: Profile | null
}

type AssistantMapped = Assistant & {
  avatar: Avatar
  prompt_vars: Record<string, PromptVar>
  provider: Provider
  model: Model
  model_settings: ModelSettings
  plugins: AssistantPlugins
  prompt_role: 'system' | 'user' | 'assistant'
};

export type {
  MessageWithProfile, Chat, Profile, ChatMember, WorkspaceMapped,
  Workspace, UserPlugin, Assistant, AssistantMapped
}
