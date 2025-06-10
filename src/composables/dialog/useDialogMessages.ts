import { storeToRefs } from "pinia"
import { useDialogsStore } from "src/stores/dialogs"
import { useWorkspacesStore } from "src/stores/workspaces"
import { computed, Ref } from "vue"
import { DialogMessageMapped } from "@/services/supabase/types"

export const useDialogMessages = (dialogId: Ref<string>) => {
  const { dialogMessages: allDialogMessages, dialogs } = storeToRefs(useDialogsStore())
  const { workspaces } = storeToRefs(useWorkspacesStore())
  const dialog = computed(() => dialogs.value[dialogId.value])
  const workspaceId = computed(() => dialog.value.workspace_id)
  const workspace = computed(() => workspaces.value.find(ws => ws.id === dialog.value.workspace_id))

  const dialogMessages = computed(
    () => allDialogMessages.value[dialogId.value] || []
  )

  const messageMap = computed<Record<string, DialogMessageMapped>>(() =>
    Object.fromEntries(dialogMessages.value.map((m) => [m.id, m]))
  )

  // watch(
  //   () => messageMap.value,
  //   (newMessages, oldMessages) => {
  //     // Only trigger if the mapped object actually changed
  //     // const newMap = Object.fromEntries(newMessages.map((m) => [m.id, m]))
  //     // const oldMap = Object.fromEntries((oldMessages || []).map((m) => [m.id, m]))

  //     if (!isEqual(newMessages, oldMessages)) {
  //       console.log("---messageMap", toRaw(Object.fromEntries(Object.entries(newMessages).map(([k, v]) => [k, v.message_contents[0].text]))))
  //     }
  //   },
  //   { deep: true }
  // )

  return { dialogMessages, messageMap, dialog, workspaceId, workspace }
}
