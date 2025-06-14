import { throttle } from "lodash"
import { defineStore } from "pinia"
import { ref } from "vue"
import { useI18n } from "vue-i18n"

import { DefaultWsIndexContent } from "@/shared/utils/template/templates"

import { useWorkspacesWithSubscription } from "@/features/workspaces/composables/useWorkspacesWithSubscription"

import { supabase } from "@/services/data/supabase/client"
import type {
  WorkspaceMapped,
  WorkspaceMemberMapped,
  WorkspaceMemberRole,
  WorkspaceRole,
} from "@/services/data/supabase/types"

const SELECT_WORKSPACE_MEMBERS = "*, profile:profiles(id, name)"

/**
 * Store for managing workspaces and workspace members
 *
 * This store provides functionality for:
 * - Managing workspace CRUD operations (create, read, update, delete)
 * - Managing workspace members and their roles
 * - Retrieving workspace membership information
 *
 * Workspaces are a fundamental organizational unit in the application that
 * contain dialogs, assistants, and other resources.
 *
 * @dependencies
 * - {@link useWorkspacesWithSubscription} - For real-time workspace data
 * - {@link useI18n} - For internationalization of default workspace names
 *
 * @database
 * - Table: "workspaces" - Stores workspace data
 * - Table: "workspace_members" - Stores workspace membership and roles
 * - Related to: "profiles" table for member information
 */
export const useWorkspacesStore = defineStore("workspaces", () => {
  const { workspaces, isLoaded } = useWorkspacesWithSubscription()
  const workspaceMembers = ref<WorkspaceMemberMapped[]>([])
  const { t } = useI18n()

  async function addWorkspace (props: Partial<WorkspaceMapped>) {
    const workspace = {
      name: t("stores.workspaces.newWorkspace"),
      type: "workspace",
      avatar: { type: "icon", icon: "sym_o_deployed_code" },
      vars: {},
      index_content: DefaultWsIndexContent,
      parent_id: null,
      ...props,
    }
    const { data, error } = await supabase
      .from("workspaces")
      .insert(workspace)
      .select()
      .single()

    if (error) {
      console.error("❌ Failed to add workspace:", error.message)

      return null
    }

    return data
  }

  const update = async (id: string, changes: Partial<WorkspaceMapped>) => {
    return await supabase
      .from("workspaces")
      .update(changes)
      .eq("id", id)
      .select()
      .single()
  }

  const throttledUpdate = throttle(
    (workspace: Partial<WorkspaceMapped>) => update(workspace.id, workspace),
    2000
  )

  async function updateItem (
    id: string,
    changes: Partial<WorkspaceMapped>,
    throttle = false
  ) {
    if (throttle) {
      throttledUpdate(changes)
    } else {
      const { data, error } = await update(id, changes)

      if (error) {
        console.error("❌ Failed to update workspace:", error.message)

        return null
      }

      return data
    }
  }

  async function insertItem (workspace: WorkspaceMapped) {
    const { data, error } = await supabase
      .from("workspaces")
      .insert(workspace)
      .select()
      .single()

    if (error) {
      console.error("❌ Failed to put workspace:", error.message)

      return null
    }

    return data
  }

  async function putItem (workspace: WorkspaceMapped) {
    if (workspace.id) {
      return await updateItem(workspace.id, workspace, true)
    }

    return await insertItem(workspace)
  }

  async function deleteItem (id: string) {
    const { error } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("❌ Failed to delete workspace:", error.message)
      throw error
    }

    return true
  }

  async function addWorkspaceMember (
    workspaceId: string,
    userId: string,
    role: WorkspaceMemberRole
  ) {
    const { data, error } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: workspaceId, user_id: userId, role })
      .select(SELECT_WORKSPACE_MEMBERS)
      .single()

    if (error) {
      console.error("❌ Failed to add workspace member:", error.message)
      throw error
    }

    workspaceMembers.value = [
      ...workspaceMembers.value,
      data as WorkspaceMemberMapped,
    ]

    return data as WorkspaceMemberMapped
  }

  async function removeWorkspaceMember (workspaceId: string, userId: string) {
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)

    if (error) {
      console.error("❌ Failed to remove workspace member:", error.message)
      throw error
    }

    workspaceMembers.value = workspaceMembers.value.filter(
      (member) => member.user_id !== userId
    )
  }

  async function updateWorkspaceMember (
    workspaceId: string,
    userId: string,
    role: WorkspaceMemberRole
  ) {
    const { error } = await supabase
      .from("workspace_members")
      .update({ role })
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)

    if (error) {
      console.error("❌ Failed to update workspace member:", error.message)
      throw error
    }

    workspaceMembers.value = workspaceMembers.value.map((member) =>
      member.user_id === userId ? { ...member, role } : member
    )
  }

  async function getWorkspaceMembers (workspaceId: string) {
    const { data, error } = await supabase
      .from("workspace_members")
      .select(SELECT_WORKSPACE_MEMBERS)
      .eq("workspace_id", workspaceId)

    if (error) {
      console.error("❌ Failed to get workspace members:", error.message)
      throw error
    }

    workspaceMembers.value = data as WorkspaceMemberMapped[]

    return data as WorkspaceMemberMapped[]
  }

  async function isUserWorkspaceAdmin (workspaceId: string, userId: string) {
    const isOwner =
      workspaces.value.find(
        (workspace) =>
          workspace.id === workspaceId && workspace.owner_id === userId
      ) !== undefined

    if (isOwner) {
      return "owner" as WorkspaceRole
    }

    const member = workspaceMembers.value.find(
      (member) => member.user_id === userId
    )

    if (member) {
      return member.role as WorkspaceRole
    }

    return "none" as WorkspaceRole
  }

  return {
    isLoaded,
    workspaces,
    addWorkspace,
    updateItem,
    putItem,
    deleteItem,
    addWorkspaceMember,
    removeWorkspaceMember,
    updateWorkspaceMember,
    getWorkspaceMembers,
    isUserWorkspaceAdmin,
  }
})
