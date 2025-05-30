import { ref, readonly, inject, watch } from 'vue'
import { supabase } from 'src/services/supabase/client'
import type { Workspace, WorkspaceMapped } from 'src/services/supabase/types'
import { Avatar } from '@/utils/types'
import { useUserStore } from 'src/stores/user'
import { useUserLoginCallback } from '../auth/useUserLoginCallback'
import { until } from '@vueuse/core'

export function mapWorkspaceTypes(item: Workspace): WorkspaceMapped {
  const { avatar, ...rest } = item
  return {
    avatar: (avatar ?? { type: 'text', text: item.name.slice(0, 1) }) as Avatar,
    ...rest
  } as WorkspaceMapped
}

const workspaces = ref<WorkspaceMapped[]>([])
let isSubscribed = false
let subscription: ReturnType<typeof supabase.channel> | null = null
const isLoaded = ref(false)

async function fetchWorkspaces() {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Failed to fetch chats:', error.message)
    return
  }
  workspaces.value = data.map((w) => mapWorkspaceTypes(w as Workspace))
  isLoaded.value = true
  console.log("---fetchWorkspaces", data)
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
        workspaces.value.unshift(mapWorkspaceTypes(payload.new as Workspace))
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
        const deletedId = (payload.old as Workspace).id
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
        const updated = mapWorkspaceTypes(payload.new as Workspace)
        workspaces.value = workspaces.value.map(c => (c.id === updated.id ? updated : c))
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

export function useWorkspacesWithSubscription() {
  const userStore = useUserStore()
  // Initial fetch and subscribe
  if (!isSubscribed) {
    fetchWorkspaces()
    subscribeToWorkspaces()
  }

  // Watch for currentUser changes
  useUserLoginCallback(async() => {
    unsubscribeFromWorkspaces()
    workspaces.value = []
    fetchWorkspaces()
    subscribeToWorkspaces()
  })

  return {
    isLoaded,
    workspaces: readonly(workspaces)
  }
}
