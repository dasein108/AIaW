import { useWorkspacesStore } from "@features/workspaces/store"
import { computed } from "vue"
import { WorkspaceMapped } from "@/services/supabase/types"

export function useRootWorkspace (parentId: string | null) {
  const workspaceStore = useWorkspacesStore()

  return computed<WorkspaceMapped[]>(
    () =>
      workspaceStore.workspaces.filter(
        (workspace) => workspace.parent_id === parentId
      ) as WorkspaceMapped[]
  )
}
