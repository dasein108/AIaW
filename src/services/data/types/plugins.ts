import { PluginManifest } from "@/shared/utils"
import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity } from "@/shared/utils/dto/types"

import { Database } from "../supabase/database.types"

type DbUserPlugin = Database["public"]["Tables"]["user_plugins"]["Row"]
type DbUserPluginInsert = Database["public"]["Tables"]["user_plugins"]["Insert"]
type UserPluginDbType = DbUserPlugin | DbUserPluginInsert
type UserPlugin<T extends UserPluginDbType = UserPluginDbType> = DtoToEntity<T>

const mapDbToUserPlugin = (dbUserPlugin: DbUserPlugin) => {
  return {
    ...dtoToEntity(dbUserPlugin),
    manifest: dbUserPlugin.manifest as PluginManifest,
  }
}

const mapUserPluginToDb = (userPlugin: UserPlugin) => entityToDto(userPlugin)

export { mapDbToUserPlugin, mapUserPluginToDb }

export type { UserPlugin, DbUserPlugin, DbUserPluginInsert, UserPluginDbType }
