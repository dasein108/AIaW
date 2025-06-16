import { ArtifactVersion } from "@/shared/utils"
import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity, OverrideProps } from "@/shared/utils/dto/types"

import { Database } from "../supabase/database.types"

type DbArtifactInsert = Database["public"]["Tables"]["artifacts"]["Insert"]
type DbArtifact = Database["public"]["Tables"]["artifacts"]["Row"]

type ArtifactDbType = DbArtifact | DbArtifactInsert

type ArtifactMap = {
  versions: ArtifactVersion[]
}

type Artifact<T extends ArtifactDbType = DbArtifact> = OverrideProps<DtoToEntity<T>, ArtifactMap>

const mapDbToArtifact = <T extends ArtifactDbType>(dbArtifact: T) => {
  return dtoToEntity(dbArtifact) as Artifact
}

const mapArtifactToDb = (artifact: Partial<Artifact>) => {
  return entityToDto(artifact) as DbArtifactInsert
}

export { mapDbToArtifact, mapArtifactToDb, type Artifact }
export type { DbArtifactInsert, DbArtifact }
