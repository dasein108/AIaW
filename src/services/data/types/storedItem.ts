import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity, OverrideProps } from "@/shared/utils/dto/types"

import { Database } from "@/services/data/supabase/database.types"

type DbStoredItem = Database["public"]["Tables"]["stored_items"]["Row"]
type DbStoredItemInsert = Database["public"]["Tables"]["stored_items"]["Insert"]
type DbStoredItemUpdate = Database["public"]["Tables"]["stored_items"]["Update"]

type StoredItemDbType = DbStoredItem | DbStoredItemInsert | DbStoredItemUpdate

type StoredItemContentType = "text" | "file" | "quote"

type StoredItemMap = {
  type: StoredItemContentType
}

type StoredItem<T extends StoredItemDbType = DbStoredItem> = OverrideProps<DtoToEntity<T>, StoredItemMap>

type StoredItemResult = {
  type?: StoredItemContentType
  contentText?: string
  fileUrl?: string
  mimeType?: string
}

const mapDbToStoredItem = (dbStoredItem: DbStoredItem): StoredItem => {
  return dtoToEntity(dbStoredItem) as StoredItem
}

const mapStoredItemToDb = <T extends StoredItemDbType>(storedItem: StoredItem<T>): T => {
  return entityToDto(storedItem) as T
}

export { mapDbToStoredItem, mapStoredItemToDb }

export type {
  StoredItem, StoredItemResult,
  StoredItemDbType, DbStoredItem, DbStoredItemInsert, DbStoredItemUpdate
}
