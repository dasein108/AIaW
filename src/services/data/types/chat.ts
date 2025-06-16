import { Avatar, defaultTextAvatar } from "@/shared/utils"
import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { OverrideProps, DtoToEntity } from "@/shared/utils/dto/types"

import { Database } from "../supabase/database.types"

import { DbProfile, Profile, mapDbToProfile } from "./profile"

type DbChatMessage = Database["public"]["Tables"]["messages"]["Row"]
type DbChatMessageInsert = Database["public"]["Tables"]["messages"]["Insert"]

type DbChat = Database["public"]["Tables"]["chats"]["Row"]
type DbChatInsert = Database["public"]["Tables"]["chats"]["Insert"]

type ChatMessageDbType = DbChatMessage | DbChatMessageInsert
type ChatDbType = DbChat | DbChatInsert

// type DbChatMember = Database["public"]["Tables"]["chat_members"]["Row"]

type ChatType = Database["public"]["Enums"]["chat_type"]

type ChatMap = {
  avatar: Avatar
  type: ChatType
}

type Chat<T extends ChatDbType = DbChat> = OverrideProps<DtoToEntity<T>, ChatMap>

type ChatWithAvatar = OverrideProps<DtoToEntity<DbChat>, ChatMap>

type DbChatMemberWithProfile = {
  user_id: string
  profile: DbProfile
}

type ChatMember = OverrideProps<DtoToEntity<DbChatMemberWithProfile>, {
  profile: Profile
}>
type ChatMessage<T extends ChatMessageDbType = DbChatMessage> = DtoToEntity<T> & {
  sender: Profile | null
}

type ChatMessageWithProfile<T extends ChatMessageDbType = DbChatMessage> = ChatMessage<T> & {
  sender: Profile | null
}

const mapDbToChat = (chat: ChatDbType) => {
  const entity = dtoToEntity(chat)

  return {
    ...entity,
    avatar: entity.avatar ? (entity.avatar as Avatar) : defaultTextAvatar(entity.name),
    type: entity.type as ChatType
  } as Chat
}

const mapDbToChatMessage = <T extends ChatMessageDbType>(message: T): ChatMessage<T> => {
  return dtoToEntity(message) as ChatMessage<T>
}

const mapDbToChatMember = (member: DbChatMemberWithProfile): ChatMember => {
  return {
    ...dtoToEntity(member),
    profile: mapDbToProfile(member.profile),
  }
}

const mapChatMessageToDb = <T extends ChatMessageDbType = DbChatMessage>(message: ChatMessage<T>) => {
  const { sender, ...rest } = message

  return { ...entityToDto(rest), sender }
}

// type MessageContentResult = {
//   type: StoredItemMapped["type"]
//   content_text?: StoredItemMapped["content_text"]
//   file_url?: StoredItemMapped["file_url"]
//   mime_type?: StoredItemMapped["mime_type"]
// }

export { mapDbToChat, mapDbToChatMessage, mapDbToChatMember, mapChatMessageToDb }
export type {
  Chat, ChatMessage, ChatMessageWithProfile, ChatMember, ChatType,
  DbChatInsert, DbChatMessageInsert, ChatWithAvatar
}
