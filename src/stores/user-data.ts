import { defineStore } from 'pinia'
import { persistentReactive } from 'src/composables/persistent-reactive'

export type ListOpen = {
  assistants: boolean,
  artifacts: boolean,
  dialogs: boolean,
  chats: boolean
}

interface UserData {
  lastWorkspaceId: string
  noobAlertDismissed: boolean,
  lastDialogIds: Record<string, string>
  defaultAssistantIds: Record<string, string>,
  listOpen: Record<string, ListOpen>,
  tipDismissed: Record<string, boolean>
  prodExpiredNotifiedTimestamp: number
  evalExpiredNotified: boolean
}

export const useUserDataStore = defineStore('user-data', () => {
  const [data, ready] = persistentReactive<UserData>('#user-data', {
    lastWorkspaceId: null,
    noobAlertDismissed: false,
    tipDismissed: {},
    lastDialogIds: {},
    defaultAssistantIds: {},
    prodExpiredNotifiedTimestamp: null,
    evalExpiredNotified: false,
    listOpen: {}
  })
  return { data, ready }
})
