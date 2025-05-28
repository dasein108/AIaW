import { Workspace } from '@/services/supabase/types'
import { useUserStore } from 'src/stores/user'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { computed, inject, readonly, Ref, ref, watch } from 'vue'

export const useIsWorkspaceAdmin = () => {
  const store = useWorkspacesStore()
  const workspace = inject<Ref<Workspace>>('workspace')

  const { currentUserId } = useUserStore()
  const isAdmin = ref<null | boolean>(null)

  watch(
    [() => workspace?.value?.id, () => currentUserId],
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
