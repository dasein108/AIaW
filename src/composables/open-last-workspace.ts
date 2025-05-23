import { until } from '@vueuse/core'
import { useUserDataStore } from 'src/stores/user-data'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { useRouter } from 'vue-router'

export function useOpenLastWorkspace() {
  const workspacesStore = useWorkspacesStore()
  const userDataStore = useUserDataStore()
  const router = useRouter()

  async function openLastWorkspace() {
    await until(() => userDataStore.ready).toBeTruthy()
    const wsId = userDataStore.data.lastWorkspaceId
    if (!wsId) return
    await until(() => workspacesStore.workspaces.length).toBeTruthy()
    const dialogId = userDataStore.data.lastDialogIds[wsId]
    router.push(dialogId ? `/workspaces/${wsId}/dialogs/${dialogId}` : `/workspaces/${wsId}`)
  }
  return { openLastWorkspace }
}
