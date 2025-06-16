import { Avatar } from "@/shared/types"
import { dtoToEntity, entityToDto } from "@/shared/utils/dto/helpers"
import { DtoToEntity, OverrideProps } from "@/shared/utils/dto/types"
import { defaultTextAvatar } from "@/shared/utils/functions"

import { Database } from "../supabase/database.types"

import { Profile } from "./profile"

type DbWorkspace = Database["public"]["Tables"]["workspaces"]["Row"]
type DbWorkspaceInsert = Database["public"]["Tables"]["workspaces"]["Insert"]
type DbWorkspaceUpdate = Database["public"]["Tables"]["workspaces"]["Update"]
type DbWorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"]

type WorkspaceMemberRole = "admin" | "member" | "readonly"
type WorkspaceRole = "owner" | "admin" | "member" | "readonly" | "none"

type WorkspaceDbType = DbWorkspace | DbWorkspaceInsert | DbWorkspaceUpdate

type WorkspaceMap = {
  avatar: Avatar
  vars: Record<string, string>
}

type Workspace<T extends WorkspaceDbType = DbWorkspace> = OverrideProps<DtoToEntity<T>, WorkspaceMap>

type WorkspaceMember = DtoToEntity<Omit<DbWorkspaceMember, 'profile'>> & {
  profile: Profile
}

const mapDbToWorkspace = <T extends WorkspaceDbType>(dbWorkspace: T) => {
  const workspace = dtoToEntity(dbWorkspace) as Workspace

  return {
    ...workspace,
    avatar: workspace.avatar ?? defaultTextAvatar(workspace.name as string),
    vars: workspace.vars ?? {} as Record<string, string>,
  }
}

const mapWorkspaceToDb = (workspace: Partial<Workspace<WorkspaceDbType>>) => {
  const dbWorkspace = entityToDto(workspace) as WorkspaceDbType

  return dbWorkspace
}

const mapDbToWorkspaceMember = (dbWorkspaceMember: DbWorkspaceMember) => {
  return dtoToEntity(dbWorkspaceMember) as WorkspaceMember
}

export { mapDbToWorkspace, mapDbToWorkspaceMember, mapWorkspaceToDb }
export type {
  Profile, WorkspaceMember, Workspace,
  WorkspaceMemberRole, WorkspaceRole,
  DbWorkspace, DbWorkspaceInsert, DbWorkspaceMember, DbWorkspaceUpdate
}
