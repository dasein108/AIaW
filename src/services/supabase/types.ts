import { AssistantPlugins, Avatar, Model, ModelSettings, PluginManifest, PromptVar, Provider } from '@/utils/types'
import { Database, Json } from './database.types'
import { LanguageModelUsage } from 'ai'

type ChatMessage = Database['public']['Tables']['messages']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Chat = Database['public']['Tables']['chats']['Row']
type ChatMember = Database['public']['Tables']['chat_members']['Row']
type UserPlugin = Database['public']['Tables']['user_plugins']['Insert']
type Workspace = Database['public']['Tables']['workspaces']['Row']
type Assistant = Database['public']['Tables']['user_assistants']['Row']
type Dialog = Database['public']['Tables']['dialogs']['Row']
type DialogMessage = Database['public']['Tables']['dialog_messages']['Row']
type MessageContent = Database['public']['Tables']['message_contents']['Row']
type StoredItem = Database['public']['Tables']['stored_items']['Row']
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']

type StoredItemMapped =Omit<Database['public']['Tables']['stored_items']['Insert'], 'message_content_id' | 'dialog_id'> & {dialog_id?: string}

type WorkspaceMapped = Workspace & {
  avatar?: Avatar;
  vars?: Record<string, string>;
  index_content?: string;
};

type DialogMapped = Dialog & {
  assistant: Assistant | null
  model_override: Model | null
  input_vars: Record<string, string>
  msg_tree: Record<string, string[]>
  msg_route: number[]
  usage: LanguageModelUsage | null
}

type ChatMessageWithProfile = ChatMessage & {
  sender: Profile | null
}

type AssistantMapped = Assistant & {
  avatar: Avatar
  prompt_vars: PromptVar[]
  provider: Provider
  model: Model
  model_settings: ModelSettings
  plugins: AssistantPlugins
  prompt_role: 'system' | 'user' | 'assistant'
};

type MessageContentWithStoredItems = Omit<Database['public']['Tables']['message_contents']['Insert'], 'message_id'> & {
  stored_items?: StoredItemMapped[]
  message_id?: string

}

type DialogMessageStatus = 'pending' | 'streaming' | 'failed' | 'default' | 'inputing' | 'processed'

type DialogMessageWithContent = DialogMessage & {
  message_contents: MessageContentWithStoredItems[]
  usage: LanguageModelUsage | null
  status: DialogMessageStatus
}

export type {
  ChatMessageWithProfile, Chat, Profile, ChatMember, WorkspaceMapped,
  Workspace, UserPlugin, Assistant, AssistantMapped, ChatMessage, Dialog, DialogMessage,
  MessageContent, WorkspaceMember, StoredItem, DialogMessageWithContent, MessageContentWithStoredItems, DialogMapped, StoredItemMapped
}
