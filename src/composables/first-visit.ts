import { useQuasar } from 'quasar'
import { DexieDBURL, LitellmBaseURL } from 'src/utils/config'
import { db } from 'src/utils/db'
import { defaultModelSettings } from 'src/common/consts'
import { localData } from 'src/utils/local-data'
import { dialogOptions } from 'src/utils/values'
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAssistantsStore } from 'src/stores/assistants'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { defaultAvatar } from 'src/utils/functions'
import { AssistantDefaultPrompt } from 'src/utils/templates'

export function useFirstVisit() {
  const $q = useQuasar()
  const router = useRouter()
  const { t } = useI18n()
  const assistantsStore = useAssistantsStore()
  const workspaceStore = useWorkspacesStore()

  // onboarding: if no assistants, add default assistant
  watch(() => assistantsStore.isLoaded && workspaceStore.isLoaded, async (val) => {
    if (val) {
      if (assistantsStore.assistants.length === 0) {
        const workspace = workspaceStore.workspaces[0]
        await assistantsStore.add({
          name: t('db.defaultAssistant'),
          avatar: defaultAvatar('AI'),
          prompt: '',
          prompt_template: AssistantDefaultPrompt,
          prompt_vars: [],
          provider: null,
          model: null,
          model_settings: { ...defaultModelSettings },
          plugins: {},
          prompt_role: 'system',
          stream: true,
          workspace_id: workspace.id
        })
        db.reactives.add({
          key: '#user-data',
          value: {
            lastWorkspaceId: workspace.id
          }
        })
      }
    }
  })

  onMounted(() => {
    if (location.pathname === '/set-provider') {
      localData.visited = true
      return
    }
    if (!localData.visited) {
      const serviceAvailable = DexieDBURL && LitellmBaseURL
      const message = serviceAvailable
        ? t('firstVisit.messageWithLogin')
        : t('firstVisit.messageWithoutLogin')
      $q.dialog({
        title: t('firstVisit.title'),
        message,
        html: true,
        cancel: {
          label: t('firstVisit.cancel'),
          noCaps: true,
          flat: true
        },
        persistent: true,
        ok: serviceAvailable ? {
          label: t('firstVisit.ok'),
          noCaps: true,
          flat: true
        } : false,
        ...dialogOptions
      }).onCancel(() => {
        router.push('/settings')
        localData.visited = true
      }).onOk(() => {
        db.cloud.login()
        localData.visited = true
      })
    }
  })
}
