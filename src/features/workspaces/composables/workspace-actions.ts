import { useQuasar } from "quasar"
import SelectWorkspaceDialog from "src/components/SelectWorkspaceDialog.vue"
import { useAssistantsStore } from "@/app/store"
import { useUserDataStore } from "@/app/store"
import { useUserPerfsStore } from "@/app/store"
import { useWorkspacesStore } from "@/app/store"
import { defaultAvatar } from "@/shared/utils/functions"
import { dialogOptions } from "@/features/providers/utils/values"
import { useI18n } from "vue-i18n"
import { useCheckLogin } from "../auth/useCheckLogin"

export function useWorkspaceActions () {
  const workspacesStore = useWorkspacesStore()
  const assistantsStore = useAssistantsStore()
  const userDataStore = useUserDataStore()
  const userPerfsStore = useUserPerfsStore()
  const $q = useQuasar()
  const { t } = useI18n()
  const { ensureLogin } = useCheckLogin()

  function addWorkspace (parentId = null) {
    ensureLogin()

    $q.dialog({
      title: t("workspace.newWorkspace"),
      prompt: {
        model: "",
        type: "text",
        isValid: (v) => !!v.trim(),
        label: t("workspace.name"),
      },
      cancel: true,
      ok: t("workspace.create"),
      ...dialogOptions,
    }).onOk(async (name) => {
      const workspace = await workspacesStore.addWorkspace({
        name: name.trim(),
        parent_id: parentId,
        type: "workspace",
        is_public: true,
      })
      const assistant = await assistantsStore.add({
        name: t("workspace.defaultAssistant"),
        workspace_id: workspace.id,
        avatar: defaultAvatar("AI"),
        provider: userPerfsStore.data.provider,
        model: userPerfsStore.data.model,
      })
      userDataStore.data.defaultAssistantIds[workspace.id] = assistant.id
    })
  }

  function addFolder (parentId = null) {
    ensureLogin()

    $q.dialog({
      title: t("workspace.newFolder"),
      prompt: {
        model: "",
        type: "text",
        isValid: (v) => !!v.trim(),
        label: t("workspace.name"),
      },
      cancel: true,
      ok: t("workspace.create"),
      ...dialogOptions,
    }).onOk((name) => {
      workspacesStore.addWorkspace({
        name: name.trim(),
        parent_id: parentId,
        type: "folder",
      })
    })
  }

  function moveItem ({ id }, exclude?: string[]) {
    $q.dialog({
      component: SelectWorkspaceDialog,
      componentProps: {
        accept: "folder",
        exclude,
      },
    }).onOk((parentId) => {
      workspacesStore.updateItem(id, { parent_id: parentId })
    })
  }

  function deleteItem ({ id, type, name }) {
    $q.dialog({
      title:
        type === "workspace"
          ? t("workspace.deleteWorkspace")
          : t("workspace.deleteFolder"),
      message:
        type === "workspace"
          ? t("workspace.confirmDeleteWorkspace", { name })
          : t("workspace.confirmDeleteFolder", { name }),
      cancel: true,
      ok: {
        label: t("workspace.delete"),
        color: "err",
        flat: true,
      },
      ...dialogOptions,
    }).onOk(() => {
      workspacesStore.deleteItem(id)
    })
  }

  return { addWorkspace, addFolder, moveItem, deleteItem }
}
