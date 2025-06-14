import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import { useUserDataStore } from "@/shared/store"

import { useDialogMessagesStore, useDialogsStore } from "@/features/dialogs/store"

import { Dialog } from "@/services/data/supabase/types"

export function useCreateDialog (workspaceId: string) {
  const router = useRouter()
  const dialogsStore = useDialogsStore()
  const { t } = useI18n()

  async function createDialog (props: Partial<Dialog> = {}) {
    const userStore = useUserDataStore()
    const dialogMessagesStore = useDialogMessagesStore()

    await dialogsStore.addDialog(
      {
        workspace_id: workspaceId,
        name: t("createDialog.newDialog"),
        assistant_id: userStore.data.defaultAssistantIds[workspaceId] || null,
        input_vars: {},
        ...props,
      }
    ).then(async ({ id }) => {
      await dialogMessagesStore.addDialogMessage(
        id,
        null as string,
        {
          type: "user",
          message_contents: [
            {
              type: "user-message",
              text: "",
              name: "",
              stored_items: [],
            },
          ],
          status: "inputing",
        }
      )

      return id
    }).then((id) => {
      router.push(`/workspaces/${workspaceId}/dialogs/${id}`)
    })
  }

  return { createDialog }
}
