import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity, OverrideProps, TContentNested } from "@/shared/utils/dto/types"

import { Database } from "@/services/data/supabase/database.types"

import { mapDbToStoredItem, StoredItemResult, DbStoredItem, StoredItem, StoredItemDbType, DbStoredItemUpdate } from "./storedItem"

type DbMessageContentRow = Database["public"]["Tables"]["message_contents"]["Row"]
type DbMessageContentInsert = Database["public"]["Tables"]["message_contents"]["Insert"]
type DbMessageContentUpdate = Database["public"]["Tables"]["message_contents"]["Update"]

type MessageContentDbType = DbMessageContentRow | DbMessageContentInsert | DbMessageContentUpdate

type MessageContentResult = StoredItemResult

// type MessageContent<T extends MessageContentDbType> = DtoToEntity<T>

type TDbMessageContentNested<T extends MessageContentDbType = DbMessageContentRow,
N extends StoredItemDbType = DbStoredItem> =
  TContentNested<T, N, "stored_items">

type MessageContent<T extends MessageContentDbType = DbMessageContentRow> = OverrideProps<DtoToEntity<T>, {
  result: MessageContentResult[] | null
  args: Record<string, any> | any[] | null
}>

type MessageContentNested<T extends MessageContentDbType = DbMessageContentRow,
N extends StoredItemDbType = DbStoredItem> =
  TContentNested<MessageContent<T>,
  StoredItem<N>,
  "storedItems">

type MessageContentNestedUpdate = MessageContentNested<DbMessageContentUpdate, DbStoredItemUpdate>

const mapDbToMessageContent = <T extends MessageContentDbType>(item: T) => {
  return dtoToEntity(item) as unknown as MessageContent<DbMessageContentRow>
}

const mapDbToMessageContentNested = <T extends MessageContentDbType>(item: TDbMessageContentNested<T>) => {
  const { stored_items, ...messageContent } = item

  const result = dtoToEntity({
    ...mapDbToMessageContent(messageContent),
    storedItems: stored_items.map(mapDbToStoredItem)
  }) as MessageContentNested<DbMessageContentRow>

  return result
}

const mapMessageContentToDb = <T extends MessageContentDbType>(messageContent: MessageContent<T>) => {
  return entityToDto(messageContent) as T
}

export { mapDbToMessageContent, mapMessageContentToDb, mapDbToMessageContentNested }
export type {
  MessageContentNested, MessageContentNestedUpdate,
  DbMessageContentRow, DbMessageContentInsert, DbMessageContentUpdate, MessageContentDbType, MessageContent
}
