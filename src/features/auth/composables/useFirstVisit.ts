import { storeToRefs } from "pinia"
import { useQuasar } from "quasar"
import { defaultModelSettings } from "@/features/assistants/consts"
import AuthDialog from "@features/auth/components/AuthDialog.vue"
import { useAssistantsStore } from "@features/assistants/store"
import { useUserStore } from "@shared/store"
import { useWorkspacesStore } from "@features/workspaces/store"
import { defaultAvatar } from "@shared/utils/functions"
import { localData } from "@/shared/utils/localData"
import { AssistantDefaultPrompt } from "@features/dialogs/utils/dialogTemplateDefinitions"
import { dialogOptions } from "@/shared/utils/values"
import { onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

export function useFirstVisit () {
  const $q = useQuasar()
  const router = useRouter()
  const { t } = useI18n()
  const assistantsStore = useAssistantsStore()
  const workspaceStore = useWorkspacesStore()
  const { isLoggedIn } = storeToRefs(useUserStore())

  // onboarding: if no assistants, add default assistant
  watch(
    () => isLoggedIn && assistantsStore.isLoaded && workspaceStore.isLoaded,
    async (val) => {
      if (val) {
        if (assistantsStore.assistants.length === 0) {
          await assistantsStore.add({
            name: t("db.defaultAssistant"),
            avatar: defaultAvatar("AI"),
            prompt: "",
            prompt_template: AssistantDefaultPrompt,
            prompt_vars: [],
            provider: null,
            model: null,
            model_settings: { ...defaultModelSettings },
            plugins: {},
            prompt_role: "system",
            stream: true,
            workspace_id: null, // Global Assistant
          })
        }
      }
    }
  )

  onMounted(() => {
    if (location.pathname === "/set-provider") {
      localData.visited = true

      return
    }

    if (!localData.visited) {
      $q.dialog({
        title: t("firstVisit.title"),
        message: t("firstVisit.messageWithLogin"),
        html: true,

        persistent: true,
        ok: {
          label: t("firstVisit.ok"),
          noCaps: true,
          flat: true,
        },
        ...dialogOptions,
      })
        .onCancel(() => {
          router.push("/settings")
          localData.visited = true
        })
        .onOk(() => {
          $q.dialog({
            component: AuthDialog,
          }).onOk(() => {
            localData.visited = true
            router.push("/settings")
          })
        })
    }
  })
}
