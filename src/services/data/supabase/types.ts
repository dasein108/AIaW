import { LanguageModelUsage } from "ai"

import {
  ArtifactVersion,
  AssistantPlugins,
  Avatar,
  Model,
  ModelSettings,
  PromptVar,
  Provider,
} from "@/shared/types"

import { Database } from "./database.types"

type ChatMessage = Database["public"]["Tables"]["messages"]["Row"]
type Chat = Database["public"]["Tables"]["chats"]["Row"]
type ChatInsert = Database["public"]["Tables"]["chats"]["Insert"]
type ChatMember = Database["public"]["Tables"]["chat_members"]["Row"]
type UserPlugin = Database["public"]["Tables"]["user_plugins"]["Insert"]
type Workspace = Database["public"]["Tables"]["workspaces"]["Row"]
type Assistant = Database["public"]["Tables"]["user_assistants"]["Row"]

type Dialog = Database["public"]["Tables"]["dialogs"]["Row"]
type DialogInsert = Database["public"]["Tables"]["dialogs"]["Insert"]

type DialogMessage = Database["public"]["Tables"]["dialog_messages"]["Row"]
type DialogMessageInsert = Database["public"]["Tables"]["dialog_messages"]["Insert"]
type MessageContent = Database["public"]["Tables"]["message_contents"]["Row"]
type MessageContentInsert = Database["public"]["Tables"]["message_contents"]["Insert"]
type StoredItem = Database["public"]["Tables"]["stored_items"]["Row"]
type StoredItemInsert = Database["public"]["Tables"]["stored_items"]["Insert"]
type WorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type ArtifactInsert = Database["public"]["Tables"]["artifacts"]["Insert"]
type CustomProvider = Database["public"]["Tables"]["custom_providers"]["Row"]
type Subprovider = Database["public"]["Tables"]["subproviders"]["Row"]
type UserData = Database["public"]["Tables"]["user_data"]["Row"]

type SubproviderMapped = Omit<
  Subprovider,
  "custom_provider_id" | "id" | "model_map"
> & {
  id?: string
  custom_provider_id?: string
  model_map: Record<string, string>
  provider: Provider
}

type CustomProviderMapped = CustomProvider & {
  subproviders: SubproviderMapped[]
  fallback_provider: Provider
  avatar: Avatar
}

type UserDataMapped = UserData & {
  value: Record<string, any>
}

type ChatType = Database["public"]["Enums"]["chat_type"]

type ChatMapped = ChatInsert & {
  avatar?: Avatar
  type?: ChatType
}

type StoredItemMapped = Omit<
  StoredItemInsert,
  "message_content_id" | "dialog_id" | "type"
> & {
  dialog_id?: string
  type: "text" | "file" | "quote"
  message_content_id?: string
}

type MessageContentResult = {
  type: StoredItemMapped["type"]
  content_text?: StoredItemMapped["content_text"]
  file_url?: StoredItemMapped["file_url"]
  mime_type?: StoredItemMapped["mime_type"]
}

type WorkspaceMemberRole = "admin" | "member" | "readonly"
type WorkspaceRole = "owner" | "admin" | "member" | "readonly" | "none"

type ProfileMapped = Omit<
  Profile,
  "avatar"
> & {
  avatar?: Avatar
}

type WorkspaceMapped = Workspace & {
  avatar?: Avatar
  vars?: Record<string, string>
  index_content?: string
}

type ArtifactMapped = ArtifactInsert & {
  versions: ArtifactVersion[]
}

type DialogMapped = Omit<Dialog, "msg_tree" | "msg_route"> & {
  assistant: Assistant | null
  model_override: Model | null
  input_vars: Record<string, string>
  msg_tree: Record<string, string[]>
  msg_route: number[]
  usage: LanguageModelUsage | null
}

type ChatMessageWithProfile = ChatMessage & {
  sender: ProfileMapped | null
}

type AssistantMapped = Omit<
  Assistant,
  | "plugins"
  | "model_settings"
  | "model"
  | "provider"
  | "prompt_vars"
  | "avatar"
  | "prompt_role"
> & {
  avatar: Avatar
  prompt_vars: PromptVar[]
  provider: Provider
  model: Model
  model_settings: ModelSettings
  plugins: AssistantPlugins
  prompt_role: "system" | "user" | "assistant"
}

type MessageContentMapped = Omit<
  MessageContentInsert,
  "message_id" | "stored_items" | "result"
> & {
  stored_items?: StoredItemMapped[]
  message_id?: string
  result?: MessageContentResult[]
}

type DialogMessageStatus =
  | "pending"
  | "streaming"
  | "failed"
  | "default"
  | "inputing"
  | "processed"

type DialogMessageMapped = DialogMessage & {
  message_contents: MessageContentMapped[]
  usage: LanguageModelUsage | null
  status: DialogMessageStatus
}

type WorkspaceMemberMapped = WorkspaceMember & {
  profile: ProfileMapped
}

// TODO: refactor this
type StoredItemInput = Omit<
  StoredItemInsert,
  "message_content_id" | "dialog_id"
>

type MessageContentInput = Omit<
  MessageContentInsert,
  "message_id"
> & { stored_items?: StoredItemInput[] }

type DialogMessageInput = DialogMessageInsert
 & { message_contents: MessageContentInput[] }

export type {
  ChatMessageWithProfile,
  Chat,
  ChatMember,
  WorkspaceMapped,
  ArtifactMapped,
  ArtifactVersion,
  Workspace,
  UserPlugin,
  Assistant,
  AssistantMapped,
  ChatMessage,
  Dialog,
  DialogMessage,
  MessageContent,
  WorkspaceMember,
  StoredItem,
  DialogMessageMapped,
  MessageContentMapped,
  DialogMapped,
  StoredItemMapped,
  CustomProviderMapped,
  SubproviderMapped,
  UserDataMapped,
  WorkspaceMemberRole,
  WorkspaceMemberMapped,
  WorkspaceRole,
  ChatMapped,
  ProfileMapped,
  MessageContentResult,
  // TODO: refactor this
  DialogMessageInput,
  DialogInsert,
  MessageContentInput,
  StoredItemInput,
}
