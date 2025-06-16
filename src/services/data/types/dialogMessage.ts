import { LanguageModelUsage } from "ai"

import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity, OverrideProps, TContentNested } from "@/shared/utils/dto/types"

import { Database } from "../supabase/database.types"

import {
  DbMessageContent,
  DbMessageContentUpdate,
  MessageContentDbType,
  TMessageContentNested
} from "./messageContents"
import { DbStoredItem, DbStoredItemUpdate, StoredItemDbType } from "./storedItem"

type DbDialogMessage = Database["public"]["Tables"]["dialog_messages"]["Row"]
type DbDialogMessageInsert = Database["public"]["Tables"]["dialog_messages"]["Insert"]
type DbDialogMessageUpdate = Database["public"]["Tables"]["dialog_messages"]["Update"]
type DialogMessageDbType = DbDialogMessage | DbDialogMessageInsert | DbDialogMessageUpdate

type DialogMessageStatus =
  | "pending"
  | "streaming"
  | "failed"
  | "default"
  | "inputing"
  | "processed"

type DialogMessageMap = {
  usage?: LanguageModelUsage
  warnings?: any[]
  type?: "user" | "assistant" | "system"
  status?: DialogMessageStatus
}

type DialogMessage<T extends DialogMessageDbType = DbDialogMessage> = OverrideProps<DtoToEntity<T>, DialogMessageMap>

type DialogMessageNested<T extends DialogMessageDbType = DbDialogMessage,
 N extends MessageContentDbType = DbMessageContent,
 S extends StoredItemDbType = DbStoredItem> =
  TContentNested<DialogMessage<T>,
  TMessageContentNested<N, S>,
  "messageContents">

type DialogMessageNestedUpdate = DialogMessageNested<DbDialogMessageUpdate, DbMessageContentUpdate, DbStoredItemUpdate>

const mapDbToDialogMessage = (dbDialogMessage: DbDialogMessage | DbDialogMessageInsert) => {
  return dtoToEntity(dbDialogMessage) as DialogMessage
}

const mapDialogMessageToDb = (dialogMessage: Partial<DialogMessage>) => {
  return entityToDto(dialogMessage) as DbDialogMessage | DbDialogMessageInsert
}

const mapDbToDialogMessageNested = (item: DialogMessageDbType) => {
  const result = dtoToEntity(item) as DialogMessageNested

  console.log("-----mapDbToDialogMessageNested", item, result)

  return result
}

export { mapDbToDialogMessage, mapDialogMessageToDb, mapDbToDialogMessageNested }

export type {
  DialogMessage, DialogMessageNested,
  DbDialogMessageInsert, DbDialogMessage, DbDialogMessageUpdate, DialogMessageNestedUpdate
}
