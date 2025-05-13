import { Avatar, PluginManifest } from '@/utils/types'
import { Database, Json } from './database.types'

type Message = Database['public']['Tables']['messages']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Chat = Database['public']['Tables']['chats']['Row']
type ChatMember = Database['public']['Tables']['chat_members']['Row']
type UserPlugin = Database['public']['Tables']['user_plugins']['Insert']
type Workspace = Database['public']['Tables']['workspaces']['Row']

type WorkspaceMetadata = {
  avatar?: Avatar;
  vars?: Record<string, string>;
  indexContent?: string;
}

type WorkspaceMapped = Omit<Workspace, 'metadata'> & { metadata: WorkspaceMetadata };
type UserPlugineMapped = Omit<UserPlugin, 'manifest'> & { manifest: PluginManifest };

type MessageWithProfile = Message & {
  sender: Profile | null
}

export type { MessageWithProfile, Chat, Profile, ChatMember, Workspace as WorkspaceDb, WorkspaceMapped, WorkspaceMetadata, UserPlugin }
