import { createUserDataStore } from "./utils/createUserDataStore"

export type ListOpen = {
  assistants: boolean
  artifacts: boolean
  dialogs: boolean
  chats: boolean
}

interface UserData {
  lastWorkspaceId: string
  noobAlertDismissed: boolean
  lastDialogIds: Record<string, string>
  defaultAssistantIds: Record<string, string>
  openedArtifacts: string[]
  listOpen: Record<string, ListOpen>
  tipDismissed: Record<string, boolean>
  prodExpiredNotifiedTimestamp: number
  evalExpiredNotified: boolean
}

const defaultUserData: UserData = {
  lastWorkspaceId: null,
  noobAlertDismissed: false,
  tipDismissed: {},
  lastDialogIds: {},
  defaultAssistantIds: {},
  prodExpiredNotifiedTimestamp: null,
  evalExpiredNotified: false,
  listOpen: {},
  openedArtifacts: [],
}

export const useUserDataStore = () => {
  return createUserDataStore<UserData>("user-data", defaultUserData)()
}
