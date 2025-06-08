import { useDialogsStore } from "src/stores/dialogs"
import { useUserDataStore } from "src/stores/user-data"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { Dialog } from "@/services/supabase/types"

export function useCreateDialog (workspaceId: string) {
  const router = useRouter()
  const dialogsStore = useDialogsStore()
  const { t } = useI18n()

  async function createDialog (props: Partial<Dialog> = {}) {
    const userStore = useUserDataStore()

    const dialog = await dialogsStore.addDialog(
      {
        workspace_id: workspaceId,
        name: t("createDialog.newDialog"),
        msg_tree: { null: [] },
        msg_route: [],
        assistant_id: userStore.data.defaultAssistantIds[workspaceId] || null,
        input_vars: {},
        ...props,
      },
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

    router.push(`/workspaces/${workspaceId}/dialogs/${dialog.id}`)
  }

  return { createDialog }
}
