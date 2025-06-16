import { Model } from "@/shared/types"
import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity } from "@/shared/utils/dto/types"

import { Database } from "../supabase/database.types"

import { Assistant } from "./assistant"

type DbDialog = Database["public"]["Tables"]["dialogs"]["Row"]
type DbDialogInsert = Database["public"]["Tables"]["dialogs"]["Insert"]

type Dialog = DtoToEntity<Omit<DbDialog, 'model_overrige' | 'input_vars'>> & {
  modelOverride: Model
  inputVars?: Record<string, string>
  assistant: Assistant
}

const mapDbToDialog = (dbDialog: DbDialog | DbDialogInsert) => {
  return dtoToEntity(dbDialog) as Dialog
}

const mapDialogToDb = (dialog: Partial<Dialog>) => {
  return entityToDto(dialog) as DbDialogInsert
}

export { mapDbToDialog, mapDialogToDb, type Dialog }
