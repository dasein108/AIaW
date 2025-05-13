import { WorkspaceMapped } from "@/services/supabase/types"
import { useWorkspaces } from "./useWorkspaces"
import { computed } from "vue"

export function useChildWorkspaces(parentId: string | null) {
  const { workspaces } = useWorkspaces()
  // ts-ignore
  return computed<WorkspaceMapped[]>(() => workspaces.value.filter(workspace => workspace.parent_id === parentId && workspace.id !== parentId) as WorkspaceMapped[])
}
