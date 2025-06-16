import { Avatar } from "@/shared/utils"
import { dtoToEntity } from "@/shared/utils/dto/helpers"
import { DtoToEntity } from "@/shared/utils/dto/types"

import { Database } from "../supabase/database.types"

type DbProfile = Database["public"]["Tables"]["profiles"]["Row"]

type Profile = DtoToEntity<Omit<DbProfile, 'avatar'>> & {
  avatar: Avatar
}

const mapDbToProfile = (dbProfile: DbProfile) => {
  return dtoToEntity(dbProfile) as Profile
}

export { mapDbToProfile }
export type { Profile, DbProfile }
