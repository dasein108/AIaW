import { Avatar, Provider } from "@/shared/utils"
import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity, OverrideProps } from "@/shared/utils/dto/types"

import { Database } from "../supabase/database.types"

type DbCustomProvider = Database["public"]["Tables"]["custom_providers"]["Row"]
type DbSubprovider = Database["public"]["Tables"]["subproviders"]["Row"]

type DbCustomProviderInsert = Database["public"]["Tables"]["custom_providers"]["Insert"]
type DbSubproviderInsert = Database["public"]["Tables"]["subproviders"]["Insert"]

type CustomProviderDbType = DbCustomProvider | DbCustomProviderInsert
type SubproviderDbType = DbSubprovider | DbSubproviderInsert

type DbCustomProviderWithSubproviders = DbCustomProvider & {
  subproviders: DbSubprovider[]
}

type Subprovider<T extends SubproviderDbType = SubproviderDbType> = OverrideProps<DtoToEntity<T>, {
  provider: Provider
  modelMap: Record<string, string>
}>

type CustomProvider<T extends CustomProviderDbType = CustomProviderDbType> = OverrideProps<DtoToEntity<T>, {
  avatar: Avatar
  fallbackProvider: Provider
}> & {
  subproviders: Subprovider[]
}

const mapDbToSubprovider = (dbSubprovider: DbSubprovider) => {
  return {
    ...dtoToEntity(dbSubprovider),
    provider: dtoToEntity(dbSubprovider.provider),
  } as Subprovider
}

const mapSubproviderToDb = (providerId: string, subprovider: Subprovider) => {
  const item = entityToDto(subprovider)

  return {
    ...item,
    custom_provider_id: providerId,
  }
}

const mapDbToCustomProvider = (dbCustomProvider: DbCustomProviderWithSubproviders) => {
  const entity = dtoToEntity(dbCustomProvider)

  return {
    ...entity,
    avatar: entity.avatar ? entity.avatar : {
      type: "icon",
      icon: "sym_o_dashboard_customize",
      hue: Math.floor(Math.random() * 360),
    },
    fallbackProvider: entity.fallbackProvider ? entity.fallbackProvider : null,
    subproviders: dbCustomProvider.subproviders.map(mapDbToSubprovider),
  } as CustomProvider
}

const mapCustomProviderToDb = (customProvider: CustomProvider) => {
  return {
    ...entityToDto(customProvider),
    subproviders: customProvider.subproviders.map((sp) => mapSubproviderToDb(customProvider.id, sp)),
  }
}

export { mapDbToCustomProvider, mapCustomProviderToDb, mapDbToSubprovider, mapSubproviderToDb }

export type { CustomProvider, Subprovider, DbCustomProvider, DbSubprovider, DbCustomProviderWithSubproviders }
