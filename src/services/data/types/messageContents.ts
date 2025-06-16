import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity, OverrideProps, TContentNested } from "@/shared/utils/dto/types"

import { Database } from "@/services/data/supabase/database.types"

import { mapDbToStoredItem, StoredItemResult, DbStoredItem, TStoredItem, StoredItemDbType, DbStoredItemUpdate } from "./storedItem"

type DbMessageContent = Database["public"]["Tables"]["message_contents"]["Row"]
type DbMessageContentInsert = Database["public"]["Tables"]["message_contents"]["Insert"]
type DbMessageContentUpdate = Database["public"]["Tables"]["message_contents"]["Update"]
type MessageContentResult = StoredItemResult
type MessageContentDbType = DbMessageContent | DbMessageContentInsert | DbMessageContentUpdate

type MessageContent<T extends MessageContentDbType> = DtoToEntity<T>

type TDbMessageContentNested<T extends MessageContentDbType = DbMessageContent,
N extends StoredItemDbType = DbStoredItem> =
  TContentNested<T, N, "stored_items">

type TMessageContent<T extends MessageContentDbType = DbMessageContent> = OverrideProps<DtoToEntity<T>, {
  result: MessageContentResult[] | null
  args: Record<string, any> | any[] | null
}>

type TMessageContentNested<T extends MessageContentDbType = DbMessageContent,
N extends StoredItemDbType = DbStoredItem> =
  TContentNested<TMessageContent<T>,
  TStoredItem<N>,
  "storedItems">

type MessageContentNested = TMessageContentNested<DbMessageContent>
type MessageContentNestedUpdate = TMessageContentNested<DbMessageContentUpdate, DbStoredItemUpdate>

const mapDbToMessageContent = <T extends MessageContentDbType>(item: T) => {
  return dtoToEntity(item) as unknown as TMessageContent<DbMessageContent>
}

const mapDbToMessageContentNested = <T extends MessageContentDbType>(item: TDbMessageContentNested<T>) => {
  const { stored_items, ...messageContent } = item

  const result = dtoToEntity({
    ...mapDbToMessageContent(messageContent),
    storedItems: stored_items.map(mapDbToStoredItem)
  }) as TMessageContentNested<DbMessageContent>

  return result
}

const mapMessageContentToDb = <T extends MessageContentDbType>(messageContent: TMessageContent<T>) => {
  return entityToDto(messageContent) as T
}

export { mapDbToMessageContent, mapMessageContentToDb, mapDbToMessageContentNested }
export type {
  MessageContent, MessageContentNested, MessageContentNestedUpdate,
  DbMessageContent, DbMessageContentInsert, DbMessageContentUpdate, MessageContentDbType, TMessageContentNested, TMessageContent
}
