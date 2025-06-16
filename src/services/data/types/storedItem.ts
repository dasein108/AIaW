import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity, OverrideProps } from "@/shared/utils/dto/types"

import { Database } from "@/services/data/supabase/database.types"

type DbStoredItem = Database["public"]["Tables"]["stored_items"]["Row"]
type DbStoredItemInsert = Database["public"]["Tables"]["stored_items"]["Insert"]
type DbStoredItemUpdate = Database["public"]["Tables"]["stored_items"]["Update"]
type StoredItemType = "text" | "file" | "quote"

type StoredItemMap = {
  type: StoredItemType
}

type StoredItemDbType = DbStoredItem | DbStoredItemInsert | DbStoredItemUpdate

type TStoredItem<T extends StoredItemDbType> = OverrideProps<DtoToEntity<T>, StoredItemMap>

type StoredItem = TStoredItem<DbStoredItem>

type StoredItemResult = {
  type?: StoredItemType
  contentText?: string
  fileUrl?: string
  mimeType?: string
}

const mapDbToStoredItem = (dbStoredItem: DbStoredItem): StoredItem => {
  return dtoToEntity(dbStoredItem) as StoredItem
}

const mapStoredItemToDb = <T extends StoredItemDbType>(storedItem: TStoredItem<T>): T => {
  return entityToDto(storedItem) as T
}

export { mapDbToStoredItem, mapStoredItemToDb }

export type {
  StoredItem, StoredItemResult, TStoredItem,
  StoredItemDbType, DbStoredItem, DbStoredItemInsert, DbStoredItemUpdate
}
