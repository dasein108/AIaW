import { Workspace } from '@/services/supabase/types'
import { useUserStore } from 'src/stores/user'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { computed, inject, readonly, Ref, ref, watch } from 'vue'

export const useIsWorkspaceAdmin = (workspaceId: Ref<string | null>) => {
  const store = useWorkspacesStore()

  const { currentUserId } = useUserStore()
  const isAdmin = ref<null | boolean>(null)

  watch(
    [() => workspaceId.value, () => currentUserId],
    async ([id, userId]) => {
      if (!id || !userId) {
        isAdmin.value = null
        return
      }
      isAdmin.value = null
      isAdmin.value = ['admin', 'owner'].includes(await store.isUserWorkspaceAdmin(id, userId))
    },
    { immediate: true }
  )

  return { isAdmin: readonly(isAdmin), isLoaded: computed(() => isAdmin.value !== null) }
}
