import { useUserStore } from 'src/stores/user'
import { computed, readonly, Ref, toRefs } from 'vue'
import { useIsWorkspaceAdmin } from '../workspaces/useIsWorkspaceAdmin'
import { ChatMapped } from '@/services/supabase/types'
import { storeToRefs } from 'pinia'

export const useIsChatAdmin = (chat: Ref<ChatMapped>) => {
  const { currentUserId } = storeToRefs(useUserStore())
  const workspaceId = computed(() => chat.value?.workspace_id)
  const { isAdmin: isWorkspaceAdmin } = useIsWorkspaceAdmin(workspaceId)
  const isAdmin = computed(() => ((isWorkspaceAdmin.value || chat.value?.owner_id === currentUserId.value)))
  return { isAdmin: readonly(isAdmin) }
}
