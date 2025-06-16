import { AssistantPlugins, Avatar, Model, ModelSettings, PromptVar, Provider } from "@/shared/types"
import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity } from "@/shared/utils/dto/types"
import { defaultTextAvatar } from "@/shared/utils/functions"

import { Database } from "../supabase/database.types"

type DbAssistant = Database["public"]["Tables"]["user_assistants"]["Row"]
type DbAssistantInsert = Database["public"]["Tables"]["user_assistants"]["Insert"]

type Assistant = DtoToEntity<Omit<DbAssistant, 'model_overrige' | 'input_vars'>> & {
  model: Model
  avatar: Avatar
  promptVars: PromptVar[]
  provider: Provider
  modelSettings: ModelSettings
  plugins: AssistantPlugins
  promptRole: "system" | "user" | "assistant"
}

type AssistantDbType = DbAssistant | DbAssistantInsert

const mapDbToAssistant = (dbDialog: DbAssistant | DbAssistantInsert) => {
  const assistant = dtoToEntity(dbDialog) as Assistant

  return {
    ...assistant,
    avatar: assistant.avatar ?? defaultTextAvatar(assistant.name),
  }
}

const mapAssistantToDb = (assistant: Partial<Assistant>) => {
  const dbAssistant = entityToDto(assistant) as DbAssistantInsert | DbAssistant

  return dbAssistant
}

export { mapDbToAssistant, mapAssistantToDb }
export type { Assistant, AssistantDbType }
