import { useQuasar } from 'quasar'
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
import AuthDialog from 'src/components/auth/AuthDialog.vue'
import { useUserStore } from 'src/stores/user'
import { storeToRefs } from 'pinia'

export function useFirstVisit() {
  const $q = useQuasar()
  const router = useRouter()
  const { t } = useI18n()
  const assistantsStore = useAssistantsStore()
  const workspaceStore = useWorkspacesStore()
  const { isLoggedIn } = storeToRefs(useUserStore())

  // onboarding: if no assistants, add default assistant
  watch(() => isLoggedIn && assistantsStore.isLoaded && workspaceStore.isLoaded, async (val) => {
    // TODO: refactor, add default workspace&assistant in db layer
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
      $q.dialog({
        title: t('firstVisit.title'),
        message: t('firstVisit.messageWithLogin'),
        html: true,

        persistent: true,
        ok: {
          label: t('firstVisit.ok'),
          noCaps: true,
          flat: true
        },
        ...dialogOptions
      }).onCancel(() => {
        router.push('/settings')
        localData.visited = true
      }).onOk(() => {
        $q.dialog({
          component: AuthDialog
        }).onOk(() => {
          localData.visited = true
          router.push('/settings')
        })
      })
    }
  })
}
