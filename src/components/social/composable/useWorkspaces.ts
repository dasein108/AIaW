import { ref, readonly, inject, watch } from 'vue'
import { supabase } from 'src/services/supabase/client'
import type { WorkspaceDb, WorkspaceMapped, WorkspaceMetadata } from 'src/services/supabase/types'
import { jsonToObject } from 'src/services/supabase/json'
import { Avatar } from '@/utils/types'
import { useUserStore } from 'src/stores/user'

const workspaces = ref<WorkspaceMapped[]>([])
let isSubscribed = false
let subscription: ReturnType<typeof supabase.channel> | null = null

function dbToWorkspace(item: WorkspaceDb): WorkspaceMapped {
  const { metadata = {}, ...rest } = item
  const metadataObject = jsonToObject(metadata)
  return {
    metadata: {
      avatar: (metadataObject?.avatar ?? { type: 'text', text: item.name.slice(0, 1) }) as Avatar,
      vars: metadataObject?.vars ?? {},
      indexContent: metadataObject?.indexContent
    },
    ...rest
  }
}
// export function extractWorkspaceMetadata(item: Partial<WorkspaceMapped>): WorkspaceMetadata | undefined {
//   const { avatar, vars, indexContent } = item
//   return { avatar, vars, indexContent }
// }
// export function workspaceToDb(item: WorkspaceMapped): WorkspaceDb {
//   const { avatar, vars, indexContent, ...rest } = item
//   return {
//     ...item,
//     metadata: {
//       avatar: item.avatar ? { ...item.avatar } : null,
//       vars: item.vars ?? {},
//       indexContent: item.indexContent ?? ''
//     }
//   }
// }
async function fetchWorkspaces() {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Failed to fetch chats:', error.message)
    return
  }
  workspaces.value = data.map((w) => dbToWorkspace(w as WorkspaceDb))
}

function subscribeToWorkspaces() {
  if (isSubscribed) return
  isSubscribed = true

  subscription = supabase
    .channel('workspaces-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'workspaces'
      },
      async (payload) => {
        workspaces.value.unshift(dbToWorkspace(payload.new as WorkspaceDb))
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'workspaces'
      },
      (payload) => {
        const deletedId = (payload.old as WorkspaceDb).id
        workspaces.value = workspaces.value.filter(c => c.id !== deletedId)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'workspaces'
      },
      async (payload) => {
        const updated = payload.new as WorkspaceDb
        workspaces.value = workspaces.value.map(c => (c.id === updated.id ? dbToWorkspace(updated) : c))
      }
    )
    .subscribe()
}

function unsubscribeFromWorkspaces() {
  if (subscription) {
    subscription.unsubscribe()
    subscription = null
  }
  isSubscribed = false
}

export function useWorkspaces() {
  const userStore = useUserStore()
  const { currentUserId, currentUser } = userStore
  // Initial fetch and subscribe
  if (!isSubscribed) {
    fetchWorkspaces()
    subscribeToWorkspaces()
  }

  // Watch for currentUser changes
  watch(
    () => currentUserId,
    (newId, oldId) => {
      if (newId !== oldId) {
        unsubscribeFromWorkspaces()
        workspaces.value = []
        fetchWorkspaces()
        subscribeToWorkspaces()
      }
    }
  )

  return {
    workspaces: readonly(workspaces)
  }
}
